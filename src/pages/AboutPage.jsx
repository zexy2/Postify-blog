import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiArrowUpRight } from 'react-icons/fi';
import SEO from '../components/SEO';
import styles from './AboutPage.module.css';

const AboutPage = () => {
  const { t } = useTranslation();
  const techStack = [
    ['React 19', 'UI'],
    ['Vite', 'Build'],
    ['Supabase', 'Data'],
    ['Framer Motion', 'Motion'],
  ];
  const features = ['blog', 'auth', 'theme', 'i18n'];

  return (
    <main className={styles.aboutPage}>
      <SEO title={t('about.title')} description={t('about.description')} />
      <div className={styles.container}>
        <header className={styles.hero}>
          <span className={styles.eyebrow}>Postify</span>
          <h1 className={styles.heroTitle}>{t('about.title')}</h1>
          <p className={styles.heroSubtitle}>{t('about.description')}</p>
        </header>

        <section className={styles.profile}>
          <div className={styles.avatar}>ZA</div>
          <div>
            <p className={styles.profileKicker}>{t('about.projectOwner')}</p>
            <h2>Zeki Akgül</h2>
            <p className={styles.role}>{t('about.role')}</p>
            <p className={styles.bio}>{t('about.bio')}</p>
            <a href="https://github.com/zexy2" target="_blank" rel="noopener noreferrer" className={styles.inlineLink}>GitHub <FiArrowUpRight size={15} /></a>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <span className={styles.eyebrow}>Stack</span>
            <h2>{t('about.technologies')}</h2>
          </div>
          <div className={styles.techList}>
            {techStack.map(([name, desc]) => <div key={name} className={styles.techItem}><strong>{name}</strong><span>{desc}</span></div>)}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeading}>
            <span className={styles.eyebrow}>Read / write</span>
            <h2>{t('about.featuresTitle')}</h2>
          </div>
          <div className={styles.featureList}>
            {features.map((key) => <div key={key} className={styles.featureItem}><h3>{t(`about.features.${key}`)}</h3><p>{t(`about.features.${key}Desc`)}</p></div>)}
          </div>
        </section>

        <Link to="/" className={styles.returnLink}>{t('home.latest')} <FiArrowUpRight size={16} /></Link>
      </div>
    </main>
  );
};

export default AboutPage;
