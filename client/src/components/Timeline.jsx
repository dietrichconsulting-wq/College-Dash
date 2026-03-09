import { motion } from 'framer-motion';

export default function Timeline({ milestones }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-10"
    >
      <h2
        className="font-semibold mb-5"
        style={{
          fontSize: 'var(--font-size-section-header)',
          color: 'var(--color-primary)',
        }}
      >
        Your Journey
      </h2>
      <div className="card-elevated p-6 overflow-x-auto">
        <div className="flex items-center min-w-[800px]">
          {milestones.map((m, i) => (
            <div key={m.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center relative group">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold transition-all ${m.reached
                    ? 'bg-success text-white shadow-md shadow-success/30'
                    : 'bg-gray-200 text-gray-500'
                    }`}
                  style={{ fontSize: 'var(--font-size-micro)' }}
                >
                  {m.reached ? '✓' : i + 1}
                </motion.div>
                <div className="mt-2.5 text-center">
                  <div
                    className={`font-semibold leading-tight ${m.reached ? 'text-success' : 'text-text-muted'
                      }`}
                    style={{ fontSize: 'var(--font-size-micro)' }}
                  >
                    {m.label}
                  </div>
                  {m.reachedAt && (
                    <div
                      className="text-text-muted mt-0.5 font-medium"
                      style={{ fontSize: '9px' }}
                    >
                      {new Date(m.reachedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  )}
                </div>
              </div>
              {i < milestones.length - 1 && (
                <div className={`flex-1 h-1 mx-1 rounded-full transition-colors ${m.reached ? 'bg-success' : 'bg-gray-200'
                  }`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
