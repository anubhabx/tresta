import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";

import {
  bulkModerationAction,
  deleteTestimonial,
  getModerationQueue,
  getTestimonialById,
  listPublicTestimonialsByApiKey,
  listTestimonials,
  updateTestimonial,
} from "../src/controllers/testimonial.controller.js";
import { prisma } from "@workspace/database/prisma";

type MockedPrisma = typeof prisma & {
  project: {
    findFirst: ReturnType<typeof vi.fn>;
    findUnique: ReturnType<typeof vi.fn>;
  };
  testimonial: {
    findMany: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
    count: ReturnType<typeof vi.fn>;
    groupBy: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    updateMany: ReturnType<typeof vi.fn>;
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
      findFirst: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      updateMany: vi.fn(),
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

describe("testimonial controller lifecycle coverage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns owner testimonial list with pagination metadata", async () => {
    mockedPrisma.project.findFirst.mockResolvedValue({
      id: "proj_1",
      slug: "demo-project",
      name: "Demo Project",
    });
    mockedPrisma.testimonial.findMany.mockResolvedValue([
      {
        id: "t_10",
        userId: null,
        projectId: "proj_1",
        authorName: "A",
        authorEmail: "a@example.com",
        authorRole: null,
        authorCompany: null,
        authorAvatar: null,
        content: "Some testimonial content",
        type: "TEXT",
        videoUrl: null,
        mediaUrl: null,
        source: null,
        sourceUrl: null,
        oembedData: null,
        isPublished: false,
        rating: 4,
        isApproved: true,
        isOAuthVerified: false,
        oauthProvider: null,
        moderationStatus: "APPROVED",
        moderationScore: 0.1,
        moderationFlags: null,
        autoPublished: false,
        createdAt: new Date("2026-03-09T10:00:00.000Z"),
        updatedAt: new Date("2026-03-09T10:00:00.000Z"),
      },
    ]);
    mockedPrisma.testimonial.count.mockResolvedValue(23);

    const req = {
      params: { slug: "demo-project" },
      query: { page: "2", limit: "10" },
      user: { id: "user_1" },
    } as unknown as Request;
    const res = createResponse();
    const next = createNext();

    await listTestimonials(req, res, next as unknown as NextFunction);

    expect(mockedPrisma.testimonial.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 }),
    );

    const responseBody = res.json.mock.calls[0]?.[0];
    expect(responseBody).toBeDefined();
    expect(responseBody!.meta.pagination).toMatchObject({
      page: 2,
      limit: 10,
      total: 23,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns empty owner testimonial list for a valid project", async () => {
    mockedPrisma.project.findFirst.mockResolvedValue({
      id: "proj_1",
      slug: "demo-project",
      name: "Demo Project",
    });
    mockedPrisma.testimonial.findMany.mockResolvedValue([]);
    mockedPrisma.testimonial.count.mockResolvedValue(0);

    const req = {
      params: { slug: "demo-project" },
      query: { page: "1", limit: "10" },
      user: { id: "user_1" },
    } as unknown as Request;
    const res = createResponse();
    const next = createNext();

    await listTestimonials(req, res, next as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(200);
    const responseBody = res.json.mock.calls[0]?.[0];
    expect(responseBody).toBeDefined();
    expect(responseBody!.data).toEqual([]);
    expect(responseBody!.meta.pagination.total).toBe(0);
    expect(next).not.toHaveBeenCalled();
  });

  it("forwards not-found when user does not own project in detail endpoint", async () => {
    mockedPrisma.project.findFirst.mockResolvedValue(null);

    const req = {
      params: { slug: "demo-project", id: "t_1" },
      user: { id: "user_1" },
    } as unknown as Request;
    const res = createResponse();
    const next = createNext();

    await getTestimonialById(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0]?.[0] as unknown as Error;
    expect(error).toBeDefined();
    expect(error.message).toContain("Project not found or you don't have access");
  });

  it("returns testimonial detail for owned project", async () => {
    mockedPrisma.project.findFirst.mockResolvedValue({
      id: "proj_1",
      slug: "demo-project",
      name: "Demo Project",
    });
    mockedPrisma.testimonial.findFirst.mockResolvedValue({
      id: "t_1",
      userId: null,
      projectId: "proj_1",
      authorName: "A",
      authorEmail: "a@example.com",
      authorRole: null,
      authorCompany: null,
      authorAvatar: null,
      content: "Detailed testimonial",
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
      moderationScore: 0.05,
      moderationFlags: null,
      autoPublished: false,
      createdAt: new Date("2026-03-09T10:00:00.000Z"),
      updatedAt: new Date("2026-03-09T10:00:00.000Z"),
    });

    const req = {
      params: { slug: "demo-project", id: "t_1" },
      user: { id: "user_1" },
    } as unknown as Request;
    const res = createResponse();
    const next = createNext();

    await getTestimonialById(req, res, next as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(200);
    const responseBody = res.json.mock.calls[0]?.[0];
    expect(responseBody).toBeDefined();
    expect(responseBody!.data).toMatchObject({
      id: "t_1",
      project: {
        id: "proj_1",
        slug: "demo-project",
        name: "Demo Project",
      },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("prevents publishing unapproved testimonial in update endpoint", async () => {
    mockedPrisma.project.findFirst.mockResolvedValue({
      id: "proj_1",
      slug: "demo-project",
      name: "Demo Project",
    });
    mockedPrisma.testimonial.findFirst.mockResolvedValue({
      id: "t_1",
      projectId: "proj_1",
      isApproved: false,
    });

    const req = {
      params: { slug: "demo-project", id: "t_1" },
      body: { isPublished: true },
      user: { id: "user_1" },
    } as unknown as Request;
    const res = createResponse();
    const next = createNext();

    await updateTestimonial(req, res, next as unknown as NextFunction);

    expect(mockedPrisma.testimonial.update).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0]?.[0] as unknown as Error;
    expect(error).toBeDefined();
    expect(error.message).toContain("Cannot publish unapproved testimonial");
  });

  it("updates testimonial moderation fields for owned project", async () => {
    mockedPrisma.project.findFirst.mockResolvedValue({
      id: "proj_1",
      slug: "demo-project",
      name: "Demo Project",
    });
    mockedPrisma.testimonial.findFirst.mockResolvedValue({
      id: "t_1",
      projectId: "proj_1",
      isApproved: true,
    });
    mockedPrisma.testimonial.update.mockResolvedValue({
      id: "t_1",
      moderationStatus: "APPROVED",
      isApproved: true,
      isPublished: true,
    });

    const req = {
      params: { slug: "demo-project", id: "t_1" },
      body: {
        moderationStatus: "APPROVED",
        isApproved: true,
        isPublished: true,
      },
      user: { id: "user_1" },
    } as unknown as Request;
    const res = createResponse();
    const next = createNext();

    await updateTestimonial(req, res, next as unknown as NextFunction);

    expect(mockedPrisma.testimonial.update).toHaveBeenCalledWith({
      where: { id: "t_1" },
      data: {
        isPublished: true,
        isApproved: true,
        moderationStatus: "APPROVED",
      },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });

  it("deletes testimonial when ownership and membership checks pass", async () => {
    mockedPrisma.project.findFirst.mockResolvedValue({
      id: "proj_1",
      slug: "demo-project",
    });
    mockedPrisma.testimonial.findFirst.mockResolvedValue({
      id: "t_1",
      projectId: "proj_1",
    });
    mockedPrisma.testimonial.delete.mockResolvedValue({ id: "t_1" });

    const req = {
      params: { slug: "demo-project", id: "t_1" },
      user: { id: "user_1" },
    } as unknown as Request;
    const res = createResponse();
    const next = createNext();

    await deleteTestimonial(req, res, next as unknown as NextFunction);

    expect(mockedPrisma.testimonial.delete).toHaveBeenCalledWith({
      where: { id: "t_1" },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });

  it("applies moderation queue filters and exposes paginated response", async () => {
    mockedPrisma.project.findFirst.mockResolvedValue({
      id: "proj_1",
      slug: "demo-project",
      name: "Demo Project",
    });
    mockedPrisma.testimonial.findMany.mockResolvedValue([]);
    mockedPrisma.testimonial.count.mockResolvedValue(0);
    mockedPrisma.testimonial.groupBy.mockResolvedValue([]);

    const req = {
      params: { slug: "demo-project" },
      query: { status: "flagged", verified: "true", page: "1", limit: "20" },
      user: { id: "user_1" },
    } as unknown as Request;
    const res = createResponse();
    const next = createNext();

    await getModerationQueue(req, res, next as unknown as NextFunction);

    expect(mockedPrisma.testimonial.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          projectId: "proj_1",
          moderationStatus: "FLAGGED",
          isOAuthVerified: true,
        }),
      }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns moderation queue pagination metadata for requested page", async () => {
    mockedPrisma.project.findFirst.mockResolvedValue({
      id: "proj_1",
      slug: "demo-project",
      name: "Demo Project",
    });
    mockedPrisma.testimonial.findMany.mockResolvedValue([]);
    mockedPrisma.testimonial.count.mockResolvedValue(26);
    mockedPrisma.testimonial.groupBy.mockResolvedValue([]);

    const req = {
      params: { slug: "demo-project" },
      query: { page: "2", limit: "10" },
      user: { id: "user_1" },
    } as unknown as Request;
    const res = createResponse();
    const next = createNext();

    await getModerationQueue(req, res, next as unknown as NextFunction);

    expect(mockedPrisma.testimonial.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 10 }),
    );

    const responseBody = res.json.mock.calls[0]?.[0];
    expect(responseBody).toBeDefined();
    expect(responseBody!.meta.pagination).toMatchObject({
      page: 2,
      limit: 10,
      total: 26,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: true,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("bulk-approves testimonials scoped to project", async () => {
    mockedPrisma.project.findFirst.mockResolvedValue({ id: "proj_1" });
    mockedPrisma.testimonial.updateMany.mockResolvedValue({ count: 2 });

    const req = {
      params: { slug: "demo-project" },
      body: { testimonialIds: ["t_1", "t_2"], action: "approve" },
      user: { id: "user_1" },
    } as unknown as Request;
    const res = createResponse();
    const next = createNext();

    await bulkModerationAction(req, res, next as unknown as NextFunction);

    expect(mockedPrisma.testimonial.updateMany).toHaveBeenCalledWith({
      where: {
        id: { in: ["t_1", "t_2"] },
        projectId: "proj_1",
      },
      data: {
        moderationStatus: "APPROVED",
        isApproved: true,
        isPublished: true,
      },
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });

  it("bulk moderation handles mixed valid and invalid testimonial IDs", async () => {
    mockedPrisma.project.findFirst.mockResolvedValue({ id: "proj_1" });
    mockedPrisma.testimonial.updateMany.mockResolvedValue({ count: 2 });

    const req = {
      params: { slug: "demo-project" },
      body: {
        testimonialIds: ["t_valid_1", "t_wrong_project", "t_missing", "t_valid_2"],
        action: "reject",
      },
      user: { id: "user_1" },
    } as unknown as Request;
    const res = createResponse();
    const next = createNext();

    await bulkModerationAction(req, res, next as unknown as NextFunction);

    expect(mockedPrisma.testimonial.updateMany).toHaveBeenCalledWith({
      where: {
        id: { in: ["t_valid_1", "t_wrong_project", "t_missing", "t_valid_2"] },
        projectId: "proj_1",
      },
      data: {
        moderationStatus: "REJECTED",
        isApproved: false,
        isPublished: false,
      },
    });

    expect(res.status).toHaveBeenCalledWith(200);
    const responseBody = res.json.mock.calls[0]?.[0];
    expect(responseBody).toBeDefined();
    expect(responseBody!.data).toEqual({ count: 2, action: "reject" });
    expect(responseBody!.message).toContain("2 testimonial(s) rejectd successfully");
    expect(next).not.toHaveBeenCalled();
  });

  it("blocks public testimonials when project is inactive", async () => {
    mockedPrisma.project.findUnique.mockResolvedValue({
      id: "proj_1",
      slug: "demo-project",
      name: "Demo Project",
      isActive: false,
    });

    const req = {
      params: { slug: "demo-project" },
      apiKey: { projectId: "proj_1" },
    } as unknown as Request;
    const res = createResponse();
    const next = createNext();

    await listPublicTestimonialsByApiKey(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);
    const error = next.mock.calls[0]?.[0] as unknown as Error;
    expect(error).toBeDefined();
    expect(error.message).toContain("project is not active");
  });
});
