import { CompanyLogo } from "./CompanyLogo";
import Link from "next/link";
import { ArrowUp, ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { googleMapsSearchURL } from "@/lib/inquiry";

type FooterContentProps = {
  contact: { email: string; phone: string; address: string };
  links: { label: string; href: string }[];
};

export function FooterContent({ contact, links }: FooterContentProps) {
  const phoneHref = `tel:${contact.phone.replace(/[^+\d]/g, "")}`;
  const mapsHref = googleMapsSearchURL(contact.address);

  return (
    <footer className="site-footer" aria-label="Informasi perusahaan">
      <div className="shell site-footer__main">
        <div className="footer-identity">
          <Link className="footer-identity__brand" href="/" aria-label="Sigma Core Solusindo — beranda">
            <CompanyLogo />
          </Link>
          <p>Partner teknologi untuk bisnis yang terus bertumbuh. Terintegrasi, aman, dan siap melaju.</p>
          <Link className="footer-identity__cta" href="/#kontak">Hubungi Kami <ArrowUpRight size={17} aria-hidden="true" /></Link>
        </div>

        <nav className="footer-navigation" aria-labelledby="footer-navigation-title">
          <h2 id="footer-navigation-title">Jelajahi</h2>
          <div>{links.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}</div>
        </nav>

        <div className="footer-contact">
          <h2>Kontak & lokasi</h2>
          <address>
            <a href={`mailto:${contact.email}`}><span className="footer-contact__icon"><Mail size={17} aria-hidden="true" /></span><span>{contact.email}</span></a>
            <a href={phoneHref}><span className="footer-contact__icon"><Phone size={17} aria-hidden="true" /></span><span>{contact.phone}</span></a>
            <a href={mapsHref} target="_blank" rel="noopener noreferrer"><span className="footer-contact__icon"><MapPin size={18} aria-hidden="true" /></span><span>{contact.address}</span></a>
          </address>
        </div>
      </div>

      <div className="shell site-footer__bottom">
        <span>© {new Date().getFullYear()} PT Sigma Core Solusindo. All rights reserved.</span>
        <div>
          <a href="https://sigmacore.id" target="_blank" rel="noopener noreferrer">sigmacore.id <ArrowUpRight size={14} aria-hidden="true" /></a>
          <a href="#">Kembali ke atas <ArrowUp size={14} aria-hidden="true" /></a>
        </div>
      </div>
    </footer>
  );
}
