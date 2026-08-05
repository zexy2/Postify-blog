/**
 * GhostText Component
 * Editörde AI önerilerini ghost text olarak gösterir
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './GhostText.module.css';

/**
 * GhostText - Inline AI suggestion display
 * @param {Object} props
 * @param {string} props.text - Suggestion text to display
 * @param {boolean} props.visible - Whether to show the ghost text
 * @param {boolean} props.isLoading - Whether AI is thinking
 */
const GhostText = ({ text, visible, isLoading }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.span
          className={styles.loading}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <span className={styles.dot}>•</span>
          <span className={styles.dot}>•</span>
          <span className={styles.dot}>•</span>
        </motion.span>
      )}

      {visible && text && !isLoading && (
        <motion.span
          className={styles.ghostText}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 0.4, x: 0 }}
          exit={{ opacity: 0, x: 4 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {text}
          <span className={styles.hint}>Tab ↹</span>
        </motion.span>
      )}
    </AnimatePresence>
  );
};

/**
 * GhostTextOverlay - Positioned overlay for ghost text
 * Used when we can't inject directly into the editor
 */
export const GhostTextOverlay = ({
  text,
  visible,
  isLoading,
  position,
}) => {
  if (!visible && !isLoading) return null;

  return (
    <div
      className={styles.overlay}
      style={{
        left: position?.left ?? 0,
        top: position?.top ?? 0,
      }}
    >
      <GhostText text={text} visible={visible} isLoading={isLoading} />
    </div>
  );
};

export default GhostText;
