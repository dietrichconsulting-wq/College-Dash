import { motion } from 'framer-motion';

export default function Timeline({ milestones }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-8"
    >
      <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-primary)' }}>Your Journey</h2>
      <div className="bg-card rounded-xl p-6 shadow-sm border border-gray-100 overflow-x-auto">
        <div className="flex items-center min-w-[800px]">
          {milestones.map((m, i) => (
            <div key={m.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center relative group">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    m.reached
                      ? 'bg-success text-white shadow-md shadow-success/30'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {m.reached ? '\u2713' : i + 1}
                </motion.div>
                <div className="mt-2 text-center">
                  <div className={`text-[10px] font-semibold leading-tight ${
                    m.reached ? 'text-success' : 'text-text-muted'
                  }`}>
                    {m.label}
                  </div>
                  {m.reachedAt && (
                    <div className="text-[9px] text-text-muted mt-0.5">
                      {new Date(m.reachedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  )}
                </div>
              </div>
              {i < milestones.length - 1 && (
                <div className={`flex-1 h-1 mx-1 rounded-full transition-colors ${
                  m.reached ? 'bg-success' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
