import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";

import { prisma } from "@workspace/database/prisma";
import { moderateTestimonial } from "../src/services/moderation.service.js";

let createTestimonial: (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;
let listTestimonials: (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void>;

vi.mock("@workspace/database/prisma", () => ({
  prisma: {
    project: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
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
  moderateTestimonial: vi.fn(),
  checkDuplicateContent: vi.fn(() => ({ isDuplicate: false, similarity: 0 })),
  analyzeReviewerBehavior: vi.fn(async () => ({
    isHighVelocity: false,
    duplicateCount: 0,
  })),
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
    findFirst: ReturnType<typeof vi.fn>;
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
const mockedModerateTestimonial = moderateTestimonial as unknown as ReturnType<
  typeof vi.fn
>;

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

describe("testimonial submission + pagination integration coverage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    process.env.ENCRYPTION_KEY =
      process.env.ENCRYPTION_KEY ?? "12345678901234567890123456789012";

    mockedPrisma.user.findUnique.mockResolvedValue({ plan: "PRO" });
    mockedPrisma.testimonial.count.mockResolvedValue(0);
    mockedPrisma.testimonial.findMany.mockResolvedValue([]);
  });

  it("loads controller exports", async () => {
    const testimonialController = await import(
      "../src/controllers/testimonial.controller.js"
    );

    createTestimonial = testimonialController.createTestimonial;
    listTestimonials = testimonialController.listTestimonials;

    expect(createTestimonial).toBeDefined();
    expect(listTestimonials).toBeDefined();
  });

  it("submits testimonial successfully for valid payload", async () => {
    if (!createTestimonial) {
      const testimonialController = await import(
        "../src/controllers/testimonial.controller.js"
      );
      createTestimonial = testimonialController.createTestimonial;
      listTestimonials = testimonialController.listTestimonials;
    }

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

    mockedModerateTestimonial.mockResolvedValue({
      status: "PENDING",
      autoPublish: false,
    });

    mockedPrisma.testimonial.create.mockResolvedValue({
      id: "t_new",
      projectId: "proj_1",
      authorName: "Alice",
      authorEmail: "alice@example.com",
      content: "This product helped our team move faster.",
      type: "TEXT",
      isApproved: false,
      isPublished: false,
      createdAt: new Date("2026-03-09T10:00:00.000Z"),
      updatedAt: new Date("2026-03-09T10:00:00.000Z"),
    });

    const req = {
      params: { slug: "demo-project" },
      body: {
        authorName: "Alice",
        authorEmail: "alice@example.com",
        content: "This product helped our team move faster.",
      },
      headers: {},
      ip: "127.0.0.1",
      socket: { remoteAddress: "127.0.0.1" },
      get: vi.fn().mockReturnValue("vitest-agent"),
    } as unknown as Request;

    const res = createResponse();
    const next = createNext();

    await createTestimonial(req, res, next as unknown as NextFunction);

    expect(mockedPrisma.testimonial.create).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);

    const payload = res.json.mock.calls[0]?.[0];
    expect(payload).toBeDefined();
    expect(payload!.success).toBe(true);
    expect(payload!.message).toContain("pending review");
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects testimonial submission with invalid payload", async () => {
    if (!createTestimonial) {
      const testimonialController = await import(
        "../src/controllers/testimonial.controller.js"
      );
      createTestimonial = testimonialController.createTestimonial;
      listTestimonials = testimonialController.listTestimonials;
    }

    const req = {
      params: { slug: "demo-project" },
      body: {
        authorName: "Alice",
        authorEmail: "alice@example.com",
      },
      headers: {},
      get: vi.fn(),
      socket: { remoteAddress: "127.0.0.1" },
    } as unknown as Request;

    const res = createResponse();
    const next = createNext();

    await createTestimonial(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0]?.[0] as unknown as Error;
    expect(error).toBeDefined();
    expect(error.message).toContain("Content is required");
  });

  it("returns not found when project slug does not exist", async () => {
    if (!createTestimonial) {
      const testimonialController = await import(
        "../src/controllers/testimonial.controller.js"
      );
      createTestimonial = testimonialController.createTestimonial;
      listTestimonials = testimonialController.listTestimonials;
    }

    mockedPrisma.project.findUnique.mockResolvedValue(null);

    const req = {
      params: { slug: "missing-project" },
      body: {
        authorName: "Alice",
        authorEmail: "alice@example.com",
        content: "This product helped our team move faster.",
      },
      headers: {},
      get: vi.fn().mockReturnValue("vitest-agent"),
      socket: { remoteAddress: "127.0.0.1" },
    } as unknown as Request;

    const res = createResponse();
    const next = createNext();

    await createTestimonial(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0]?.[0] as unknown as Error;
    expect(error).toBeDefined();
    expect(error.message).toContain('Project with slug "missing-project" not found');
  });

  it("normalizes invalid pagination values instead of failing", async () => {
    if (!listTestimonials) {
      const testimonialController = await import(
        "../src/controllers/testimonial.controller.js"
      );
      createTestimonial = testimonialController.createTestimonial;
      listTestimonials = testimonialController.listTestimonials;
    }

    mockedPrisma.project.findFirst.mockResolvedValue({
      id: "proj_1",
      slug: "demo-project",
      name: "Demo Project",
    });

    mockedPrisma.testimonial.findMany.mockResolvedValue([]);
    mockedPrisma.testimonial.count.mockResolvedValue(0);

    const req = {
      params: { slug: "demo-project" },
      query: { page: "-99", limit: "10000" },
      user: { id: "user_1" },
    } as unknown as Request;

    const res = createResponse();
    const next = createNext();

    await listTestimonials(req, res, next as unknown as NextFunction);

    expect(mockedPrisma.testimonial.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 100,
      }),
    );

    expect(res.status).toHaveBeenCalledWith(200);
    const payload = res.json.mock.calls[0]?.[0];
    expect(payload).toBeDefined();
    expect(payload!.meta.pagination.page).toBe(1);
    expect(payload!.meta.pagination.limit).toBe(100);
    expect(next).not.toHaveBeenCalled();
  });
});
