import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";

import { createProject } from "../src/controllers/project.controller.js";
import { CreateProjectSchema } from "../src/validators/schemas.js";
import { ConflictError, ValidationError } from "../src/lib/errors.js";
import { prisma } from "@workspace/database/prisma";

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
    project: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock("../src/services/plan-gate.service.js", () => ({
  assertCanUseCustomColors: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../src/config/urls.js", () => ({
  getAppBaseUrl: vi.fn(() => "https://app.example.test"),
}));

type MockedPrisma = typeof prisma & {
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

describe("project validation and slug behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("enforces lowercase-hyphen slug format in schema validation", () => {
    const invalidSlug = CreateProjectSchema.safeParse({
      name: "Demo Project",
      slug: "Invalid Slug",
    });
    const validSlug = CreateProjectSchema.safeParse({
      name: "Demo Project",
      slug: "demo-project",
    });

    expect(invalidSlug.success).toBe(false);
    expect(validSlug.success).toBe(true);
  });

  it("returns validation error and skips DB calls on invalid create payload", async () => {
    const req = {
      body: {
        name: "",
        slug: "bad slug",
      },
      user: { id: "user_1" },
    } as unknown as Request;
    const res = createResponse();
    const next = createNext();

    await createProject(req, res, next as unknown as NextFunction);

    expect(mockedPrisma.project.findUnique).not.toHaveBeenCalled();
    expect(mockedPrisma.project.create).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0]?.[0]).toBeInstanceOf(ValidationError);
  });

  it("returns conflict error when a duplicate slug already exists", async () => {
    mockedPrisma.project.findUnique.mockResolvedValue({ id: "proj_existing" });

    const req = {
      body: {
        name: "Demo Project",
        slug: "demo-project",
      },
      user: { id: "user_1" },
    } as unknown as Request;
    const res = createResponse();
    const next = createNext();

    await createProject(req, res, next as unknown as NextFunction);

    expect(mockedPrisma.project.findUnique).toHaveBeenCalledWith({
      where: { slug: "demo-project" },
    });
    expect(mockedPrisma.project.create).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0]?.[0]).toBeInstanceOf(ConflictError);
  });
});
