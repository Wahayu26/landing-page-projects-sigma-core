import { process as steps, values } from './site';

// One-time import source only; never a runtime fallback after migration.
export const websiteSeed = {
  hero: {
    eyebrow: 'Technology Infrastructure & System Integrator', headline: 'Teknologi terintegrasi.', highlight: 'Bisnis terus melaju.',
    description: 'Kami merancang, mengintegrasikan, dan mengoptimalkan solusi IT end-to-end untuk operasional bisnis yang lebih andal, aman, dan scalable.',
  },
  contact: { email: 'admin@sigmacore.id', phone: '0851 5855 8791', address: 'Plaza Aminta Lt. 5/504, Jl. TB. Simatupang Kav. 10, Jakarta Selatan' },
  companyFacts: [
    { value: '06', label: 'Portofolio solusi inti' }, { value: '06', label: 'Tahap integrasi end-to-end' }, { value: '20+', label: 'Teknologi enterprise dalam ekosistem' },
  ],
  seo: { title: 'PT Sigma Core Solusindo | End-to-End IT Solution', description: 'Solusi infrastruktur, jaringan, keamanan siber, cloud, managed service, dan pengadaan IT untuk bisnis yang andal dan bertumbuh.' },
  about: { eyebrow: 'Who we are', headline: 'Lebih dari sekadar', highlight: 'technology vendor.', description: 'PT Sigma Core Solusindo membantu perusahaan membangun fondasi teknologi yang kuat dan berkelanjutan. Bukan hanya menyediakan produk, kami memastikan setiap komponen bekerja sebagai satu ekosistem yang utuh.' },
  workflow: { eyebrow: 'How we work', title: 'Dari kebutuhan bisnis menuju sistem yang bekerja.', description: 'Kami menyatukan beragam teknologi menjadi ekosistem yang seamless, optimal, dan mudah dikembangkan.', steps },
  strengths: { eyebrow: 'Why SCS', title: 'Dibangun untuk menjadi partner, bukan sekadar penyedia.', description: 'Setiap proyek dijalankan dengan kombinasi keahlian teknis, disiplin implementasi, dan pemahaman terhadap tujuan bisnis.', items: values },
};
