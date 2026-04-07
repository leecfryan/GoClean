import Sidebar from './Sidebar';
import styles from './Layout.module.css';

const Layout = ({ children }) => (
  <div className={styles.layout}>
    <Sidebar />
    <main className={styles.main}>{children}</main>
  </div>
);

export default Layout;
