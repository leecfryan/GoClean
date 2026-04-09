const Logo = ({ size = 36, light = false }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="36" rx="10" fill={light ? '#ffffff' : '#0d9488'} />
      {/* Broom handle */}
      <line x1="22" y1="8" x2="12" y2="28" stroke={light ? '#0d9488' : '#ffffff'} strokeWidth="2.5" strokeLinecap="round" />
      {/* Broom head */}
      <path d="M9 26 Q12 22 15 26 Q18 30 12 30 Q6 30 9 26Z" fill={light ? '#0d9488' : '#ffffff'} />
      {/* Sparkle */}
      <circle cx="26" cy="12" r="1.5" fill={light ? '#f59e0b' : '#f59e0b'} />
      <circle cx="29" cy="8" r="1" fill={light ? '#f59e0b' : '#f59e0b'} />
      <circle cx="23" cy="7" r="1" fill={light ? '#f59e0b' : '#f59e0b'} />
    </svg>
    <span style={{
      fontSize: size * 0.6,
      fontWeight: 800,
      letterSpacing: '-0.5px',
      color: light ? '#ffffff' : '#0f172a',
    }}>
      Go<span style={{ color: light ? '#f59e0b' : '#0d9488' }}>Clean</span>
    </span>
  </div>
);

export default Logo;
