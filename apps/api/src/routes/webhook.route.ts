import { Router } from "express";

import { idempotencyMiddleware } from '../middleware/idempotency.middleware.js';
import { createIpRateLimiter } from '../middleware/rate-limiter.js';
import { syncUserToDB } from '../webhooks/clerk.webhook.js';
import { handleRazorpayWebhook } from '../webhooks/razorpay.webhook.js';

export const webhookRouter: Router = Router();

const webhookIpRateLimiter = createIpRateLimiter(300, 60, 'webhook');

webhookRouter.post("/clerk", webhookIpRateLimiter, idempotencyMiddleware, syncUserToDB);
webhookRouter.post("/", webhookIpRateLimiter, idempotencyMiddleware, syncUserToDB);
webhookRouter.post("/razorpay", webhookIpRateLimiter, handleRazorpayWebhook);
