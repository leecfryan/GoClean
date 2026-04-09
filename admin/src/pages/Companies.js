import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Companies.module.css';
import CompanyDetailPanel from '../components/CompanyDetailPanel';

const STATUS_TABS = [
  { key: 'all',       label: 'All' },
  { key: 'pending',   label: 'Pending' },
  { key: 'active',    label: 'Active' },
  { key: 'suspended', label: 'Suspended' },
];

const StatusBadge = ({ status }) => {
  const map = {
    pending:   styles.statusPending,
    active:    styles.statusActive,
    suspended: styles.statusSuspended,
  };
  return (
    <span className={`${styles.badge} ${map[status] ?? ''}`}>
      <span className={styles.dot} /> {status}
    </span>
  );
};

const ServiceTags = ({ services = [] }) => {
  const shown  = services.slice(0, 2);
  const extra  = services.length - shown.length;
  return (
    <div className={styles.tags}>
      {shown.map((s) => <span key={s} className={styles.tag}>{s}</span>)}
      {extra > 0 && <span className={styles.tagMore}>+{extra}</span>}
      {services.length === 0 && <span className={styles.muted}>—</span>}
    </div>
  );
};

const Companies = () => {
  const [companies,      setCompanies]      = useState([]);
  const [counts,         setCounts]         = useState({ all: 0, pending: 0, active: 0, suspended: 0 });
  const [page,           setPage]           = useState(1);
  const [pages,          setPages]          = useState(1);
  const [activeFilter,   setActiveFilter]   = useState('all');
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState('');
  const [actionLoading,  setActionLoading]  = useState(null); // company _id being actioned
  const [confirmDelete,  setConfirmDelete]  = useState(null); // company _id awaiting confirm
  const [selectedCompany, setSelectedCompany] = useState(null);

  const navigate = useNavigate();
  const token    = localStorage.getItem('adminToken');
  const headers  = { Authorization: `Bearer ${token}` };

  // ── Fetch companies list ───────────────────────────────────────────────────
  const fetchCompanies = useCallback(async (p = 1, filter = activeFilter) => {
    setLoading(true);
    setError('');
    try {
      const statusParam = filter !== 'all' ? `&status=${filter}` : '';
      const res = await fetch(`/api/companies?page=${p}&limit=20${statusParam}`, { headers });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('adminToken');
        navigate('/login');
        return;
      }
      if (!res.ok) { setError('Failed to load companies.'); return; }

      const data = await res.json();
      setCompanies(data.companies ?? []);
      setPage(data.page ?? 1);
      setPages(data.pages ?? 1);
    } catch {
      setError('Failed to load companies.');
    } finally {
      setLoading(false);
    }
  }, [token, navigate, activeFilter]); // eslint-disable-line

  // ── Fetch counts for all status tabs ──────────────────────────────────────
  const fetchCounts = useCallback(async () => {
    try {
      const [all, pending, active, suspended] = await Promise.all([
        fetch('/api/companies?limit=1',                    { headers }).then(r => r.json()),
        fetch('/api/companies?limit=1&status=pending',     { headers }).then(r => r.json()),
        fetch('/api/companies?limit=1&status=active',      { headers }).then(r => r.json()),
        fetch('/api/companies?limit=1&status=suspended',   { headers }).then(r => r.json()),
      ]);
      setCounts({
        all:       all.total       ?? 0,
        pending:   pending.total   ?? 0,
        active:    active.total    ?? 0,
        suspended: suspended.total ?? 0,
      });
    } catch { /* counts are non-critical */ }
  }, [token]); // eslint-disable-line

  useEffect(() => {
    fetchCounts();
    fetchCompanies(1, activeFilter);
  }, [activeFilter]); // eslint-disable-line

  // ── Switch filter tab ──────────────────────────────────────────────────────
  const handleFilterChange = (key) => {
    setActiveFilter(key);
    setPage(1);
    setConfirmDelete(null);
  };

  // ── Update company status ──────────────────────────────────────────────────
  const handleStatusChange = async (company, newStatus) => {
    setActionLoading(company._id);
    try {
      const res = await fetch(`/api/companies/${company._id}/status`, {
        method:  'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();

      // Optimistic: update row in list
      setCompanies((prev) =>
        prev.map((c) => c._id === company._id ? { ...c, status: newStatus } : c)
      );
      // Refresh selected panel if open
      if (selectedCompany?._id === company._id) {
        setSelectedCompany((prev) => ({ ...prev, status: newStatus }));
      }
      fetchCounts();
    } catch {
      setError('Failed to update company status.');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Delete company ─────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/companies/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (!res.ok) throw new Error();

      setCompanies((prev) => prev.filter((c) => c._id !== id));
      setConfirmDelete(null);
      if (selectedCompany?._id === id) setSelectedCompany(null);
      fetchCounts();
    } catch {
      setError('Failed to delete company.');
    } finally {
      setActionLoading(null);
    }
  };

  const busy = (id) => actionLoading === id;

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Companies</h1>
          <p className={styles.subtitle}>Manage and oversee all registered cleaning businesses</p>
        </div>
      </header>

      {/* Stat chips */}
      <div className={styles.statRow}>
        <div className={styles.statChip}>
          <span className={styles.statNum}>{counts.all}</span>
          <span className={styles.statLabel}>Total</span>
        </div>
        <div className={`${styles.statChip} ${styles.chipPending}`}>
          <span className={styles.statNum}>{counts.pending}</span>
          <span className={styles.statLabel}>Awaiting approval</span>
        </div>
        <div className={`${styles.statChip} ${styles.chipActive}`}>
          <span className={styles.statNum}>{counts.active}</span>
          <span className={styles.statLabel}>Active</span>
        </div>
        <div className={`${styles.statChip} ${styles.chipSuspended}`}>
          <span className={styles.statNum}>{counts.suspended}</span>
          <span className={styles.statLabel}>Suspended</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className={styles.tabs}>
        {STATUS_TABS.map(({ key, label }) => (
          <button
            key={key}
            className={`${styles.tab} ${activeFilter === key ? styles.tabActive : ''}`}
            onClick={() => handleFilterChange(key)}
          >
            {label}
            {counts[key] > 0 && (
              <span className={`${styles.tabCount} ${activeFilter === key ? styles.tabCountActive : ''}`}>
                {counts[key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className={styles.errorBox}>
          <span>{error}</span>
          <button onClick={() => setError('')}>✕</button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          Loading companies…
        </div>
      ) : companies.length === 0 ? (
        <div className={styles.empty}>
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <p>No {activeFilter !== 'all' ? activeFilter : ''} companies found</p>
        </div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>License No.</th>
                  <th>Services</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr
                    key={c._id}
                    className={`${styles.row} ${selectedCompany?._id === c._id ? styles.rowSelected : ''}`}
                  >
                    {/* Company + location */}
                    <td>
                      <p className={styles.companyName}>{c.name}</p>
                      <p className={styles.companyLocation}>{[c.city, c.country].filter(Boolean).join(', ') || '—'}</p>
                    </td>

                    <td className={styles.mono}>{c.license_number}</td>

                    <td><ServiceTags services={c.services} /></td>

                    <td><StatusBadge status={c.status} /></td>

                    <td className={styles.muted}>
                      {c.created_at ? new Date(c.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>

                    {/* Actions */}
                    <td>
                      {confirmDelete === c._id ? (
                        <div className={styles.confirmRow}>
                          <span className={styles.confirmText}>Delete?</span>
                          <button
                            className={styles.btnDangerSm}
                            disabled={busy(c._id)}
                            onClick={() => handleDelete(c._id)}
                          >
                            {busy(c._id) ? '…' : 'Yes'}
                          </button>
                          <button
                            className={styles.btnGhostSm}
                            onClick={() => setConfirmDelete(null)}
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <div className={styles.actions}>
                          {/* View details */}
                          <button
                            className={styles.btnIcon}
                            title="View details"
                            onClick={() => setSelectedCompany(c)}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          </button>

                          {/* Approve (pending only) */}
                          {c.status === 'pending' && (
                            <button
                              className={`${styles.btnSm} ${styles.btnApprove}`}
                              disabled={busy(c._id)}
                              onClick={() => handleStatusChange(c, 'active')}
                            >
                              {busy(c._id) ? '…' : 'Approve'}
                            </button>
                          )}

                          {/* Suspend (active only) */}
                          {c.status === 'active' && (
                            <button
                              className={`${styles.btnSm} ${styles.btnSuspend}`}
                              disabled={busy(c._id)}
                              onClick={() => handleStatusChange(c, 'suspended')}
                            >
                              {busy(c._id) ? '…' : 'Suspend'}
                            </button>
                          )}

                          {/* Reinstate (suspended only) */}
                          {c.status === 'suspended' && (
                            <button
                              className={`${styles.btnSm} ${styles.btnReinstate}`}
                              disabled={busy(c._id)}
                              onClick={() => handleStatusChange(c, 'active')}
                            >
                              {busy(c._id) ? '…' : 'Reinstate'}
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            className={styles.btnIcon}
                            title="Delete company"
                            onClick={() => setConfirmDelete(c._id)}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                              <path d="M10 11v6M14 11v6"/>
                              <path d="M9 6V4h6v2"/>
                            </svg>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className={styles.pagination}>
              <button disabled={page <= 1} onClick={() => fetchCompanies(page - 1)}>← Prev</button>
              <span>Page {page} of {pages}</span>
              <button disabled={page >= pages} onClick={() => fetchCompanies(page + 1)}>Next →</button>
            </div>
          )}
        </>
      )}

      {/* Detail panel */}
      {selectedCompany && (
        <CompanyDetailPanel
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
          onStatusChange={handleStatusChange}
          onDelete={(id) => { setConfirmDelete(id); setSelectedCompany(null); }}
          actionLoading={actionLoading}
        />
      )}
    </div>
  );
};

export default Companies;
