import { z } from "zod";
import type {
  CreateSubscriptionRequest,
  VerifyPaymentRequest,
} from "@workspace/types";

const createSubscriptionSchema = z.object({
  planId: z.string().min(1, "Plan ID is required"),
});

const verifyPaymentSchema = z.object({
  razorpay_payment_id: z.string().min(1, "Payment ID is required"),
  razorpay_subscription_id: z.string().min(1, "Subscription ID is required"),
  razorpay_signature: z.string().min(1, "Payment signature is required"),
  planId: z.string().min(1, "Plan ID is required"),
});

export function parseCreateSubscriptionRequest(
  payload: unknown,
): CreateSubscriptionRequest {
  return createSubscriptionSchema.parse(payload);
}

export function parseVerifyPaymentRequest(
  payload: unknown,
): VerifyPaymentRequest {
  return verifyPaymentSchema.parse(payload);
}