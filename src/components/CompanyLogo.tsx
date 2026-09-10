import Image from "next/image";

/** Original supplied artwork; the frame only trims its transparent display margins. */
export function CompanyLogo({ priority = false }: { priority?: boolean }) {
  return <span className="company-logo">
    <Image src="/assets/scs-full-logo.png" width={1672} height={941}
      alt="PT Sigma Core Solusindo" sizes="(max-width: 580px) 166px, 240px" priority={priority} />
  </span>;
}
