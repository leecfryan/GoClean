import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Users.module.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  const fetchUsers = useCallback(async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/users?page=${p}&limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('adminToken');
        navigate('/login');
        return;
      }
      const data = await res.json();
      setUsers(data.users);
      setTotal(data.total);
      setPage(data.page);
      setPages(data.pages);
    } catch {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => { fetchUsers(1); }, [fetchUsers]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Users</h1>
          <p className={styles.subtitle}>{total > 0 ? `${total.toLocaleString()} total accounts` : ' '}</p>
        </div>
      </header>

      {error && <p className={styles.error}>{error}</p>}

      {loading ? (
        <p className={styles.loading}>Loading…</p>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Age</th>
                  <th>Address</th>
                  <th>Tier</th>
                  <th>Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className={styles.muted}>{u.id}</td>
                    <td className={styles.email}>{u.email}</td>
                    <td>{u.age ?? '—'}</td>
                    <td className={styles.address}>{u.address ?? '—'}</td>
                    <td><span className={`${styles.badge} ${styles[u.tier]}`}>{u.tier}</span></td>
                    <td><span className={`${styles.badge} ${u.role === 'admin' ? styles.badgeAdmin : styles.badgeUser}`}>{u.role}</span></td>
                    <td className={styles.muted}>{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className={styles.pagination}>
              <button disabled={page <= 1} onClick={() => fetchUsers(page - 1)}>← Prev</button>
              <span>Page {page} of {pages}</span>
              <button disabled={page >= pages} onClick={() => fetchUsers(page + 1)}>Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Users;
