import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms and Conditions - Tresta",
    description: "Terms and Conditions for using Tresta.",
};

export default function TermsPage() {
    return (
        <div className="container mx-auto max-w-3xl py-12 px-4">
            <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
            <div className="prose dark:prose-invert">
                <p className="mb-4">
                    Last updated: {new Date().toLocaleDateString()}
                </p>

                <p className="mb-4">
                    Welcome to Tresta! These terms and conditions outline the rules and regulations for the use of Tresta's Website and Service.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">1. Acceptance of Terms</h2>
                <p className="mb-4">
                    By accessing this website we assume you accept these terms and conditions. Do not continue to use Tresta if you do not agree to take all of the terms and conditions stated on this page.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">2. License</h2>
                <p className="mb-4">
                    Unless otherwise stated, Tresta and/or its licensors own the intellectual property rights for all material on Tresta. All intellectual property rights are reserved. You may access this from Tresta for your own personal use subjected to restrictions set in these terms and conditions.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">3. User Accounts</h2>
                <p className="mb-4">
                    When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">4. Limitation of Liability</h2>
                <p className="mb-4">
                    In no event shall Tresta, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">5. Changes to Terms</h2>
                <p className="mb-4">
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                </p>

                <h2 className="text-xl font-semibold mt-6 mb-2">Contact Us</h2>
                <p className="mb-4">
                    If you have any questions about these Terms, please contact us at <a href="mailto:support@tresta.app" className="text-primary hover:underline">support@tresta.app</a>.
                </p>
            </div>
        </div>
    );
}
