import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";

import { createProject } from "../src/controllers/project.controller.js";
import { prisma } from "@workspace/database/prisma";
import { ForbiddenError } from "../src/lib/errors.js";

vi.mock("@workspace/database/prisma", () => ({
  ProjectType: {
    OTHER: "OTHER",
  },
  ProjectVisibility: {
    PRIVATE: "PRIVATE",
    PUBLIC: "PUBLIC",
  },
  TestimonialType: {
    TEXT: "TEXT",
    VIDEO: "VIDEO",
  },
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    project: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("../src/config/urls.js", () => ({
  getAppBaseUrl: vi.fn(() => "https://app.example.test"),
}));

type MockedPrisma = typeof prisma & {
  user: {
    findUnique: ReturnType<typeof vi.fn>;
  };
  project: {
    findUnique: ReturnType<typeof vi.fn>;
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

describe("plan gate enforcement on paid features", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("blocks free users from creating projects with custom non-free colors", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue({ plan: "FREE" });

    const req = {
      body: {
        name: "Demo Project",
        slug: "demo-project",
        brandColorPrimary: "#123456",
      },
      user: { id: "user_free" },
    } as unknown as Request;
    const res = createResponse();
    const next = createNext();

    await createProject(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0]?.[0]).toBeInstanceOf(ForbiddenError);
    expect(mockedPrisma.project.findUnique).not.toHaveBeenCalled();
    expect(mockedPrisma.project.create).not.toHaveBeenCalled();
  });

  it("allows pro users to create projects with custom colors", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue({ plan: "PRO" });
    mockedPrisma.project.findUnique.mockResolvedValue(null);
    mockedPrisma.project.create.mockResolvedValue({
      id: "proj_1",
      userId: "user_pro",
      name: "Demo Project",
      slug: "demo-project",
      shortDescription: null,
      description: null,
      logoUrl: null,
      projectType: "OTHER",
      websiteUrl: null,
      collectionFormUrl: "https://app.example.test/testimonials/demo-project",
      brandColorPrimary: "#123456",
      brandColorSecondary: null,
      socialLinks: null,
      tags: [],
      visibility: "PRIVATE",
      formConfig: null,
      createdAt: new Date("2026-03-09T10:00:00.000Z"),
      updatedAt: new Date("2026-03-09T10:00:00.000Z"),
    });

    const req = {
      body: {
        name: "Demo Project",
        slug: "demo-project",
        brandColorPrimary: "#123456",
      },
      user: { id: "user_pro" },
    } as unknown as Request;
    const res = createResponse();
    const next = createNext();

    await createProject(req, res, next as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(mockedPrisma.project.create).toHaveBeenCalledTimes(1);
    expect(next).not.toHaveBeenCalled();
  });
});
