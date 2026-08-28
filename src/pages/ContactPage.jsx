import { useTranslation } from 'react-i18next';
import { FiArrowUpRight, FiGithub, FiMail } from 'react-icons/fi';
import SEO from '../components/SEO';
import styles from './ContactPage.module.css';

const ContactPage = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');

  const reasons = [
    ['01', isEn ? 'Correction' : 'Düzeltme', isEn ? 'A claim is stale, incomplete, or wrong.' : 'Bir iddia eski, eksik veya yanlış.'],
    ['02', isEn ? 'Useful topic' : 'Faydalı konu', isEn ? 'A practical problem deserves a maintained record.' : 'Pratik bir problem, bakımı yapılan bir kaydı hak ediyor.'],
    ['03', isEn ? 'Collaboration' : 'İş birliği', isEn ? 'You have evidence, experience, or a workflow worth combining.' : 'Birleştirmeye değer kanıtın, deneyimin veya iş akışın var.'],
  ];

  return (
    <div className={styles.page}>
      <SEO title={t('contact.title')} description={t('contact.description')} />
      <div className={styles.container}>
        <header className={styles.hero}>
          <span className={styles.eyebrow}>{isEn ? 'CORRECTIONS / FEEDBACK / COLLABORATION' : 'DÜZELTME / GERİ BİLDİRİM / İŞ BİRLİĞİ'}</span>
          <h1>{isEn ? 'Useful knowledge gets better when readers can challenge it.' : 'Faydalı bilgi, okuyucu ona itiraz edebildiğinde gelişir.'}</h1>
          <p>{t('contact.description')}</p>
        </header>

        <section className={styles.channelSection} aria-labelledby="contact-channel-title">
          <div className={styles.sectionHeading}>
            <span>01</span>
            <h2 id="contact-channel-title">{isEn ? 'Direct channels' : 'Doğrudan kanallar'}</h2>
          </div>
          <div className={styles.channels}>
            <a href="mailto:zekiakgul09@gmail.com" className={styles.channel}>
              <span className={styles.channelIndex}>01</span>
              <FiMail aria-hidden="true" />
              <span className={styles.channelCopy}>
                <small>{t('contact.email')}</small>
                <strong>zekiakgul09@gmail.com</strong>
              </span>
              <FiArrowUpRight aria-hidden="true" />
            </a>
            <a href="https://github.com/zexy2" target="_blank" rel="noopener noreferrer" className={styles.channel}>
              <span className={styles.channelIndex}>02</span>
              <FiGithub aria-hidden="true" />
              <span className={styles.channelCopy}>
                <small>GitHub</small>
                <strong>@zexy2</strong>
              </span>
              <FiArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </section>

        <section className={styles.reasonSection} aria-labelledby="contact-reasons-title">
          <div className={styles.sectionHeading}>
            <span>02</span>
            <h2 id="contact-reasons-title">{isEn ? 'Good reasons to reach out' : 'İletişim için iyi nedenler'}</h2>
          </div>
          <div className={styles.reasonRows}>
            {reasons.map(([index, title, text]) => (
              <div className={styles.reasonRow} key={index}>
                <span>{index}</span>
                <strong>{title}</strong>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className={styles.note}>
          <span>{isEn ? 'A useful correction includes' : 'İyi bir düzeltmede şunlar olur'}</span>
          <p>{isEn ? 'The page or claim, what you expected, what you observed, and any evidence that helps reproduce it.' : 'Sayfa veya iddia, beklediğin sonuç, gözlemlediğin sonuç ve tekrar üretmeye yardımcı olan kanıt.'}</p>
        </aside>
      </div>
    </div>
  );
};

export default ContactPage;
