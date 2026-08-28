import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import styles from './design-testimonial.module.css';

export function Testimonial() {
  const { i18n } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);

  const isTr = i18n.language === 'tr';

  const testimonials = [
    {
      quote: isTr
        ? "Modern web mimarisi ve yüksek performanslı okuma deneyimi sunan bağımsız teknoloji dergisi."
        : "An independent tech journal offering modern web architecture and high-performance reading experience.",
      author: "Zeki Akgül",
      role: isTr ? "Proje Kurucusu & Yazılım Mimarı" : "Project Founder & Software Architect",
      company: "Postify Core",
    },
    {
      quote: isTr
        ? "Yapay zekâdan frontend performansına kadar her makalede derinlemesine pratik mühendislik notları."
        : "In-depth practical engineering notes in every article, from AI models to frontend web performance.",
      author: "Postify Editorial",
      role: isTr ? "İçerik & Dergi Ekibi" : "Content & Editorial Team",
      company: "Postify Journal",
    },
    {
      quote: isTr
        ? "%100 Açık kaynak ruhu, çevrimdışı PWA erişimi ve modern tasarım sistemleriyle geliştirildi."
        : "Built with 100% open source spirit, offline PWA access, and state-of-the-art design systems.",
      author: "Open Source Community",
      role: isTr ? "Geliştirici Topluluğu" : "Developer Community",
      company: "Postify Engine",
    },
  ];

  // Mouse position for magnetic effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  // Transform for parallax on the large number
  const numberX = useTransform(x, [-200, 200], [-20, 20]);
  const numberY = useTransform(y, [-200, 200], [-10, 10]);

  const handleMouseMove = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
    }
  };

  const testimonialCount = testimonials.length;
  const goNext = () => setActiveIndex((prev) => (prev + 1) % testimonialCount);
  const goPrev = () => setActiveIndex((prev) => (prev - 1 + testimonialCount) % testimonialCount);

  useEffect(() => {
    const timer = setInterval(
      () => setActiveIndex((prev) => (prev + 1) % testimonialCount),
      6000,
    );
    return () => clearInterval(timer);
  }, [testimonialCount]);

  const current = testimonials[activeIndex];

  return (
    <div className={styles.wrapper}>
      <div ref={containerRef} className={styles.container} onMouseMove={handleMouseMove}>
        {/* Oversized index number */}
        <motion.div
          className={styles.oversizedIndex}
          style={{ x: numberX, y: numberY }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className={styles.indexNum}
            >
              {String(activeIndex + 1).padStart(2, "0")}
            </motion.span>
          </AnimatePresence>
        </motion.div>

        {/* Main content - asymmetric layout */}
        <div className={styles.mainFlex}>
          {/* Left column - vertical text */}
          <div className={styles.leftCol}>
            <motion.span
              className={styles.verticalText}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              POSTIFY JOURNAL
            </motion.span>

            {/* Vertical progress line */}
            <div className={styles.progressTrack}>
              <motion.div
                className={styles.progressBar}
                animate={{
                  height: `${((activeIndex + 1) / testimonials.length) * 100}%`,
                }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>

          {/* Center - main content */}
          <div className={styles.centerContent}>
            {/* Company badge */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4 }}
                className={styles.badgeWrapper}
              >
                <span className={styles.companyBadge}>
                  <span className={styles.badgeDot} />
                  {current.company}
                </span>
              </motion.div>
            </AnimatePresence>

            {/* Quote with character reveal */}
            <div className={styles.quoteWrapper}>
              <AnimatePresence mode="wait">
                <motion.blockquote
                  key={activeIndex}
                  className={styles.quoteText}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {current.quote.split(" ").map((word, i) => (
                    <motion.span
                      key={i}
                      className={styles.wordSpan}
                      variants={{
                        hidden: { opacity: 0, y: 20, rotateX: 90 },
                        visible: {
                          opacity: 1,
                          y: 0,
                          rotateX: 0,
                          transition: {
                            duration: 0.5,
                            delay: i * 0.05,
                            ease: [0.22, 1, 0.36, 1],
                          },
                        },
                        exit: {
                          opacity: 0,
                          y: -10,
                          transition: { duration: 0.2, delay: i * 0.02 },
                        },
                      }}
                    >
                      {word}
                    </motion.span>
                  ))}
                </motion.blockquote>
              </AnimatePresence>
            </div>

            {/* Author row */}
            <div className={styles.authorRow}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className={styles.authorInfo}
                >
                  <motion.div
                    className={styles.authorLine}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  />
                  <div>
                    <p className={styles.authorName}>{current.author}</p>
                    <p className={styles.authorRole}>{current.role}</p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation buttons */}
              <div className={styles.navButtons}>
                <motion.button
                  onClick={goPrev}
                  className={styles.navBtn}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Previous testimonial"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 16 16"
                    fill="none"
                    className={styles.navSvg}
                  >
                    <path
                      d="M10 12L6 8L10 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.button>

                <motion.button
                  onClick={goNext}
                  className={styles.navBtn}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Next testimonial"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 16 16"
                    fill="none"
                    className={styles.navSvg}
                  >
                    <path
                      d="M6 4L10 8L6 12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom ticker - Postify brand ticker */}
        <div className={styles.bottomTicker}>
          <motion.div
            className={styles.tickerTrack}
            animate={{ x: [0, -1000] }}
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            {[...Array(10)].map((_, i) => (
              <span key={i} className={styles.tickerItem}>
                {testimonials.map((t) => t.company).join(" • ")} •
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Testimonial;
