import type { LucideIcon } from "lucide-react";

import {
  partners as fallbackPartners,
  solutionCategoryLabels,
  solutions as fallbackSolutions,
} from "@/content/site";

const fallbackSettings = {
  hero: {
    eyebrow: "Technology Infrastructure & System Integrator",
    headline: "Teknologi terintegrasi.",
    highlight: "Bisnis terus melaju.",
    description:
      "Kami merancang, mengintegrasikan, dan mengoptimalkan solusi IT end-to-end untuk operasional bisnis yang lebih andal, aman, dan scalable.",
  },
  contact: {
    email: "admin@sigmacore.id",
    phone: "0851 5855 8791",
    address: "Plaza Aminta Lt. 5/504, Jl. TB. Simatupang Kav. 10, Jakarta Selatan",
  },
  companyFacts: [
    { value: "06", label: "Portofolio solusi inti" },
    { value: "06", label: "Tahap integrasi end-to-end" },
    { value: "20+", label: "Teknologi enterprise dalam ekosistem" },
  ],
  seo: {
    title: "PT Sigma Core Solusindo | End-to-End IT Solution",
    description:
      "Solusi infrastruktur, jaringan, keamanan siber, cloud, managed service, dan pengadaan IT untuk bisnis yang andal dan bertumbuh.",
  },
};

export const insightCategoryLabels = {
  insight: "Insight teknologi",
  news: "Berita perusahaan",
  guide: "Panduan",
} as const;

type CategoryKey = keyof typeof solutionCategoryLabels;

export type SolutionView = {
  number: string;
  slug: string;
  category: CategoryKey;
  categoryLabel: string;
  title: string;
  description: string;
  outcome: string;
  items: string[];
  benefits: { title: string; text: string }[];
  useCases: string[];
  icon: LucideIcon;
  image: string | null;
  content: unknown | null;
  partners: { name: string; logo: string; website: string | null }[];
};

export type ProjectView = {
  slug: string;
  title: string;
  industry: string;
  client: string | null;
  summary: string;
  highlights: string[];
  image: string | null;
  challenge: unknown | null;
  solution: unknown | null;
  result: unknown | null;
  technologies: string[];
  relatedSolutions: { slug: string; title: string }[];
};

export type InsightView = {
  slug: string;
  title: string;
  category: string;
  categoryKey: keyof typeof insightCategoryLabels;
  excerpt: string;
  publishedAt: string;
  image: string | null;
  content: unknown;
  featured: boolean;
  seo: { title: string; description: string };
  relatedSolutions: { slug: string; title: string }[];
};

function fallbackSolutionView(index: number): SolutionView {
  const solution = fallbackSolutions[index];
  return {
    ...solution,
    categoryLabel: solutionCategoryLabels[solution.category],
    image: null,
    content: null,
    partners: [],
  };
}

export async function getPublishedSolutions(): Promise<SolutionView[]> {
  return fallbackSolutions.map((_, index) => fallbackSolutionView(index));
}

export async function getSolutionBySlug(slug: string): Promise<SolutionView | null> {
  const index = fallbackSolutions.findIndex((solution) => solution.slug === slug);
  return index >= 0 ? fallbackSolutionView(index) : null;
}

export async function getPublishedPartners() {
  return fallbackPartners.map((partner) => ({ ...partner, website: null }));
}

export async function getPublishedProjects(): Promise<ProjectView[]> {
  return [];
}

export async function getProjectBySlug(_slug: string): Promise<ProjectView | null> {
  return null;
}

export async function getPublishedInsights(): Promise<InsightView[]> {
  return [];
}

export async function getInsightBySlug(_slug: string): Promise<InsightView | null> {
  return null;
}

export async function getSiteSettings() {
  return fallbackSettings;
}

export async function getLandingContent() {
  const [solutions, partners, projects, insights, settings] = await Promise.all([
    getPublishedSolutions(),
    getPublishedPartners(),
    getPublishedProjects(),
    getPublishedInsights(),
    getSiteSettings(),
  ]);

  return {
    solutions,
    partners,
    projects: projects.slice(0, 3),
    insights: insights.slice(0, 3),
    settings,
  };
}
