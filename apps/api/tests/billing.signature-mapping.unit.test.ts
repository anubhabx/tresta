import crypto from "crypto";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import {
  mapProviderSignalsToInternal,
  mapProviderStatusToInternal,
} from "../src/services/subscription-status.service.js";

let verifyPaymentSignature: (
  razorpaySubscriptionId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
) => boolean;

let verifyWebhookSignature: (
  rawBody: string,
  signature: string,
  webhookSecret: string,
) => boolean;

beforeAll(async () => {
  process.env.RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID ?? "test_key_id";
  process.env.RAZORPAY_KEY_SECRET =
    process.env.RAZORPAY_KEY_SECRET ?? "test_secret";

  const razorpayService = await import("../src/services/razorpay.service.js");
  verifyPaymentSignature = razorpayService.verifyPaymentSignature;
  verifyWebhookSignature = razorpayService.verifyWebhookSignature;
});

describe("billing signature verification", () => {
  const originalSecret = process.env.RAZORPAY_KEY_SECRET;

  afterEach(() => {
    process.env.RAZORPAY_KEY_SECRET = originalSecret;
  });

  it("verifies payment signature for valid Razorpay payload", () => {
    process.env.RAZORPAY_KEY_SECRET = "test_secret";

    const paymentId = "pay_123";
    const subscriptionId = "sub_123";
    const signature = crypto
      .createHmac("sha256", "test_secret")
      .update(`${paymentId}|${subscriptionId}`)
      .digest("hex");

    const isValid = verifyPaymentSignature(subscriptionId, paymentId, signature);

    expect(isValid).toBe(true);
  });

  it("rejects invalid payment signature", () => {
    process.env.RAZORPAY_KEY_SECRET = "test_secret";

    const isValid = verifyPaymentSignature("sub_123", "pay_123", "invalid_signature");

    expect(isValid).toBe(false);
  });

  it("rejects payment signature when secret is missing", () => {
    delete process.env.RAZORPAY_KEY_SECRET;

    const isValid = verifyPaymentSignature("sub_123", "pay_123", "anything");

    expect(isValid).toBe(false);
  });

  it("verifies webhook signatures with raw payload hashing", () => {
    const rawPayload = JSON.stringify({ event: "payment.captured", id: "evt_1" });
    const secret = "webhook_secret";
    const signature = crypto
      .createHmac("sha256", secret)
      .update(rawPayload)
      .digest("hex");

    expect(verifyWebhookSignature(rawPayload, signature, secret)).toBe(true);
    expect(verifyWebhookSignature(rawPayload, "bad_signature", secret)).toBe(false);
  });
});

describe("billing provider mapping and reconciliation", () => {
  it("maps provider statuses to internal lifecycle statuses", () => {
    expect(mapProviderStatusToInternal("active")).toBe("ACTIVE");
    expect(mapProviderStatusToInternal("pending")).toBe("PAST_DUE");
    expect(mapProviderStatusToInternal("paused")).toBe("PAUSED");
    expect(mapProviderStatusToInternal("cancelled")).toBe("CANCELED");
    expect(mapProviderStatusToInternal("authenticated")).toBe("INCOMPLETE");
  });

  it("reconciles payment failure signals into past-due status", () => {
    expect(mapProviderSignalsToInternal("active", "paid", "captured")).toBe("ACTIVE");
    expect(mapProviderSignalsToInternal("active", "payment_failed", "captured")).toBe("PAST_DUE");
    expect(mapProviderSignalsToInternal("authenticated", "paid", "failed")).toBe("PAST_DUE");
  });
});
