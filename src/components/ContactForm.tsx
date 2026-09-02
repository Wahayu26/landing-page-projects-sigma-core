"use client";

import { useId, useState } from "react";
import { ArrowUpRight } from "lucide-react";

type ContactFormProps = {
  solutions?: { slug: string; title: string }[];
  defaultInterest?: string;
  sourcePage?: string;
};

const readInterestFromQuery = (solutions: { slug: string; title: string }[], fallback: string) => {
  if (typeof window === "undefined") return fallback;

  const queryInterest = new URLSearchParams(window.location.search).get("interest");
  const isKnownSolution = solutions.some((solution) => solution.slug === queryInterest);

  return isKnownSolution && queryInterest ? queryInterest : fallback;
};

export const ContactForm = ({ solutions = [], defaultInterest = "" }: ContactFormProps) => {
  const [interest, setInterest] = useState(() => readInterestFromQuery(solutions, defaultInterest));
  const helperTextId = useId();

  return (
    <form className="contact-form" onSubmit={(event) => event.preventDefault()}>
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
      <label>
        Kebutuhan Anda
        <textarea name="message" rows={4} required minLength={10} />
      </label>
      <button className="button button-primary" type="submit" disabled aria-describedby={helperTextId}>
        Kirim konsultasi <ArrowUpRight size={18} />
      </button>
      <p className="form-message" id={helperTextId} role="status">
        Formulir konsultasi akan segera aktif. Silakan hubungi kami langsung melalui WhatsApp atau email untuk saat ini.
      </p>
    </form>
  );
};