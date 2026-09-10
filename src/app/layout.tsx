import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { PreviewBanner } from "@/components/PreviewBanner";
import "./globals.css";
import "./services-refinement.css";
import "./navigation-refinement.css";

const baseMetadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000"
  ),
  title: "PT Sigma Core Solusindo | End-to-End IT Solutions",
  description:
    "Technology infrastructure and system integrator for secure, scalable, and reliable business operations.",
  icons: {
    icon: [{ url: "/assets/scs-icon.png", type: "image/png" }],
    shortcut: ["/assets/scs-icon.png"],
    apple: [{ url: "/assets/scs-icon.png", type: "image/png" }],
  },
  openGraph: {
    title: "PT Sigma Core Solusindo | End-to-End IT Solutions",
    description:
      "Teknologi terintegrasi untuk operasional bisnis yang andal, aman, dan scalable.",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1731,
        height: 909,
        alt: "PT Sigma Core Solusindo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PT Sigma Core Solusindo | End-to-End IT Solutions",
    description:
      "Teknologi terintegrasi untuk operasional bisnis yang andal, aman, dan scalable.",
    images: ["/og.png"],
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...baseMetadata,
    ...((await draftMode()).isEnabled ? { robots: { index: false, follow: false } } : {}),
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body suppressHydrationWarning>{children}<PreviewBanner /></body>
    </html>
  );
}
