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
import { getPayload } from "payload";

import config from "@payload-config";
import {
  partners as fallbackPartners,
  solutionCategoryLabels,
  solutions as fallbackSolutions,
} from "@/content/site";
import type { Insight, Media, Partner, Project, Solution } from "@/payload-types";

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

const iconMap: Record<string, LucideIcon> = {
  infrastructure: Building2,
  network: Network,
  security: ShieldCheck,
  cloud: CloudCog,
  "managed-service": Headphones,
  procurement: PackageCheck,
};

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
  content: Solution["content"] | null;
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
  challenge: Project["challenge"] | null;
  solution: Project["solution"] | null;
  result: Project["result"] | null;
  technologies: string[];
  relatedSolutions: { slug: string; title: string }[];
};

export type InsightView = {
  slug: string;
  title: string;
  category: string;
  categoryKey: Insight["category"];
  excerpt: string;
  publishedAt: string;
  image: string | null;
  content: Insight["content"];
  featured: boolean;
  seo: { title: string; description: string };
  relatedSolutions: { slug: string; title: string }[];
};

function mediaUrl(value?: number | Media | null) {
  return typeof value === "object" && value?.url ? value.url : null;
}

function partnerView(partner: Partner) {
  const logo = mediaUrl(partner.logo);
  if (!logo) return null;
  return { name: partner.name, logo, website: partner.website ?? null };
}

function relatedSolutionLinks(values?: (number | Solution)[] | null) {
  return (values ?? []).flatMap((value) =>
    typeof value === "object" ? [{ slug: value.slug, title: value.title }] : [],
  );
}

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

function solutionView(solution: Solution, index: number): SolutionView {
  const fallback = fallbackSolutions.find((item) => item.slug === solution.slug);
  const category = (solution.category ?? fallback?.category ?? "platform") as CategoryKey;
  const relatedPartners = (solution.relatedPartners ?? []).flatMap((value) => {
    if (typeof value !== "object") return [];
    const view = partnerView(value);
    return view ? [view] : [];
  });

  return {
    number: String(index + 1).padStart(2, "0"),
    slug: solution.slug,
    category,
    categoryLabel: solutionCategoryLabels[category],
    title: solution.title,
    description: solution.summary,
    outcome: solution.outcome || fallback?.outcome || solution.summary,
    items: solution.features?.map((feature) => feature.label) ?? fallback?.items ?? [],
    benefits:
      solution.benefits?.map((benefit) => ({ title: benefit.title, text: benefit.description })) ??
      fallback?.benefits ??
      [],
    useCases: solution.useCases?.map((useCase) => useCase.label) ?? fallback?.useCases ?? [],
    icon: iconMap[solution.iconKey] ?? fallback?.icon ?? Building2,
    image: mediaUrl(solution.heroImage),
    content: solution.content ?? null,
    partners: relatedPartners,
  };
}

function projectView(project: Project): ProjectView {
  return {
    slug: project.slug,
    title: project.title,
    industry: project.industry,
    client: project.client ?? null,
    summary: project.summary,
    highlights: project.highlights?.map((highlight) => highlight.label) ?? [],
    image: mediaUrl(project.cover),
    challenge: project.challenge ?? null,
    solution: project.solution ?? null,
    result: project.result ?? null,
    technologies: project.technologies?.map((technology) => technology.label) ?? [],
    relatedSolutions: relatedSolutionLinks(project.relatedSolutions),
  };
}

function insightView(insight: Insight): InsightView {
  return {
    slug: insight.slug,
    title: insight.title,
    category: insightCategoryLabels[insight.category],
    categoryKey: insight.category,
    excerpt: insight.excerpt,
    publishedAt: insight.publishedAt,
    image: mediaUrl(insight.cover),
    content: insight.content,
    featured: insight.featured,
    seo: {
      title: insight.seo?.title || insight.title,
      description: insight.seo?.description || insight.excerpt,
    },
    relatedSolutions: relatedSolutionLinks(insight.relatedSolutions),
  };
}

