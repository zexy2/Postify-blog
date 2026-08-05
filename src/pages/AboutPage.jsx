import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import styles from "./AboutPage.module.css";

const AboutPage = () => {
  const { t } = useTranslation();

  const techStack = [
    { name: "React 19", desc: "UI Framework" },
    { name: "Redux Toolkit", desc: "State Management" },
    { name: "Vite", desc: "Build Tool" },
    { name: "Supabase", desc: "Backend" },
    { name: "Framer Motion", desc: "Animations" },
    { name: "GSAP", desc: "Scroll Effects" },
  ];

  const features = [
    {
      title: t('about.features.blog') || "Blog Posts",
      desc: t('about.features.blogDesc') || "Create, edit and share your thoughts",
    },
    {
      title: t('about.features.auth') || "Authentication",
      desc: t('about.features.authDesc') || "Secure login with Supabase",
    },
    {
      title: t('about.features.theme') || "Dark Mode",
      desc: t('about.features.themeDesc') || "Easy on the eyes",
    },
    {
      title: t('about.features.i18n') || "Multi-language",
      desc: t('about.features.i18nDesc') || "Turkish & English support",
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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className={styles.aboutPage}>
      <div className={styles.container}>
        {/* Hero Section */}
        <motion.div
          className={styles.hero}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className={styles.heroTitle}>{t('about.title')}</h1>
          <p className={styles.heroSubtitle}>{t('about.description')}</p>
        </motion.div>

        {/* Developer Card */}
        <motion.div
          className={styles.developerCard}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className={styles.avatarWrapper}>
            <div className={styles.avatar}>ZA</div>
          </div>
          <div className={styles.developerInfo}>
            <h2 className={styles.developerName}>Zeki Akgül</h2>
            <p className={styles.developerRole}>Full Stack Developer</p>
            <p className={styles.developerBio}>
              {t('about.bio') || "Passionate about creating modern web applications with clean code and great user experiences."}
            </p>
            <div className={styles.socialLinks}>
              <a
                href="https://github.com/zexy2"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/zeki-akgül"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                LinkedIn
              </a>
            </div>
          </div>
        </motion.div>

        {/* Tech Stack */}
        <motion.section
          className={styles.techSection}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className={styles.sectionTitle}>
            {t('about.technologies')}
          </h2>
          <div className={styles.techGrid}>
            {techStack.map((tech) => (
              <motion.div
                key={tech.name}
                className={styles.techCard}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
              >
                <div className={styles.techName}>{tech.name}</div>
                <div className={styles.techDesc}>{tech.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Features */}
        <motion.section
          className={styles.featuresSection}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className={styles.sectionTitle}>
            {t('about.featuresTitle') || "Features"}
          </h2>
          <div className={styles.featuresGrid}>
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                className={styles.featureCard}
                variants={itemVariants}
                whileHover={{ scale: 1.01 }}
              >
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDesc}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Stats */}
        <motion.div
          className={styles.statsSection}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className={styles.statCard}>
            <div className={styles.statNumber}>100+</div>
            <div className={styles.statLabel}>{t('about.stats.commits') || "Commits"}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>15+</div>
            <div className={styles.statLabel}>{t('about.stats.components') || "Components"}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>2</div>
            <div className={styles.statLabel}>{t('about.stats.languages') || "Languages"}</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;
