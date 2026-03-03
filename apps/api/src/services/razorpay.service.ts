
import Razorpay from "razorpay";
import crypto from "crypto";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.warn("Razorpay credentials missing in environment variables.");
}

export const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export const createRazorpaySubscription = async (
    planId: string,
    totalCount: number = 120,
    customerNotify: 1 | 0 = 1,
) => {
    const subscription = await razorpay.subscriptions.create({
        plan_id: planId,
        total_count: totalCount,
        quantity: 1,
        customer_notify: customerNotify,
    });
    return subscription;
};

function secureCompareHex(actual: string, expected: string): boolean {
    try {
        const actualBuffer = Buffer.from(actual, "hex");
        const expectedBuffer = Buffer.from(expected, "hex");

        if (actualBuffer.length !== expectedBuffer.length) {
            return false;
        }

        return crypto.timingSafeEqual(actualBuffer, expectedBuffer);
    } catch {
        return false;
    }
}

export const verifyPaymentSignature = (
    razorpaySubscriptionId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
) => {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
        return false;
    }

    const generatedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${razorpayPaymentId}|${razorpaySubscriptionId}`)
        .digest("hex");

    return secureCompareHex(generatedSignature, razorpaySignature);
};

export const verifyWebhookSignature = (
    rawBody: string,
    signature: string,
    webhookSecret: string,
) => {
    const generatedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

    return secureCompareHex(generatedSignature, signature);
};

export const cancelRazorpaySubscription = async (
    subscriptionId: string
): Promise<any> => {
    const result = await razorpay.subscriptions.cancel(subscriptionId, true);
    return result;
};

export const getSubscription = async (subscriptionId: string) => {
    return await razorpay.subscriptions.fetch(subscriptionId);
};
