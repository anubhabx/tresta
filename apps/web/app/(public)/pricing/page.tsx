
import { PricingTable } from "@/components/billing/pricing-table";

export const metadata = {
    title: "Pricing - Tresta",
    description: "Simple, transparent pricing for your testimonial collection needs.",
};

export default function PricingPage() {
    return (
        <div className="container mx-auto py-12 px-4 pt-24">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
                    Simple, Transparent Pricing
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Choose the plan that's right for you. Change plans or cancel anytime.
                </p>
            </div>

            <PricingTable />
        </div>
    );
}
