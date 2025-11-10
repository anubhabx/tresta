import { syncUserToDB } from "../webhooks/clerk.webhook.ts";
import { Router } from "express";
import { idempotencyMiddleware } from "../middleware/idempotency.middleware.ts";

export const webhookRouter: Router = Router();

webhookRouter.post("/", idempotencyMiddleware, syncUserToDB);
