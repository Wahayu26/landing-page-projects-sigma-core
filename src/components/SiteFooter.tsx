import { navigation } from "@/content/site";
import { getSiteSettings } from "@/lib/landing-content";
import { FooterContent } from "./FooterContent";

export async function SiteFooter() {
  const { contact } = await getSiteSettings();
  return <FooterContent contact={contact} links={[
    { label: "Solusi", href: "/#solusi" }, ...navigation,
    { label: "Ekosistem", href: "/#ekosistem" },
  ]} />;
}
