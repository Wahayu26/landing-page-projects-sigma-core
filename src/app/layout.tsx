import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000"
  ),
  title: "PT Sigma Core Solusindo | End-to-End IT Solutions",
  description:
    "Technology infrastructure and system integrator for secure, scalable, and reliable business operations.",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
