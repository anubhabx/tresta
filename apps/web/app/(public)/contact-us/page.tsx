import Link from "next/link"

export default function ContactUsPage() {
    return (
        <div className="container max-w-3xl py-12 md:py-24">
            <div className="prose prose-zinc dark:prose-invert max-w-none">
                <h1 className="text-4xl font-bold tracking-tight">Contact Us</h1>
                <p className="lead text-muted-foreground mt-4">
                    We&apos;re here to help! If you have any questions or concerns, please
                    feel free to reach out to us.
                </p>

                <div className="mt-8 space-y-8">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg border p-6">
                            <h3 className="font-semibold">Support Email</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                For general inquiries and support:
                            </p>
                            <Link
                                href="mailto:support@tresta.app"
                                className="mt-2 block font-medium text-primary hover:underline"
                            >
                                support@tresta.app
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold">Get in Touch</h2>
                        <p className="mt-4">
                            You can contact us via email for any queries related to:
                        </p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Platform usage and features</li>
                            <li>Billing and payments</li>
                            <li>Technical support</li>
                            <li>Feedback and suggestions</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
