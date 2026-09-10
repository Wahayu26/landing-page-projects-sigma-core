// Public REST adapter. Runtime configuration and caching are owned by landing-content.ts.
type Row = Record<string, unknown>;
const row = (value: unknown): Row => value && typeof value === "object" && !Array.isArray(value) ? value as Row : {};
const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
const rows = (value: unknown): Row[] => Array.isArray(value) ? value.map(row) : [];

export function cmsAPIBase(value: string): URL {
  const url = new URL(value);
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error("CMS_API_URL must be an HTTP(S) API base without credentials, query or fragment.");
  }
  url.pathname = `${url.pathname.replace(/\/+$/, "")}/`;
  return url;
}

export function cmsMediaURL(value: unknown, base: URL): string | null {
  // Payload's stored url can reference an old deployment. Use its filename and the configured API instead.
  const filename = text(row(value).filename);
  if (!filename || filename === "." || filename === ".." || /[\\/\u0000-\u001f]/.test(filename)) return null;
  return new URL(`media/file/${encodeURIComponent(filename)}`, base).href;
}

export function safeContentLink(value: unknown): string | null {
  const link = text(value);
  if (!link || /[\u0000-\u0020\\]/.test(link)) return null;
  if (link.startsWith("/") && !link.startsWith("//")) return link;
  if (link.startsWith("#")) return link;
  try {
    const url = new URL(link);
    return ["https:", "http:", "mailto:", "tel:"].includes(url.protocol) ? link : null;
  } catch { return null; }
}

export function mapCMSSolution(value: unknown, base: URL, includeDrafts = false) {
  const doc = row(value);
  if (!includeDrafts && (doc.published !== true || doc._status !== "published")) return null;
  const slug = text(doc.slug);
  const title = text(doc.title);
  const description = text(doc.summary);
  if (!/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(slug) || !title || !description) {
    throw new Error("Published CMS solution has an invalid slug, title or summary.");
  }
  const category: "platform" | "protection" | "operations" = doc.category === "protection" || doc.category === "operations" ? doc.category : "platform";
  return {
    slug, title, description, category,
    order: typeof doc.order === "number" && Number.isFinite(doc.order) ? doc.order : 0,
    outcome: text(doc.outcome) || description,
    iconKey: text(doc.iconKey),
    items: rows(doc.features).map((feature) => text(feature.label)).filter(Boolean),
    benefits: rows(doc.benefits).flatMap((benefit) => text(benefit.title) && text(benefit.description)
      ? [{ title: text(benefit.title), text: text(benefit.description) }] : []),
    useCases: rows(doc.useCases).map((item) => text(item.label)).filter(Boolean),
    image: cmsMediaURL(doc.heroImage, base),
    mediaAPIBase: base.href,
    content: doc.content ?? null,
    partners: rows(doc.relatedPartners).flatMap((partner) => {
      if (!includeDrafts && (partner.published !== true || partner._status !== "published")) return [];
      const logo = cmsMediaURL(partner.logo, base);
      return logo && text(partner.name) ? [{ name: text(partner.name), logo, website: safeContentLink(partner.website) }] : [];
    }),
  };
}

// Injecting only the transport keeps this adapter testable without a live CMS or DB writes.
export async function readPublishedCMSSolutions(baseValue: string, request: (url: URL) => Promise<Response>) {
  const base = cmsAPIBase(baseValue);
  const results: NonNullable<ReturnType<typeof mapCMSSolution>>[] = [];
  const slugs = new Set<string>();
  let page = 1;
  while (page <= 100) {
    const url = new URL("solutions", base);
    url.search = new URLSearchParams({
      "where[published][equals]": "true", "where[_status][equals]": "published",
      draft: "false", depth: "2", sort: "order,slug", limit: "100", page: String(page),
    }).toString();
    const response = await request(url);
    if (!response.ok) throw new Error(`CMS solutions request failed (${response.status}).`);
    const payload = row(await response.json());
    if (!Array.isArray(payload.docs) || typeof payload.hasNextPage !== "boolean") {
      throw new Error("Invalid CMS solutions response.");
    }
    for (const doc of payload.docs) {
      const solution = mapCMSSolution(doc, base);
      if (!solution) continue;
      if (slugs.has(solution.slug)) throw new Error("Duplicate CMS solution slug.");
      slugs.add(solution.slug);
      results.push(solution);
    }
    if (!payload.hasNextPage) return results.sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));
    if (payload.nextPage !== page + 1) throw new Error("Invalid CMS pagination.");
    page += 1;
  }
  throw new Error("CMS solutions pagination limit exceeded.");
}
