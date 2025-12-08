
import { Router } from "express";
import {
    createSubscription,
    verifyPayment,
} from "../controllers/payments.controller.js";
import { attachUser } from "../middleware/auth.middleware.js";

const paymentsRouter: Router = Router();

// Protected routes (require login)
paymentsRouter.post("/subscription", attachUser, createSubscription);
paymentsRouter.post("/verify", attachUser, verifyPayment);

export { paymentsRouter };
