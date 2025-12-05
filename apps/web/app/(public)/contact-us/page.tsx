import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Us - Tresta",
    description: "Get in touch with the Tresta team.",
};

export default function ContactUsPage() {
    return (
        <div className="container mx-auto max-w-3xl py-12 px-4">
            <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
            <div className="prose dark:prose-invert">
                <p className="mb-4">
                    We'd love to hear from you! If you have any questions, concerns, or feedback, please don't hesitate to reach out to us.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">Get in Touch</h2>
                <p className="mb-2">
                    <strong>Email:</strong> <a href="mailto:support@tresta.app" className="text-primary hover:underline">support@tresta.app</a>
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">Business Address</h2>
                <p className="mb-4">
                    Tresta Inc.
                </p>
            </div>
        </div>
    );
}
