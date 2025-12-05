import { syncUserToDB } from '../webhooks/clerk.webhook.js';
import { Router } from "express";
import { idempotencyMiddleware } from '../middleware/idempotency.middleware.js';
import { handleRazorpayWebhook } from '../webhooks/razorpay.js';

export const webhookRouter: Router = Router();

webhookRouter.post("/", idempotencyMiddleware, syncUserToDB);
webhookRouter.post('/razorpay', handleRazorpayWebhook);
