import styles from './SystemStatus.module.css';

const SystemStatus = ({
  eyebrow = 'POSTIFY / SYSTEM',
  title,
  message,
  loading = false,
  fullPage = false,
  role = 'status',
  action = null,
  children = null,
}) => (
  <section
    className={`${styles.shell} ${fullPage ? styles.fullPage : ''}`}
    role={role}
    aria-live={role === 'alert' ? 'assertive' : 'polite'}
  >
    <div className={styles.frame}>
      <span className={styles.index} aria-hidden="true">00 / SYS</span>
      <div className={styles.content}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        {loading && <span className={styles.progress} aria-hidden="true"><i /></span>}
        {title && <h1>{title}</h1>}
        {message && <p>{message}</p>}
        {children && <div className={styles.extra}>{children}</div>}
        {action && <div className={styles.actions}>{action}</div>}
      </div>
    </div>
  </section>
);

export default SystemStatus;
