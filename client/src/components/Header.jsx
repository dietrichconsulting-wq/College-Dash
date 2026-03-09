import { motion } from 'framer-motion';

export default function Header({ profile, onToggleChat }) {
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
          <span className="header-bar__welcome">
            Welcome, {profile.displayName}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {profile?.schools?.[0]?.name && (
          <span className="header-bar__school-badge">
            #1: {profile.schools[0].name}
          </span>
        )}
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
