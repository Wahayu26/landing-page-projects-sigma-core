import { CompanyLogo } from "./CompanyLogo";
import Link from "next/link";
import { ArrowUpRight, ChevronDown, Menu } from "lucide-react";

import { solutionCategoryLabels } from "@/content/site";
import { getPublishedSolutions, getSiteSettings } from "@/lib/landing-content";

export const SiteHeader: React.FC = async () => {
  const [solutions, settings] = await Promise.all([getPublishedSolutions(), getSiteSettings()]);
  const content = settings.header;
  const navigation = [
    { label: content.workflowLabel, href: "/#cara-kerja" },
    { label: content.projectsLabel, href: "/proyek#proyek-list" },
    { label: content.insightsLabel, href: "/insight#insight-list" },
  ];
  const groupedSolutions = Object.entries(solutionCategoryLabels).map(([key, label]) => ({
    key,
    label,
    items: solutions.filter((solution) => solution.category === key),
  }));

  return (
    <header className="site-header">
      <div className="header-inner shell">
        <Link className="brand" href="/" aria-label="Sigma Core Solusindo - halaman utama">
          <CompanyLogo priority />
        </Link>

        <nav className="desktop-nav" aria-label="Navigasi utama">
          <Link href="/#tentang">{content.aboutLabel}</Link>
          <div className="solution-nav">
            <Link className="solution-nav__link" href="/#solusi">{content.solutionsLabel}</Link>
            <details className="solution-nav__menu">
              <summary aria-label="Buka daftar solusi">
                <ChevronDown size={14} />
              </summary>
              <div className="solution-mega-menu">
                <div className="solution-mega-menu__intro">
                  <span>{content.menuEyebrow}</span>
                  <strong>{content.menuTitle}</strong>
                  <Link href="/#solusi">{content.menuLinkLabel} <ArrowUpRight size={15} /></Link>
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
          {navigation.map((item) => (
            <Link href={item.href} key={item.href}>{item.label}</Link>
          ))}
        </nav>

        <Link className="header-cta" href="/#kontak">
          {content.consultationLabel} <ArrowUpRight size={16} />
        </Link>

        <details className="mobile-menu">
          <summary aria-label="Buka menu"><Menu size={22} /></summary>
          <nav aria-label="Navigasi seluler">
            <Link href="/#tentang">{content.aboutLabel}</Link>
            <Link href="/#solusi">{content.solutionsLabel}</Link>
            <p>{content.mobileDetailLabel}</p>
            {solutions.map((solution) => (
              <Link className="mobile-solution-link" href={`/solusi/${solution.slug}`} key={solution.slug}>
                {solution.title}
              </Link>
            ))}
            {navigation.map((item) => (
              <Link href={item.href} key={item.href}>{item.label}</Link>
            ))}
            <Link href="/#kontak">{content.consultationLabel}</Link>
          </nav>
        </details>
      </div>
    </header>
  );
};
