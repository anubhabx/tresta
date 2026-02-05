import Image from "next/image";
import Link from "next/link";
import { Github, Twitter, Mail } from "lucide-react";

// Footer link sections
const productLinks = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Demo", href: "/#interactive-demo" },
];

const resourceLinks = [
  { label: "API Docs", href: "/docs" },
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

function FooterSection({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  const supportEmail =
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@tresta.app";

  return (
    <footer className="w-full border-t border-border bg-background">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/branding/tresta.svg"
                alt="Tresta logo"
                width={32}
                height={32}
                className="h-8 w-8"
                priority
              />
              <span className="text-lg font-semibold tracking-tight text-foreground">
                Tresta
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs mb-6">
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
                  className="flex h-9 w-9 items-center justify-center rounded-md border bg-background hover:bg-accent hover:border-accent transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4 text-muted-foreground" />
                </a>
              ))}
              <a
                href={`mailto:${supportEmail}`}
                className="flex h-9 w-9 items-center justify-center rounded-md border bg-background hover:bg-accent hover:border-accent transition-colors"
                aria-label="Email"
              >
                <Mail className="h-4 w-4 text-muted-foreground" />
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
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {year} Tresta. All rights reserved.</p>
          <a
            href={`mailto:${supportEmail}`}
            className="hover:text-foreground transition-colors"
          >
            {supportEmail}
          </a>
        </div>
      </div>
    </footer>
  );
}
