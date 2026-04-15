import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import styles from './Layout.module.css';

const COLLAPSE_KEY = 'adminSidebarCollapsed';

const Layout = ({ children }) => {
  const [collapsed,   setCollapsed]   = useState(() => {
    try { return localStorage.getItem(COLLAPSE_KEY) === 'true'; } catch { return false; }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer whenever the route changes
  useLocation(); // re-render on navigate; sidebar closes via onMobileClose passed down

  const toggleCollapse = () => {
    setCollapsed(prev => {
      const next = !prev;
      try { localStorage.setItem(COLLAPSE_KEY, String(next)); } catch {}
      return next;
    });
  };

  return (
    <div className={styles.layout}>
      {/* ── Mobile top bar ── */}
      <header className={styles.topBar}>
        <button
          className={styles.hamburger}
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
        >
          <span /><span /><span />
        </button>
        <span className={styles.topBarBrand}>Go<em>Clean</em></span>
        <span className={styles.topBarLabel}>Admin Portal</span>
      </header>

      {/* ── Mobile backdrop ── */}
      {mobileOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={toggleCollapse}
        onMobileClose={() => setMobileOpen(false)}
      />

      <main className={`${styles.main} ${collapsed ? styles.mainCollapsed : ''}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
