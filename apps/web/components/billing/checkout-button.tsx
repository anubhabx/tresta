"use client";

import { useState, forwardRef } from "react";
import { Button } from "@workspace/ui/components/button";
import { useApi } from "@/hooks/use-api";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import axios from "axios";

interface CheckoutButtonProps {
  planId: string;
  planName: string;
  price: number;
}

type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  handler: (response: RazorpaySuccessResponse) => Promise<void>;
  modal: {
    ondismiss: () => void;
  };
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
};

type RazorpayInstance = {
  open: () => void;
};

type RazorpayConstructor = new (options: RazorpayOptions) => RazorpayInstance;

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

const loadRazorpayCallback = (): Promise<boolean> => {
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

export const CheckoutButton = forwardRef<
  HTMLButtonElement,
  CheckoutButtonProps
>(function CheckoutButton({ planId, planName, price }, ref) {
  const [loading, setLoading] = useState(false);
  const api = useApi();
  const { user } = useUser();

  const handleSubscribe = async () => {
    if (loading) return; // Prevent multiple clicks/requests
    setLoading(true);

    try {
      const isLoaded = await loadRazorpayCallback();
      if (!isLoaded) {
        toast.error("Razorpay SDK failed to load. Are you online?");
        setLoading(false);
        return;
      }

      const { data: response } = await api.post("/api/payments/subscription", {
        planId,
      });

      const { subscriptionId, key, planName: name } = response.data;

      const options = {
        key,
        subscription_id: subscriptionId,
        name: "Tresta",
        description: `Subscribe to ${name}`,
        handler: async (response: RazorpaySuccessResponse) => {
          try {
            await api.post("/api/payments/verify", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
              planId,
            });
            toast.success("Subscription activated successfully!");
            window.location.reload();
          } catch (error) {
            toast.error("Payment verification failed. Please contact support.");
            console.error(error);
          }
        },
        modal: {
          ondismiss: () => {
            toast("Payment process cancelled");
            setLoading(false);
          },
        },
        prefill: {
          name: user?.fullName || "",
          email: user?.primaryEmailAddress?.emailAddress || "",
          contact: "",
        },
        theme: {
          color: "#000000",
        },
      };

      const razorpayCtor = (
        window as unknown as { Razorpay?: RazorpayConstructor }
      ).Razorpay;

      if (!razorpayCtor) {
        toast.error("Razorpay SDK is unavailable. Please try again.");
        setLoading(false);
        return;
      }

      const paymentObject = new razorpayCtor(options);

      // If payment modal is opened, we keep loading true until it's closed or completed
      // The ondismiss handler takes care of resetting loading to false on close.
      paymentObject.open();
    } catch (error: unknown) {
      console.error("Payment error:", error);
      toast.error(
        getErrorMessage(error, "Something went wrong initiating payment."),
      );
      setLoading(false);
    }
    // Note: We deliberately do NOT set loading(false) in a finally block here
    // because we want the button to remain disabled while the modal is open.
    // loading set to false in:
    // 1. pre-check failures (SDK load fail)
    // 2. catch block (API errors)
    // 3. modal.ondismiss (User closed modal)
    // 4. handler (Success - page reload happens anyway)
  };

  if (planName === "Free") {
    return (
      <Button ref={ref} onClick={handleSubscribe} disabled className="w-full">
        Always free
      </Button>
    );
  }

  return (
    <Button
      ref={ref}
      onClick={handleSubscribe}
      disabled={loading}
      className="w-full"
    >
      {loading ? "Processing..." : `Upgrade to ${planName}`}
    </Button>
  );
});
