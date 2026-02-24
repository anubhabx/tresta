import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Tresta",
  description:
    "Get in touch with the Tresta team. We'd love to hear from you about features, support, or partnership opportunities.",
  alternates: { canonical: "/contact-us" },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
