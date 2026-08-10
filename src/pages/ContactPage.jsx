import { useTranslation } from 'react-i18next';
import { FiArrowUpRight, FiGithub, FiMail, FiMessageSquare, FiClock } from 'react-icons/fi';
import SEO from '../components/SEO';
import GlowingCard from '../components/GlowingCard/GlowingCard';
import styles from './ContactPage.module.css';

const ContactPage = () => {
  const { t } = useTranslation();

  return (
    <main className={styles.contactPage}>
      <SEO title={t('contact.title')} description={t('contact.description')} />

      <div className={styles.container}>
        {/* 1. Hero Header Section */}
        <header className={styles.heroCard}>
          <span className={styles.eyebrow}>
            <FiMessageSquare size={13} /> Get In Touch
          </span>
          <h1 className={styles.heroTitle}>{t('contact.title')}</h1>
          <p className={styles.heroSubtitle}>{t('contact.description')}</p>

          <div className={styles.metricsBar}>
            <span className={styles.metricBadge}>Fast Response</span>
            <span className={styles.metricBadge}>Open Source Projects</span>
            <span className={styles.metricBadge}>Istanbul / Remote</span>
          </div>
        </header>

        {/* 2. Bento Contact Cards Grid (21st.dev Spotlight) */}
        <div className={styles.bentoGrid}>
          <GlowingCard
            glowColor="color-mix(in srgb, var(--primary) 20%, transparent)"
            borderRadius="20px"
            className={styles.bentoCardWrapper}
          >
            <div className={styles.bentoCard}>
              <div className={styles.cardIcon}>
                <FiMail />
              </div>
              <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>{t('contact.email', 'E-Posta')}</span>
                <h3 className={styles.cardTitle}>zekiakgul09@gmail.com</h3>
              </div>
              <p className={styles.cardDesc}>Doğrudan geliştiriciye ve editoryal ekibe e-posta gönderin.</p>
              <a
                href="mailto:zekiakgul09@gmail.com"
                className={styles.actionBtn}
              >
                <span>E-Posta Gönder</span>
                <FiArrowUpRight size={14} />
              </a>
            </div>
          </GlowingCard>

          <GlowingCard
            glowColor="color-mix(in srgb, var(--primary) 20%, transparent)"
            borderRadius="20px"
            className={styles.bentoCardWrapper}
          >
            <div className={styles.bentoCard}>
              <div className={styles.cardIcon}>
                <FiGithub />
              </div>
              <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>GitHub</span>
                <h3 className={styles.cardTitle}>@zexy2</h3>
              </div>
              <p className={styles.cardDesc}>Açık kaynak repolarımızı ve geliştirici profilimizi inceleyin.</p>
              <a
                href="https://github.com/zexy2"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.actionBtn}
              >
                <span>GitHub Profil <FiArrowUpRight size={14} /></span>
              </a>
            </div>
          </GlowingCard>

          <GlowingCard
            glowColor="color-mix(in srgb, var(--primary) 20%, transparent)"
            borderRadius="20px"
            className={styles.bentoCardWrapper}
          >
            <div className={styles.bentoCard}>
              <div className={styles.cardIcon}>
                <FiClock />
              </div>
              <div className={styles.cardHeader}>
                <span className={styles.cardLabel}>Yanıt Süresi</span>
                <h3 className={styles.cardTitle}>24 Saat İçinde</h3>
              </div>
              <p className={styles.cardDesc}>{t('contact.responseMessage', 'Gelen mesajlara en kısa sürede dönüş sağlamaya çalışıyorum.')}</p>
            </div>
          </GlowingCard>
        </div>
      </div>
    </main>
  );
};

export default ContactPage;
