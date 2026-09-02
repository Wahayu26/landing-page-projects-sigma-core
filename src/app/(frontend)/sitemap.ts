import type { MetadataRoute } from "next";

import { getPublishedInsights, getPublishedProjects, getPublishedSolutions } from "@/lib/landing-content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";
  const [solutions, projects, insights] = await Promise.all([
    getPublishedSolutions(),
    getPublishedProjects(),
    getPublishedInsights(),
  ]);

  return [
    { url: origin, changeFrequency: "weekly", priority: 1 },
    { url: `${origin}/proyek`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${origin}/insight`, changeFrequency: "weekly", priority: 0.7 },
    ...solutions.map((solution) => ({ url: `${origin}/solusi/${solution.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...projects.map((project) => ({ url: `${origin}/proyek/${project.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...insights.map((insight) => ({ url: `${origin}/insight/${insight.slug}`, lastModified: new Date(insight.publishedAt), changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
