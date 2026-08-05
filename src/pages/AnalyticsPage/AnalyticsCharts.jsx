import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { useTranslation } from 'react-i18next';
import styles from './AnalyticsPage.module.css';

const COLORS = ['#ffffff', '#e5e5e5', '#cccccc', '#b3b3b3', '#999999', '#808080', '#666666', '#4d4d4d', '#333333', '#1a1a1a'];

const tooltipStyle = {
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
};

export default function AnalyticsCharts({ stats }) {
  const { t } = useTranslation();

  return (
    <div className={styles.chartsGrid}>
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>{t('analytics.postsByAuthor')}</h3>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.postsByAuthor}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={{ stroke: 'var(--border-color)' }} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={{ stroke: 'var(--border-color)' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="posts" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#808080" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>{t('analytics.topAuthors')}</h3>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={stats.topAuthors} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="posts" label={({ name }) => name}>
                {stats.topAuthors.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`${styles.chartCard} ${styles.wideChart}`}>
        <h3 className={styles.chartTitle}>{t('analytics.postsOverTime')}</h3>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.postsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={{ stroke: 'var(--border-color)' }} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={{ stroke: 'var(--border-color)' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="posts" stroke="#ffffff" strokeWidth={3} dot={{ fill: '#ffffff', strokeWidth: 2 }} name="Yazılar" />
              <Line type="monotone" dataKey="views" stroke="#666666" strokeWidth={3} dot={{ fill: '#666666', strokeWidth: 2 }} name="Görüntüleme" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
