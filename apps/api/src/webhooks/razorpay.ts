import { Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '@workspace/database/prisma';

export const handleRazorpayWebhook = async (req: Request, res: Response) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'] as string;

    if (!secret) {
        console.error('RAZORPAY_WEBHOOK_SECRET is not set');
        return res.status(500).send('Webhook secret not configured');
    }

    const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(req.body))
        .digest('hex');

    if (generatedSignature !== signature) {
        console.error('Invalid Razorpay Webhook Signature');
        return res.status(400).send('Invalid signature');
    }

    const event = req.body;
    console.log('Received Razorpay Webhook:', event.event);

    try {
        switch (event.event) {
            case 'subscription.charged':
                await handleSubscriptionCharged(event.payload);
                break;
            case 'subscription.cancelled':
                await handleSubscriptionCancelled(event.payload);
                break;
            // Add other events as needed
            default:
                console.log('Unhandled event:', event.event);
        }
        res.json({ status: 'ok' });
    } catch (error) {
        console.error('Error handling webhook:', error);
        res.status(500).send('Internal Server Error');
    }
};

async function handleSubscriptionCharged(payload: any) {
    const { subscription, payment } = payload;
    const razorpaySubscriptionId = subscription.entity.id;
    const razorpayPlanId = subscription.entity.plan_id;

    // Find the plan in our DB
    const plan = await prisma.plan.findFirst({
        where: { razorpayPlanId },
    });

    if (!plan) {
        console.error(`Plan not found for Razorpay Plan ID: ${razorpayPlanId}`);
        return;
    }

    // Find or create subscription in our DB
    // Note: We might need to look up user by metadata or notes if not already linked
    // But usually we create the subscription record when initiating, so we can update it here.

    // For now, let's assume we can find it by externalSubscriptionId if we saved it, 
    // or we need to rely on notes passed during creation.
    const userId = subscription.entity.notes?.userId;

    if (userId) {
        await prisma.subscription.upsert({
            where: { userId },
            create: {
                userId,
                planId: plan.id,
                status: 'ACTIVE',
                externalSubscriptionId: razorpaySubscriptionId,
                currentPeriodStart: new Date(subscription.entity.current_start * 1000),
                currentPeriodEnd: new Date(subscription.entity.current_end * 1000),
            },
            update: {
                planId: plan.id,
                status: 'ACTIVE',
                externalSubscriptionId: razorpaySubscriptionId,
                currentPeriodStart: new Date(subscription.entity.current_start * 1000),
                currentPeriodEnd: new Date(subscription.entity.current_end * 1000),
            },
        });
        console.log(`Subscription updated for user ${userId}`);
    } else {
        console.error('User ID not found in subscription notes');
    }
}

async function handleSubscriptionCancelled(payload: any) {
    const { subscription } = payload;
    const razorpaySubscriptionId = subscription.entity.id;

    await prisma.subscription.updateMany({
        where: { externalSubscriptionId: razorpaySubscriptionId },
        data: {
            status: 'CANCELED',
            cancelAtPeriodEnd: true, // Or immediate depending on logic
        },
    });
    console.log(`Subscription cancelled: ${razorpaySubscriptionId}`);
}
