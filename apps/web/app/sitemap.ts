import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteConfig.url,
      lastModified: "2026-02-16",
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/pricing`,
      lastModified: "2026-02-16",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/contact-us`,
      lastModified: "2026-02-16",
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteConfig.url}/privacy-policy`,
      lastModified: "2026-02-16",
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteConfig.url}/terms-and-conditions`,
      lastModified: "2026-02-16",
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteConfig.url}/cancellations-and-refunds`,
      lastModified: "2026-02-16",
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
