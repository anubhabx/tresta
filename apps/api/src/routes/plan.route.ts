
import { Router } from "express";
import {
    listPlans,
    createPlan,
    updatePlan,
    deletePlan,
} from "../controllers/plan.controller.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import { attachUser, requireAuth } from "../middleware/auth.middleware.js";


const planRouter: Router = Router();


// Public route to list plans
planRouter.get("/", listPlans);

// Admin routes
planRouter.post("/", attachUser, requireAuth, requireAdmin, createPlan);
planRouter.patch("/:id", attachUser, requireAuth, requireAdmin, updatePlan);
planRouter.delete("/:id", attachUser, requireAuth, requireAdmin, deletePlan);

export { planRouter };
