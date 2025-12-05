import Razorpay from 'razorpay';
import crypto from 'crypto';
import { prisma } from '@workspace/database/prisma';
import { PlanService } from './plan.service.js';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export class PaymentService {
    /**
     * Create a subscription for a user
     */
    static async createSubscription(userId: string, planSlug: string) {
        const plan = await PlanService.getPlanBySlug(planSlug);
        if (!plan) throw new Error('Plan not found');
        if (!plan.razorpayPlanId) throw new Error('Plan is not configured for payments');

        const subscription = await razorpay.subscriptions.create({
            plan_id: plan.razorpayPlanId,
            customer_notify: 1,
            total_count: 120, // 10 years
            quantity: 1,
            notes: {
                userId,
                planSlug,
            },
        });

        return subscription;
    }

    /**
     * Verify RazorPay signature
     */
    static verifySignature(orderId: string, paymentId: string, signature: string) {
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
            .update(orderId + '|' + paymentId)
            .digest('hex');

        return generatedSignature === signature;
    }

    /**
     * Verify Subscription Signature
     */
    static verifySubscriptionSignature(subscriptionId: string, paymentId: string, signature: string) {
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
            .update(paymentId + '|' + subscriptionId)
            .digest('hex');

        return generatedSignature === signature;
    }
}
