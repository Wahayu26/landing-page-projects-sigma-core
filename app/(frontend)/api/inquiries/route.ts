import { NextResponse } from "next/server";

const REQUIRED_FIELDS = ["name", "company", "email", "message"] as const;

export async function POST(request: Request) {
  let body: Record<string, unknown>;

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ message: "Format data tidak valid." }, { status: 400 });
  }

  const missingField = REQUIRED_FIELDS.find(
    (field) => typeof body[field] !== "string" || body[field].trim().length === 0,
  );

  if (missingField) {
    return NextResponse.json({ message: `Kolom ${missingField} wajib diisi.` }, { status: 422 });
  }

  const coreApiUrl = process.env.CORE_API_URL ?? "http://localhost:8080";

  try {
    const response = await fetch(`${coreApiUrl}/api/v1/inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const result = await response.json();

    return NextResponse.json(result, { status: response.status });
  } catch {
    return NextResponse.json(
      { message: "Layanan konsultasi sedang tidak tersedia. Silakan hubungi admin@sigmacore.id." },
      { status: 503 },
    );
  }
}

