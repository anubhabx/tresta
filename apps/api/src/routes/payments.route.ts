
import { Router } from "express";
import {
    createSubscription,
    verifyPayment,
    getSubscriptionDetails,
    cancelSubscription,
    resumeSubscription,
} from "../controllers/payments.controller.js";
import { attachUser } from "../middleware/auth.middleware.js";

const paymentsRouter: Router = Router();

// Protected routes (require login)
paymentsRouter.post("/subscription", attachUser, createSubscription);
paymentsRouter.get("/subscription", attachUser, getSubscriptionDetails);
paymentsRouter.post("/verify", attachUser, verifyPayment);
paymentsRouter.post("/cancel", attachUser, cancelSubscription);
paymentsRouter.post("/resume", attachUser, resumeSubscription);

export { paymentsRouter };
