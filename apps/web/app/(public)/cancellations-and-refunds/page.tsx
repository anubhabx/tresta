import Link from "next/link"

export default function CancellationsPage() {
    return (
        <div className="container max-w-3xl py-12 md:py-24">
            <div className="prose prose-zinc dark:prose-invert max-w-none">
                <h1 className="text-4xl font-bold tracking-tight">Cancellations and Refunds</h1>
                <p className="text-sm text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>

                <div className="mt-8 space-y-6">
                    <section>
                        <h2 className="text-2xl font-semibold">Cancellation Policy</h2>
                        <p>
                            You may cancel your subscription at any time. If you cancel, you will continue to have access to the Tresta service through the end of your current billing period. We do not provide refunds or credits for any partial-month subscription periods or unwatched content.
                        </p>
                        <p className="mt-2">
                            To cancel your subscription, please go to your account settings page and follow the instructions for cancellation.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">Refund Policy</h2>
                        <p>
                            <strong>Subscriptions:</strong> Payments are non-refundable and there are no refunds or credits for partially used periods. Following any cancellation, however, you will continue to have access to the service through the end of your current billing period.
                        </p>
                        <p className="mt-2">
                            <strong>Exceptions:</strong> In exceptional circumstances, such as technical errors where you were charged multiple times for the same billing period, we will review the request and may issue a refund at our sole discretion.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">Processing of Refunds</h2>
                        <p>
                            If a refund is approved, it will be processed and a credit will automatically be applied to your credit card or original method of payment, within a certain amount of days (typically 5-7 business days).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold">Late or Missing Refunds</h2>
                        <p>
                            If you haven’t received a refund yet, first check your bank account again. Then contact your credit card company, it may take some time before your refund is officially posted. Next contact your bank. There is often some processing time before a refund is posted.
                        </p>
                        <p className="mt-2">
                            If you’ve done all of this and you still have not received your refund yet, please contact us at <Link href="mailto:support@tresta.app" className="text-primary hover:underline">support@tresta.app</Link>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    )
}
