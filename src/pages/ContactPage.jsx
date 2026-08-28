import { useTranslation } from 'react-i18next';
import { FiArrowUpRight, FiGithub, FiMail } from 'react-icons/fi';
import SEO from '../components/SEO';
import styles from './ContactPage.module.css';

const ContactPage = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');

  return (
    <main className={styles.page}>
      <SEO title={t('contact.title')} description={t('contact.description')} />
      <div className={styles.container}>
        <header className={styles.hero}>
          <span className={styles.eyebrow}>{isEn ? 'Contact' : 'İletişim'}</span>
          <h1>{isEn ? 'Have something worth discussing?' : 'Konuşmaya değer bir şey mi var?'}</h1>
          <p>{t('contact.description')}</p>
        </header>

        <section className={styles.channels} aria-label={isEn ? 'Contact channels' : 'İletişim kanalları'}>
          <a href="mailto:zekiakgul09@gmail.com" className={styles.channel}>
            <FiMail aria-hidden="true" />
            <span>
              <small>{t('contact.email')}</small>
              <strong>zekiakgul09@gmail.com</strong>
            </span>
            <FiArrowUpRight aria-hidden="true" />
          </a>
          <a href="https://github.com/zexy2" target="_blank" rel="noopener noreferrer" className={styles.channel}>
            <FiGithub aria-hidden="true" />
            <span>
              <small>GitHub</small>
              <strong>@zexy2</strong>
            </span>
            <FiArrowUpRight aria-hidden="true" />
          </a>
        </section>

        <section className={styles.note}>
          <h2>{isEn ? 'Best reasons to reach out' : 'En uygun iletişim konuları'}</h2>
          <p>{isEn ? 'Product feedback, corrections, collaboration ideas, or a useful topic you think Postify should cover.' : 'Ürün geri bildirimi, içerik düzeltmeleri, iş birliği fikirleri veya Postify’da ele alınmasını istediğin faydalı bir konu.'}</p>
        </section>
      </div>
    </main>
  );
};

export default ContactPage;
