import styles from './CompanyDetailPanel.module.css';

const Field = ({ label, value }) => (
  <div className={styles.field}>
    <p className={styles.fieldLabel}>{label}</p>
    <p className={styles.fieldValue}>{value || '—'}</p>
  </div>
);

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

const CompanyDetailPanel = ({ company: c, onClose, onStatusChange, onDelete, actionLoading }) => {
  const busy = actionLoading === c._id;

  const fmt = (d) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} />

      {/* Panel */}
      <aside className={styles.panel}>
        {/* Panel header */}
        <div className={styles.panelHeader}>
          <div>
            <h2 className={styles.panelTitle}>{c.name}</h2>
            <StatusBadge status={c.status} />
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className={styles.body}>
          {/* Contact & identity */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Business Identity</h3>
            <div className={styles.grid2}>
              <Field label="License Number" value={c.license_number} />
              <Field label="Tier"           value={c.tier} />
              <Field label="Contact Email"  value={c.email} />
              <Field label="Phone"          value={c.phone} />
            </div>
          </section>

          {/* Location */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Location</h3>
            <div className={styles.grid2}>
              <Field label="Address" value={c.address} />
              <Field label="City"    value={c.city} />
              <Field label="Country" value={c.country} />
            </div>
          </section>

          {/* Services */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Services Offered</h3>
            {c.services?.length > 0 ? (
              <div className={styles.tagRow}>
                {c.services.map((s) => (
                  <span key={s} className={styles.tag}>{s}</span>
                ))}
              </div>
            ) : (
              <p className={styles.none}>No services listed</p>
            )}
          </section>

          {/* Description */}
          {c.description && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>Description</h3>
              <p className={styles.description}>{c.description}</p>
            </section>
          )}

          {/* Meta */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Account Info</h3>
            <div className={styles.grid2}>
              <Field label="Owner ID"   value={c.owner_id} />
              <Field label="Registered" value={fmt(c.created_at)} />
              <Field label="Updated"    value={fmt(c.updated_at)} />
            </div>
          </section>
        </div>

        {/* Actions footer */}
        <div className={styles.footer}>
          {c.status === 'pending' && (
            <button
              className={`${styles.footerBtn} ${styles.btnApprove}`}
              disabled={busy}
              onClick={() => onStatusChange(c, 'active')}
            >
              {busy ? 'Working…' : '✓ Approve Company'}
            </button>
          )}
          {c.status === 'active' && (
            <button
              className={`${styles.footerBtn} ${styles.btnSuspend}`}
              disabled={busy}
              onClick={() => onStatusChange(c, 'suspended')}
            >
              {busy ? 'Working…' : '⊘ Suspend Company'}
            </button>
          )}
          {c.status === 'suspended' && (
            <button
              className={`${styles.footerBtn} ${styles.btnReinstate}`}
              disabled={busy}
              onClick={() => onStatusChange(c, 'active')}
            >
              {busy ? 'Working…' : '↩ Reinstate Company'}
            </button>
          )}
          <button
            className={`${styles.footerBtn} ${styles.btnDelete}`}
            disabled={busy}
            onClick={() => onDelete(c._id)}
          >
            Delete
          </button>
        </div>
      </aside>
    </>
  );
};

export default CompanyDetailPanel;
