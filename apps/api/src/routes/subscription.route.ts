import express, { Router } from 'express';
import { getAuth } from '@clerk/express';
import { PaymentService } from '../services/payment.service.js';
import { prisma } from '@workspace/database/prisma';

const router: Router = express.Router();

// Create Subscription
router.post('/', async (req, res) => {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { planSlug } = req.body;
    if (!planSlug) return res.status(400).json({ error: 'Plan slug is required' });

    try {
        const subscription = await PaymentService.createSubscription(userId, planSlug);
        res.json({ subscriptionId: subscription.id });
    } catch (error: any) {
        console.error('Error creating subscription:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

// Verify Subscription
router.post('/verify', async (req, res) => {
    const { userId } = getAuth(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body;

    try {
        const isValid = PaymentService.verifySubscriptionSignature(
            razorpay_subscription_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            return res.status(400).json({ error: 'Invalid signature' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error verifying subscription:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
