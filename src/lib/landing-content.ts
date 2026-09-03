import "server-only";
import { cache } from "react";
import { Building2, CloudCog, Headphones, Network, PackageCheck, ShieldCheck, type LucideIcon } from "lucide-react";
import { readPublishedCMSSolutions } from "./cms-solutions";

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
  mediaAPIBase?: string;
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

const fallbackSolutionView = (index: number): SolutionView => {
  const solution = fallbackSolutions[index];
  return {
    ...solution,
    categoryLabel: solutionCategoryLabels[solution.category],
    image: null,
    content: null,
    partners: [],
  };
};

const iconMap: Record<string, LucideIcon> = {
  infrastructure: Building2, network: Network, security: ShieldCheck,
  cloud: CloudCog, "managed-service": Headphones, procurement: PackageCheck,
};

export const getPublishedSolutions = cache(async (): Promise<SolutionView[]> => {
  const apiURL = process.env.CMS_API_URL?.trim();
  // Explicit standalone/demo mode only. Never resurrect unpublished CMS records.
  if (!apiURL) return fallbackSolutions.map((_, index) => fallbackSolutionView(index));
  const solutions = await readPublishedCMSSolutions(apiURL, (url) => fetch(url, {
    headers: { Accept: "application/json" },
    credentials: "omit", redirect: "error", signal: AbortSignal.timeout(10_000),
    next: { revalidate: 60, tags: ["cms-solutions"] },
  }));
  return solutions.map(({ iconKey, order: _order, ...solution }, index) => ({
    ...solution,
    number: String(index + 1).padStart(2, "0"),
    categoryLabel: solutionCategoryLabels[solution.category],
    icon: iconMap[iconKey] ?? Building2,
  }));
});

export const getSolutionBySlug = async (slug: string): Promise<SolutionView | null> => {
  return (await getPublishedSolutions()).find((solution) => solution.slug === slug) ?? null;
};

export const getPublishedPartners = async () => {
  return fallbackPartners.map((partner) => ({ ...partner, website: null }));
};

export const getPublishedProjects = async (): Promise<ProjectView[]> => {
  return [];
};

export const getProjectBySlug = async (_slug: string): Promise<ProjectView | null> => {
  return null;
};

export const getPublishedInsights = async (): Promise<InsightView[]> => {
  return [];
};

export const getInsightBySlug = async (_slug: string): Promise<InsightView | null> => {
  return null;
};

export const getSiteSettings = async () => {
  return fallbackSettings;
};

export const getLandingContent = async () => {
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
};
