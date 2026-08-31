import {
  Building2,
  CloudCog,
  Headphones,
  Network,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";

export const navigation = [
  { label: "Tentang", href: "#tentang" },
  { label: "Solusi", href: "#solusi" },
  { label: "Cara Kerja", href: "#cara-kerja" },
  { label: "Ekosistem", href: "#ekosistem" },
];

export const solutions = [
  {
    number: "01",
    title: "IT Infrastructure",
    description: "Fondasi teknologi yang tangguh, efisien, dan siap bertumbuh bersama bisnis.",
    items: ["Server & storage", "Virtualization", "Backup & disaster recovery"],
    icon: Building2,
  },
  {
    number: "02",
    title: "Network & Telecommunication",
    description: "Konektivitas tanpa batas dengan jaringan yang stabil, aman, dan terpantau.",
    items: ["LAN/WAN & SD-WAN", "Routing & wireless", "Network monitoring"],
    icon: Network,
  },
  {
    number: "03",
    title: "Cybersecurity",
    description: "Perlindungan menyeluruh untuk aset, identitas, endpoint, dan jaringan perusahaan.",
    items: ["Network security", "Endpoint protection", "Assessment & audit"],
    icon: ShieldCheck,
  },
  {
    number: "04",
    title: "Data Center & Cloud",
    description: "Infrastruktur fleksibel dan scalable untuk percepatan modernisasi digital.",
    items: ["Cloud & hybrid", "Migration", "High availability"],
    icon: CloudCog,
  },
  {
    number: "05",
    title: "Managed Services",
    description: "Operasional IT yang terjaga agar tim Anda bisa fokus pada bisnis utama.",
    items: ["IT support", "Remote monitoring", "Managed security"],
    icon: Headphones,
  },
  {
    number: "06",
    title: "IT Asset Procurement",
    description: "Pengadaan perangkat dan solusi teknologi yang tepat guna serta terintegrasi.",
    items: ["Hardware & peripherals", "CCTV", "Access control"],
    icon: PackageCheck,
  },
];

export const process = [
  { step: "01", title: "Assess", text: "Memetakan kebutuhan dan konteks bisnis." },
  { step: "02", title: "Design", text: "Merancang solusi yang tepat dan terukur." },
  { step: "03", title: "Implement", text: "Menerapkan teknologi dengan disiplin proyek." },
  { step: "04", title: "Integrate", text: "Menyatukan sistem menjadi satu ekosistem." },
  { step: "05", title: "Optimize", text: "Meningkatkan performa dan efisiensi." },
  { step: "06", title: "Support", text: "Menjaga layanan tetap andal berkelanjutan." },
];

export const values = [
  {
    title: "Certified professionals",
    text: "Tenaga profesional dengan pengalaman industri dan kompetensi teknis yang relevan.",
  },
  {
    title: "End-to-end solutions",
    text: "Satu partner dari perencanaan, implementasi, integrasi, hingga dukungan.",
  },
  {
    title: "Security by design",
    text: "Keamanan, reliabilitas, dan kepuasan pelanggan menjadi dasar setiap solusi.",
  },
  {
    title: "On-time delivery",
    text: "Implementasi disiplin dengan standar kualitas dan performa yang tinggi.",
  },
];

export const partners = [
  { name: "Hewlett Packard Enterprise", logo: "/assets/partners/hpe.png" },
  { name: "Lenovo", logo: "/assets/partners/lenovo.png" },
  { name: "Dell Technologies", logo: "/assets/partners/dell.png" },
  { name: "Cisco", logo: "/assets/partners/cisco.png" },
  { name: "Huawei", logo: "/assets/partners/huawei.png" },
  { name: "MikroTik", logo: "/assets/partners/mikrotik.png" },
  { name: "Aruba", logo: "/assets/partners/aruba.png" },
  { name: "AWS", logo: "/assets/partners/aws.png" },
  { name: "Microsoft", logo: "/assets/partners/microsoft.png" },
  { name: "Veeam", logo: "/assets/partners/veeam.png" },
  { name: "Sophos", logo: "/assets/partners/sophos.png" },
  { name: "VMware", logo: "/assets/partners/vmware.png" },
  { name: "CrowdStrike", logo: "/assets/partners/crowdstrike.png" },
  { name: "Fortinet", logo: "/assets/partners/fortinet.png" },
  { name: "Sangfor", logo: "/assets/partners/sangfor.png" },
  { name: "Palo Alto Networks", logo: "/assets/partners/palo-alto.png" },
  { name: "Check Point", logo: "/assets/partners/check-point.png" },
  { name: "Red Hat", logo: "/assets/partners/red-hat.png" },
  { name: "SonicWall", logo: "/assets/partners/sonicwall.png" },
  { name: "Nutanix", logo: "/assets/partners/nutanix.png" },
];
