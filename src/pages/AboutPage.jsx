import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiArrowUpRight, FiGithub, FiZap, FiCode, FiGlobe, FiLayers, FiCpu, FiDatabase } from 'react-icons/fi';
import SEO from '../components/SEO';
import GlowingCard from '../components/GlowingCard/GlowingCard';
import { Testimonial } from '../components/ui/design-testimonial';
import styles from './AboutPage.module.css';

const AboutPage = () => {
  const { t } = useTranslation();

  const techStack = [
    {
      name: 'React 19 & Vite',
      tag: 'Core UI',
      desc: 'Modern component architecture with Instant HMR and bundle optimization.',
      icon: <FiCpu className={styles.techIcon} />,
    },
    {
      name: 'Supabase Data & Auth',
      tag: 'Backend',
      desc: 'PostgreSQL database with Row Level Security (RLS) and OAuth authentication.',
      icon: <FiDatabase className={styles.techIcon} />,
    },
    {
      name: 'CSS Modules & Motion',
      tag: 'Design System',
      desc: 'Vanilla CSS token architecture with micro-interactions and dark/light themes.',
      icon: <FiLayers className={styles.techIcon} />,
    },
    {
      name: 'i18next & Offline PWA',
      tag: 'Experience',
      desc: 'Multilingual Turkish/English localization with offline Service Worker caching.',
      icon: <FiGlobe className={styles.techIcon} />,
    },
  ];

  return (
    <main className={styles.aboutPage}>
      <SEO title={t('about.title')} description={t('about.description')} />

      <div className={styles.container}>
        {/* 1. Hero Header Section */}
        <header className={styles.heroCard}>
          <span className={styles.eyebrow}>Postify Journal</span>
          <h1 className={styles.heroTitle}>{t('about.title')}</h1>
          <p className={styles.heroSubtitle}>{t('about.description')}</p>

          <div className={styles.metricsBar}>
            <span className={styles.metricBadge}>100% Open Source</span>
            <span className={styles.metricBadge}>React 19 & Supabase</span>
            <span className={styles.metricBadge}>Offline PWA</span>
            <span className={styles.metricBadge}>Multilingual TR / EN</span>
          </div>
        </header>

        {/* 2. Founder Profile Bento Card */}
        <section className={styles.section}>
          <GlowingCard
            glowColor="color-mix(in srgb, var(--primary) 20%, transparent)"
            borderRadius="20px"
          >
            <div className={styles.profileCard}>
              <div className={styles.avatarWrapper}>
                <span className={styles.avatar}>ZA</span>
                <span className={styles.avatarBadge} title="Project Owner" />
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
                    <span>GitHub Profile <FiArrowUpRight size={14} /></span>
                  </a>
                  <Link to="/" className={styles.socialBtnOutline}>
                    <span>Browse Journal</span>
                    <FiArrowUpRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </GlowingCard>
        </section>

        {/* 3. Testimonials Showcase Section */}
        <section className={styles.section}>
          <Testimonial />
        </section>

        {/* 4. Streamlined Architecture Stack */}
        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>Architecture</span>
              <h2>{t('about.technologies')}</h2>
            </div>
          </div>

          <div className={styles.techGrid}>
            {techStack.map((tech) => (
              <GlowingCard
                key={tech.name}
                glowColor="color-mix(in srgb, var(--primary) 15%, transparent)"
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

        {/* Return Link */}
        <div className={styles.returnWrapper}>
          <Link to="/" className={styles.returnLink}>
            <span>{t('home.latest')}</span>
            <FiArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </main>
  );
};

export default AboutPage;
