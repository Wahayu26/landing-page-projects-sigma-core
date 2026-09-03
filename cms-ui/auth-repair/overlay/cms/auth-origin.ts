export function cmsAuthOrigin(env: Record<string, string | undefined> = process.env) {
  const value = env.PAYLOAD_SERVER_URL || env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash || url.pathname !== "/") {
    throw new Error("PAYLOAD_SERVER_URL must be an HTTP(S) origin without credentials, path, query, or hash.");
  }
  return url.origin;
}
