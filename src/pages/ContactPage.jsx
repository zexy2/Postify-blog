import { useTranslation } from 'react-i18next';
import { FiArrowUpRight, FiGithub, FiMail } from 'react-icons/fi';
import SEO from '../components/SEO';
import styles from './ContactPage.module.css';

const ContactPage = () => {
  const { t } = useTranslation();
  const links = [
    { key: 'github', label: 'GitHub', value: '@zexy2', href: 'https://github.com/zexy2', icon: FiGithub },
    { key: 'email', label: t('contact.email'), value: 'zekiakgul09@gmail.com', href: 'mailto:zekiakgul09@gmail.com', icon: FiMail },
  ];

  return (
    <main className={styles.contactPage}>
      <SEO title={t('contact.title')} description={t('contact.description')} />
      <div className={styles.container}>
        <header className={styles.hero}>
          <span className={styles.eyebrow}>Contact</span>
          <h1>{t('contact.title')}</h1>
          <p>{t('contact.description')}</p>
        </header>

        <section className={styles.contactList} aria-label={t('contact.title')}>
          {links.map(({ key, label, value, href, icon: Icon }) => (
            <a key={key} href={href} target={key === 'github' ? '_blank' : undefined} rel={key === 'github' ? 'noopener noreferrer' : undefined} className={styles.contactLink}>
              <span className={styles.icon}><Icon size={20} /></span>
              <span><small>{label}</small><strong>{value}</strong></span>
              <FiArrowUpRight className={styles.arrow} size={18} />
            </a>
          ))}
        </section>

        <p className={styles.response}>{t('contact.responseMessage')}</p>
      </div>
    </main>
  );
};

export default ContactPage;
