import { beforeEach, describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";

import { prisma } from "@workspace/database/prisma";

type PrivacyHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

let requestPrivacyAccess: PrivacyHandler | null = null;
let getPrivacyData: PrivacyHandler | null = null;
let deletePrivacyData: PrivacyHandler | null = null;

vi.mock("@workspace/database/prisma", () => ({
  NotificationType: {
    PRIVACY_REQUEST: "PRIVACY_REQUEST",
  },
  prisma: {
    testimonial: {
      count: vi.fn(),
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

vi.mock("../src/services/email.service.js", () => ({
  EmailService: {
    sendEmail: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("../src/services/notification.service.js", () => ({
  NotificationService: {
    create: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("../src/utils/encryption.js", () => ({
  decrypt: vi.fn((value: string) => `decrypted:${value}`),
}));

vi.mock("../src/config/urls.js", () => ({
  getAppBaseUrl: vi.fn(() => "https://app.example.test"),
}));

type MockedPrisma = typeof prisma & {
  testimonial: {
    count: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
    updateMany: ReturnType<typeof vi.fn>;
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

const loadPrivacyController = async () => {
  if (requestPrivacyAccess && getPrivacyData && deletePrivacyData) {
    return;
  }

  const controller = await import("../src/controllers/privacy.controller.js");
  requestPrivacyAccess = controller.requestPrivacyAccess;
  getPrivacyData = controller.getPrivacyData;
  deletePrivacyData = controller.deletePrivacyData;
};

describe("privacy flows and compliance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = process.env.JWT_SECRET ?? "privacy_test_secret";
  });

  it("returns masked success when no testimonials are linked to email", async () => {
    await loadPrivacyController();
    mockedPrisma.testimonial.count.mockResolvedValue(0);

    const req = {
      body: { email: "none@example.com" },
    } as unknown as Request;
    const res = createResponse();
    const next = createNext();

    await requestPrivacyAccess!(req, res, next as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "If we have data linked to this email, you will receive a magic link shortly.",
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("rejects privacy export without bearer token", async () => {
    await loadPrivacyController();

    const req = {
      headers: {},
    } as unknown as Request;
    const res = createResponse();
    const next = createNext();

    await getPrivacyData!(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);
    expect((next.mock.calls[0]?.[0] as Error).message).toContain("No token provided");
  });

  it("rejects privacy delete with invalid token", async () => {
    await loadPrivacyController();

    const req = {
      headers: { authorization: "Bearer invalid.jwt.token" },
    } as unknown as Request;
    const res = createResponse();
    const next = createNext();

    await deletePrivacyData!(req, res, next as unknown as NextFunction);

    expect(next).toHaveBeenCalledTimes(1);
    expect((next.mock.calls[0]?.[0] as Error).message).toContain("Invalid or expired token");
  });

  it("formats privacy export payload and decrypts user agent", async () => {
    await loadPrivacyController();

    const token = jwt.sign(
      { email: "alice@example.com", type: "privacy-access" },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" },
    );

    mockedPrisma.testimonial.findMany.mockResolvedValue([
      {
        id: "t_1",
        authorEmail: "alice@example.com",
        content: "Great product",
        userAgent: "enc_ua_1",
      },
      {
        id: "t_2",
        authorEmail: "alice@example.com",
        content: "Works well",
        userAgent: null,
      },
    ]);

    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as unknown as Request;
    const res = createResponse();
    const next = createNext();

    await getPrivacyData!(req, res, next as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0]?.[0];
    expect(body.data.count).toBe(2);
    expect(body.data.testimonials[0].userAgent).toBe("decrypted:enc_ua_1");
    expect(body.data.testimonials[1].userAgent).toBeNull();
    expect(next).not.toHaveBeenCalled();
  });

  it("anonymizes testimonials on privacy deletion requests", async () => {
    await loadPrivacyController();

    const token = jwt.sign(
      { email: "alice@example.com", type: "privacy-access" },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" },
    );

    mockedPrisma.testimonial.updateMany.mockResolvedValue({ count: 3 });

    const req = {
      headers: { authorization: `Bearer ${token}` },
    } as unknown as Request;
    const res = createResponse();
    const next = createNext();

    await deletePrivacyData!(req, res, next as unknown as NextFunction);

    expect(mockedPrisma.testimonial.updateMany).toHaveBeenCalledWith({
      where: { authorEmail: { equals: "alice@example.com", mode: "insensitive" } },
      data: expect.objectContaining({
        ipAddress: null,
        userAgent: null,
        authorEmail: null,
        authorName: "Anonymous (Redacted)",
      }),
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ processed: 3 }),
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });
});
