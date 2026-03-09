import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";

import { prisma } from "@workspace/database/prisma";

type ControllerHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

let createTestimonial: ControllerHandler | null = null;

vi.mock("@workspace/database/prisma", () => ({
  prisma: {
    project: {
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    testimonial: {
      count: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
  NotificationType: {
    NEW_TESTIMONIAL: "NEW_TESTIMONIAL",
    TESTIMONIAL_FLAGGED: "TESTIMONIAL_FLAGGED",
  },
}));

vi.mock("../src/services/moderation.service.js", () => ({
  moderateTestimonial: vi.fn(async () => ({
    status: "PENDING",
    score: 0.4,
    flags: [],
    autoPublish: false,
  })),
  checkDuplicateContent: vi.fn(() => ({ isDuplicate: false, similarity: 0 })),
  analyzeReviewerBehavior: vi.fn(async () => null),
}));

vi.mock("../src/services/notification.service.js", () => ({
  NotificationService: {
    create: vi.fn(async () => undefined),
  },
}));

vi.mock("../src/lib/google-oauth.js", () => ({
  verifyGoogleIdToken: vi.fn(async () => null),
}));

type MockedPrisma = typeof prisma & {
  project: {
    findUnique: ReturnType<typeof vi.fn>;
  };
  user: {
    findUnique: ReturnType<typeof vi.fn>;
  };
  testimonial: {
    count: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
};

const mockedPrisma = prisma as unknown as MockedPrisma;

const createResponse = () => {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });

  return {
    status,
    json,
  } as unknown as Response & {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
  };
};

const createNext = () => vi.fn<NextFunction>();

const loadController = async () => {
  if (createTestimonial) {
    return;
  }

  const testimonialController = await import(
    "../src/controllers/testimonial.controller.js"
  );

  createTestimonial = testimonialController.createTestimonial;
};

describe("testimonial validation rules", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.ENCRYPTION_KEY =
      process.env.ENCRYPTION_KEY ?? "12345678901234567890123456789012";

    mockedPrisma.user.findUnique.mockResolvedValue({ plan: "PRO" });
    mockedPrisma.testimonial.count.mockResolvedValue(0);
    mockedPrisma.testimonial.findMany.mockResolvedValue([]);
    mockedPrisma.testimonial.findFirst.mockResolvedValue(null);
    mockedPrisma.testimonial.create.mockResolvedValue({
      id: "t_1",
      projectId: "proj_1",
      authorName: "Alice",
      authorEmail: "alice@example.com",
      content: "This is a valid testimonial body.",
      type: "TEXT",
      createdAt: new Date("2026-03-09T10:00:00.000Z"),
      updatedAt: new Date("2026-03-09T10:00:00.000Z"),
    });
  });

  it("enforces content length boundaries (10-2000 chars)", async () => {
    await loadController();

    const req = {
      params: { slug: "demo-project" },
      body: {
        authorName: "Alice",
        authorEmail: "alice@example.com",
        content: "short",
      },
      headers: {},
      get: vi.fn(),
      socket: { remoteAddress: "127.0.0.1" },
    } as unknown as Request;

    const res = createResponse();
    const next = createNext();

    await createTestimonial!(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);
    expect((next.mock.calls[0]?.[0] as Error).message).toContain(
      "Content must be between 10 and 2000 characters",
    );
  });

  it("coerces numeric-string rating and persists normalized numeric value", async () => {
    await loadController();

    mockedPrisma.project.findUnique.mockResolvedValue({
      id: "proj_1",
      slug: "demo-project",
      name: "Demo Project",
      userId: "owner_1",
      isActive: true,
      autoModeration: true,
      autoApproveVerified: false,
      profanityFilterLevel: "MODERATE",
      moderationSettings: null,
      formConfig: {
        notifyOnSubmission: false,
      },
    });

    const req = {
      params: { slug: "demo-project" },
      body: {
        authorName: "Alice",
        authorEmail: "alice@example.com",
        content: "This product improved our team workflow and confidence.",
        rating: "5",
      },
      headers: {},
      ip: "127.0.0.1",
      get: vi.fn().mockReturnValue("vitest-agent"),
      socket: { remoteAddress: "127.0.0.1" },
    } as unknown as Request;

    const res = createResponse();
    const next = createNext();

    await createTestimonial!(req, res, next as unknown as NextFunction);

    expect(mockedPrisma.testimonial.create).toHaveBeenCalledTimes(1);
    const createArgs = mockedPrisma.testimonial.create.mock.calls[0]?.[0];
    expect(createArgs.data.rating).toBe(5);
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects rating outside 1..5 bounds", async () => {
    await loadController();

    const req = {
      params: { slug: "demo-project" },
      body: {
        authorName: "Alice",
        authorEmail: "alice@example.com",
        content: "This is a valid testimonial content body.",
        rating: 6,
      },
      headers: {},
      get: vi.fn(),
      socket: { remoteAddress: "127.0.0.1" },
    } as unknown as Request;

    const res = createResponse();
    const next = createNext();

    await createTestimonial!(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);
    expect((next.mock.calls[0]?.[0] as Error).message).toContain(
      "Rating must be a number between 1 and 5",
    );
  });

  it("enforces required optional fields from formConfig", async () => {
    await loadController();

    mockedPrisma.project.findUnique.mockResolvedValue({
      id: "proj_1",
      slug: "demo-project",
      name: "Demo Project",
      userId: "owner_1",
      isActive: true,
      autoModeration: true,
      autoApproveVerified: false,
      profanityFilterLevel: "MODERATE",
      moderationSettings: null,
      formConfig: {
        requireCompany: true,
        enableCompany: true,
        notifyOnSubmission: false,
      },
    });

    const req = {
      params: { slug: "demo-project" },
      body: {
        authorName: "Alice",
        authorEmail: "alice@example.com",
        content: "This is a valid testimonial content body.",
      },
      headers: {},
      get: vi.fn(),
      socket: { remoteAddress: "127.0.0.1" },
    } as unknown as Request;

    const res = createResponse();
    const next = createNext();

    await createTestimonial!(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);
    expect((next.mock.calls[0]?.[0] as Error).message).toContain(
      "Company is required for this collection form",
    );
  });

  it("rejects anonymous opt-out when project disallows it", async () => {
    await loadController();

    mockedPrisma.project.findUnique.mockResolvedValue({
      id: "proj_1",
      slug: "demo-project",
      name: "Demo Project",
      userId: "owner_1",
      isActive: true,
      autoModeration: true,
      autoApproveVerified: false,
      profanityFilterLevel: "MODERATE",
      moderationSettings: null,
      formConfig: {
        allowAnonymousSubmissions: false,
        allowFingerprintOptOut: false,
        notifyOnSubmission: false,
      },
    });

    const req = {
      params: { slug: "demo-project" },
      body: {
        authorName: "Alice",
        authorEmail: "alice@example.com",
        content: "This is a valid testimonial content body.",
      },
      headers: {
        "x-anonymous-submission": "true",
      },
      get: vi.fn(),
      socket: { remoteAddress: "127.0.0.1" },
    } as unknown as Request;

    const res = createResponse();
    const next = createNext();

    await createTestimonial!(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);
    expect((next.mock.calls[0]?.[0] as Error).message).toContain(
      "IP/device data opt-out is disabled for this project",
    );
  });
});
