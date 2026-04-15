import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';

const icons = {
  overview: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  companies: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  reviews: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
};

const collapseIcon = (collapsed) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {collapsed
      ? <><polyline points="9 18 15 12 9 6"/><line x1="4" y1="12" x2="14" y2="12"/></>
      : <><polyline points="15 18 9 12 15 6"/><line x1="20" y1="12" x2="10" y2="12"/></>
    }
  </svg>
);

const NAV = [
  { label: 'Overview',  path: '/dashboard', key: 'overview' },
  { label: 'Users',     path: '/users',      key: 'users' },
  { label: 'Companies', path: '/companies',  key: 'companies' },
  { label: 'Reviews',   path: '/reviews',    key: 'reviews' },
];

const Sidebar = ({ collapsed, mobileOpen, onToggleCollapse, onMobileClose }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (path) =>
    path === '/dashboard'
      ? pathname === '/dashboard' || pathname === '/'
      : pathname.startsWith(path);

  const handleNav = (path) => {
    navigate(path);
    onMobileClose(); // close mobile drawer on navigate
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  const sidebarClass = [
    styles.sidebar,
    collapsed  ? styles.collapsed   : '',
    mobileOpen ? styles.mobileOpen  : '',
  ].filter(Boolean).join(' ');

  return (
    <aside className={sidebarClass}>
      {/* ── Brand ── */}
      <div className={styles.brand}>
        <div className={styles.logo}>
          Go<span>Clean</span>
        </div>
        <p className={styles.badge}>Admin Portal</p>
      </div>

      {/* ── Nav ── */}
      <nav className={styles.nav}>
        {NAV.map(({ label, path, key }) => (
          <button
            key={path}
            className={`${styles.navItem} ${isActive(path) ? styles.active : ''}`}
            onClick={() => handleNav(path)}
            title={collapsed ? label : undefined}
          >
            <span className={styles.icon}>{icons[key]}</span>
            <span className={styles.label}>{label}</span>
          </button>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className={styles.footer}>
        {/* Collapse toggle — desktop only */}
        <button
          className={styles.collapseBtn}
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className={styles.icon}>{collapseIcon(collapsed)}</span>
          <span className={styles.label}>{collapsed ? 'Expand' : 'Collapse'}</span>
        </button>

        <button className={styles.logout} onClick={handleLogout} title="Sign out">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span className={styles.label}>Sign out</span>
        </button>
      </div>

      {/* ── Mobile close button ── */}
      <button className={styles.mobileClose} onClick={onMobileClose} aria-label="Close navigation">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </aside>
  );
};

export default Sidebar;
