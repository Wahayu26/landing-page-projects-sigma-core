import "server-only";

import {
  Building2,
  CloudCog,
  Headphones,
  Network,
  PackageCheck,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { cache } from "react";

import {
  partners as fallbackPartners,
  process as fallbackProcess,
  solutionCategoryLabels,
  solutions as fallbackSolutions,
  values as fallbackValues,
} from "@/content/site";

import { readCMSContent } from "./cms-content";
import { cmsAPIBase, cmsMediaURL, mapCMSSolution, safeContentLink } from "./cms-solutions";

export const insightCategoryLabels = {
  insight: "Insight teknologi",
  news: "Berita perusahaan",
  guide: "Panduan",
} as const;

type Row = Record<string, unknown>;
type CategoryKey = keyof typeof solutionCategoryLabels;

const row = (value: unknown): Row =>
  value && typeof value === "object" && !Array.isArray(value) ? value as Row : {};
const rows = (value: unknown): Row[] => Array.isArray(value) ? value.map(row) : [];
const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
const number = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : 0;
const validSlug = (value: string) => /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(value);

const iconMap: Record<string, LucideIcon> = {
  infrastructure: Building2,
  network: Network,
  security: ShieldCheck,
  cloud: CloudCog,
  "managed-service": Headphones,
  procurement: PackageCheck,
};

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
  mediaAPIBase?: string;
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
  mediaAPIBase?: string;
};

export type SiteSettingsView = {
  hero: { eyebrow: string; headline: string; highlight: string; description: string };
  contact: { email: string; phone: string; address: string };
  companyFacts: { value: string; label: string }[];
  seo: { title: string; description: string };
  about: { eyebrow: string; headline: string; highlight: string; description: string };
  workflow: {
    eyebrow: string;
    title: string;
    description: string;
    steps: { step: string; title: string; text: string }[];
  };
  strengths: {
    eyebrow: string;
    title: string;
    description: string;
    items: { title: string; text: string }[];
  };
};

const fallbackSettings: SiteSettingsView = {
  hero: {
    eyebrow: "Technology Infrastructure & System Integrator",
    headline: "Teknologi terintegrasi.",
    highlight: "Bisnis terus melaju.",
    description: "Kami merancang, mengintegrasikan, dan mengoptimalkan solusi IT end-to-end untuk operasional bisnis yang lebih andal, aman, dan scalable.",
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
    description: "Solusi infrastruktur, jaringan, keamanan siber, cloud, managed service, dan pengadaan IT untuk bisnis yang andal dan bertumbuh.",
  },
  about: {
    eyebrow: "Who we are",
    headline: "Lebih dari sekadar",
    highlight: "technology vendor.",
    description: "PT Sigma Core Solusindo membantu perusahaan membangun fondasi teknologi yang kuat dan berkelanjutan. Bukan hanya menyediakan produk, kami memastikan setiap komponen bekerja sebagai satu ekosistem yang utuh.",
  },
  workflow: {
    eyebrow: "How we work",
    title: "Dari kebutuhan bisnis menuju sistem yang bekerja.",
    description: "Kami menyatukan beragam teknologi menjadi ekosistem yang seamless, optimal, dan mudah dikembangkan.",
    steps: fallbackProcess,
  },
  strengths: {
    eyebrow: "Why SCS",
    title: "Dibangun untuk menjadi partner, bukan sekadar penyedia.",
    description: "Setiap proyek dijalankan dengan kombinasi keahlian teknis, disiplin implementasi, dan pemahaman terhadap tujuan bisnis.",
    items: fallbackValues,
  },
};

function publicDocument(doc: Row, includeDrafts: boolean) {
  return includeDrafts || (doc.published === true && doc._status === "published");
}

function relatedSolutions(value: unknown) {
  return rows(value).flatMap((solution) => {
    const slug = text(solution.slug);
    const title = text(solution.title);
    return validSlug(slug) && title ? [{ slug, title }] : [];
  });
}

function mapPartner(value: unknown, base: URL, includeDrafts: boolean) {
  const doc = row(value);
  if (!publicDocument(doc, includeDrafts)) return null;
  const name = text(doc.name);
  const logo = cmsMediaURL(doc.logo, base);
  if (!name || !logo) return null;
  return { name, logo, website: safeContentLink(doc.website) };
}

function mapProject(value: unknown, base: URL, includeDrafts: boolean): (ProjectView & { order: number }) | null {
  const doc = row(value);
  if (!publicDocument(doc, includeDrafts)) return null;
  const slug = text(doc.slug);
  const title = text(doc.title);
  const industry = text(doc.industry);
  const summary = text(doc.summary);
  if (!validSlug(slug) || !title || !industry || !summary) throw new Error("Published CMS project is invalid.");
  return {
    slug,
    title,
    industry,
    client: text(doc.client) || null,
    summary,
    highlights: rows(doc.highlights).map((item) => text(item.label)).filter(Boolean),
    image: cmsMediaURL(doc.cover, base),
    challenge: doc.challenge ?? null,
    solution: doc.solution ?? null,
    result: doc.result ?? null,
    technologies: rows(doc.technologies).map((item) => text(item.label)).filter(Boolean),
    relatedSolutions: relatedSolutions(doc.relatedSolutions),
    mediaAPIBase: base.href,
    order: number(doc.order),
  };
}

