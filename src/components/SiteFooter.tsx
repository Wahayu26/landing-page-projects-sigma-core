import { getSiteSettings } from "@/lib/landing-content";
import { FooterContent } from "./FooterContent";

export async function SiteFooter() {
  const { contact, footer, header } = await getSiteSettings();
  return <FooterContent contact={contact} links={[
    { label: header.solutionsLabel, href: "/#solusi" },
    { label: header.aboutLabel, href: "/#tentang" },
    { label: header.workflowLabel, href: "/#cara-kerja" },
    { label: header.projectsLabel, href: "/proyek#proyek-list" },
    { label: header.insightsLabel, href: "/insight#insight-list" },
    { label: header.ecosystemLabel, href: "/#ekosistem" },
  ]} content={footer} />;
}
