
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

export const verifyRazorpaySignature = (
    razorpaySubscriptionId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
) => {
    const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
        .update(razorpayPaymentId + "|" + razorpaySubscriptionId)
        .digest("hex");

    return generatedSignature === razorpaySignature;
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
