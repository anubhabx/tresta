import { beforeEach, describe, expect, it, vi } from "vitest";

const queueAddMock = vi.hoisted(() => vi.fn());

vi.mock("../src/lib/queues.js", () => ({
  getQueue: vi.fn(() => ({
    add: queueAddMock,
  })),
}));

vi.mock("../src/services/email.service.js", () => ({
  EmailService: {
    sendEmail: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("../src/services/ably.service.js", () => ({
  AblyService: {
    publish: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("@workspace/database/prisma", () => ({
  NotificationType: {
    TESTIMONIAL_FLAGGED: "TESTIMONIAL_FLAGGED",
    SECURITY_ALERT: "SECURITY_ALERT",
    NEW_TESTIMONIAL: "NEW_TESTIMONIAL",
  },
  prisma: {
    notificationOutbox: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    jobIdempotency: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    notificationPreferences: {
      upsert: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

import { NotificationType, prisma } from "@workspace/database/prisma";
import { EmailService } from "../src/services/email.service.js";
import { NotificationService } from "../src/services/notification.service.js";

type MockedPrisma = typeof prisma & {
  notificationOutbox: {
    findFirst: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  jobIdempotency: {
    findUnique: ReturnType<typeof vi.fn>;
    upsert: ReturnType<typeof vi.fn>;
  };
  notificationPreferences: {
    upsert: ReturnType<typeof vi.fn>;
  };
  user: {
    findUnique: ReturnType<typeof vi.fn>;
  };
  $transaction: ReturnType<typeof vi.fn>;
};

const mockedPrisma = prisma as unknown as MockedPrisma;
const mockedEmailService = EmailService.sendEmail as unknown as ReturnType<typeof vi.fn>;

describe("NotificationService.sendViaEmail eligibility and preference filtering", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skips email delivery when user email preference is disabled", async () => {
    mockedPrisma.notificationPreferences.upsert.mockResolvedValue({
      emailEnabled: false,
    });

    await NotificationService.sendViaEmail("user_1", {
      type: NotificationType.TESTIMONIAL_FLAGGED,
      title: "Flagged",
      message: "Needs review",
    });

    expect(mockedPrisma.user.findUnique).not.toHaveBeenCalled();
    expect(mockedEmailService).not.toHaveBeenCalled();
  });

  it("sends email for critical notification types when enabled", async () => {
    mockedPrisma.notificationPreferences.upsert.mockResolvedValue({
      emailEnabled: true,
    });
    mockedPrisma.user.findUnique.mockResolvedValue({
      email: "owner@example.com",
    });

    await NotificationService.sendViaEmail("user_1", {
      type: NotificationType.NEW_TESTIMONIAL,
      title: "New testimonial",
      message: "A new testimonial arrived",
      link: "/dashboard",
    });

    expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: "user_1" },
      select: { email: true },
    });
    expect(mockedEmailService).toHaveBeenCalledTimes(1);
  });
});

describe("NotificationService.enqueueFromOutbox idempotency behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedPrisma.$transaction.mockResolvedValue(undefined);
  });

  it("returns early when there is no pending outbox entry", async () => {
    mockedPrisma.notificationOutbox.findFirst.mockResolvedValue(null);

    await NotificationService.enqueueFromOutbox("notif_1");

    expect(mockedPrisma.jobIdempotency.findUnique).not.toHaveBeenCalled();
    expect(queueAddMock).not.toHaveBeenCalled();
  });

  it("marks outbox as enqueued when job is already idempotently completed", async () => {
    mockedPrisma.notificationOutbox.findFirst.mockResolvedValue({
      id: "outbox_1",
      notificationId: "notif_1",
      payload: { notificationId: "notif_1", userId: "user_1" },
      status: "pending",
    });
    mockedPrisma.jobIdempotency.findUnique.mockResolvedValue({
      jobKey: "notification:notif_1",
      status: "completed",
    });

    await NotificationService.enqueueFromOutbox("notif_1");

    expect(mockedPrisma.notificationOutbox.update).toHaveBeenCalledWith({
      where: { id: "outbox_1" },
      data: expect.objectContaining({ status: "enqueued" }),
    });
    expect(queueAddMock).not.toHaveBeenCalled();
  });

  it("enqueues queue job and updates idempotency when processing new outbox entry", async () => {
    mockedPrisma.notificationOutbox.findFirst.mockResolvedValue({
      id: "outbox_1",
      notificationId: "notif_1",
      payload: { notificationId: "notif_1", userId: "user_1", type: "NEW_TESTIMONIAL" },
      status: "pending",
    });
    mockedPrisma.jobIdempotency.findUnique.mockResolvedValue(null);

    await NotificationService.enqueueFromOutbox("notif_1");

    expect(queueAddMock).toHaveBeenCalledWith(
      "send-notification",
      expect.objectContaining({ notificationId: "notif_1" }),
      expect.objectContaining({ jobId: "notification-notif_1" }),
    );
    expect(mockedPrisma.$transaction).toHaveBeenCalledTimes(1);
    expect(mockedPrisma.jobIdempotency.upsert).toHaveBeenCalledWith({
      where: { jobKey: "notification:notif_1" },
      create: {
        jobKey: "notification:notif_1",
        jobId: "notification-notif_1",
        status: "processing",
      },
      update: {
        jobId: "notification-notif_1",
        status: "processing",
      },
    });
  });
});
