import Link from "next/link";
import { LegalLayout, LegalSection } from "@/components/legal-layout";

const toc = [
  { id: "introduction", title: "Introduction", level: 2 as const },
  { id: "data-we-collect", title: "Data We Collect", level: 2 as const },
  { id: "your-rights", title: "Your Rights & Data Control", level: 2 as const },
  { id: "how-we-use-data", title: "How We Use Your Data", level: 2 as const },
  { id: "data-security", title: "Data Security", level: 2 as const },
  { id: "third-party-links", title: "Third-Party Links", level: 2 as const },
  { id: "contact", title: "Contact Us", level: 2 as const },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="Oct 24, 2025" toc={toc}>
      <LegalSection id="introduction" title="Introduction">
        <p>
          Tresta respects your privacy and is committed to protecting your
          personal data. This privacy policy will inform you as to how we look
          after your personal data when you visit our website (regardless of
          where you visit it from) and tell you about your privacy rights and
          how the law protects you.
        </p>
      </LegalSection>

      <LegalSection id="data-we-collect" title="Data We Collect">
        <p>
          We may collect, use, store and transfer different kinds of personal
          data about you which we have grouped together as follows:
        </p>
        <ul>
          <li>
            <strong>Identity Data:</strong> includes first name, last name,
            username or similar identifier.
          </li>
          <li>
            <strong>Contact Data:</strong> includes email address and telephone
            numbers.
          </li>
          <li>
            <strong>Technical Data:</strong> includes internet protocol (IP)
            address, your login data, browser type and version, time zone
            setting and location, browser plug-in types and versions, operating
            system and platform and other technology on the devices you use to
            access this website.
          </li>
          <li>
            <strong>Usage Data:</strong> includes information about how you use
            our website, products and services.
          </li>
          <li>
            <strong>Testimonial Data:</strong> When you submit a testimonial, we
            collect the content of your review along with your name, role,
            company, and avatar. This information is intended for public display
            on our customers&apos; websites. We also privately collect your
            email address for verification and your IP address for spam
            prevention.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="your-rights" title="Your Rights & Data Control">
        <p>
          You have full control over your personal data. We provide tools for
          you to access, download, or delete your data at any time.
        </p>
        <div className="legal-callout">
          <h3>Self-Serve Data Tools</h3>
          <p>
            Use our automated portal to manage your data without waiting for
            support.
          </p>
          <Link
            href="/privacy/request"
            className="inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-200 no-underline"
          >
            Manage My Data →
          </Link>
        </div>
      </LegalSection>

      <LegalSection id="how-we-use-data" title="How We Use Your Data">
        <p>
          We will only use your personal data when the law allows us to. Most
          commonly, we will use your personal data in the following
          circumstances:
        </p>
        <ul>
          <li>
            Where we need to perform the contract we are about to enter into or
            have entered into with you.
          </li>
          <li>
            Where it is necessary for our legitimate interests (or those of a
            third party) and your interests and fundamental rights do not
            override those interests.
          </li>
          <li>
            Where we need to comply with a legal or regulatory obligation.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="data-security" title="Data Security">
        <p>
          We have put in place appropriate security measures to prevent your
          personal data from being accidentally lost, used or accessed in an
          unauthorized way, altered or disclosed. In addition, we limit access
          to your personal data to those employees, agents, contractors and
          other third parties who have a business need to know.
        </p>
      </LegalSection>

      <LegalSection id="third-party-links" title="Third-Party Links">
        <p>
          This website may include links to third-party websites, plug-ins and
          applications. Clicking on those links or enabling those connections
          may allow third parties to collect or share data about you. We do not
          control these third-party websites and are not responsible for their
          privacy statements.
        </p>
      </LegalSection>

      <LegalSection id="contact" title="Contact Us">
        <p>
          If you have any questions about this privacy policy or our privacy
          practices, please contact us at{" "}
          <Link href="mailto:support@tresta.app">support@tresta.app</Link>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
