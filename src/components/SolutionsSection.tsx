import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import type { SolutionView } from "@/lib/landing-content";
import { SectionHeading } from "./SectionHeading";

type SolutionCardView = Pick<SolutionView, "slug" | "number" | "title" | "description" | "items" | "icon">;

// Presentation only: the page supplies either published CMS views or demo views.
export function SolutionsSection({ solutions }: { solutions: SolutionCardView[] }) {
  return (
    <section className="solutions section" id="solusi" aria-labelledby="solutions-heading">
      <div className="shell">
        <SectionHeading
          id="solutions-heading"
          eyebrow="What we do"
          title="Solusi menyeluruh untuk setiap lapisan teknologi."
          description="Dari infrastruktur hingga keamanan, dari cloud hingga managed services—semua dirancang untuk bekerja bersama."
        />
        {solutions.length ? (
          <div className="solution-grid">
            {solutions.map((solution) => {
              const Icon = solution.icon;
              return (
                <Link className="solution-card" href={`/solusi/${encodeURIComponent(solution.slug)}`} key={solution.slug} aria-labelledby={`solution-${solution.slug}`}>
                  <div className="solution-topline" aria-hidden="true">
                    <span>{solution.number}</span><Icon size={26} strokeWidth={1.6} />
                  </div>
                  <div className="solution-card__body">
                    <h3 id={`solution-${solution.slug}`}>{solution.title}</h3>
                    <p>{solution.description}</p>
                    {solution.items.length > 0 && <ul>{solution.items.map((item, index) => (
                      <li key={`${index}-${item}`}><Check size={14} aria-hidden="true" /><span>{item}</span></li>
                    ))}</ul>}
                  </div>
                  <span className="solution-card__link">Lihat detail solusi <ArrowUpRight size={18} aria-hidden="true" /></span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="solutions-empty">
            <p>Informasi solusi sedang diperbarui. Tim kami tetap siap membantu kebutuhan teknologi Anda.</p>
            <Link className="button button-dark" href="#kontak">Hubungi tim SCS <ArrowUpRight size={18} aria-hidden="true" /></Link>
          </div>
        )}
      </div>
    </section>
  );
}
