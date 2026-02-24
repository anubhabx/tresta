import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { prisma } from "@workspace/database/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  /* ── Static pages ──────────────────────────────────────────── */
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteConfig.url}/contact-us`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteConfig.url}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteConfig.url}/terms-and-conditions`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteConfig.url}/cancellations-and-refunds`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  /* ── Dynamic pages: public testimonial forms ───────────────── */
  let projectPages: MetadataRoute.Sitemap = [];
  try {
    const publicProjects = await prisma.project.findMany({
      where: { visibility: "PUBLIC", isActive: true },
      select: { slug: true, updatedAt: true },
    });

    projectPages = publicProjects.map((project) => ({
      url: `${siteConfig.url}/testimonials/${project.slug}`,
      lastModified: project.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch {
    // Gracefully degrade — DB unavailable at build time still produces static sitemap
    console.warn("[sitemap] Could not fetch public projects — using static pages only");
  }

  return [...staticPages, ...projectPages];
}
