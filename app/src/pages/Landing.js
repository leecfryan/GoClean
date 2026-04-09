import { useState } from 'react';
import Logo from '../components/Logo';
import AuthForm from '../components/AuthForm';
import Illustration from '../components/Illustration';
import InfoSection from '../components/InfoSection';
import styles from './Landing.module.css';

const Landing = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const isLogin = mode === 'login';

  const toggle = () => setMode(isLogin ? 'signup' : 'login');

  return (
    <div className={styles.page}>
      {/* ── Hero (split screen) ── */}
      <section className={`${styles.hero} ${isLogin ? styles.loginLayout : styles.signupLayout}`}>

        {/* Left form slot — shows login form */}
        <div className={styles.formPanel}>
          <div className={`${styles.formContent} ${isLogin ? styles.visible : styles.hidden}`}>
            <AuthForm mode="login" onToggle={toggle} />
          </div>
        </div>

        {/* Sliding illustrated panel */}
        <div className={styles.illustrationPanel}>
          <div className={styles.illustrationInner}>
            <Logo size={40} light />
            <div className={styles.illustrationArt}>
              <Illustration />
            </div>
            <div className={styles.illustrationCopy}>
              <h1 className={styles.heroHeading}>
                {isLogin ? 'Good to see you again.' : 'A cleaner home awaits.'}
              </h1>
              <p className={styles.heroSub}>
                {isLogin
                  ? 'Your bookings, your cleaners, all in one place.'
                  : 'Connect with trusted cleaning professionals near you.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right form slot — shows signup form */}
        <div className={styles.formPanel}>
          <div className={`${styles.formContent} ${isLogin ? styles.hidden : styles.visible}`}>
            <AuthForm mode="signup" onToggle={toggle} />
          </div>
        </div>

      </section>

      {/* ── Info section ── */}
      <InfoSection />
    </div>
  );
};

export default Landing;
