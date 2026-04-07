import { useEffect, useState } from 'react';
import styles from './Overview.module.css';

const MONTHS = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
const MOCK_MONTHLY = [38, 54, 61, 47, 83, 97];

const TIER_BREAKDOWN = [
  { label: 'Normal',   pct: 58, color: '#94a3b8' },
  { label: 'Silver',   pct: 24, color: '#64748b' },
  { label: 'Gold',     pct: 13, color: '#d97706' },
  { label: 'Platinum', pct:  5, color: '#7c3aed' },
];

const StatCard = ({ label, value, sub, icon, colorClass }) => (
  <div className={`${styles.statCard} ${styles[colorClass]}`}>
    <div className={styles.statIconWrap}>{icon}</div>
    <div>
      <p className={styles.statLabel}>{label}</p>
      <p className={styles.statValue}>{value}</p>
      {sub && <p className={styles.statSub}>{sub}</p>}
    </div>
  </div>
);

const Overview = () => {
  const [userTotal, setUserTotal] = useState(null);
  const [companyTotal, setCompanyTotal] = useState(null);
  const [reviewTotal, setReviewTotal] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    const h = { Authorization: `Bearer ${token}` };

    Promise.allSettled([
      fetch('/api/users?page=1&limit=5', { headers: h }),
      fetch('/api/admin/companies?page=1&limit=1', { headers: h }),
      fetch('/api/admin/reviews?page=1&limit=1', { headers: h }),
    ]).then(async ([uRes, cRes, rRes]) => {
      if (uRes.status === 'fulfilled' && uRes.value.ok) {
        const d = await uRes.value.json();
        setUserTotal(d.total ?? null);
        setRecentUsers(d.users ?? []);
      }
      if (cRes.status === 'fulfilled' && cRes.value.ok) {
        const d = await cRes.value.json();
        setCompanyTotal(d.total ?? null);
      }
      if (rRes.status === 'fulfilled' && rRes.value.ok) {
        const d = await rRes.value.json();
        setReviewTotal(d.total ?? null);
      }
      setLoading(false);
    });
  }, [token]);

  const fmt = (v) => (v == null ? '—' : v.toLocaleString());
  const maxBar = Math.max(...MOCK_MONTHLY);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Overview</h1>
          <p className={styles.subtitle}>Here's what's happening with GoClean today</p>
        </div>
        <span className={styles.date}>{today}</span>
      </header>

      {/* KPI Cards */}
      <div className={styles.statGrid}>
        <StatCard
          colorClass="teal"
          label="Total Users"
          value={loading ? '—' : fmt(userTotal)}
          sub="Registered accounts"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          }
        />
        <StatCard
          colorClass="indigo"
          label="Companies"
          value={loading ? '—' : fmt(companyTotal)}
          sub="Listed businesses"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          }
        />
        <StatCard
          colorClass="amber"
          label="Reviews"
          value={loading ? '—' : fmt(reviewTotal)}
          sub="Customer reviews"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          }
        />
        <StatCard
          colorClass="green"
          label="Platform"
          value="Healthy"
          sub="All systems operational"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          }
        />
      </div>

      {/* Charts row */}
      <div className={styles.chartsRow}>
        {/* Bar chart */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div>
              <h2 className={styles.cardTitle}>New Signups</h2>
              <p className={styles.cardSub}>Last 6 months</p>
            </div>
          </div>
          <div className={styles.barChart}>
            {MOCK_MONTHLY.map((val, i) => (
              <div key={i} className={styles.barCol}>
                <span className={styles.barValue}>{val}</span>
                <div className={styles.barTrack}>
                  <div
                    className={styles.bar}
                    style={{ height: `${(val / maxBar) * 100}%` }}
                  />
                </div>
                <span className={styles.barLabel}>{MONTHS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tier breakdown */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div>
              <h2 className={styles.cardTitle}>User Tiers</h2>
              <p className={styles.cardSub}>Subscription breakdown</p>
            </div>
          </div>
          <div className={styles.tierList}>
            {TIER_BREAKDOWN.map(({ label, pct, color }) => (
              <div key={label} className={styles.tierRow}>
                <div className={styles.tierMeta}>
                  <span className={styles.tierLabel}>{label}</span>
                  <span className={styles.tierPct}>{pct}%</span>
                </div>
                <div className={styles.tierBarBg}>
                  <div
                    className={styles.tierBarFill}
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent users */}
      <div className={styles.card}>
        <div className={styles.cardHead}>
          <div>
            <h2 className={styles.cardTitle}>Recent Registrations</h2>
            <p className={styles.cardSub}>Latest user signups</p>
          </div>
        </div>
        {loading ? (
          <p className={styles.empty}>Loading…</p>
        ) : recentUsers.length === 0 ? (
          <p className={styles.empty}>No users found.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Tier</th>
                <th>Role</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td><span className={`${styles.badge} ${styles[u.tier]}`}>{u.tier}</span></td>
                  <td><span className={`${styles.badge} ${u.role === 'admin' ? styles.badgeAdmin : styles.badgeUser}`}>{u.role}</span></td>
                  <td className={styles.muted}>{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Overview;
