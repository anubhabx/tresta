import Link from "next/link";
import {
  LegalLayout,
  LegalSection,
} from "@/components/legal-layout";

const toc = [
  { id: "introduction", title: "Introduction", level: 2 as const },
  { id: "use-of-service", title: "Use of Service", level: 2 as const },
  { id: "account-registration", title: "Account Registration", level: 2 as const },
  { id: "payments", title: "Payments", level: 2 as const },
  { id: "limitation-of-liability", title: "Limitation of Liability", level: 2 as const },
  { id: "changes-to-terms", title: "Changes to Terms", level: 2 as const },
  { id: "contact", title: "Contact Us", level: 2 as const },
];

export default function TermsAndConditionsPage() {
  return (
    <LegalLayout
      title="Terms and Conditions"
      lastUpdated="Oct 24, 2025"
      toc={toc}
    >
      <LegalSection id="introduction" title="Introduction">
        <p>
          Welcome to Tresta. By accessing or using our website and services, you
          agree to be bound by these Terms and Conditions and our{" "}
          <Link href="/privacy-policy">Privacy Policy</Link>. If you do not
          agree to these terms, please do not use our services.
        </p>
      </LegalSection>

      <LegalSection id="use-of-service" title="Use of Service">
        <p>
          You must be at least 18 years old to use our services. You agree to
          use Tresta only for lawful purposes and in a way that does not
          infringe the rights of, restrict or inhibit anyone else&apos;s use and
          enjoyment of the platform.
        </p>
      </LegalSection>

      <LegalSection id="account-registration" title="Account Registration">
        <p>
          To access certain features, you may be required to register for an
          account. You agree to provide accurate, current, and complete
          information during the registration process and to update such
          information to keep it accurate, current, and complete.
        </p>
      </LegalSection>

      <LegalSection id="payments" title="Payments">
        <p>
          We use Razorpay for processing payments. We/Razorpay do not store your
          card data on their servers. The data is encrypted through the Payment
          Card Industry Data Security Standard (PCI-DSS) when processing
          payment. Your purchase transaction data is only used as long as is
          necessary to complete your purchase transaction. After that is
          complete, your purchase transaction information is not saved.
        </p>
      </LegalSection>

      <LegalSection id="limitation-of-liability" title="Limitation of Liability">
        <p>
          Tresta shall not be liable for any indirect, incidental, special,
          consequential or punitive damages, including without limitation, loss
          of profits, data, use, goodwill, or other intangible losses, resulting
          from your access to or use of or inability to access or use the
          service.
        </p>
      </LegalSection>

      <LegalSection id="changes-to-terms" title="Changes to Terms">
        <p>
          We reserve the right to modify or replace these Terms at any time. If
          a revision is material we will try to provide at least 30 days notice
          prior to any new terms taking effect. What constitutes a material
          change will be determined at our sole discretion.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact Us">
        <p>
          If you have any questions about these Terms, please contact us at{" "}
          <Link href="mailto:support@tresta.app">support@tresta.app</Link>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
