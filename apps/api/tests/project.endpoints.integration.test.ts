import { beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import type { AddressInfo } from "net";

import {
  createProject,
  deleteProject,
  getPublicProjectBySlug,
  updateProject,
} from "../src/controllers/project.controller.js";
import { ApiError } from "../src/lib/errors.js";
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
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
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
    findFirst: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
};

const mockedPrisma = prisma as unknown as MockedPrisma;

function createTestApp() {
  const app = express();
  app.use(express.json());

  app.use("/api/projects", (req, _res, next) => {
    req.user = { id: req.header("x-test-user-id") ?? "user_1" };
    next();
  });

  app.post("/api/projects", createProject);
  app.put("/api/projects/:slug", updateProject);
  app.delete("/api/projects/:slug", deleteProject);

  app.get("/api/public/projects/:slug", getPublicProjectBySlug);

  app.use(
    (
      error: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      if (error instanceof ApiError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message,
          code: error.code,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Unhandled integration test error",
      });
    },
  );

  return app;
}

async function executeRequest(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  options?: {
    body?: Record<string, unknown>;
    userId?: string;
  },
) {
  const app = createTestApp();
  const server = app.listen(0);

  const address = server.address() as AddressInfo;
  const response = await fetch(`http://127.0.0.1:${address.port}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      ...(options?.userId ? { "x-test-user-id": options.userId } : {}),
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = await response.json();

  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

  return {
    status: response.status,
    payload,
  };
}

describe("project endpoint integrations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates, updates, and deletes a project through HTTP endpoints", async () => {
    const createdAt = new Date("2026-03-09T10:00:00.000Z");
    const updatedAt = new Date("2026-03-09T10:00:00.000Z");

    mockedPrisma.project.findUnique.mockResolvedValueOnce(null);
    mockedPrisma.project.create.mockResolvedValueOnce({
      id: "proj_1",
      userId: "user_1",
      name: "Demo Project",
      slug: "demo-project",
      shortDescription: null,
      description: null,
      logoUrl: null,
      projectType: "OTHER",
      websiteUrl: null,
      collectionFormUrl: "https://app.example.test/testimonials/demo-project",
      brandColorPrimary: null,
      brandColorSecondary: null,
      socialLinks: null,
      tags: [],
      visibility: "PRIVATE",
      formConfig: null,
      isActive: true,
      createdAt,
      updatedAt,
    });

    const createResponse = await executeRequest("POST", "/api/projects", {
      body: {
        name: "Demo Project",
        slug: "demo-project",
      },
    });

    expect(createResponse.status).toBe(201);
    expect(createResponse.payload.success).toBe(true);
    expect(createResponse.payload.data.slug).toBe("demo-project");

    mockedPrisma.project.findFirst
      .mockResolvedValueOnce({
        id: "proj_1",
        slug: "demo-project",
        userId: "user_1",
        isActive: true,
        user: { plan: "FREE" },
      })
      .mockResolvedValueOnce(null);

    mockedPrisma.project.update.mockResolvedValueOnce({
      id: "proj_1",
      userId: "user_1",
      name: "Updated Project",
      slug: "updated-project",
      shortDescription: null,
      description: null,
      logoUrl: null,
      projectType: "OTHER",
      websiteUrl: null,
      collectionFormUrl: null,
      brandColorPrimary: null,
      brandColorSecondary: null,
      socialLinks: null,
      tags: [],
      visibility: "PRIVATE",
      formConfig: null,
      isActive: true,
      _count: { testimonials: 0, widgets: 0 },
      createdAt,
      updatedAt: new Date("2026-03-09T10:30:00.000Z"),
    });

    const updateResponse = await executeRequest(
      "PUT",
      "/api/projects/demo-project",
      {
        body: {
          name: "Updated Project",
          slug: "updated-project",
        },
      },
    );

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.payload.success).toBe(true);
    expect(updateResponse.payload.data.slug).toBe("updated-project");

    mockedPrisma.project.findFirst.mockResolvedValueOnce({
      id: "proj_1",
      name: "Updated Project",
      slug: "updated-project",
      userId: "user_1",
    });
    mockedPrisma.project.delete.mockResolvedValueOnce({ id: "proj_1" });

    const deleteResponse = await executeRequest(
      "DELETE",
      "/api/projects/updated-project",
    );

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.payload.success).toBe(true);
    expect(deleteResponse.payload.message).toContain("deleted successfully");
  });

  it("returns active project for public endpoint and rejects inactive projects", async () => {
    mockedPrisma.project.findFirst
      .mockResolvedValueOnce({
        id: "proj_public_1",
        name: "Private but Active",
        slug: "private-active",
        logoUrl: null,
        projectType: "OTHER",
        brandColorPrimary: "#112233",
        brandColorSecondary: "#445566",
        formConfig: {},
        user: { plan: "FREE" },
      })
      .mockResolvedValueOnce(null);

    const visibleResponse = await executeRequest(
      "GET",
      "/api/public/projects/private-active",
    );

    expect(visibleResponse.status).toBe(200);
    expect(visibleResponse.payload.success).toBe(true);
    expect(visibleResponse.payload.data.slug).toBe("private-active");
    expect(visibleResponse.payload.data.brandColorPrimary).toBeNull();
    expect(visibleResponse.payload.data.brandColorSecondary).toBeNull();

    const inactiveResponse = await executeRequest(
      "GET",
      "/api/public/projects/inactive-project",
    );

    expect(inactiveResponse.status).toBe(404);
    expect(inactiveResponse.payload.success).toBe(false);
    expect(inactiveResponse.payload.message).toBe("Project not found");
  });
});
