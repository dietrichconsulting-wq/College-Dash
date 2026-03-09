import { motion } from 'framer-motion';

export default function Header({ profile, onToggleChat }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-navy text-white px-6 py-5 flex items-center justify-between shadow-lg"
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
          <span
            className="text-blue-200 font-medium"
            style={{ fontSize: 'var(--font-size-small)' }}
          >
            Welcome, {profile.displayName}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {profile?.schools?.[0]?.name && (
          <span
            className="bg-gold/20 text-gold-light font-semibold px-3 py-1 rounded-full"
            style={{ fontSize: 'var(--font-size-micro)' }}
          >
            #1: {profile.schools[0].name}
          </span>
        )}
        <button
          onClick={onToggleChat}
          className="bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2 rounded-lg transition-colors"
          style={{ fontSize: 'var(--font-size-small)' }}
        >
          AI Advisor
        </button>
      </div>
    </motion.header>
  );
}
