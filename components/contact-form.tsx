"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowUpRight, LoaderCircle } from "lucide-react";

type FormStatus = "idle" | "submitting" | "success" | "error";

type ContactFormProps = {
  solutions?: { slug: string; title: string }[];
  defaultInterest?: string;
  sourcePage?: string;
};

export function ContactForm({ solutions = [], defaultInterest = "", sourcePage = "website" }: ContactFormProps) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");
  const [interest, setInterest] = useState(defaultInterest);
  const [tracking, setTracking] = useState({ sourcePage, utmSource: "", utmCampaign: "" });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryInterest = params.get("interest");
    if (queryInterest && solutions.some((solution) => solution.slug === queryInterest)) {
      setInterest(queryInterest);
    }
    setTracking({
      sourcePage: sourcePage || window.location.pathname,
      utmSource: params.get("utm_source") ?? "",
      utmCampaign: params.get("utm_campaign") ?? "",
    });
  }, [solutions, sourcePage]);

  async function submitInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = (await response.json()) as { reference?: string; message?: string };

      if (!response.ok) throw new Error(result.message ?? "Permintaan belum dapat dikirim.");

      setStatus("success");
      setMessage(`Terima kasih. Referensi konsultasi Anda: ${result.reference}`);
      form.reset();
      setInterest(defaultInterest);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Terjadi kendala. Silakan coba lagi.");
    }
  }

  return (
    <form className="contact-form" onSubmit={submitInquiry}>
      <div className="form-row">
        <label>
          Nama
          <input name="name" type="text" autoComplete="name" required minLength={2} />
        </label>
        <label>
          Perusahaan
          <input name="company" type="text" autoComplete="organization" required minLength={2} />
        </label>
      </div>
      <div className="form-row">
        <label>
          Email
          <input name="email" type="email" autoComplete="email" required />
        </label>
        <label>
          Nomor telepon
          <input name="phone" type="tel" autoComplete="tel" />
        </label>
      </div>
      <div className="form-row">
        {solutions.length > 0 ? (
          <label>
            Solusi yang diminati
            <select name="interestSolution" value={interest} onChange={(event) => setInterest(event.target.value)}>
              <option value="">Belum menentukan solusi</option>
              {solutions.map((solution) => (
                <option value={solution.slug} key={solution.slug}>{solution.title}</option>
              ))}
            </select>
          </label>
        ) : (
          <input name="interestSolution" type="hidden" value={interest} />
        )}
        <label>
          Preferensi dihubungi
          <select name="preferredContact" defaultValue="whatsapp">
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
            <option value="phone">Telepon</option>
          </select>
        </label>
      </div>
      <input name="sourcePage" type="hidden" value={tracking.sourcePage} />
      <input name="utmSource" type="hidden" value={tracking.utmSource} />
      <input name="utmCampaign" type="hidden" value={tracking.utmCampaign} />
      <label>
        Kebutuhan Anda
        <textarea name="message" rows={4} required minLength={10} />
      </label>
      <button className="button button-primary" type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? (
          <><LoaderCircle className="spin" size={18} /> Mengirim...</>
        ) : (
          <>Kirim konsultasi <ArrowUpRight size={18} /></>
        )}
      </button>
      {message ? <p className={`form-message ${status}`} role="status">{message}</p> : null}
    </form>
  );
}
