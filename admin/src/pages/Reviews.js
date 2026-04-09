import { useEffect, useState, useCallback, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Reviews.module.css';

// ── Shared components ─────────────────────────────────────────────────────────

const Stars = ({ rating, size = 13 }) => (
  <span className={styles.stars}>
    {[1, 2, 3, 4, 5].map((n) => (
      <svg key={n} width={size} height={size} viewBox="0 0 24 24"
        fill={n <= rating ? '#f59e0b' : 'none'}
        stroke={n <= rating ? '#f59e0b' : '#cbd5e1'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ))}
  </span>
);

const StatusBadge = ({ status }) => {
  const map = { published: styles.sPublished, flagged: styles.sFlagged, removed: styles.sRemoved };
  return <span className={`${styles.badge} ${map[status] ?? ''}`}>{status}</span>;
};

// ── Leaderboard view ──────────────────────────────────────────────────────────

const RatingBar = ({ count, total, star }) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  const colors = { 5: '#0d9488', 4: '#2dd4bf', 3: '#f59e0b', 2: '#f97316', 1: '#ef4444' };
  return (
    <div className={styles.ratingBarRow}>
      <span className={styles.ratingBarLabel}>{star}★</span>
      <div className={styles.ratingBarBg}>
        <div className={styles.ratingBarFill} style={{ width: `${pct}%`, background: colors[star] }} />
      </div>
      <span className={styles.ratingBarCount}>{count}</span>
    </div>
  );
};

const LeaderboardView = ({ stats, loading }) => {
  if (loading) return <div className={styles.loadingState}><div className={styles.spinner} />Loading leaderboard…</div>;
  if (!stats || stats.companies.length === 0) return (
    <div className={styles.empty}>
      <p>No review data yet. Reviews will appear here once customers start rating companies.</p>
    </div>
  );

  const { platform, companies } = stats;

  return (
    <div>
      {/* Platform stats */}
      <div className={styles.statRow}>
        <div className={styles.statChip}>
          <span className={styles.statNum}>{platform.total}</span>
          <span className={styles.statLabel}>Total reviews</span>
        </div>
        <div className={`${styles.statChip} ${styles.chipGold}`}>
          <span className={styles.statNum}>{platform.avg_rating}</span>
          <Stars rating={Math.round(platform.avg_rating)} size={12} />
          <span className={styles.statLabel}>Platform avg</span>
        </div>
        <div className={`${styles.statChip} ${styles.chipGreen}`}>
          <span className={styles.statNum}>{platform.published}</span>
          <span className={styles.statLabel}>Published</span>
        </div>
        <div className={`${styles.statChip} ${styles.chipRed}`}>
          <span className={styles.statNum}>{platform.flagged}</span>
          <span className={styles.statLabel}>Flagged</span>
        </div>
      </div>

      {/* Company leaderboard cards */}
      <div className={styles.leaderboardGrid}>
        {companies.map((c, i) => (
          <div key={c.company_id} className={`${styles.leaderCard} ${i === 0 ? styles.leaderTop : ''}`}>
            <div className={styles.leaderRank}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
            </div>
            <div className={styles.leaderBody}>
              <div className={styles.leaderHeader}>
                <div>
                  <p className={styles.leaderName}>{c.company_name}</p>
                  <div className={styles.leaderRatingRow}>
                    <Stars rating={Math.round(c.avg_rating)} size={14} />
                    <span className={styles.leaderAvg}>{c.avg_rating}</span>
                    <span className={styles.leaderTotal}>({c.total} reviews)</span>
                  </div>
                </div>
                <div className={styles.leaderMeta}>
                  <span className={styles.fiveStarPct}>{c.five_star_pct}%</span>
                  <span className={styles.fiveStarLabel}>5-star</span>
                  {c.flagged > 0 && (
                    <span className={styles.flaggedBadge}>{c.flagged} flagged</span>
                  )}
                </div>
              </div>
              {/* Rating distribution bars */}
              <div className={styles.distBars}>
                {[5, 4, 3, 2, 1].map((s) => (
                  <RatingBar key={s} star={s} count={c.distribution[s] ?? 0} total={c.total} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Moderation view ───────────────────────────────────────────────────────────

const STATUS_TABS = [
  { key: 'all',       label: 'All' },
  { key: 'published', label: 'Published' },
  { key: 'flagged',   label: 'Flagged' },
  { key: 'removed',   label: 'Removed' },
];

const ModerationView = ({ token, navigate }) => {
  const [reviews,       setReviews]       = useState([]);
  const [page,          setPage]          = useState(1);
  const [pages,         setPages]         = useState(1);
  const [total,         setTotal]         = useState(0);
  const [activeFilter,  setActiveFilter]  = useState('all');
  const [counts,        setCounts]        = useState({ all: 0, published: 0, flagged: 0, removed: 0 });
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [expanded,      setExpanded]      = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchReviews = useCallback(async (p = 1, filter = activeFilter) => {
    setLoading(true);
    setError('');
    try {
      const statusParam = filter !== 'all' ? `&status=${filter}` : '';
      const res = await fetch(`/api/reviews?page=${p}&limit=20${statusParam}`, { headers });
      if (res.status === 401 || res.status === 403) { localStorage.removeItem('adminToken'); navigate('/login'); return; }
      if (!res.ok) { setError('Failed to load reviews.'); return; }
      const data = await res.json();
      setReviews(data.reviews ?? []);
      setTotal(data.total ?? 0);
      setPage(data.page ?? 1);
      setPages(data.pages ?? 1);
    } catch { setError('Failed to load reviews.'); }
    finally  { setLoading(false); }
  }, [token, navigate, activeFilter]); // eslint-disable-line

  const fetchCounts = useCallback(async () => {
    try {
      const [all, published, flagged, removed] = await Promise.all([
        fetch('/api/reviews?limit=1',                    { headers }).then(r => r.json()),
        fetch('/api/reviews?limit=1&status=published',   { headers }).then(r => r.json()),
        fetch('/api/reviews?limit=1&status=flagged',     { headers }).then(r => r.json()),
        fetch('/api/reviews?limit=1&status=removed',     { headers }).then(r => r.json()),
      ]);
      setCounts({ all: all.total ?? 0, published: published.total ?? 0, flagged: flagged.total ?? 0, removed: removed.total ?? 0 });
    } catch { /* non-critical */ }
  }, [token]); // eslint-disable-line

  useEffect(() => { fetchCounts(); fetchReviews(1, activeFilter); }, [activeFilter]); // eslint-disable-line

  const handleStatusChange = async (review, newStatus, flagReason) => {
    setActionLoading(review._id);
    try {
      const res = await fetch(`/api/reviews/${review._id}/status`, {
        method:  'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status: newStatus, flag_reason: flagReason }),
      });
      if (!res.ok) throw new Error();
      setReviews(prev => prev.map(r => r._id === review._id ? { ...r, status: newStatus } : r));
      fetchCounts();
    } catch { setError('Failed to update review.'); }
    finally  { setActionLoading(null); }
  };

  const handleDelete = async (id) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE', headers });
      if (!res.ok) throw new Error();
      setReviews(prev => prev.filter(r => r._id !== id));
      setConfirmDelete(null);
      fetchCounts();
    } catch { setError('Failed to delete review.'); }
    finally  { setActionLoading(null); }
  };

  const busy = (id) => actionLoading === id;

  return (
    <div>
      {/* Filter tabs */}
      <div className={styles.tabs}>
        {STATUS_TABS.map(({ key, label }) => (
          <button key={key}
            className={`${styles.tab} ${activeFilter === key ? styles.tabActive : ''}`}
            onClick={() => { setActiveFilter(key); setPage(1); setConfirmDelete(null); }}
          >
            {label}
            {counts[key] > 0 && (
              <span className={`${styles.tabCount} ${activeFilter === key ? styles.tabCountActive : ''}`}>
                {counts[key]}
              </span>
            )}
          </button>
        ))}
        <span className={styles.tabTotal}>{total} result{total !== 1 ? 's' : ''}</span>
      </div>

      {error && (
        <div className={styles.errorBox}>
          <span>{error}</span>
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      {loading ? (
        <div className={styles.loadingState}><div className={styles.spinner} />Loading reviews…</div>
      ) : reviews.length === 0 ? (
        <div className={styles.empty}><p>No {activeFilter !== 'all' ? activeFilter : ''} reviews found.</p></div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Rating</th>
                  <th>Review</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <Fragment key={r._id}>
                    <tr className={`${styles.row} ${expanded === r._id ? styles.rowExpanded : ''}`}>
                      <td>
                        <p className={styles.companyName}>{r.company_name}</p>
                        <p className={styles.userId}>User {r.user_id?.slice(-6)}</p>
                      </td>
                      <td>
                        <Stars rating={r.rating} />
                        <span className={styles.ratingNum}>{r.rating}/5</span>
                      </td>
                      <td className={styles.reviewCell}>
                        {r.title && <p className={styles.reviewTitle}>{r.title}</p>}
                        <p className={styles.reviewComment}>
                          {r.comment
                            ? (r.comment.length > 80 ? `${r.comment.slice(0, 80)}…` : r.comment)
                            : <span className={styles.muted}>No comment</span>
                          }
                        </p>
                        {r.flag_reason && (
                          <p className={styles.flagReason}>⚑ {r.flag_reason}</p>
                        )}
                      </td>
                      <td className={styles.muted}>{r.service_type ?? '—'}</td>
                      <td><StatusBadge status={r.status} /></td>
                      <td className={styles.muted}>
                        {r.created_at ? new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td>
                        {confirmDelete === r._id ? (
                          <div className={styles.confirmRow}>
                            <span className={styles.confirmText}>Delete?</span>
                            <button className={styles.btnDangerSm} disabled={busy(r._id)} onClick={() => handleDelete(r._id)}>
                              {busy(r._id) ? '…' : 'Yes'}
                            </button>
                            <button className={styles.btnGhostSm} onClick={() => setConfirmDelete(null)}>No</button>
                          </div>
                        ) : (
                          <div className={styles.actions}>
                            <button className={styles.btnIcon} title="Expand" onClick={() => setExpanded(expanded === r._id ? null : r._id)}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                {expanded === r._id
                                  ? <polyline points="18 15 12 9 6 15"/>
                                  : <polyline points="6 9 12 15 18 9"/>}
                              </svg>
                            </button>
                            {r.status !== 'published' && (
                              <button className={`${styles.btnSm} ${styles.btnPublish}`} disabled={busy(r._id)}
                                onClick={() => handleStatusChange(r, 'published')}>
                                {busy(r._id) ? '…' : 'Publish'}
                              </button>
                            )}
                            {r.status !== 'flagged' && (
                              <button className={`${styles.btnSm} ${styles.btnFlag}`} disabled={busy(r._id)}
                                onClick={() => handleStatusChange(r, 'flagged', 'Flagged by admin')}>
                                {busy(r._id) ? '…' : 'Flag'}
                              </button>
                            )}
                            {r.status !== 'removed' && (
                              <button className={`${styles.btnSm} ${styles.btnRemove}`} disabled={busy(r._id)}
                                onClick={() => handleStatusChange(r, 'removed')}>
                                {busy(r._id) ? '…' : 'Remove'}
                              </button>
                            )}
                            <button className={styles.btnIcon} title="Delete permanently" onClick={() => setConfirmDelete(r._id)}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
                              </svg>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                    {/* Expanded full review */}
                    {expanded === r._id && (
                      <tr key={`${r._id}-exp`} className={styles.expandedRow}>
                        <td colSpan={7}>
                          <div className={styles.expandedContent}>
                            {r.title && <p className={styles.expandedTitle}>{r.title}</p>}
                            <p className={styles.expandedComment}>{r.comment || 'No comment provided.'}</p>
                            {r.flag_reason && <p className={styles.expandedFlag}>Flag reason: {r.flag_reason}</p>}
                            <p className={styles.expandedMeta}>User ID: {r.user_id} · Company ID: {r.company_id}</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className={styles.pagination}>
              <button disabled={page <= 1} onClick={() => fetchReviews(page - 1)}>← Prev</button>
              <span>Page {page} of {pages}</span>
              <button disabled={page >= pages} onClick={() => fetchReviews(page + 1)}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ── Main Reviews page ─────────────────────────────────────────────────────────

const Reviews = () => {
  const [view,       setView]       = useState('leaderboard');
  const [stats,      setStats]      = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const navigate = useNavigate();
  const token    = localStorage.getItem('adminToken');

  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const res = await fetch('/api/reviews/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setStats(await res.json());
      } catch { /* non-critical */ }
      finally { setStatsLoading(false); }
    };
    fetchStats();
  }, [token]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Reviews</h1>
          <p className={styles.subtitle}>Monitor company performance and moderate customer feedback</p>
        </div>
        {/* View toggle */}
        <div className={styles.viewToggle}>
          <button className={`${styles.toggleBtn} ${view === 'leaderboard' ? styles.toggleActive : ''}`}
            onClick={() => setView('leaderboard')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            Leaderboard
          </button>
          <button className={`${styles.toggleBtn} ${view === 'moderation' ? styles.toggleActive : ''}`}
            onClick={() => setView('moderation')}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
            Moderation
          </button>
        </div>
      </header>

      {view === 'leaderboard'
        ? <LeaderboardView stats={stats} loading={statsLoading} />
        : <ModerationView token={token} navigate={navigate} />
      }
    </div>
  );
};

export default Reviews;
