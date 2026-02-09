import Link from "next/link";
import {
  LegalLayout,
  LegalSection,
} from "@/components/legal-layout";

const toc = [
  { id: "cancellation-policy", title: "Cancellation Policy", level: 2 as const },
  { id: "refund-policy", title: "Refund Policy", level: 2 as const },
  { id: "processing-refunds", title: "Processing of Refunds", level: 2 as const },
  { id: "late-or-missing", title: "Late or Missing Refunds", level: 2 as const },
];

export default function CancellationsPage() {
  return (
    <LegalLayout
      title="Cancellations and Refunds"
      lastUpdated="Oct 24, 2025"
      toc={toc}
    >
      <LegalSection id="cancellation-policy" title="Cancellation Policy">
        <p>
          You may cancel your subscription at any time. If you cancel, you will
          continue to have access to the Tresta service through the end of your
          current billing period. We do not provide refunds or credits for any
          partial-month subscription periods or unwatched content.
        </p>
        <p>
          To cancel your subscription, please go to your account settings page
          and follow the instructions for cancellation.
        </p>
      </LegalSection>

      <LegalSection id="refund-policy" title="Refund Policy">
        <p>
          <strong>Subscriptions:</strong> Payments are non-refundable and there
          are no refunds or credits for partially used periods. Following any
          cancellation, however, you will continue to have access to the service
          through the end of your current billing period.
        </p>
        <p>
          <strong>Exceptions:</strong> In exceptional circumstances, such as
          technical errors where you were charged multiple times for the same
          billing period, we will review the request and may issue a refund at
          our sole discretion.
        </p>
      </LegalSection>

      <LegalSection id="processing-refunds" title="Processing of Refunds">
        <p>
          If a refund is approved, it will be processed and a credit will
          automatically be applied to your credit card or original method of
          payment, within a certain amount of days (typically 5-7 business
          days).
        </p>
      </LegalSection>

      <LegalSection id="late-or-missing" title="Late or Missing Refunds">
        <p>
          If you haven&apos;t received a refund yet, first check your bank
          account again. Then contact your credit card company, it may take some
          time before your refund is officially posted. Next contact your bank.
          There is often some processing time before a refund is posted.
        </p>
        <p>
          If you&apos;ve done all of this and you still have not received your
          refund yet, please contact us at{" "}
          <Link href="mailto:support@tresta.app">support@tresta.app</Link>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}