/* Apartment / cleaning themed SVG illustration */
const Illustration = () => (
  <svg viewBox="0 0 420 480" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxWidth: 380 }}>
    {/* Building */}
    <rect x="80" y="120" width="260" height="300" rx="6" fill="#ffffff" fillOpacity="0.15" />
    <rect x="80" y="120" width="260" height="300" rx="6" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1.5" />

    {/* Roof */}
    <path d="M70 124 L210 60 L350 124Z" fill="#ffffff" fillOpacity="0.2" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1.5" />

    {/* Windows row 1 */}
    <rect x="110" y="160" width="55" height="50" rx="4" fill="#ffffff" fillOpacity="0.25" />
    <rect x="183" y="160" width="55" height="50" rx="4" fill="#ffffff" fillOpacity="0.25" />
    <rect x="256" y="160" width="55" height="50" rx="4" fill="#ffffff" fillOpacity="0.25" />

    {/* Window glow */}
    <rect x="110" y="160" width="55" height="50" rx="4" fill="#f59e0b" fillOpacity="0.2" />
    <rect x="256" y="160" width="55" height="50" rx="4" fill="#f59e0b" fillOpacity="0.2" />

    {/* Windows row 2 */}
    <rect x="110" y="230" width="55" height="50" rx="4" fill="#ffffff" fillOpacity="0.15" />
    <rect x="183" y="230" width="55" height="50" rx="4" fill="#ffffff" fillOpacity="0.25" />
    <rect x="256" y="230" width="55" height="50" rx="4" fill="#ffffff" fillOpacity="0.15" />

    {/* Door */}
    <rect x="172" y="330" width="76" height="90" rx="4" fill="#ffffff" fillOpacity="0.2" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1.5" />
    <circle cx="238" cy="378" r="4" fill="#f59e0b" fillOpacity="0.9" />

    {/* Steps */}
    <rect x="155" y="418" width="110" height="8" rx="2" fill="#ffffff" fillOpacity="0.2" />
    <rect x="168" y="425" width="84" height="6" rx="2" fill="#ffffff" fillOpacity="0.15" />

    {/* Broom character */}
    <circle cx="340" cy="300" r="28" fill="#ffffff" fillOpacity="0.15" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1.5" />
    <line x1="340" y1="285" x2="330" y2="315" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M326 313 Q330 309 334 313 Q338 317 332 318 Q326 319 326 313Z" fill="#ffffff" fillOpacity="0.8" />
    {/* Sparkles around broom */}
    <circle cx="358" cy="288" r="2" fill="#f59e0b" />
    <circle cx="364" cy="296" r="1.5" fill="#f59e0b" />
    <circle cx="355" cy="278" r="1.5" fill="#f59e0b" />

    {/* Ground */}
    <rect x="40" y="430" width="340" height="6" rx="3" fill="#ffffff" fillOpacity="0.2" />

    {/* Trees */}
    <rect x="55" y="370" width="8" height="65" rx="2" fill="#ffffff" fillOpacity="0.3" />
    <circle cx="59" cy="355" r="22" fill="#ffffff" fillOpacity="0.15" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />
    <rect x="360" y="390" width="8" height="46" rx="2" fill="#ffffff" fillOpacity="0.3" />
    <circle cx="364" cy="375" r="18" fill="#ffffff" fillOpacity="0.15" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />

    {/* Floating bubbles (cleaning feel) */}
    <circle cx="60" cy="180" r="10" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1.5" fill="none" />
    <circle cx="50" cy="220" r="6" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1" fill="none" />
    <circle cx="370" cy="200" r="8" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1.5" fill="none" />
    <circle cx="385" cy="240" r="5" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1" fill="none" />
  </svg>
);

export default Illustration;
