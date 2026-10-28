import type { MetadataRoute } from "next";

const SITE = "https://yaseenahmadexe.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE,
      lastModified: new Date("2026-10-28T00:00:00Z"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE}/freelance-software-engineer`,
      lastModified: new Date("2026-10-21T00:00:00Z"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE}/hire-web-developer-peshawar`,
      lastModified: new Date("2026-10-21T00:00:00Z"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE}/mern-stack-developer`,
      lastModified: new Date("2026-10-21T00:00:00Z"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE}/uncensored-llm`,
      lastModified: new Date("2026-10-21T00:00:00Z"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE}/privacy`,
      lastModified: new Date("2026-10-28T00:00:00Z"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE}/terms`,
      lastModified: new Date("2026-10-21T00:00:00Z"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