function mapInsight(value: unknown, base: URL, includeDrafts: boolean): InsightView | null {
  const doc = row(value);
  if (!publicDocument(doc, includeDrafts)) return null;
  const slug = text(doc.slug);
  const title = text(doc.title);
  const excerpt = text(doc.excerpt);
  const publishedAt = text(doc.publishedAt);
  const categoryKey = doc.category === "news" || doc.category === "guide" ? doc.category : "insight";
  if (!validSlug(slug) || !title || !excerpt || !publishedAt || Number.isNaN(Date.parse(publishedAt))) {
    throw new Error("Published CMS insight is invalid.");
  }
  const seo = row(doc.seo);
  return {
    slug,
    title,
    category: insightCategoryLabels[categoryKey],
    categoryKey,
    excerpt,
    publishedAt,
    image: cmsMediaURL(doc.cover, base),
    content: doc.content ?? null,
    featured: doc.featured === true,
    seo: { title: text(seo.title) || title, description: text(seo.description) || excerpt },
    relatedSolutions: relatedSolutions(doc.relatedSolutions),
    mediaAPIBase: base.href,
  };
}

function requiredGroup(parent: Row, name: string, fields: string[]) {
  const group = row(parent[name]);
  const result = Object.fromEntries(fields.map((field) => [field, text(group[field])]));
  if (Object.values(result).some((value) => !value)) throw new Error(`Published CMS site-settings.${name} is incomplete.`);
  return result;
}

function mapSettings(value: unknown): SiteSettingsView {
  const doc = row(value);
  const hero = requiredGroup(doc, "hero", ["eyebrow", "headline", "highlight", "description"]);
  const contact = requiredGroup(doc, "contact", ["email", "phone", "address"]);
  const seo = requiredGroup(doc, "seo", ["title", "description"]);
  const about = requiredGroup(doc, "about", ["eyebrow", "headline", "highlight", "description"]);
  const workflow = requiredGroup(doc, "workflow", ["eyebrow", "title", "description"]);
  const strengths = requiredGroup(doc, "strengths", ["eyebrow", "title", "description"]);
  const workflowRow = row(doc.workflow);
  const strengthsRow = row(doc.strengths);
  const steps = rows(workflowRow.steps).flatMap((item) => {
    const step = text(item.step); const title = text(item.title); const body = text(item.text);
    return step && title && body ? [{ step, title, text: body }] : [];
  });
  const items = rows(strengthsRow.items).flatMap((item) => {
    const title = text(item.title); const body = text(item.text);
    return title && body ? [{ title, text: body }] : [];
  });
  if (!steps.length || !items.length) throw new Error("Published CMS workflow or strengths is empty.");
  return {
    hero: hero as SiteSettingsView["hero"],
    contact: contact as SiteSettingsView["contact"],
    companyFacts: rows(doc.companyFacts).flatMap((item) => {
      const valueText = text(item.value); const label = text(item.label);
      return valueText && label ? [{ value: valueText, label }] : [];
    }),
    seo: seo as SiteSettingsView["seo"],
    about: about as SiteSettingsView["about"],
    workflow: { ...(workflow as Omit<SiteSettingsView["workflow"], "steps">), steps },
    strengths: { ...(strengths as Omit<SiteSettingsView["strengths"], "items">), items },
  };
}

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

const getViews = cache(async (publishedOnly = false) => {
  const snapshot = await readCMSContent(publishedOnly);
  if (!snapshot) return {
    solutions: fallbackSolutions.map((_, index) => fallbackSolutionView(index)),
    partners: fallbackPartners.map((partner) => ({ ...partner, website: null })),
    projects: [] as ProjectView[],
    insights: [] as InsightView[],
    settings: fallbackSettings,
  };

  const base = cmsAPIBase(process.env.CMS_API_URL as string);
  const solutionDocs = snapshot.solutions.flatMap((value) => {
    const mapped = mapCMSSolution(value, base, snapshot.preview);
    return mapped ? [mapped] : [];
  }).sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
  const projects = snapshot.projects.flatMap((value) => {
    const mapped = mapProject(value, base, snapshot.preview);
    return mapped ? [mapped] : [];
  }).sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug))
    .map(({ order: _order, ...project }) => project);

  return {
    solutions: solutionDocs.map(({ iconKey, order: _order, ...solution }, index) => ({
      ...solution,
      number: String(index + 1).padStart(2, "0"),
      categoryLabel: solutionCategoryLabels[solution.category],
      icon: iconMap[iconKey] ?? Building2,
    })),
    partners: snapshot.partners.flatMap((value) => {
      const mapped = mapPartner(value, base, snapshot.preview);
      return mapped ? [mapped] : [];
    }),
    projects,
    insights: snapshot.insights.flatMap((value) => {
      const mapped = mapInsight(value, base, snapshot.preview);
      return mapped ? [mapped] : [];
    }),
    settings: mapSettings(snapshot.settings),
  };
});

export const getPublishedSolutions = cache(async (publishedOnly = false): Promise<SolutionView[]> => (await getViews(publishedOnly)).solutions);
export const getSolutionBySlug = cache(async (slug: string): Promise<SolutionView | null> =>
  (await getPublishedSolutions()).find((solution) => solution.slug === slug) ?? null);
export const getPublishedPartners = cache(async () => (await getViews()).partners);
export const getPublishedProjects = cache(async (publishedOnly = false): Promise<ProjectView[]> => (await getViews(publishedOnly)).projects);
export const getProjectBySlug = cache(async (slug: string): Promise<ProjectView | null> =>
  (await getPublishedProjects()).find((project) => project.slug === slug) ?? null);
export const getPublishedInsights = cache(async (publishedOnly = false): Promise<InsightView[]> => (await getViews(publishedOnly)).insights);
export const getInsightBySlug = cache(async (slug: string): Promise<InsightView | null> =>
  (await getPublishedInsights()).find((insight) => insight.slug === slug) ?? null);
export const getSiteSettings = cache(async (): Promise<SiteSettingsView> => (await getViews()).settings);
export const getLandingContent = cache(async () => {
  const content = await getViews();
  return { ...content, projects: content.projects.slice(0, 3), insights: content.insights.slice(0, 3) };
});
