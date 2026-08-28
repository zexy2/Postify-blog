import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiArrowRight, FiBookOpen, FiCompass, FiEdit3, FiRefreshCw } from 'react-icons/fi';
import SEO from '../components/SEO';
import styles from './AboutPage.module.css';

const AboutPage = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');

  const formats = [
    { icon: FiBookOpen, title: isEn ? 'Guides' : 'Rehberler', text: isEn ? 'Step-by-step paths for getting a concrete job done.' : 'Somut bir işi tamamlamak için adım adım yollar.' },
    { icon: FiCompass, title: isEn ? 'Decision notes' : 'Karar notları', text: isEn ? 'Trade-offs, constraints, and why one option wins.' : 'Seçeneklerin artıları, eksileri ve hangi koşulda hangisinin seçileceği.' },
    { icon: FiRefreshCw, title: isEn ? 'Field notes' : 'Saha notları', text: isEn ? 'What happened in real work, including mistakes and fixes.' : 'Gerçek işte ne olduğu, hatalar ve işe yarayan düzeltmeler.' },
    { icon: FiEdit3, title: isEn ? 'Explainers' : 'Açıklayıcılar', text: isEn ? 'Dense concepts made easier to understand and reuse.' : 'Karmaşık konuları anlaşılır ve tekrar kullanılabilir hale getiren anlatılar.' },
  ];

  return (
    <main className={styles.page}>
      <SEO title={t('about.title')} description={t('about.description')} />
      <div className={styles.container}>
        <header className={styles.hero}>
          <span className={styles.eyebrow}>Postify</span>
          <h1>{t('about.title')}</h1>
          <p>{t('about.description')}</p>
        </header>

        <section className={styles.statement}>
          <p>{isEn ? 'Postify is built around one simple job: help you find useful knowledge quickly, understand whether it fits your situation, and come back to it when you need it.' : 'Postify’ın tek bir işi var: işe yarayan bilgiyi hızlı bulmanı, sana uygun olup olmadığını anlamanı ve gerektiğinde yeniden dönüp kullanmanı kolaylaştırmak.'}</p>
        </section>

        <section className={styles.formats} aria-labelledby="formats-title">
          <div className={styles.sectionHeading}>
            <span className={styles.eyebrow}>{isEn ? 'Content formats' : 'İçerik biçimleri'}</span>
            <h2 id="formats-title">{isEn ? 'Different problems need different writing.' : 'Farklı sorunlar, farklı anlatım ister.'}</h2>
          </div>
          <div className={styles.grid}>
            {formats.map(({ icon: Icon, title, text }) => (
              <article key={title} className={styles.item}>
                <Icon aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.principles}>
          <div>
            <span className={styles.eyebrow}>{isEn ? 'What we optimize for' : 'Neye önem veriyoruz'}</span>
            <h2>{isEn ? 'Less performance. More usefulness.' : 'Daha az gösteri. Daha çok fayda.'}</h2>
          </div>
          <ul>
            <li>{isEn ? 'Clear outcomes before long introductions.' : 'Uzun girişlerden önce net sonuç.'}</li>
            <li>{isEn ? 'Visible dates and context.' : 'Görünür tarih ve bağlam.'}</li>
            <li>{isEn ? 'Readable pages on mobile and desktop.' : 'Mobilde ve masaüstünde rahat okuma.'}</li>
            <li>{isEn ? 'Practical examples over generic advice.' : 'Genel tavsiye yerine uygulanabilir örnek.'}</li>
          </ul>
        </section>

        <div className={styles.cta}>
          <Link to="/">{isEn ? 'Explore Postify' : 'İçerikleri keşfet'} <FiArrowRight /></Link>
          <Link to="/create" className={styles.secondary}>{isEn ? 'Write something useful' : 'Faydalı bir şey yaz'}</Link>
        </div>
      </div>
    </main>
  );
};

export default AboutPage;
