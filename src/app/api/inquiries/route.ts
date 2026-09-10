import { coreInquiryURL, parseInquiryPayload } from "@/lib/inquiry";

export const runtime = "nodejs";

const windowMs = 15 * 60 * 1000;
const requestLimit = 5;
const attempts = new Map<string, number[]>();

function clientKey(request: Request) {
  return request.headers.get("cf-connecting-ip")?.trim()
    || request.headers.get("x-real-ip")?.trim()
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || "unknown";
}

function rateLimited(key: string, now = Date.now()) {
  const active = (attempts.get(key) ?? []).filter((timestamp) => now - timestamp < windowMs);
  active.push(now);
  attempts.set(key, active);
  return active.length > requestLimit;
}

const json = (body: Record<string, unknown>, status: number) => Response.json(body, {
  status,
  headers: { "cache-control": "no-store" },
});

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0]?.trim();
  if (contentType !== "application/json") return json({ ok: false, message: "Format permintaan tidak didukung." }, 415);

  const expectedOrigin = new URL(process.env.NEXT_PUBLIC_SERVER_URL ?? request.url).origin;
  const requestOrigin = request.headers.get("origin");
  if (requestOrigin && requestOrigin !== expectedOrigin) return json({ ok: false, message: "Permintaan lintas situs ditolak." }, 403);

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > 16_384) return json({ ok: false, message: "Formulir terlalu besar." }, 413);
  if (rateLimited(clientKey(request))) return json({ ok: false, message: "Terlalu banyak percobaan. Silakan coba lagi beberapa menit." }, 429);

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return json({ ok: false, message: "Formulir tidak dapat dibaca." }, 400);
  }
  if (rawBody.length > 16_384) return json({ ok: false, message: "Formulir terlalu besar." }, 413);

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return json({ ok: false, message: "Data formulir tidak valid." }, 400);
  }

  // Quietly accept bot submissions without storing them.
  if (typeof body.website === "string" && body.website.trim()) {
    return json({ ok: true, reference: "SCS-RECEIVED" }, 201);
  }

  const parsed = parseInquiryPayload(body);
  if (!parsed.ok) return json({ ok: false, message: parsed.message }, 400);

  const coreAPI = process.env.CORE_API_URL?.trim();
  if (!coreAPI) return json({ ok: false, message: "Layanan konsultasi belum tersedia." }, 503);

  try {
    const response = await fetch(coreInquiryURL(coreAPI), {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(parsed.value),
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return json({ ok: false, message: "Konsultasi belum dapat dikirim. Silakan coba kembali." }, 502);

    const receipt = await response.json() as Record<string, unknown>;
    const reference = typeof receipt.reference === "string" ? receipt.reference : "";
    if (!reference) return json({ ok: false, message: "Respons layanan konsultasi tidak valid." }, 502);

    return json({ ok: true, reference }, 201);
  } catch {
    return json({ ok: false, message: "Layanan konsultasi sedang tidak tersedia. Silakan coba kembali." }, 504);
  }
}
