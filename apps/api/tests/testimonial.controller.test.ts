import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";

import {
  getModerationQueue,
  listPublicTestimonialsByApiKey,
  listTestimonials,
} from "../src/controllers/testimonial.controller.js";
import { prisma } from "@workspace/database/prisma";

type MockedPrisma = typeof prisma & {
  project: {
    findFirst: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
  };
  testimonial: {
    findMany: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
    groupBy: ReturnType<typeof vi.fn>;
  };
};

vi.mock("@workspace/database/prisma", () => ({
  prisma: {
    project: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
    testimonial: {
      findMany: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
  },
  NotificationType: {},
}));

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

describe("testimonial controller response contracts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns owner list with project summary, derived flags, and traceable meta", async () => {
    const createdAt = new Date("2026-03-09T10:00:00.000Z");
    const updatedAt = new Date("2026-03-09T11:00:00.000Z");

    mockedPrisma.project.findFirst.mockResolvedValue({
      id: "proj_1",
      slug: "demo-project",
      name: "Demo Project",
    });

    mockedPrisma.testimonial.findMany.mockResolvedValue([
      {
        id: "t_1",
        userId: null,
        projectId: "proj_1",
        authorName: "A",
        authorEmail: "a@example.com",
        authorRole: null,
        authorCompany: null,
        authorAvatar: null,
        content: "Great product",
        type: "TEXT",
        videoUrl: null,
        mediaUrl: null,
        source: null,
        sourceUrl: null,
        oembedData: null,
        isPublished: false,
        rating: 5,
        isApproved: true,
        isOAuthVerified: true,
        oauthProvider: "google",
        moderationStatus: "APPROVED",
        moderationScore: 0.1,
        moderationFlags: null,
        autoPublished: false,
        createdAt,
        updatedAt,
      },
    ]);

    mockedPrisma.testimonial.count.mockResolvedValue(1);

    const req = {
      params: { slug: "demo-project" },
      query: {},
      user: { id: "user_1" },
    } as unknown as Request;
    const res = createResponse();
    const next = createNext();

    await listTestimonials(req, res, next as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(200);
    const responseBody = res.json.mock.calls[0]?.[0];
    expect(responseBody).toBeDefined();

    expect(responseBody!.data[0]).toMatchObject({
      project: {
        id: "proj_1",
        slug: "demo-project",
        name: "Demo Project",
      },
      moderationContext: {
        needsReview: false,
        canAutoPublish: true,
      },
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    });

    expect(responseBody!.meta.filters).toEqual({
      projectSlug: "demo-project",
    });
    expect(responseBody!.meta.sort).toEqual({
      field: "createdAt",
      direction: "desc",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns moderation queue with serialized stats and filter echo metadata", async () => {
    mockedPrisma.project.findFirst.mockResolvedValue({
      id: "proj_1",
      slug: "demo-project",
      name: "Demo Project",
    });

    mockedPrisma.testimonial.findMany.mockResolvedValue([
      {
        id: "t_1",
        userId: null,
        projectId: "proj_1",
        authorName: "A",
        authorEmail: "a@example.com",
        authorRole: null,
        authorCompany: null,
        authorAvatar: null,
        content: "Pending review",
        type: "TEXT",
        videoUrl: null,
        mediaUrl: null,
        source: null,
        sourceUrl: null,
        oembedData: null,
        isPublished: false,
        rating: null,
        isApproved: false,
        isOAuthVerified: false,
        oauthProvider: null,
        moderationStatus: "PENDING",
        moderationScore: 0.8,
        moderationFlags: ["risk"],
        autoPublished: false,
        createdAt: new Date("2026-03-09T10:00:00.000Z"),
        updatedAt: new Date("2026-03-09T10:00:00.000Z"),
      },
    ]);

    mockedPrisma.testimonial.count.mockResolvedValue(1);
    mockedPrisma.testimonial.groupBy.mockResolvedValue([
      { moderationStatus: "PENDING", _count: 1 },
      { moderationStatus: "FLAGGED", _count: 0 },
      { moderationStatus: "APPROVED", _count: 0 },
      { moderationStatus: "REJECTED", _count: 0 },
    ]);

    const req = {
      params: { slug: "demo-project" },
      query: { status: "pending", verified: "false" },
      user: { id: "user_1" },
    } as unknown as Request;
    const res = createResponse();
    const next = createNext();

    await getModerationQueue(req, res, next as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(200);
    const responseBody = res.json.mock.calls[0]?.[0];
    expect(responseBody).toBeDefined();

    expect(responseBody!.meta.stats).toEqual({
      total: 1,
      pending: 1,
      flagged: 0,
      approved: 0,
      rejected: 0,
    });
    expect(responseBody!.meta.filters).toEqual({
      status: "pending",
      verified: false,
      projectSlug: "demo-project",
    });
    expect(responseBody!.meta.reviewPriority).toEqual({
      high: 1,
      medium: 0,
      low: 0,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns public testimonials including mediaUrl and updatedAt", async () => {
    const createdAt = new Date("2026-03-09T10:00:00.000Z");
    const updatedAt = new Date("2026-03-09T11:00:00.000Z");

    mockedPrisma.project.findUnique.mockResolvedValue({
      id: "proj_1",
      slug: "demo-project",
      name: "Demo Project",
      isActive: true,
    });

    mockedPrisma.testimonial.findMany.mockResolvedValue([
      {
        id: "t_public",
        authorName: "Public User",
        authorAvatar: null,
        authorRole: null,
        authorCompany: null,
        content: "Public content",
        rating: 5,
        type: "TEXT",
        videoUrl: null,
        mediaUrl: "https://cdn.example.com/media.mp4",
        createdAt,
        updatedAt,
        isOAuthVerified: true,
        oauthProvider: "google",
      },
    ]);

    const req = {
      params: { slug: "demo-project" },
      apiKey: { projectId: "proj_1" },
    } as unknown as Request;
    const res = createResponse();
    const next = createNext();

    await listPublicTestimonialsByApiKey(req, res, next as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(200);
    const responseBody = res.json.mock.calls[0]?.[0];
    expect(responseBody).toBeDefined();
    expect(responseBody!.data.testimonials[0]).toMatchObject({
      mediaUrl: "https://cdn.example.com/media.mp4",
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    });
    expect(next).not.toHaveBeenCalled();
  });
});
