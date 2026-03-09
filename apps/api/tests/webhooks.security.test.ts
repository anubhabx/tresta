import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";

import { syncUserToDB } from "../src/webhooks/clerk.webhook.js";
import { handleRazorpayWebhook } from "../src/webhooks/razorpay.webhook.js";
import { prisma } from "@workspace/database/prisma";
import { verifyWebhookSignature } from "../src/services/razorpay.service.js";

const verifyWebhookMock = vi.hoisted(() => vi.fn());

vi.mock("@clerk/express/webhooks", () => ({
  verifyWebhook: verifyWebhookMock,
}));

vi.mock("@workspace/database/prisma", () => ({
  prisma: {
    user: {
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    paymentWebhookEvent: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    subscription: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    payment: {
      findFirst: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));

vi.mock("../src/services/operational-alerts.service.js", () => ({
  recordOperationalAlert: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../src/services/razorpay.service.js", () => ({
  verifyWebhookSignature: vi.fn(),
}));

const mockedPrisma = prisma as unknown as {
  user: { upsert: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  paymentWebhookEvent: {
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  subscription: {
    findUnique: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  payment: {
    findFirst: ReturnType<typeof vi.fn>;
    upsert: ReturnType<typeof vi.fn>;
  };
};

const mockedVerifyWebhookSignature = verifyWebhookSignature as unknown as ReturnType<
  typeof vi.fn
>;

const createResponse = () => {
  const json = vi.fn();
  const send = vi.fn();
  const status = vi.fn().mockReturnValue({ json, send });

  return {
    status,
    json,
    send,
  } as unknown as Response & {
    status: ReturnType<typeof vi.fn>;
    json: ReturnType<typeof vi.fn>;
    send: ReturnType<typeof vi.fn>;
  };
};

const createNext = () => vi.fn<NextFunction>();

describe("webhook signature enforcement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLERK_WEBHOOK_SIGNING_SECRET = "clerk_secret";
    process.env.RAZORPAY_WEBHOOK_SECRET = "rzp_secret";
  });

  it("rejects Clerk webhook when signature verification fails", async () => {
    verifyWebhookMock.mockRejectedValue(new Error("invalid signature"));

    const req = {
      requestId: "req_clerk_1",
    } as unknown as Request;
    const res = createResponse();
    const next = createNext();

    await syncUserToDB(req, res, next as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith("Webhook verification failed");
  });

  it("rejects Razorpay webhook when signature header is missing", async () => {
    const req = {
      requestId: "req_rzp_1",
      header: vi.fn().mockImplementation((name: string) => {
        if (name === "x-razorpay-signature") return undefined;
        return undefined;
      }),
      body: Buffer.from('{"event":"payment.captured"}'),
    } as unknown as Request;

    const res = createResponse();
    const next = createNext();

    await handleRazorpayWebhook(req, res, next as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Missing webhook signature configuration" }),
    );
  });

  it("rejects Razorpay webhook when signature verification fails", async () => {
    mockedVerifyWebhookSignature.mockReturnValue(false);

    const req = {
      requestId: "req_rzp_2",
      header: vi.fn().mockImplementation((name: string) => {
        if (name === "x-razorpay-signature") return "invalid_signature";
        if (name === "x-razorpay-event-id") return "evt_1";
        return undefined;
      }),
      body: Buffer.from('{"event":"payment.captured"}'),
    } as unknown as Request;

    const res = createResponse();
    const next = createNext();

    await handleRazorpayWebhook(req, res, next as unknown as NextFunction);

    expect(mockedVerifyWebhookSignature).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Invalid Razorpay webhook signature" }),
    );
  });

  it("accepts Razorpay webhook with valid signature and idempotency no-op", async () => {
    mockedVerifyWebhookSignature.mockReturnValue(true);
    mockedPrisma.paymentWebhookEvent.findUnique.mockResolvedValue({ id: "existing" });

    const req = {
      requestId: "req_rzp_3",
      header: vi.fn().mockImplementation((name: string) => {
        if (name === "x-razorpay-signature") return "valid_signature";
        if (name === "x-razorpay-event-id") return "evt_existing";
        return undefined;
      }),
      body: Buffer.from('{"event":"payment.captured"}'),
    } as unknown as Request;

    const res = createResponse();
    const next = createNext();

    await handleRazorpayWebhook(req, res, next as unknown as NextFunction);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, message: "Already processed" }),
    );
  });
});
