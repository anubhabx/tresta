
import { Router } from "express";
import {
    createSubscription,
    verifyPayment,
    getSubscriptionDetails,
    cancelSubscription,
} from "../controllers/payments.controller.js";
import { attachUser, requireAuth } from "../middleware/auth.middleware.js";

const paymentsRouter: Router = Router();

// Protected routes (require login)
paymentsRouter.post("/subscription", attachUser, requireAuth, createSubscription);
paymentsRouter.get("/subscription", attachUser, requireAuth, getSubscriptionDetails);
paymentsRouter.post("/verify", attachUser, requireAuth, verifyPayment);
paymentsRouter.post("/cancel", attachUser, requireAuth, cancelSubscription);

export { paymentsRouter };
