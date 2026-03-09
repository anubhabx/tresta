import Link from "next/link";
import { Github, Twitter, Mail } from "lucide-react";

/* ── Footer Link Data ─────────────────────────────────────────────── */

const productLinks = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Demo", href: "/#interactive-demo" },
];

const resourceLinks = [
  { label: "Contact Us", href: "/contact-us" },
  { label: "FAQ", href: "/#faq" },
];

const legalLinks = [
  { label: "Terms of Service", href: "/terms-and-conditions" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Refund Policy", href: "/cancellations-and-refunds" },
  { label: "Privacy Request", href: "/privacy/request" },
];

const socialLinks = [
  { label: "GitHub", href: "https://github.com/tresta-app", icon: Github },
  { label: "Twitter", href: "https://twitter.com/tresta_app", icon: Twitter },
];

/* ── Footer Section ───────────────────────────────────────────────── */

function FooterSection({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-[#e8eaed] mb-4">{title}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-[#8b8f99] hover:text-[#e8eaed] transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Site Footer ──────────────────────────────────────────────────── */

export function SiteFooter() {
  const year = new Date().getFullYear();
  const supportEmail =
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@tresta.app";

  return (
    <footer className="relative w-full bg-[#0c0e12]">
      {/* Border beam top — gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px overflow-hidden">
        <div
          className="h-full w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, #60a5fa 30%, #60a5fa 70%, transparent 100%)",
            animation: "border-beam 4s linear infinite",
          }}
        />
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-lg font-semibold tracking-tight text-[#e8eaed]">
                Tresta
              </span>
            </Link>
            <p className="text-sm text-[#8b8f99] max-w-xs mb-6">
              Collect testimonials. Embed them anywhere. Build trust with real
              customer stories.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-[#2a2e38] bg-[#111318] hover:bg-[#1a1d25] hover:border-[#3a3e48] transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4 text-[#8b8f99]" />
                </a>
              ))}
              <a
                href={`mailto:${supportEmail}`}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-[#2a2e38] bg-[#111318] hover:bg-[#1a1d25] hover:border-[#3a3e48] transition-colors"
                aria-label="Email"
              >
                <Mail className="h-4 w-4 text-[#8b8f99]" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <FooterSection title="Product" links={productLinks} />
          <FooterSection title="Resources" links={resourceLinks} />
          <FooterSection title="Legal" links={legalLinks} />
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#2a2e38]">
        <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#8b8f99]">
          <p>&copy; {year} Tresta. All rights reserved.</p>
          <a
            href={`mailto:${supportEmail}`}
            className="hover:text-[#e8eaed] transition-colors"
          >
            {supportEmail}
          </a>
        </div>
      </div>
    </footer>
  );
}
