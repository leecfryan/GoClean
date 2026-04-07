import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Reviews.module.css';

const Stars = ({ rating }) => (
  <span className={styles.stars}>
    {[1, 2, 3, 4, 5].map((n) => (
      <svg
        key={n}
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={n <= rating ? '#f59e0b' : 'none'}
        stroke={n <= rating ? '#f59e0b' : '#cbd5e1'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ))}
  </span>
);

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  const fetchReviews = useCallback(async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/reviews?page=${p}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('adminToken');
        navigate('/login');
        return;
      }
      if (!res.ok) {
        setError('Reviews endpoint not available yet.');
        setLoading(false);
        return;
      }
      const data = await res.json();
      setReviews(data.reviews ?? []);
      setTotal(data.total ?? 0);
      setPage(data.page ?? 1);
      setPages(data.pages ?? 1);
    } catch {
      setError('Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => { fetchReviews(1); }, [fetchReviews]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Reviews</h1>
          <p className={styles.subtitle}>{total > 0 ? `${total.toLocaleString()} customer reviews` : ' '}</p>
        </div>
      </header>

      {error && <p className={styles.error}>{error}</p>}

      {loading ? (
        <p className={styles.loading}>Loading…</p>
      ) : reviews.length === 0 && !error ? (
        <div className={styles.empty}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          <p>No reviews found</p>
        </div>
      ) : reviews.length > 0 && (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Reviewer</th>
                  <th>Company</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r.id}>
                    <td className={styles.email}>{r.user_email ?? r.reviewer ?? '—'}</td>
                    <td className={styles.company}>{r.company_name ?? r.company ?? '—'}</td>
                    <td><Stars rating={r.rating ?? 0} /></td>
                    <td className={styles.comment}>{r.comment ? `${r.comment.slice(0, 60)}${r.comment.length > 60 ? '…' : ''}` : <span className={styles.muted}>No comment</span>}</td>
                    <td>
                      <span className={`${styles.badge} ${r.flagged ? styles.flagged : styles.published}`}>
                        {r.flagged ? 'Flagged' : 'Published'}
                      </span>
                    </td>
                    <td className={styles.muted}>
                      {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
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

export default Reviews;
