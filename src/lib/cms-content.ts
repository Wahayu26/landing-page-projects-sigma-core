import "server-only";

import { draftMode } from "next/headers";
import { cache } from "react";

import { cmsAPIBase } from "./cms-solutions";

type Row = Record<string, unknown>;

export type CMSContentSnapshot = {
  insights: unknown[];
  partners: unknown[];
  preview: boolean;
  projects: unknown[];
  settings: unknown;
  solutions: unknown[];
};

const row = (value: unknown): Row =>
  value && typeof value === "object" && !Array.isArray(value) ? value as Row : {};

async function fetchCMS(url: URL, init: RequestInit & { next?: { revalidate: number; tags: string[] } }) {
  const response = await fetch(url, {
    ...init,
    credentials: "omit",
    redirect: "error",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`CMS request failed (${response.status}) for ${url.pathname}.`);
  return response.json() as Promise<unknown>;
}

async function readCollection(base: URL, collection: string, sort: string) {
  const docs: unknown[] = [];
  let page = 1;

  while (page <= 100) {
    const url = new URL(collection, base);
    url.search = new URLSearchParams({
      "where[published][equals]": "true",
      "where[_status][equals]": "published",
      draft: "false",
      depth: "2",
      limit: "100",
      page: String(page),
      sort,
    }).toString();
    const payload = row(await fetchCMS(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300, tags: ["cms-content"] },
    }));
    if (!Array.isArray(payload.docs) || typeof payload.hasNextPage !== "boolean") {
      throw new Error(`Invalid CMS ${collection} response.`);
    }
    docs.push(...payload.docs);
    if (!payload.hasNextPage) return docs;
    if (payload.nextPage !== page + 1) throw new Error(`Invalid CMS ${collection} pagination.`);
    page += 1;
  }

  throw new Error(`CMS ${collection} pagination limit exceeded.`);
}

async function readPublishedSnapshot(base: URL): Promise<CMSContentSnapshot> {
  const settingsURL = new URL("globals/site-settings", base);
  settingsURL.search = new URLSearchParams({ draft: "false", depth: "1" }).toString();

  const [solutions, partners, projects, insights, settings] = await Promise.all([
    readCollection(base, "solutions", "order,slug"),
    readCollection(base, "partners", "order,name"),
    readCollection(base, "projects", "order,slug"),
    readCollection(base, "insights", "-publishedAt,slug"),
    fetchCMS(settingsURL, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300, tags: ["cms-content"] },
    }),
  ]);

  return { solutions, partners, projects, insights, settings, preview: false };
}

async function readPreviewSnapshot(base: URL): Promise<CMSContentSnapshot> {
  const secret = process.env.CMS_PREVIEW_SECRET?.trim();
  if (!secret) throw new Error("CMS_PREVIEW_SECRET is required while Draft Mode is enabled.");
  const url = new URL("preview-content", base);
  const payload = row(await fetchCMS(url, {
    cache: "no-store",
    headers: { Accept: "application/json", Authorization: `Bearer ${secret}` },
  }));
  for (const collection of ["solutions", "partners", "projects", "insights"] as const) {
    if (!Array.isArray(payload[collection])) throw new Error(`Invalid CMS preview ${collection} response.`);
  }
  return {
    solutions: payload.solutions as unknown[],
    partners: payload.partners as unknown[],
    projects: payload.projects as unknown[],
    insights: payload.insights as unknown[],
    settings: payload.settings,
    preview: true,
  };
}

export const readCMSContent = cache(async (publishedOnly = false): Promise<CMSContentSnapshot | null> => {
  const configured = process.env.CMS_API_URL?.trim();
  if (!configured) return null;
  const base = cmsAPIBase(configured);
  return !publishedOnly && (await draftMode()).isEnabled
    ? readPreviewSnapshot(base)
    : readPublishedSnapshot(base);
});
