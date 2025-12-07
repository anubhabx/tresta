import Link from "next/link"

export default function TermsAndConditionsPage() {
    return (
        <div className="container max-w-3xl py-12 md:py-24">
            <div className="prose prose-zinc dark:prose-invert max-w-none">
                <h1 className="text-4xl font-bold tracking-tight">Terms and Conditions</h1>
                <p className="text-sm text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="mt-8 space-y-6">
                    <section>
                        <h2 className="text-2xl font-semibold">1. Introduction</h2>
                        <p>
                            Welcome to Tresta. By accessing or using our website and services, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">2. Use of Service</h2>
                        <p>
                            You must be at least 18 years old to use our services. You agree to use Tresta only for lawful purposes and in a way that does not infringe the rights of, restrict or inhibit anyone else's use and enjoyment of the platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">3. Account Registration</h2>
                        <p>
                            To access certain features, you may be required to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">4. Payments</h2>
                        <p>
                            We use Razorpay for processing payments. We/Razprpay do not store your card data on their servers. The data is encrypted through the Payment Card Industry Data Security Standard (PCI-DSS) when processing payment. Your purchase transaction data is only used as long as is necessary to complete your purchase transaction. After that is complete, your purchase transaction information is not saved.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">5. Limitation of Liability</h2>
                        <p>
                            Tresta shall not be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">6. Changes to Terms</h2>
                        <p>
                            We reserve the right to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">7. Contact Us</h2>
                        <p>
                            If you have any questions about these Terms, please contact us at <Link href="mailto:support@tresta.app" className="text-primary hover:underline">support@tresta.app</Link>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
