import { motion } from 'framer-motion';

export default function Header({ profile, onToggleChat }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-navy text-white px-6 py-4 flex items-center justify-between shadow-lg"
    >
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold tracking-tight">College Dashboard</h1>
        {profile?.displayName && (
          <span className="text-sm text-blue-200">Welcome, {profile.displayName}</span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {profile?.schools?.[0]?.name && (
          <span className="bg-gold/20 text-gold-light text-xs font-semibold px-3 py-1 rounded-full">
            #1: {profile.schools[0].name}
          </span>
        )}
        <button
          onClick={onToggleChat}
          className="bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          AI Advisor
        </button>
      </div>
    </motion.header>
  );
}
