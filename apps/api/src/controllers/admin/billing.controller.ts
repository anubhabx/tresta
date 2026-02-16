import { prisma } from '@workspace/database/prisma';
import type { NextFunction, Request, Response } from 'express';

import { ResponseHandler } from '../../lib/response.js';

const PAYMENT_SUCCESS_STATES = ['captured'];
const INVOICE_SUCCESS_STATES = ['paid'];
const PAYMENT_FAILED_STATES = ['failed'];

const parsePositiveInt = (value: unknown, fallback: number, max: number): number => {
  const parsed = Number.parseInt(String(value ?? fallback), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.min(parsed, max);
};

/**
 * GET /admin/billing/overview
 * Compact top-level billing counters for dashboard cards.
 */
export const getBillingOverview = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      activeSubscriptions,
      pastDueSubscriptions,
      pausedSubscriptions,
      canceledSubscriptions,
      paymentsCount,
      failedPaymentsCount,
      grossCollected,
      collectedLast30Days,
    ] = await Promise.all([
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.subscription.count({ where: { status: 'PAST_DUE' } }),
      prisma.subscription.count({ where: { status: 'PAUSED' } }),
      prisma.subscription.count({ where: { status: 'CANCELED' } }),
      prisma.subscriptionPayment.count({
        where: {
          OR: [
            { paymentStatus: { in: PAYMENT_SUCCESS_STATES } },
            { invoiceStatus: { in: INVOICE_SUCCESS_STATES } },
          ],
        },
      }),
      prisma.subscriptionPayment.count({
        where: {
          OR: [
            { paymentStatus: { in: PAYMENT_FAILED_STATES } },
            { invoiceStatus: 'expired' },
          ],
        },
      }),
      prisma.subscriptionPayment.aggregate({
        _sum: { amount: true },
        where: {
          OR: [
            { paymentStatus: { in: PAYMENT_SUCCESS_STATES } },
            { invoiceStatus: { in: INVOICE_SUCCESS_STATES } },
          ],
        },
      }),
      prisma.subscriptionPayment.aggregate({
        _sum: { amount: true },
        where: {
          eventCreatedAt: { gte: thirtyDaysAgo },
          OR: [
            { paymentStatus: { in: PAYMENT_SUCCESS_STATES } },
            { invoiceStatus: { in: INVOICE_SUCCESS_STATES } },
          ],
        },
      }),
    ]);

    return ResponseHandler.success(res, {
      data: {
        subscriptions: {
          active: activeSubscriptions,
          pastDue: pastDueSubscriptions,
          paused: pausedSubscriptions,
          canceled: canceledSubscriptions,
        },
        payments: {
          successCount: paymentsCount,
          failedCount: failedPaymentsCount,
          grossCollected: grossCollected._sum.amount ?? 0,
          grossCollectedLast30Days: collectedLast30Days._sum.amount ?? 0,
          currencyHint: 'INR',
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /admin/billing/records
 * Compact billing rows for admin tables with cursor pagination.
 */
export const listBillingRecords = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { cursor, limit = '50', search, planId, status } = req.query;
    const pageSize = parsePositiveInt(limit, 50, 100);

    const where: {
      planId?: string;
      OR?: Array<Record<string, unknown>>;
      user?: {
        OR: Array<Record<string, unknown>>;
      };
    } = {};

    if (planId && typeof planId === 'string') {
      where.planId = planId;
    }

    if (status && typeof status === 'string') {
      const normalized = status.trim().toLowerCase();
      if (normalized.length > 0) {
        where.OR = [
          { paymentStatus: { equals: normalized, mode: 'insensitive' } },
          { invoiceStatus: { equals: normalized, mode: 'insensitive' } },
        ];
      }
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      const q = search.trim();
      where.user = {
        OR: [
          { email: { contains: q, mode: 'insensitive' } },
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
        ],
      };
    }

    const records = await prisma.subscriptionPayment.findMany({
      where,
      take: pageSize + 1,
      ...(cursor && typeof cursor === 'string'
        ? { cursor: { id: cursor }, skip: 1 }
        : {}),
      orderBy: [{ eventCreatedAt: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        externalPaymentId: true,
        externalInvoiceId: true,
        externalSubscriptionId: true,
        amount: true,
        currency: true,
        paymentStatus: true,
        invoiceStatus: true,
        eventType: true,
        eventCreatedAt: true,
        paidAt: true,
        failedAt: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            plan: true,
          },
        },
        plan: {
          select: {
            id: true,
            name: true,
            interval: true,
            price: true,
            type: true,
          },
        },
        subscription: {
          select: {
            id: true,
            status: true,
            providerStatus: true,
            currentPeriodEnd: true,
            cancelAtPeriodEnd: true,
          },
        },
      },
    });

    const hasMore = records.length > pageSize;
    const results = hasMore ? records.slice(0, pageSize) : records;
    const nextCursor = hasMore && results.length > 0 ? results[results.length - 1]?.id : null;

    return ResponseHandler.success(res, {
      data: {
        records: results.map((record) => ({
          id: record.id,
          user: {
            id: record.user.id,
            email: record.user.email,
            name:
              [record.user.firstName, record.user.lastName].filter(Boolean).join(' ') ||
              'N/A',
            currentPlan: record.user.plan,
          },
          plan: record.plan
            ? {
                id: record.plan.id,
                name: record.plan.name,
                type: record.plan.type,
                interval: record.plan.interval,
                price: record.plan.price,
              }
            : null,
          subscription: {
            id: record.subscription.id,
            externalId: record.externalSubscriptionId,
            status: record.subscription.status,
            providerStatus: record.subscription.providerStatus,
            currentPeriodEnd: record.subscription.currentPeriodEnd?.toISOString() || null,
            cancelAtPeriodEnd: record.subscription.cancelAtPeriodEnd,
          },
          payment: {
            paymentId: record.externalPaymentId,
            invoiceId: record.externalInvoiceId,
            amount: record.amount,
            currency: record.currency,
            paymentStatus: record.paymentStatus,
            invoiceStatus: record.invoiceStatus,
            eventType: record.eventType,
            eventCreatedAt: record.eventCreatedAt?.toISOString() || null,
            paidAt: record.paidAt?.toISOString() || null,
            failedAt: record.failedAt?.toISOString() || null,
          },
          createdAt: record.createdAt.toISOString(),
        })),
        nextCursor,
        hasMore,
      },
    });
  } catch (error) {
    next(error);
  }
};
