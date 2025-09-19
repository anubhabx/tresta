import { syncUserToDB } from "../webhooks/clerk.webhook.ts";
import { Router } from "express";

export const webhookRouter: Router = Router();

webhookRouter.post("/", syncUserToDB);
