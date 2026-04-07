import styles from './InfoSection.module.css';

const features = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" stroke="#0d9488" strokeWidth="1.5" />
        <path d="M8 14.5L12 18.5L20 10" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Vetted Professionals',
    desc: 'Every cleaning company on GoClean is background-checked, insured, and rated by real customers.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="6" width="20" height="16" rx="3" stroke="#0d9488" strokeWidth="1.5" />
        <path d="M4 11H24" stroke="#0d9488" strokeWidth="1.5" />
        <circle cx="9" cy="17" r="1.5" fill="#0d9488" />
        <circle cx="14" cy="17" r="1.5" fill="#0d9488" />
      </svg>
    ),
    title: 'Easy Booking',
    desc: 'Book a one-time clean or a recurring schedule in minutes. No phone calls, no paperwork.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 4L16.5 10H23L18 14L20 20L14 16.5L8 20L10 14L5 10H11.5L14 4Z" stroke="#0d9488" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Satisfaction Guarantee',
    desc: "Not happy? We'll arrange a re-clean at no extra cost. Your space, your standards.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 4C9.6 4 6 7.6 6 12C6 18 14 24 14 24C14 24 22 18 22 12C22 7.6 18.4 4 14 4Z" stroke="#0d9488" strokeWidth="1.5" />
        <circle cx="14" cy="12" r="3" stroke="#0d9488" strokeWidth="1.5" />
      </svg>
    ),
    title: 'Local & Nationwide',
    desc: 'Whether you\'re in a studio apartment or a large home, find cleaners near you in seconds.',
  },
];

const steps = [
  { number: '01', title: 'Enter your address', desc: 'Tell us where you need cleaning and when.' },
  { number: '02', title: 'Compare companies', desc: 'Browse ratings, prices, and specialisations.' },
  { number: '03', title: 'Book & pay securely', desc: 'Confirm your booking with secure online payment.' },
  { number: '04', title: 'Enjoy a clean space', desc: 'Sit back while the pros take care of everything.' },
];

const InfoSection = () => (
  <div className={styles.wrapper}>

    {/* Value props */}
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.pill}>Why GoClean</span>
        <h2 className={styles.heading}>The smarter way to keep your home spotless</h2>
        <p className={styles.lead}>
          GoClean connects apartment residents and homeowners with trusted, local cleaning companies —
          all in one place. No more searching, no more surprises.
        </p>
      </div>
      <div className={styles.grid}>
        {features.map((f) => (
          <div key={f.title} className={styles.card}>
            <div className={styles.cardIcon}>{f.icon}</div>
            <h3 className={styles.cardTitle}>{f.title}</h3>
            <p className={styles.cardDesc}>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* How it works */}
    <section className={styles.howSection}>
      <div className={styles.sectionHeader}>
        <span className={styles.pill}>How it works</span>
        <h2 className={styles.heading}>Clean home in four steps</h2>
      </div>
      <div className={styles.steps}>
        {steps.map((s, i) => (
          <div key={s.number} className={styles.step}>
            <div className={styles.stepNumber}>{s.number}</div>
            {i < steps.length - 1 && <div className={styles.stepLine} />}
            <h4 className={styles.stepTitle}>{s.title}</h4>
            <p className={styles.stepDesc}>{s.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* CTA banner */}
    <section className={styles.cta}>
      <h2>Ready for a cleaner home?</h2>
      <p>Join thousands of residents who trust GoClean every week.</p>
      <button className={styles.ctaBtn}>Get started free</button>
    </section>

    {/* Footer */}
    <footer className={styles.footer}>
      <span>© {new Date().getFullYear()} GoClean. All rights reserved.</span>
      <span>Connecting homes with trusted cleaners.</span>
    </footer>
  </div>
);

export default InfoSection;
