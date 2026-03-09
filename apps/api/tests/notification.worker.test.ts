import { beforeEach, describe, expect, it, vi } from "vitest";

type WorkerHandler = (job: any) => Promise<void>;

const workerState = vi.hoisted(() => ({
  handler: null as WorkerHandler | null,
  eventHandlers: new Map<string, Function>(),
}));

vi.mock("bullmq", () => ({
  Worker: class MockWorker {
    constructor(_name: string, processor: WorkerHandler) {
      workerState.handler = processor;
    }

    on(event: string, callback: Function) {
      workerState.eventHandlers.set(event, callback);
      return this;
    }

    close = vi.fn().mockResolvedValue(undefined);
  },
}));

vi.mock("@workspace/database/prisma", () => ({
  prisma: {
    notification: {
      findUnique: vi.fn(),
    },
    jobIdempotency: {
      update: vi.fn(),
    },
    deadLetterJob: {
      create: vi.fn(),
    },
  },
}));

vi.mock("../src/services/notification.service.js", () => ({
  NotificationService: {
    sendViaAbly: vi.fn().mockResolvedValue(undefined),
    sendViaEmail: vi.fn().mockResolvedValue(undefined),
  },
}));

import { prisma } from "@workspace/database/prisma";
import { NotificationService } from "../src/services/notification.service.js";

type MockedPrisma = typeof prisma & {
  notification: {
    findUnique: ReturnType<typeof vi.fn>;
  };
  jobIdempotency: {
    update: ReturnType<typeof vi.fn>;
  };
  deadLetterJob: {
    create: ReturnType<typeof vi.fn>;
  };
};

const mockedPrisma = prisma as unknown as MockedPrisma;
const mockedSendViaAbly = NotificationService.sendViaAbly as unknown as ReturnType<typeof vi.fn>;
const mockedSendViaEmail = NotificationService.sendViaEmail as unknown as ReturnType<typeof vi.fn>;

describe("notification worker processing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    workerState.handler = null;
    workerState.eventHandlers.clear();
    process.env.REDIS_URL = "redis://localhost:6379";
  });

  it("processes successful jobs and marks idempotency completed", async () => {
    mockedPrisma.notification.findUnique.mockResolvedValue({
      id: "notif_1",
      type: "NEW_TESTIMONIAL",
      title: "New testimonial",
      message: "Body",
    });

    const { createNotificationWorker } = await import("../src/workers/notification.worker.js");
    createNotificationWorker();

    expect(workerState.handler).not.toBeNull();

    await workerState.handler!({
      id: "job_1",
      data: {
        notificationId: "notif_1",
        userId: "user_1",
        requestId: "req_1",
      },
    });

    expect(mockedSendViaAbly).toHaveBeenCalledWith(
      "user_1",
      expect.objectContaining({ id: "notif_1" }),
    );
    expect(mockedSendViaEmail).toHaveBeenCalledWith(
      "user_1",
      expect.objectContaining({ id: "notif_1" }),
    );
    expect(mockedPrisma.jobIdempotency.update).toHaveBeenCalledWith({
      where: { jobKey: "notification:notif_1" },
      data: expect.objectContaining({ status: "completed" }),
    });
  });

  it("records dead-letter metadata on failed jobs including retry history", async () => {
    const { createNotificationWorker } = await import("../src/workers/notification.worker.js");
    createNotificationWorker();

    const failedHandler = workerState.eventHandlers.get("failed");
    expect(failedHandler).toBeDefined();

    const job = {
      id: "job_2",
      attemptsMade: 2,
      data: {
        notificationId: "notif_2",
        userId: "user_1",
        requestId: "req_2",
      },
    };
    const error = Object.assign(new Error("TRANSIENT provider timeout"), {
      statusCode: 503,
      response: { reason: "gateway timeout" },
    });

    await failedHandler!(job, error);

    expect(mockedPrisma.deadLetterJob.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        jobId: "job_2",
        queue: "notifications",
        errorType: "transient",
        statusCode: 503,
      }),
    });

    const createArgs = mockedPrisma.deadLetterJob.create.mock.calls[0]?.[0];
    expect(createArgs.data.retryHistory).toHaveLength(2);
    expect(createArgs.data.providerResponse).toContain("gateway timeout");
  });
});
