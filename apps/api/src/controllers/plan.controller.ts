
import { prisma } from "@workspace/database/prisma";
import type { Request, Response, NextFunction } from "express";
import {
    BadRequestError,
    NotFoundError,
    handlePrismaError,
} from '../lib/errors.js';
import { ResponseHandler } from '../lib/response.js';

export const listPlans = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const plans = await prisma.plan.findMany({
            where: { isActive: true },
            orderBy: { price: 'asc' },
        });

        return ResponseHandler.success(res, {
            message: "Plans retrieved successfully",
            data: plans,
        });
    } catch (error) {
        next(error);
    }
};

export const createPlan = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { name, description, price, currency, interval, limits, razorpayPlanId, type } = req.body;

        if (!name || !price || !interval || !limits) {
            throw new BadRequestError("Missing required fields: name, price, interval, limits");
        }

        const plan = await prisma.plan.create({
            data: {
                name,
                description,
                price,
                currency: currency || "INR",
                interval,
                limits,
                razorpayPlanId,
                type: type || "FREE",
                isActive: true,
            },
        });

        return ResponseHandler.created(res, {
            message: "Plan created successfully",
            data: plan,
        });
    } catch (error) {
        next(handlePrismaError(error));
    }
};

export const updatePlan = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const existingPlan = await prisma.plan.findUnique({ where: { id } });
        if (!existingPlan) {
            throw new NotFoundError("Plan not found");
        }

        const updatedPlan = await prisma.plan.update({
            where: { id },
            data,
        });

        return ResponseHandler.updated(res, {
            message: "Plan updated successfully",
            data: updatedPlan,
        });
    } catch (error) {
        next(handlePrismaError(error));
    }
};

export const deletePlan = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id } = req.params;

        // Soft delete to preserve history? Or hard delete?
        // User asked to "manage" plans. Usually soft delete (isActive=false) is better for historical data.
        // Schema has isActive.

        const plan = await prisma.plan.update({
            where: { id },
            data: { isActive: false },
        });

        return ResponseHandler.success(res, {
            message: "Plan deactivated successfully",
            data: plan,
        });
    } catch (error) {
        next(handlePrismaError(error));
    }
};
