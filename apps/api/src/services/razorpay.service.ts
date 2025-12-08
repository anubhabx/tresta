
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
