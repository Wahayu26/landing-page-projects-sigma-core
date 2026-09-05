export type InquiryPayload = {
  name: string;
  company: string;
  email: string;
  phone: string | null;
  message: string;
  interestSolution: string | null;
  sourcePage: string | null;
  utmSource: string | null;
  utmCampaign: string | null;
  preferredContact: "whatsapp" | "email" | "phone";
};

type ParseResult =
  | { ok: true; value: InquiryPayload }
  | { ok: false; message: string };

const forbiddenControlCharacters = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+\d][\d\s().-]{5,39}$/;
const slugPattern = /^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u;
const contactMethods = new Set(["whatsapp", "email", "phone"]);

const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
const optionalText = (value: unknown) => text(value) || null;

export function parseInquiryPayload(input: unknown): ParseResult {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, message: "Data formulir tidak valid." };
  }

  const row = input as Record<string, unknown>;
  const name = text(row.name);
  const company = text(row.company);
  const email = text(row.email).toLowerCase();
  const phone = optionalText(row.phone);
  const message = text(row.message);
  const interestSolution = optionalText(row.interestSolution);
  const sourcePage = optionalText(row.sourcePage);
  const utmSource = optionalText(row.utmSource);
  const utmCampaign = optionalText(row.utmCampaign);
  const preferredContact = text(row.preferredContact);

  const values = [name, company, email, phone, message, interestSolution, sourcePage, utmSource, utmCampaign]
    .filter((value): value is string => value !== null);
  if (values.some((value) => forbiddenControlCharacters.test(value))) {
    return { ok: false, message: "Formulir mengandung karakter yang tidak didukung." };
  }
  if (name.length < 2 || name.length > 120) return { ok: false, message: "Nama harus berisi 2–120 karakter." };
  if (company.length < 2 || company.length > 160) return { ok: false, message: "Nama perusahaan harus berisi 2–160 karakter." };
  if (email.length > 180 || !emailPattern.test(email)) return { ok: false, message: "Alamat email tidak valid." };
  if (phone && !phonePattern.test(phone)) return { ok: false, message: "Nomor telepon tidak valid." };
  if (message.length < 10 || message.length > 5000) return { ok: false, message: "Kebutuhan harus berisi 10–5000 karakter." };
  if (interestSolution && (interestSolution.length > 120 || !slugPattern.test(interestSolution))) {
    return { ok: false, message: "Pilihan solusi tidak valid." };
  }
  if (sourcePage && sourcePage.length > 300) return { ok: false, message: "Sumber halaman tidak valid." };
  if (utmSource && utmSource.length > 120) return { ok: false, message: "Sumber kampanye tidak valid." };
  if (utmCampaign && utmCampaign.length > 160) return { ok: false, message: "Nama kampanye tidak valid." };
  if (!contactMethods.has(preferredContact)) return { ok: false, message: "Preferensi kontak tidak valid." };

  return {
    ok: true,
    value: {
      name,
      company,
      email,
      phone,
      message,
      interestSolution,
      sourcePage,
      utmSource,
      utmCampaign,
      preferredContact: preferredContact as InquiryPayload["preferredContact"],
    },
  };
}

export function coreInquiryURL(value: string): URL {
  const base = new URL(value);
  if (!["http:", "https:"].includes(base.protocol) || base.username || base.password || base.search || base.hash) {
    throw new Error("CORE_API_URL must be an HTTP(S) base without credentials, query or fragment.");
  }
  base.pathname = `${base.pathname.replace(/\/+$/, "")}/api/v1/inquiries`;
  return base;
}

export function googleMapsSearchURL(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.trim())}`;
}
