import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  Mail,
  MapPin,
  Menu,
  Phone,
  Sparkles,
} from "lucide-react";
import { navigation, partners, process, solutions, values } from "@/content/site";

export default function Home() {
  const partnerRows = [partners.slice(0, 10), partners.slice(10)];

  return (
    <main>
      <header className="site-header">
        <div className="header-inner shell">
          <Link className="brand" href="#top" aria-label="Sigma Core Solusindo - kembali ke atas">
            <Image
              src="/assets/scs-logo.png"
              width={533}
              height={267}
              alt="PT Sigma Core Solusindo"
              priority
            />
          </Link>

          <nav className="desktop-nav" aria-label="Navigasi utama">
            {navigation.map((item) => (
              <Link href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>

          <Link className="header-cta" href="#kontak">
            Konsultasi <ArrowUpRight size={16} />
          </Link>

          <details className="mobile-menu">
            <summary aria-label="Buka menu">
              <Menu size={22} />
            </summary>
            <nav aria-label="Navigasi seluler">
              {navigation.map((item) => (
                <Link href={item.href} key={item.href}>
                  {item.label}
                </Link>
              ))}
              <Link href="#kontak">Konsultasi</Link>
            </nav>
          </details>
        </div>
      </header>

      <section className="hero" id="top">
        <Image
          src="/assets/connected-city.jpg"
          alt="Kota digital yang saling terhubung"
          fill
          priority
          sizes="100vw"
          className="hero-image"
        />
        <div className="hero-shade" />
        <div className="hero-grid" aria-hidden="true" />

        <div className="hero-content shell">
          <div className="hero-copy reveal">
            <p className="eyebrow light">
              <span /> Technology Infrastructure &amp; System Integrator
            </p>
            <h1>
              Teknologi terintegrasi.
              <br />
              <em>Bisnis terus melaju.</em>
            </h1>
            <p className="hero-lead">
              Kami merancang, mengintegrasikan, dan mengoptimalkan solusi IT end-to-end untuk
              operasional bisnis yang lebih andal, aman, dan scalable.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href="#kontak">
                Diskusikan kebutuhan <ArrowUpRight size={18} />
              </Link>
              <Link className="button button-ghost" href="#solusi">
                Jelajahi solusi <ArrowDown size={18} />
              </Link>
            </div>
          </div>

          <div className="hero-proof" aria-label="Nilai utama perusahaan">
            <span>Reliable</span>
            <span>Secure</span>
            <span>Scalable</span>
            <span>Customer-focused</span>
          </div>
        </div>
      </section>

      <section className="about section" id="tentang">
        <div className="shell about-grid">
          <div>
            <p className="eyebrow"><span /> Who we are</p>
            <h2 className="section-title">
              Lebih dari sekadar
              <br />
              <em>technology vendor.</em>
            </h2>
          </div>
          <div className="about-copy">
            <p>
              PT Sigma Core Solusindo membantu perusahaan membangun fondasi teknologi yang kuat
              dan berkelanjutan. Bukan hanya menyediakan produk, kami memastikan setiap komponen
              bekerja sebagai satu ekosistem yang utuh.
            </p>
            <div className="about-metrics">
              <div><strong>06</strong><span>Portofolio solusi inti</span></div>
              <div><strong>06</strong><span>Tahap integrasi end-to-end</span></div>
              <div><strong>01</strong><span>Partner untuk seluruh kebutuhan IT</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="solutions section" id="solusi">
        <div className="shell">
          <div className="section-heading-row">
            <div>
              <p className="eyebrow"><span /> What we do</p>
              <h2 className="section-title">Solusi menyeluruh untuk setiap lapisan teknologi.</h2>
            </div>
            <p>
              Dari infrastruktur hingga keamanan, dari cloud hingga managed services—semua
              dirancang untuk bekerja bersama.
            </p>
          </div>

          <div className="solution-grid">
            {solutions.map((solution) => {
              const Icon = solution.icon;
              return (
                <article className="solution-card" key={solution.title}>
                  <div className="solution-topline">
                    <span>{solution.number}</span>
                    <Icon size={26} strokeWidth={1.6} />
                  </div>
                  <div>
                    <h3>{solution.title}</h3>
                    <p>{solution.description}</p>
                    <ul>
                      {solution.items.map((item) => (
                        <li key={item}><Check size={14} /> {item}</li>
                      ))}
                    </ul>
                  </div>
                  <ArrowUpRight className="card-arrow" size={20} />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="integration" id="cara-kerja">
        <div className="integration-visual">
          <Image
            src="/assets/server-room.jpg"
            alt="Infrastruktur data center modern"
            fill
            sizes="(max-width: 900px) 100vw, 46vw"
          />
          <div className="visual-label">
            <Sparkles size={18} />
            <span>End-to-end system integration</span>
          </div>
        </div>

        <div className="integration-content">
          <p className="eyebrow light"><span /> How we work</p>
          <h2 className="section-title light-title">Dari kebutuhan bisnis menuju sistem yang bekerja.</h2>
          <p className="integration-intro">
            Kami menyatukan beragam teknologi menjadi ekosistem yang seamless, optimal, dan mudah
            dikembangkan.
          </p>
          <div className="process-list">
            {process.map((item) => (
              <div className="process-item" key={item.step}>
                <span>{item.step}</span>
                <div><h3>{item.title}</h3><p>{item.text}</p></div>
                <ArrowRight size={18} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="values section">
        <div className="shell">
          <div className="section-heading-row values-heading">
            <div>
              <p className="eyebrow"><span /> Why SCS</p>
              <h2 className="section-title">Dibangun untuk menjadi partner, bukan sekadar penyedia.</h2>
            </div>
            <p>
              Setiap proyek dijalankan dengan kombinasi keahlian teknis, disiplin implementasi,
              dan pemahaman terhadap tujuan bisnis.
            </p>
          </div>

          <div className="value-grid">
            {values.map((value, index) => (
              <article key={value.title}>
                <span>0{index + 1}</span>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ecosystem section" id="ekosistem">
        <div className="shell ecosystem-heading">
          <p className="eyebrow light"><span /> Technology ecosystem</p>
          <h2 className="section-title light-title">Bekerja dengan teknologi terdepan.</h2>
          <p>Kami merancang solusi menggunakan ekosistem teknologi enterprise yang sudah teruji.</p>
        </div>
        <div className="partner-marquee" aria-label="Daftar mitra teknologi">
          {partnerRows.map((row, rowIndex) => (
            <div className={`partner-track${rowIndex === 1 ? " reverse" : ""}`} key={rowIndex}>
              {[...row, ...row].map((partner, index) => (
                <div className="partner-logo" key={`${partner.name}-${index}`}>
                  <Image
                    src={partner.logo}
                    alt={`Logo ${partner.name}`}
                    width={460}
                    height={144}
                    sizes="(max-width: 580px) 190px, 240px"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section className="contact section" id="kontak">
        <div className="shell contact-card">
          <div className="contact-copy">
            <p className="eyebrow light"><span /> Let&apos;s build what&apos;s next</p>
            <h2>Siap membangun fondasi teknologi berikutnya?</h2>
            <p>
              Ceritakan kebutuhan infrastruktur dan sistem Anda. Tim kami siap membantu menyusun
              solusi yang tepat.
            </p>
            <Link className="button button-primary" href="mailto:admin@sigmacore.id">
              Mulai konsultasi <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="contact-details">
            <a href="mailto:admin@sigmacore.id"><Mail size={20} /> admin@sigmacore.id</a>
            <a href="tel:+6285158558791"><Phone size={20} /> 0851 5855 8791</a>
            <p><MapPin size={20} /> Plaza Aminta Lt. 5/504, Jl. TB. Simatupang Kav. 10, Jakarta Selatan</p>
          </div>
        </div>
      </section>

      <footer>
        <div className="shell footer-main">
          <div className="footer-brand">
            <Image src="/assets/scs-logo.png" width={533} height={267} alt="PT Sigma Core Solusindo" />
            <p>Your end-to-end IT solution.</p>
          </div>
          <div className="footer-links">
            {navigation.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}
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
    </main>
  );
}
