import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, Menu } from "lucide-react";

import { navigation, solutionCategoryLabels } from "@/content/site";
import { getPublishedSolutions } from "@/lib/landing-content";

export const SiteHeader = async () => {
  const solutions = await getPublishedSolutions();
  const groupedSolutions = Object.entries(solutionCategoryLabels).map(([key, label]) => ({
    key,
    label,
    items: solutions.filter((solution) => solution.category === key),
  }));

  return (
    <header className="site-header">
      <div className="header-inner shell">
        <Link className="brand" href="/" aria-label="Sigma Core Solusindo - halaman utama">
          <Image
            src="/assets/scs-icon.png"
            width={640}
            height={473}
            alt="Ikon PT Sigma Core Solusindo"
            priority
          />
          <span className="brand-copy">
            <strong>Sigma Core</strong>
            <small>Solusindo</small>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Navigasi utama">
          <Link href="/#tentang">Tentang</Link>
          <div className="solution-nav">
            <Link className="solution-nav__link" href="/#solusi">Solusi</Link>
            <details className="solution-nav__menu">
              <summary aria-label="Buka daftar solusi">
                <ChevronDown size={14} />
              </summary>
              <div className="solution-mega-menu">
                <div className="solution-mega-menu__intro">
                  <span>End-to-end capabilities</span>
                  <strong>Satu ekosistem untuk kebutuhan teknologi bisnis.</strong>
                  <Link href="/#solusi">Lihat seluruh solusi <ArrowUpRight size={15} /></Link>
                </div>
                {groupedSolutions.map((group) => (
                  <div className="solution-mega-menu__group" key={group.key}>
                    <p>{group.label}</p>
                    {group.items.map((solution) => {
                      const Icon = solution.icon;
                      return (
                        <Link href={`/solusi/${solution.slug}`} key={solution.slug}>
                          <Icon size={18} strokeWidth={1.7} />
                          <span>
                            <strong>{solution.title}</strong>
                            <small>{solution.description}</small>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>
            </details>
          </div>
          {navigation.slice(1).map((item) => (
            <Link href={item.href} key={item.href}>{item.label}</Link>
          ))}
        </nav>

        <Link className="header-cta" href="/#kontak">
          Konsultasi <ArrowUpRight size={16} />
        </Link>

        <details className="mobile-menu">
          <summary aria-label="Buka menu"><Menu size={22} /></summary>
          <nav aria-label="Navigasi seluler">
            <Link href="/#tentang">Tentang</Link>
            <Link href="/#solusi">Solusi</Link>
            <p>Detail solusi</p>
            {solutions.map((solution) => (
              <Link className="mobile-solution-link" href={`/solusi/${solution.slug}`} key={solution.slug}>
                {solution.title}
              </Link>
            ))}
            {navigation.slice(1).map((item) => (
              <Link href={item.href} key={item.href}>{item.label}</Link>
            ))}
            <Link href="/#kontak">Konsultasi</Link>
          </nav>
        </details>
      </div>
    </header>
  );
};