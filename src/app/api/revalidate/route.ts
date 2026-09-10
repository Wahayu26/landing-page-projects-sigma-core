import { revalidatePath, revalidateTag } from "next/cache";

import { safeSecretEqual } from "@/lib/safe-secret";

const collectionPaths: Record<string, string> = {
  insights: "/insight",
  partners: "/",
  projects: "/proyek",
  solutions: "/solusi",
  "site-settings": "/",
};

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? null;
  if (!safeSecretEqual(process.env.CMS_REVALIDATE_SECRET, authorization)) {
    return Response.json({ revalidated: false }, { status: 401 });
  }

  let event: Record<string, unknown>;
  try {
    event = await request.json() as Record<string, unknown>;
  } catch {
    return Response.json({ revalidated: false }, { status: 400 });
  }

  const collection = typeof event.collection === "string" ? event.collection : "";
  const basePath = collectionPaths[collection];
  if (!basePath) return Response.json({ revalidated: false }, { status: 400 });

  revalidateTag("cms-content", { expire: 0 });
  revalidatePath(basePath);
  const slug = typeof event.slug === "string" && /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(event.slug)
    ? event.slug
    : null;
  if (slug && basePath !== "/") revalidatePath(`${basePath}/${slug}`);
  revalidatePath("/sitemap.xml");

  return Response.json({ revalidated: true, collection });
}
