import { Router } from "express";

import { idempotencyMiddleware } from '../middleware/idempotency.middleware.js';
import { syncUserToDB } from '../webhooks/clerk.webhook.js';
import { handleRazorpayWebhook } from '../webhooks/razorpay.webhook.js';

export const webhookRouter: Router = Router();

webhookRouter.post("/clerk", idempotencyMiddleware, syncUserToDB);
webhookRouter.post("/", idempotencyMiddleware, syncUserToDB);
webhookRouter.post("/razorpay", handleRazorpayWebhook);
