"use client";

import { useId, useState } from "react";
import { ArrowUpRight } from "lucide-react";

type ContactFormProps = {
  solutions?: { slug: string; title: string }[];
  defaultInterest?: string;
  sourcePage?: string;
  content?: { submitLabel: string; privacyText: string; unknownSolutionLabel: string };
};

const readInterestFromQuery = (solutions: { slug: string; title: string }[], fallback: string) => {
  if (typeof window === "undefined") return fallback;

  const queryInterest = new URLSearchParams(window.location.search).get("interest");
  const isKnownSolution = solutions.some((solution) => solution.slug === queryInterest);

  return isKnownSolution && queryInterest ? queryInterest : fallback;
};

export const ContactForm: React.FC<ContactFormProps> = ({ solutions = [], defaultInterest = "", sourcePage, content = { submitLabel: "Kirim konsultasi", privacyText: "Data Anda hanya digunakan untuk menindaklanjuti kebutuhan konsultasi.", unknownSolutionLabel: "Belum menentukan solusi" } }) => {
  const [interest, setInterest] = useState(() => readInterestFromQuery(solutions, defaultInterest));
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const helperTextId = useId();

  async function submitInquiry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const search = new URLSearchParams(window.location.search);
    setStatus("submitting");
    setMessage("Mengirim konsultasi Anda…");

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          company: formData.get("company"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          interestSolution: formData.get("interestSolution"),
          preferredContact: formData.get("preferredContact"),
          message: formData.get("message"),
          website: formData.get("website"),
          sourcePage: sourcePage || window.location.pathname,
          utmSource: search.get("utm_source"),
          utmCampaign: search.get("utm_campaign"),
        }),
      });
      const result = await response.json() as { message?: string; reference?: string };
      if (!response.ok || !result.reference) throw new Error(result.message || "Konsultasi belum dapat dikirim.");

      form.reset();
      setInterest(defaultInterest);
      setStatus("success");
      setMessage(`Konsultasi berhasil diterima. Nomor referensi: ${result.reference}`);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Konsultasi belum dapat dikirim. Silakan coba kembali.");
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
              <option value="">{content.unknownSolutionLabel}</option>
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
      <label>
        Kebutuhan Anda
        <textarea name="message" rows={4} required minLength={10} />
      </label>
      <label className="form-honeypot" aria-hidden="true">
        Website
        <input name="website" type="text" tabIndex={-1} autoComplete="off" />
      </label>
      <button className="button button-primary" type="submit" disabled={status === "submitting"} aria-describedby={helperTextId}>
        {status === "submitting" ? "Mengirim…" : content.submitLabel} <ArrowUpRight size={18} />
      </button>
      <p className={`form-message${status === "success" ? " success" : status === "error" ? " error" : ""}`} id={helperTextId} role="status" aria-live="polite">
        {message || content.privacyText}
      </p>
    </form>
  );
};
