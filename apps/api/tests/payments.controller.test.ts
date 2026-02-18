import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

import { verifyPayment } from "../src/controllers/payments.controller.js";
import { prisma } from "@workspace/database/prisma";
import { ResponseHandler } from "../src/lib/response.js";
import { NotFoundError } from "../src/lib/errors.js";
import {
  verifyRazorpaySignature,
  getSubscription,
} from "../src/services/razorpay.service.js";

vi.mock("@workspace/database/prisma", () => ({
  prisma: {
    subscription: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    plan: {
      findUnique: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
  },
}));

vi.mock("../src/lib/response.js", () => ({
  ResponseHandler: {
    success: vi.fn(),
  },
}));

vi.mock("../src/services/razorpay.service.js", () => ({
  verifyRazorpaySignature: vi.fn(),
  getSubscription: vi.fn(),
}));

type MockedPrisma = typeof prisma & {
  subscription: {
    findFirst: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  plan: {
    findUnique: ReturnType<typeof vi.fn>;
  };
  user: {
    update: ReturnType<typeof vi.fn>;
  };
};

const mockedPrisma = prisma as unknown as MockedPrisma;

const mockedVerifySignature = verifyRazorpaySignature as unknown as ReturnType<
  typeof vi.fn
>;
const mockedGetSubscription = getSubscription as unknown as ReturnType<
  typeof vi.fn
>;

const mockedSuccess = ResponseHandler.success as unknown as ReturnType<
  typeof vi.fn
>;

const createRequest = (overrides?: Partial<Request>, userId = "user_1") =>
  ({
    body: {
      razorpay_payment_id: "pay_123",
      razorpay_subscription_id: "sub_123",
      razorpay_signature: "sig_123",
      planId: "plan_razor",
      ...(overrides?.body as any),
    },
    user: { id: userId },
    ...overrides,
  }) as Request;

const createResponse = () => ({}) as Response;

const createNext = () => vi.fn<Parameters<NextFunction>, void>();

describe("verifyPayment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates only the authenticated user's subscription and does not write razorpayOrderId", async () => {
    mockedVerifySignature.mockReturnValue(true);
    mockedGetSubscription.mockResolvedValue({
      status: "active",
      current_start: 1700000000,
      current_end: 1702592000,
    });

    mockedPrisma.subscription.findFirst.mockResolvedValue({
      id: "sub_db_1",
      userId: "user_1",
      externalSubscriptionId: "sub_123",
    });

    mockedPrisma.subscription.update.mockResolvedValue({
      id: "sub_db_1",
      status: "ACTIVE",
    });

    mockedPrisma.plan.findUnique.mockResolvedValue({
      id: "plan_db_1",
      type: "PRO",
    });

    const req = createRequest();
    const res = createResponse();
    const next = createNext();

    await verifyPayment(req, res, next);

    expect(mockedPrisma.subscription.findFirst).toHaveBeenCalledWith({
      where: {
        externalSubscriptionId: "sub_123",
        userId: "user_1",
      },
    });

    expect(mockedPrisma.subscription.update).toHaveBeenCalledTimes(1);
    const updateArgs = mockedPrisma.subscription.update.mock.calls[0][0];

    expect(updateArgs.where).toEqual({ id: "sub_db_1" });
    expect(updateArgs.data).not.toHaveProperty("razorpayOrderId");

    expect(mockedSuccess).toHaveBeenCalledTimes(1);
    expect(next).not.toHaveBeenCalled();
  });

  it("fails when subscription does not belong to the authenticated user", async () => {
    mockedVerifySignature.mockReturnValue(true);
    mockedGetSubscription.mockResolvedValue({
      status: "active",
    });

    mockedPrisma.subscription.findFirst.mockResolvedValue(null);

    const req = createRequest(undefined, "user_other");
    const res = createResponse();
    const next = createNext();

    await verifyPayment(req, res, next);

    expect(mockedPrisma.subscription.update).not.toHaveBeenCalled();
    expect(mockedSuccess).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);

    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(NotFoundError);
  });
});

