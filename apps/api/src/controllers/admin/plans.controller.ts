
import { prisma } from "@workspace/database/prisma";
import type { Request, Response, NextFunction } from "express";
import { NotFoundError } from '../../lib/errors.js';
import { ResponseHandler } from '../../lib/response.js';

export const listAllPlans = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const plans = await prisma.plan.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return ResponseHandler.success(res, {
            message: "All plans retrieved successfully",
            data: plans,
        });
    } catch (error) {
        next(error);
    }
};

export const getPlanById = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id } = req.params;
        const plan = await prisma.plan.findUnique({
            where: { id },
        });

        if (!plan) {
            throw new NotFoundError("Plan not found");
        }

        return ResponseHandler.success(res, {
            message: "Plan details retrieved successfully",
            data: plan,
        });
    } catch (error) {
        next(error);
    }
};
