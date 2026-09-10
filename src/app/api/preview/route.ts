import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

import { safeSecretEqual } from "@/lib/safe-secret";

const collectionPaths: Record<string, string> = {
  insights: "/insight",
  partners: "/",
  projects: "/proyek",
  solutions: "/solusi",
  "site-settings": "/",
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (!safeSecretEqual(process.env.CMS_PREVIEW_SECRET, url.searchParams.get("secret"))) {
    return new Response("Invalid preview token", { status: 401 });
  }

  const collection = url.searchParams.get("collection") ?? "";
  const basePath = collectionPaths[collection];
  if (!basePath) return new Response("Invalid preview collection", { status: 400 });
  const requestedSlug = url.searchParams.get("slug");
  const slug = requestedSlug && /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(requestedSlug)
    ? requestedSlug
    : null;
  if (basePath !== "/" && !slug) return new Response("Invalid preview slug", { status: 400 });

  (await draftMode()).enable();
  redirect(slug ? `${basePath}/${slug}` : basePath);
}
