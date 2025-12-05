import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Cancellations and Refunds - Tresta",
    description: "Cancellation and Refund policy for Tresta.",
};

export default function RefundsPage() {
    return (
        <div className="container mx-auto max-w-3xl py-12 px-4">
            <h1 className="text-3xl font-bold mb-6">Cancellations and Refunds</h1>
            <div className="prose dark:prose-invert">
                <p className="mb-4">
                    Last updated: {new Date().toLocaleDateString()}
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">Cancellation Policy</h2>
                <p className="mb-4">
                    You may cancel your subscription at any time by logging into your account and navigating to the billing settings.
                    Your cancellation will take effect at the end of the current paid term.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">Refund Policy</h2>
                <p className="mb-4">
                    We offer a 14-day money-back guarantee for new subscriptions. If you are not satisfied with our service,
                    you can request a full refund within 14 days of your initial purchase.
                </p>
                <p className="mb-4">
                    To request a refund, please contact our support team at <a href="mailto:support@tresta.app" className="text-primary hover:underline">support@tresta.app</a> with your order details.
                </p>
                <p className="mb-4">
                    Refunds are processed within 5-7 business days and will be credited back to the original method of payment.
                </p>
            </div>
        </div>
    );
}
