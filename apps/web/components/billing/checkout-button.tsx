
"use client";

import { useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { useApi } from "@/hooks/use-api";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

interface CheckoutButtonProps {
    planId: string;
    planName: string;
    price: number;
}

const loadRazorpayCallback = () => {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            resolve(false);
        };
        document.body.appendChild(script);
    });
};

export function CheckoutButton({ planId, planName, price }: CheckoutButtonProps) {
    const [loading, setLoading] = useState(false);
    const api = useApi();
    const { user } = useUser();

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            const isLoaded = await loadRazorpayCallback();
            if (!isLoaded) {
                toast.error("Razorpay SDK failed to load. Are you online?");
                setLoading(false);
                return;
            }

            // Create Subscription
            const { data: response } = await api.post("/api/payments/subscription", {
                planId,
            });

            const { subscriptionId, key, planName: name } = response.data;

            const options = {
                key,
                subscription_id: subscriptionId,
                name: "Tresta",
                description: `Subscribe to ${name}`,
                handler: async (response: any) => {
                    try {
                        // Verify Payment
                        await api.post("/api/payments/verify", {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_subscription_id: response.razorpay_subscription_id,
                            razorpay_signature: response.razorpay_signature,
                            planId,
                        });
                        toast.success("Subscription activated successfully!");
                        // Optionally reload page or invalidate queries
                        window.location.reload();
                    } catch (error) {
                        toast.error("Payment verification failed. Please contact support.");
                        console.error(error);
                    }
                },
                prefill: {
                    name: user?.fullName || "",
                    email: user?.primaryEmailAddress?.emailAddress || "",
                    contact: "", // Optional
                },
                theme: {
                    color: "#000000", // Should match brand color
                },
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();

        } catch (error: any) {
            console.error("Payment error:", error);
            toast.error(error.response?.data?.message || "Something went wrong initiating payment.");
        } finally {
            setLoading(false);
        }
    };

    if (planName === "Free") {
        return (
            <Button onClick={handleSubscribe} disabled className="w-full">
                Always free
            </Button>
        );
    }

    return (
        <Button onClick={handleSubscribe} disabled={loading} className="w-full">
            {loading ? "Processing..." : `Upgrade to ${planName}`}
        </Button>
    );
}
