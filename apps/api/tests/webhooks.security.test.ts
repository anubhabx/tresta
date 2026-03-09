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
    $transaction: vi.fn(),
    user: {
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    paymentWebhookEvent: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    subscription: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    subscriptionPayment: {
      findUnique: vi.fn(),
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
  $transaction: ReturnType<typeof vi.fn>;
  user: { upsert: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  paymentWebhookEvent: {
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  subscription: {
    findUnique: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  subscriptionPayment: {
    findUnique: ReturnType<typeof vi.fn>;
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

  it("marks out-of-order webhook events as stale without mutating subscription state", async () => {
    mockedVerifyWebhookSignature.mockReturnValue(true);
    mockedPrisma.paymentWebhookEvent.findUnique.mockResolvedValue(null);

    const tx = {
      paymentWebhookEvent: {
        create: vi.fn().mockResolvedValue(undefined),
        update: vi.fn().mockResolvedValue(undefined),
      },
      subscription: {
        findUnique: vi.fn().mockResolvedValue({
          id: "sub_local_1",
          userId: "user_1",
          userPlan: "PRO",
          planId: "plan_1",
          amount: 30000,
          currency: "INR",
          externalSubscriptionId: "sub_123",
          providerStatus: "active",
          lastPaymentStatus: "captured",
          lastInvoiceStatus: "paid",
          currentPeriodStart: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
          razorpayPaymentId: null,
          lastWebhookAt: new Date("2026-03-09T12:00:00.000Z"),
        }),
        findFirst: vi.fn().mockResolvedValue(null),
        update: vi.fn().mockResolvedValue(undefined),
      },
      subscriptionPayment: {
        findUnique: vi.fn().mockResolvedValue(null),
        upsert: vi.fn().mockResolvedValue(undefined),
      },
      user: {
        update: vi.fn().mockResolvedValue(undefined),
      },
    };

    mockedPrisma.$transaction.mockImplementation(async (callback: any) => callback(tx));

    const staleEventPayload = {
      event: "subscription.activated",
      created_at: 1773050400,
      payload: {
        subscription: {
          entity: {
            id: "sub_123",
            status: "active",
          },
        },
      },
    };

    const req = {
      requestId: "req_rzp_stale_1",
      header: vi.fn().mockImplementation((name: string) => {
        if (name === "x-razorpay-signature") return "valid_signature";
        if (name === "x-razorpay-event-id") return "evt_stale_1";
        return undefined;
      }),
      body: Buffer.from(JSON.stringify(staleEventPayload)),
    } as unknown as Request;

    const res = createResponse();
    const next = createNext();

    await handleRazorpayWebhook(req, res, next as unknown as NextFunction);

    expect(tx.paymentWebhookEvent.update).toHaveBeenCalledWith({
      where: { providerEventId: "razorpay:evt_stale_1" },
      data: expect.objectContaining({ status: "stale" }),
    });
    expect(tx.subscription.update).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, message: "Webhook processed" }),
    );
  });
});
