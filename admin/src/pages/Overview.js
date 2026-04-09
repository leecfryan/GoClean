import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Overview.module.css';

// ── Small helpers ─────────────────────────────────────────────────────────────

const fmt   = (v) => (v == null ? '—' : Number(v).toLocaleString());
const Stars = ({ rating }) => (
  <span className={styles.inlineStars}>
    {[1,2,3,4,5].map((n) => (
      <svg key={n} width="13" height="13" viewBox="0 0 24 24"
        fill={n <= Math.round(rating) ? '#f59e0b' : 'none'}
        stroke={n <= Math.round(rating) ? '#f59e0b' : '#cbd5e1'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ))}
  </span>
);

const KpiCard = ({ label, value, sub, colorClass, icon }) => (
  <div className={`${styles.kpiCard} ${styles[colorClass]}`}>
    <div className={styles.kpiIcon}>{icon}</div>
    <div className={styles.kpiBody}>
      <p className={styles.kpiLabel}>{label}</p>
      <p className={styles.kpiValue}>{value}</p>
      {sub && <p className={styles.kpiSub}>{sub}</p>}
    </div>
  </div>
);

// ── Overview ──────────────────────────────────────────────────────────────────

const Overview = () => {
  const navigate = useNavigate();
  const token    = localStorage.getItem('adminToken');
  const h        = { Authorization: `Bearer ${token}` };

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      fetch('/api/users?page=1&limit=5',           { headers: h }),
      fetch('/api/companies?limit=1',              { headers: h }),
      fetch('/api/companies?limit=1&status=active',    { headers: h }),
      fetch('/api/companies?limit=1&status=pending',   { headers: h }),
      fetch('/api/companies?limit=1&status=suspended', { headers: h }),
      fetch('/api/reviews/stats',                  { headers: h }),
    ]).then(async (results) => {
      const safe = async (r) => {
        if (r.status === 'fulfilled' && r.value.ok) return r.value.json();
        return null;
      };

      const [users, allCo, activeCo, pendingCo, suspendedCo, reviewStats] = await Promise.all(
        results.map(safe)
      );

      setData({
        userTotal:      users?.total         ?? null,
        recentUsers:    users?.users         ?? [],
        companyTotal:   allCo?.total         ?? null,
        companyActive:  activeCo?.total      ?? null,
        companyPending: pendingCo?.total     ?? null,
        companySuspended: suspendedCo?.total ?? null,
        reviewTotal:    reviewStats?.platform?.total     ?? null,
        reviewAvg:      reviewStats?.platform?.avg_rating ?? null,
        reviewFlagged:  reviewStats?.platform?.flagged   ?? null,
        reviewPublished:reviewStats?.platform?.published ?? null,
        topCompany:     reviewStats?.companies?.[0]      ?? null,
      });
      setLoading(false);
    });
  }, []); // eslint-disable-line

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  const d = data ?? {};
  const hasPending  = d.companyPending > 0;
  const hasFlagged  = d.reviewFlagged  > 0;

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Overview</h1>
          <p className={styles.subtitle}>Here's the state of GoClean right now</p>
        </div>
        <span className={styles.date}>{today}</span>
      </header>

      {/* ── KPI row ── */}
      <div className={styles.kpiGrid}>
        <KpiCard
          colorClass="teal" label="Total Users"
          value={loading ? '—' : fmt(d.userTotal)}
          sub="Registered accounts"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
        />
        <KpiCard
          colorClass="indigo" label="Active Companies"
          value={loading ? '—' : fmt(d.companyActive)}
          sub={`${fmt(d.companyTotal)} total registered`}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
        />
        <KpiCard
          colorClass="amber" label="Platform Avg Rating"
          value={loading ? '—' : (d.reviewAvg != null ? d.reviewAvg.toFixed(1) : '—')}
          sub={`${fmt(d.reviewTotal)} total reviews`}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
        />
        <KpiCard
          colorClass={hasFlagged ? 'red' : 'green'} label="Flagged Reviews"
          value={loading ? '—' : fmt(d.reviewFlagged)}
          sub={hasFlagged ? 'Requires moderation' : 'Nothing to action'}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>}
        />
      </div>

      {/* ── Action items ── */}
      {(hasPending || hasFlagged) && (
        <section className={styles.actionsSection}>
          <p className={styles.actionsSectionLabel}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Requires attention
          </p>
          <div className={styles.actionCards}>
            {hasPending && (
              <button className={`${styles.actionCard} ${styles.actionCardAmber}`} onClick={() => navigate('/companies')}>
                <div className={styles.actionCardIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                </div>
                <div className={styles.actionCardBody}>
                  <p className={styles.actionCardCount}>{d.companyPending}</p>
                  <p className={styles.actionCardLabel}>
                    {d.companyPending === 1 ? 'company' : 'companies'} awaiting approval
                  </p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            )}
            {hasFlagged && (
              <button className={`${styles.actionCard} ${styles.actionCardRed}`} onClick={() => navigate('/reviews')}>
                <div className={styles.actionCardIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                </div>
                <div className={styles.actionCardBody}>
                  <p className={styles.actionCardCount}>{d.reviewFlagged}</p>
                  <p className={styles.actionCardLabel}>
                    {d.reviewFlagged === 1 ? 'review' : 'reviews'} flagged for moderation
                  </p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            )}
          </div>
        </section>
      )}

      {/* ── Main grid ── */}
      <div className={styles.mainGrid}>

        {/* Recent users */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <div>
              <h2 className={styles.cardTitle}>Recent Registrations</h2>
              <p className={styles.cardSub}>Latest user signups</p>
            </div>
            <button className={styles.cardLink} onClick={() => navigate('/users')}>View all →</button>
          </div>
          {loading ? (
            <div className={styles.loadingState}><div className={styles.spinner}/>Loading…</div>
          ) : d.recentUsers?.length === 0 ? (
            <p className={styles.emptyState}>No users yet.</p>
          ) : (
            <table className={styles.table}>
              <thead><tr><th>Email</th><th>Tier</th><th>Joined</th></tr></thead>
              <tbody>
                {d.recentUsers.map((u) => (
                  <tr key={u.id}>
                    <td className={styles.email}>{u.email}</td>
                    <td><span className={`${styles.badge} ${styles[u.tier]}`}>{u.tier}</span></td>
                    <td className={styles.muted}>{new Date(u.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Right column */}
        <div className={styles.rightCol}>

          {/* Company status breakdown */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <div>
                <h2 className={styles.cardTitle}>Company Status</h2>
                <p className={styles.cardSub}>{fmt(d.companyTotal)} total registered</p>
              </div>
              <button className={styles.cardLink} onClick={() => navigate('/companies')}>Manage →</button>
            </div>
            <div className={styles.statusBreakdown}>
              {[
                { label: 'Active',    value: d.companyActive,    color: '#0d9488', bg: '#ccfbf1', dot: styles.dotActive },
                { label: 'Pending',   value: d.companyPending,   color: '#d97706', bg: '#fef3c7', dot: styles.dotPending },
                { label: 'Suspended', value: d.companySuspended, color: '#ef4444', bg: '#fef2f2', dot: styles.dotSuspended },
              ].map(({ label, value, color, bg, dot }) => {
                const pct = d.companyTotal > 0 ? Math.round((value / d.companyTotal) * 100) : 0;
                return (
                  <div key={label} className={styles.statusRow}>
                    <div className={styles.statusLeft}>
                      <span className={`${styles.statusDot} ${dot}`} />
                      <span className={styles.statusLabel}>{label}</span>
                    </div>
                    <div className={styles.statusBarWrap}>
                      <div className={styles.statusBar}>
                        <div className={styles.statusBarFill} style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                    <span className={styles.statusCount} style={{ color }}>{loading ? '—' : fmt(value)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top rated company */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <div>
                <h2 className={styles.cardTitle}>Top Rated Company</h2>
                <p className={styles.cardSub}>By average customer rating</p>
              </div>
              <button className={styles.cardLink} onClick={() => navigate('/reviews')}>Leaderboard →</button>
            </div>
            {loading ? (
              <div className={styles.loadingState}><div className={styles.spinner}/>Loading…</div>
            ) : !d.topCompany ? (
              <p className={styles.emptyState}>No reviews yet.</p>
            ) : (
              <div className={styles.topCompany}>
                <div className={styles.topCompanyRank}>🥇</div>
                <div className={styles.topCompanyInfo}>
                  <p className={styles.topCompanyName}>{d.topCompany.company_name}</p>
                  <div className={styles.topCompanyRating}>
                    <Stars rating={d.topCompany.avg_rating} />
                    <span className={styles.topCompanyAvg}>{d.topCompany.avg_rating}</span>
                    <span className={styles.topCompanyCount}>({d.topCompany.total} reviews)</span>
                  </div>
                  <div className={styles.topCompanyMeta}>
                    <span className={styles.metaBadge} style={{ background: '#ccfbf1', color: '#0d9488' }}>
                      {d.topCompany.five_star_pct}% five-star
                    </span>
                    {d.topCompany.flagged > 0 && (
                      <span className={styles.metaBadge} style={{ background: '#fef2f2', color: '#dc2626' }}>
                        {d.topCompany.flagged} flagged
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Review snapshot */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <div>
                <h2 className={styles.cardTitle}>Review Snapshot</h2>
                <p className={styles.cardSub}>Platform-wide status breakdown</p>
              </div>
            </div>
            <div className={styles.reviewSnapshot}>
              {[
                { label: 'Published', value: d.reviewPublished, color: '#0d9488' },
                { label: 'Flagged',   value: d.reviewFlagged,   color: '#d97706' },
                { label: 'Removed',   value: (d.reviewTotal ?? 0) - (d.reviewPublished ?? 0) - (d.reviewFlagged ?? 0), color: '#ef4444' },
              ].map(({ label, value, color }) => (
                <div key={label} className={styles.snapshotItem}>
                  <p className={styles.snapshotValue} style={{ color }}>{loading ? '—' : fmt(value < 0 ? 0 : value)}</p>
                  <p className={styles.snapshotLabel}>{label}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Overview;
