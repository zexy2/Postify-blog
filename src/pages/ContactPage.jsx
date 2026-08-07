import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import styles from "./ContactPage.module.css";

const ContactPage = () => {
  const { t } = useTranslation();

  const contactLinks = [
    {
      type: "github",
      label: "GitHub",
      value: "@zexy2",
      href: "https://github.com/zexy2",
    },
    {
      type: "email",
      label: t('contact.email') || "Email",
      value: "zekiakgul09@gmail.com",
      href: "mailto:zekiakgul09@gmail.com",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className={styles.contactPage}>
      <div className={styles.container}>
        {/* Hero Section */}
        <motion.div
          className={styles.hero}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className={styles.heroTitle}>{t('contact.title')}</h1>
          <p className={styles.heroSubtitle}>{t('contact.description')}</p>
        </motion.div>

        {/* Contact Links */}
        <motion.div
          className={styles.contactInfo}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {contactLinks.map((link) => (
            <motion.a
              key={link.type}
              href={link.href}
              target={link.type !== "email" ? "_blank" : undefined}
              rel={link.type !== "email" ? "noopener noreferrer" : undefined}
              className={styles.contactCard}
              variants={itemVariants}
              whileHover={{ x: 8 }}
            >
              <div className={`${styles.contactIconWrapper} ${styles[link.type]}`}>
                {link.label.charAt(0)}
              </div>
              <div className={styles.contactDetails}>
                <div className={styles.contactLabel}>{link.label}</div>
                <div className={styles.contactValue}>{link.value}</div>
              </div>
              <span className={styles.contactArrow}>→</span>
            </motion.a>
          ))}
        </motion.div>

        {/* Response Card */}
        <motion.div
          className={styles.responseCard}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <p className={styles.responseText}>
            {t('contact.responseMessage')}
          </p>
        </motion.div>

        {/* Availability */}
        <motion.div
          className={styles.availabilitySection}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className={styles.availabilityTitle}>
            {t('contact.availability') || "Currently Available For"}
          </h3>
          <div className={styles.availabilityGrid}>
            <div className={styles.availabilityBadge}>
              <span className={styles.availabilityDot}></span>
              {t('contact.freelance') || "Freelance Projects"}
            </div>
            <div className={styles.availabilityBadge}>
              <span className={styles.availabilityDot}></span>
              {t('contact.collaboration') || "Collaboration"}
            </div>
            <div className={styles.availabilityBadge}>
              <span className={styles.availabilityDot}></span>
              {t('contact.fulltime') || "Full-time Opportunities"}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;
