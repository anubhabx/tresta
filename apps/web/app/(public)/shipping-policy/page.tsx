import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Shipping Policy - Tresta",
    description: "Shipping and delivery policy for Tresta.",
};

export default function ShippingPolicyPage() {
    return (
        <div className="container mx-auto max-w-3xl py-12 px-4">
            <h1 className="text-3xl font-bold mb-6">Shipping & Delivery Policy</h1>
            <div className="prose dark:prose-invert">
                <p className="mb-4">
                    Last updated: {new Date().toLocaleDateString()}
                </p>

                <p className="mb-4">
                    Tresta is a SaaS (Software as a Service) platform. As such, we do not ship any physical products.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">Digital Delivery</h2>
                <p className="mb-4">
                    Upon successful payment, you will receive immediate access to the premium features of your selected plan.
                    A confirmation email with your order details will be sent to your registered email address.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">Issues with Access</h2>
                <p className="mb-4">
                    If you do not receive access to the features you purchased or if you encounter any issues with your account upgrade,
                    please contact our support team immediately at <a href="mailto:support@tresta.app" className="text-primary hover:underline">support@tresta.app</a>.
                </p>
            </div>
        </div>
    );
}
