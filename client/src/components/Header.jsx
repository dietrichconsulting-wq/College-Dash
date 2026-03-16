import { motion } from 'framer-motion';

export default function Header({ profile, onToggleChat, dark, onToggleDark }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="header-bar"
    >
      <div className="flex items-center gap-4">
        <h1
          className="font-bold tracking-tight"
          style={{
            fontSize: 'var(--font-size-page-title)',
            lineHeight: 'var(--line-height-tight)',
          }}
        >
          College Dashboard
        </h1>
        {profile?.displayName && (
          <div>
            <span className="header-bar__welcome">
              Welcome, {profile.displayName}
            </span>
            <p style={{ fontSize: 'var(--font-size-micro)', color: 'var(--color-text-muted)', margin: 0, marginTop: 2 }}>
              Change your GPA, SAT, major, and schools to check your chance of getting in.
            </p>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        {profile?.schools?.[0]?.name && (
          <span className="header-bar__school-badge">
            #1: {profile.schools[0].name}
          </span>
        )}
        <button
          onClick={onToggleDark}
          className="header-bar__action-btn"
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{ padding: '0.45rem 0.65rem' }}
        >
          {dark ? (
            /* Sun icon */
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            /* Moon icon */
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
        <button
          onClick={onToggleChat}
          className="header-bar__action-btn"
        >
          AI Advisor
        </button>
      </div>
    </motion.header>
  );
}
