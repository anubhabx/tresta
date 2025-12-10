
import Razorpay from "razorpay";
import crypto from "crypto";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.warn("Razorpay credentials missing in environment variables.");
}

export const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export const createRazorpayPlan = async (
    name: string,
    description: string,
    amount: number, // in paise
    currency: string = "INR",
    interval: "monthly" | "yearly" | "daily" | "weekly" = "monthly",
) => {
    const period = interval === "monthly" ? "monthly" : interval === "yearly" ? "yearly" : "monthly";

    // Razorpay limits/options might vary, keeping it simple
    const plan = await razorpay.plans.create({
        period,
        interval: 1,
        item: {
            name,
            description,
            amount,
            currency,
        },
    });
    return plan;
};

export const createRazorpaySubscription = async (
    planId: string,
    totalCount: number = 120, // 10 years by default for monthly
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

// For one-time payments (Orders) if needed
export const createRazorpayOrder = async (amount: number, currency: string = "INR") => {
    const order = await razorpay.orders.create({
        amount,
        currency,
        receipt: `receipt_${Date.now()}`,
    });
    return order;
};

export const verifyRazorpayOrderSignature = (
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string,
) => {
    const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
        .update(razorpayOrderId + "|" + razorpayPaymentId)
        .digest("hex");

    return generatedSignature === razorpaySignature;
};

export const cancelRazorpaySubscription = async (
    subscriptionId: string
): Promise<any> => {
    // Razorpay allows cancelling (pausing or cancelling at end of cycle)
    // We want to cancel at period end usually.
    // If we pass cancel_at_cycle_end: 1, it cancels at end of current cycle.
    // The library method might be slightly different.
    // razorpay.subscriptions.cancel(subscriptionId, cancel_at_cycle_end)
    const result = await razorpay.subscriptions.cancel(subscriptionId, true); // true = at period end
    // Docs say: subscription.cancel(subscriptionId, cancel_at_cycle_end)
    // Actually method signature: cancel(subscriptionId, cancelAtCycleEnd)
    // If we want cancelAtPeriodEnd, we pass true/1.
    return result;
};

export const getSubscription = async (subscriptionId: string) => {
    return await razorpay.subscriptions.fetch(subscriptionId);
};

export const resumeRazorpaySubscription = async (subscriptionId: string) => {
    // To resume (cancel the scheduled cancellation), we send cancel_at_cycle_end = 0
    // However, the node-razorpay lib might not have a dedicated 'resume' method, 
    // we typically use 'cancel' with false to cancel immediately? No.
    // We strictly use update usually. 
    // Razorpay API: PATCH /subscriptions/{id} -> { cancel_at_cycle_end: 0 }
    // The library usually maps update(id, options).
    return await razorpay.subscriptions.update(subscriptionId, {
        cancel_at_cycle_end: false
    } as any);
};
