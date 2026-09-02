import {
  Building2,
  CloudCog,
  Headphones,
  Network,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";

export const navigation = [
  { label: "Tentang", href: "/#tentang" },
  { label: "Cara Kerja", href: "/#cara-kerja" },
  { label: "Proyek", href: "/proyek#proyek-list" },
  { label: "Insight", href: "/insight#insight-list" },
];

export const solutionCategoryLabels = {
  platform: "Platform & Infrastructure",
  protection: "Connectivity & Protection",
  operations: "Operations & Procurement",
} as const;

export const solutions = [
  {
    number: "01",
    slug: "it-infrastructure",
    category: "platform" as const,
    title: "IT Infrastructure",
    description: "Fondasi teknologi yang tangguh, efisien, dan siap bertumbuh bersama bisnis.",
    outcome:
      "Membangun fondasi komputasi yang stabil, mudah dikembangkan, dan siap menjaga kontinuitas operasional bisnis.",
    items: ["Server & storage", "Virtualization", "Backup & disaster recovery"],
    benefits: [
      { title: "Kinerja yang konsisten", text: "Arsitektur disesuaikan dengan beban kerja dan target pertumbuhan bisnis." },
      { title: "Business continuity", text: "Proteksi data dan strategi pemulihan membantu mengurangi risiko downtime." },
      { title: "Operasional efisien", text: "Standardisasi platform menyederhanakan pengelolaan dan pemeliharaan." },
    ],
    useCases: ["Modernisasi server dan storage", "Konsolidasi virtualisasi", "Backup dan disaster recovery"],
    icon: Building2,
  },
  {
    number: "02",
    slug: "network-telecommunication",
    category: "protection" as const,
    title: "Network & Telecommunication",
    description: "Konektivitas tanpa batas dengan jaringan yang stabil, aman, dan terpantau.",
    outcome:
      "Menghubungkan kantor, pengguna, aplikasi, dan perangkat melalui jaringan yang andal, aman, serta mudah dipantau.",
    items: ["LAN/WAN & SD-WAN", "Routing & wireless", "Network monitoring"],
    benefits: [
      { title: "Konektivitas andal", text: "Desain jaringan mengutamakan ketersediaan dan pengalaman pengguna." },
      { title: "Visibilitas menyeluruh", text: "Monitoring membantu tim mengenali gangguan sebelum berdampak luas." },
      { title: "Siap berkembang", text: "Topologi dan kapasitas dirancang mengikuti kebutuhan cabang dan pengguna." },
    ],
    useCases: ["Modernisasi LAN dan Wi-Fi", "Interkoneksi kantor dan cabang", "Implementasi SD-WAN"],
    icon: Network,
  },
  {
    number: "03",
    slug: "cybersecurity",
    category: "protection" as const,
    title: "Cybersecurity",
    description: "Perlindungan menyeluruh untuk aset, identitas, endpoint, dan jaringan perusahaan.",
    outcome:
      "Memperkuat ketahanan siber melalui perlindungan berlapis, visibilitas risiko, dan kontrol yang sesuai kebutuhan organisasi.",
    items: ["Network security", "Endpoint protection", "Assessment & audit"],
    benefits: [
      { title: "Security by design", text: "Kontrol keamanan dipertimbangkan sejak tahap perencanaan solusi." },
      { title: "Risiko lebih terukur", text: "Assessment membantu memprioritaskan celah dan tindakan perbaikan." },
      { title: "Respons lebih cepat", text: "Visibilitas endpoint dan jaringan mempercepat identifikasi insiden." },
    ],
    useCases: ["Security assessment", "Endpoint dan network protection", "Hardening dan security monitoring"],
    icon: ShieldCheck,
  },
  {
    number: "04",
    slug: "data-center-cloud",
    category: "platform" as const,
    title: "Data Center & Cloud",
    description: "Infrastruktur fleksibel dan scalable untuk percepatan modernisasi digital.",
    outcome:
      "Menentukan kombinasi data center, private cloud, dan public cloud yang tepat untuk performa, keamanan, dan biaya.",
    items: ["Cloud & hybrid", "Migration", "High availability"],
    benefits: [
      { title: "Arsitektur fleksibel", text: "Beban kerja ditempatkan pada platform yang paling sesuai dengan kebutuhannya." },
      { title: "Migrasi terkendali", text: "Tahapan migrasi disusun untuk menjaga layanan dan integritas data." },
      { title: "Ketersediaan tinggi", text: "Desain redundansi membantu mempertahankan layanan kritis." },
    ],
    useCases: ["Cloud readiness assessment", "Hybrid cloud", "Data center modernization"],
    icon: CloudCog,
  },
  {
    number: "05",
    slug: "managed-services",
    category: "operations" as const,
    title: "Managed Services",
    description: "Operasional IT yang terjaga agar tim Anda bisa fokus pada bisnis utama.",
    outcome:
      "Menjaga lingkungan IT tetap terpantau, responsif, dan terpelihara dengan dukungan operasional yang terukur.",
    items: ["IT support", "Remote monitoring", "Managed security"],
    benefits: [
      { title: "Dukungan berkelanjutan", text: "Tim mendapatkan jalur dukungan yang jelas untuk kebutuhan operasional." },
      { title: "Monitoring proaktif", text: "Pemantauan membantu mendeteksi anomali dan potensi gangguan lebih dini." },
      { title: "Fokus pada bisnis", text: "Aktivitas rutin dapat dikelola tanpa membebani tim internal." },
    ],
    useCases: ["Managed infrastructure", "Remote monitoring", "IT helpdesk dan onsite support"],
    icon: Headphones,
  },
  {
    number: "06",
    slug: "it-asset-procurement",
    category: "operations" as const,
    title: "IT Asset Procurement",
    description: "Pengadaan perangkat dan solusi teknologi yang tepat guna serta terintegrasi.",
    outcome:
      "Menyederhanakan pengadaan aset teknologi melalui pemilihan produk, integrasi, dan dukungan yang sesuai kebutuhan.",
    items: ["Hardware & peripherals", "CCTV", "Access control"],
    benefits: [
      { title: "Pilihan tepat guna", text: "Spesifikasi disusun berdasarkan kebutuhan, kompatibilitas, dan siklus hidup aset." },
      { title: "Satu jalur koordinasi", text: "Pengadaan, konfigurasi, dan implementasi dikelola secara terintegrasi." },
      { title: "Lebih mudah dikembangkan", text: "Aset dipilih dengan mempertimbangkan standardisasi dan kebutuhan berikutnya." },
    ],
    useCases: ["Pengadaan perangkat kerja", "CCTV dan surveillance", "Access control dan perangkat pendukung"],
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
