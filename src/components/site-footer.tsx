import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { navigation } from "@/content/site";

export function SiteFooter() {
  return (
    <footer>
      <div className="shell footer-main">
        <div className="footer-brand">
          <Image src="/assets/scs-logo.png" width={533} height={267} alt="PT Sigma Core Solusindo" />
          <p>Your end-to-end IT solution.</p>
        </div>
        <div className="footer-links">
          <Link href="/#solusi">Solusi</Link>
          {navigation.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}
          <Link href="/#ekosistem">Ekosistem</Link>
        </div>
        <Link className="footer-site" href="https://sigmacore.id" target="_blank">
          sigmacore.id <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="shell footer-bottom">
        <span>© 2026 PT Sigma Core Solusindo</span>
        <span>Integrate · Secure · Optimize · Empower</span>
      </div>
    </footer>
  );
}