export const getPublishedSolutions = cache(async (): Promise<SolutionView[]> => {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "solutions",
      depth: 2,
      pagination: false,
      sort: "order",
      where: { published: { equals: true } },
    });
    return result.docs.length > 0
      ? result.docs.map(solutionView)
      : fallbackSolutions.map((_, index) => fallbackSolutionView(index));
  } catch (error) {
    console.warn("Solutions unavailable from CMS; using bundled content.", error);
    return fallbackSolutions.map((_, index) => fallbackSolutionView(index));
  }
});

export const getSolutionBySlug = cache(async (slug: string): Promise<SolutionView | null> => {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "solutions",
      depth: 2,
      limit: 1,
      where: { and: [{ slug: { equals: slug } }, { published: { equals: true } }] },
    });
    if (result.docs[0]) return solutionView(result.docs[0], Math.max(0, result.docs[0].order));
  } catch (error) {
    console.warn(`Solution ${slug} unavailable from CMS; checking bundled content.`, error);
  }

  const index = fallbackSolutions.findIndex((solution) => solution.slug === slug);
  return index >= 0 ? fallbackSolutionView(index) : null;
});

export const getPublishedPartners = cache(async () => {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "partners",
      depth: 1,
      pagination: false,
      sort: "order",
      where: { published: { equals: true } },
    });
    const partners = result.docs.flatMap((partner) => {
      const view = partnerView(partner);
      return view ? [view] : [];
    });
    return partners.length > 0
      ? partners
      : fallbackPartners.map((partner) => ({ ...partner, website: null }));
  } catch (error) {
    console.warn("Partners unavailable from CMS; using bundled content.", error);
    return fallbackPartners.map((partner) => ({ ...partner, website: null }));
  }
});

export const getPublishedProjects = cache(async (): Promise<ProjectView[]> => {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "projects",
      depth: 2,
      pagination: false,
      sort: "order",
      where: { published: { equals: true } },
    });
    return result.docs.map(projectView);
  } catch (error) {
    console.warn("Projects unavailable from CMS.", error);
    return [];
  }
});

export const getProjectBySlug = cache(async (slug: string): Promise<ProjectView | null> => {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "projects",
      depth: 2,
      limit: 1,
      where: { and: [{ slug: { equals: slug } }, { published: { equals: true } }] },
    });
    return result.docs[0] ? projectView(result.docs[0]) : null;
  } catch (error) {
    console.warn(`Project ${slug} unavailable from CMS.`, error);
    return null;
  }
});

export const getPublishedInsights = cache(async (): Promise<InsightView[]> => {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "insights",
      depth: 2,
      pagination: false,
      sort: "-publishedAt",
      where: { published: { equals: true } },
    });
    return result.docs.map(insightView);
  } catch (error) {
    console.warn("Insights unavailable from CMS.", error);
    return [];
  }
});

export const getInsightBySlug = cache(async (slug: string): Promise<InsightView | null> => {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: "insights",
      depth: 2,
      limit: 1,
      where: { and: [{ slug: { equals: slug } }, { published: { equals: true } }] },
    });
    return result.docs[0] ? insightView(result.docs[0]) : null;
  } catch (error) {
    console.warn(`Insight ${slug} unavailable from CMS.`, error);
    return null;
  }
});

export const getSiteSettings = cache(async () => {
  try {
    const payload = await getPayload({ config });
    const siteSettings = await payload.findGlobal({ slug: "site-settings", depth: 0 });
    return {
      hero: { ...fallbackSettings.hero, ...siteSettings.hero },
      contact: { ...fallbackSettings.contact, ...siteSettings.contact },
      companyFacts:
        siteSettings.companyFacts && siteSettings.companyFacts.length > 0
          ? siteSettings.companyFacts.map((fact) => ({ value: fact.value, label: fact.label }))
          : fallbackSettings.companyFacts,
      seo: { ...fallbackSettings.seo, ...siteSettings.seo },
    };
  } catch (error) {
    console.warn("Site settings unavailable from CMS; using bundled settings.", error);
    return fallbackSettings;
  }
});

export const getLandingContent = cache(async () => {
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
});
