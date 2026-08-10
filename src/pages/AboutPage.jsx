import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiArrowUpRight, FiGithub, FiZap, FiCode, FiGlobe, FiLayers, FiCpu, FiShield, FiSmartphone, FiDatabase } from 'react-icons/fi';
import SEO from '../components/SEO';
import GlowingCard from '../components/GlowingCard/GlowingCard';
import styles from './AboutPage.module.css';

const AboutPage = () => {
  const { t } = useTranslation();

  const techStack = [
    {
      name: 'React 19 & Vite',
      tag: 'Core UI',
      desc: 'En son React 19 mimarisi ve Vite ile anlık geliştirme ve ultra hızlı bundle optimizasyonu.',
      icon: <FiCpu className={styles.techIcon} />,
    },
    {
      name: 'Supabase Data & Auth',
      tag: 'Backend',
      desc: 'PostgreSQL tabanlı güvenli veritabanı, Row Level Security (RLS) ve kimlik doğrulama.',
      icon: <FiDatabase className={styles.techIcon} />,
    },
    {
      name: 'CSS Modules & Motion',
      tag: 'Design System',
      desc: 'Sıfır ek kütüphane bağımlılığı ile Vanilla CSS, mikro-animasyonlar ve tam tema desteği.',
      icon: <FiLayers className={styles.techIcon} />,
    },
    {
      name: 'i18next Multi-Language',
      tag: 'Localization',
      desc: 'Tam Türkçe ve İngilizce dil desteği, anlık dinamik dil değişimi ve yerelleştirme.',
      icon: <FiGlobe className={styles.techIcon} />,
    },
    {
      name: 'Progressive Web App',
      tag: 'Offline PWA',
      desc: 'Service Worker ile çevrimdışı erişim, otomatik arka plan önbellekleme ve PWA kurulumu.',
      icon: <FiSmartphone className={styles.techIcon} />,
    },
    {
      name: 'TanStack Query v5',
      tag: 'State & Cache',
      desc: 'Akıllı veritabanı sorgulama, otomatik önbellekleme ve iyimser (optimistic) UI yönetimi.',
      icon: <FiZap className={styles.techIcon} />,
    },
  ];

  const features = [
    { key: 'blog', icon: <FiZap /> },
    { key: 'auth', icon: <FiShield /> },
    { key: 'theme', icon: <FiLayers /> },
    { key: 'i18n', icon: <FiGlobe /> },
  ];

  return (
    <main className={styles.aboutPage}>
      <SEO title={t('about.title')} description={t('about.description')} />

      <div className={styles.container}>
        {/* 1. Hero Header Section */}
        <header className={styles.heroCard}>
          <span className={styles.eyebrow}>
            <FiZap size={13} /> Postify Independent Journal
          </span>
          <h1 className={styles.heroTitle}>{t('about.title')}</h1>
          <p className={styles.heroSubtitle}>{t('about.description')}</p>

          {/* Quick Metrics Bar */}
          <div className={styles.metricsBar}>
            <span className={styles.metricBadge}>✦ %100 Açık Kaynak</span>
            <span className={styles.metricBadge}>⚡ React 19 & Supabase</span>
            <span className={styles.metricBadge}>🔥 PWA Çevrimdışı Desteği</span>
            <span className={styles.metricBadge}>🌍 TR / EN Çoklu Dil</span>
          </div>
        </header>

        {/* 2. Founder Profile Bento Card with 21st.dev Spotlight */}
        <section className={styles.section}>
          <GlowingCard
            glowColor="color-mix(in srgb, var(--primary) 22%, transparent)"
            borderRadius="20px"
          >
            <div className={styles.profileCard}>
              <div className={styles.avatarWrapper}>
                <span className={styles.avatar}>ZA</span>
                <span className={styles.avatarBadge} title="Proje Sahibi & Geliştirici" />
              </div>

              <div className={styles.profileContent}>
                <span className={styles.roleTag}>
                  <FiCode size={13} /> {t('about.projectOwner')}
                </span>

                <h2 className={styles.founderName}>Zeki Akgül</h2>
                <p className={styles.role}>{t('about.role')}</p>
                <p className={styles.bio}>{t('about.bio')}</p>

                <div className={styles.profileActions}>
                  <a
                    href="https://github.com/zexy2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.socialBtn}
                  >
                    <FiGithub size={16} />
                    <span>GitHub Profil ↗</span>
                  </a>
                  <Link to="/" className={styles.socialBtnOutline}>
                    <span>Yayınları İncele</span>
                    <FiArrowUpRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          </GlowingCard>
        </section>

        {/* 3. Technology Stack Bento Cards */}
        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>Teknoloji Mimarisi</span>
              <h2>{t('about.technologies')}</h2>
            </div>
          </div>

          <div className={styles.techGrid}>
            {techStack.map((tech) => (
              <GlowingCard
                key={tech.name}
                glowColor="color-mix(in srgb, var(--primary) 18%, transparent)"
                borderRadius="16px"
                className={styles.techCardWrapper}
              >
                <div className={styles.techCard}>
                  <div className={styles.techHeader}>
                    {tech.icon}
                    <span className={styles.techTag}>{tech.tag}</span>
                  </div>
                  <h3 className={styles.techTitle}>{tech.name}</h3>
                  <p className={styles.techDesc}>{tech.desc}</p>
                </div>
              </GlowingCard>
            ))}
          </div>
        </section>

        {/* 4. Platform Capabilities Grid */}
        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>Platform Özellikleri</span>
              <h2>{t('about.featuresTitle')}</h2>
            </div>
          </div>

          <div className={styles.featureGrid}>
            {features.map(({ key, icon }) => (
              <div key={key} className={styles.featureCard}>
                <div className={styles.featureIcon}>{icon}</div>
                <h3 className={styles.featureTitle}>{t(`about.features.${key}`)}</h3>
                <p className={styles.featureDesc}>{t(`about.features.${key}Desc`)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Return Button */}
        <div className={styles.returnWrapper}>
          <Link to="/" className={styles.returnLink}>
            <span>{t('home.latest')}</span>
            <FiArrowUpRight size={18} />
          </Link>
        </div>
      </div>
    </main>
  );
};

export default AboutPage;
