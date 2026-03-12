import { motion } from 'framer-motion';
import { SkeletonCircle, SkeletonLine } from './Skeleton';

function TimelineSkeleton() {
  return (
    <div className="mt-10">
      <div className="skeleton" style={{ width: 120, height: 20, borderRadius: 6, marginBottom: 20 }} />
      <div className="card-elevated p-6 overflow-x-auto">
        <div className="flex items-center min-w-[800px]" style={{ gap: 0 }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center" style={{ gap: 10 }}>
                <SkeletonCircle size={36} />
                <SkeletonLine width={56} height={10} />
              </div>
              {i < 9 && (
                <div className="flex-1 mx-1 skeleton" style={{ height: 4, borderRadius: 999 }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Timeline({ milestones, loading }) {
  if (loading) return <TimelineSkeleton />;
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
                {/* Milestone node */}
                <div style={{ position: 'relative' }}>
                  {/* Ripple pulse on completed nodes */}
                  {m.reached && (
                    <motion.div
                      style={{
                        position: 'absolute',
                        inset: -4,
                        borderRadius: '50%',
                        background: 'var(--color-success)',
                        opacity: 0,
                      }}
                      animate={{ scale: [1, 1.8], opacity: [0.35, 0] }}
                      transition={{
                        delay: i * 0.12 + 0.6,
                        duration: 0.8,
                        ease: 'easeOut',
                      }}
                    />
                  )}
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      delay: i * 0.08 + 0.1,
                      type: 'spring',
                      stiffness: 380,
                      damping: 20,
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold ${
                      m.reached
                        ? 'text-white'
                        : 'text-gray-500'
                    }`}
                    style={{
                      fontSize: 'var(--font-size-micro)',
                      background: m.reached
                        ? 'var(--color-success)'
                        : 'rgba(148,163,184,0.25)',
                      boxShadow: m.reached
                        ? '0 2px 12px rgba(34,197,94,0.35)'
                        : 'none',
                    }}
                  >
                    {m.reached ? (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.08 + 0.3, type: 'spring', stiffness: 500 }}
                      >
                        ✓
                      </motion.span>
                    ) : (
                      i + 1
                    )}
                  </motion.div>
                </div>

                <div className="mt-2.5 text-center">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.08 + 0.3 }}
                    className={`font-semibold leading-tight ${
                      m.reached ? 'text-success' : 'text-text-muted'
                    }`}
                    style={{ fontSize: 'var(--font-size-micro)' }}
                  >
                    {m.label}
                  </motion.div>
                  {m.reachedAt && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.08 + 0.45 }}
                      className="text-text-muted mt-0.5 font-medium"
                      style={{ fontSize: '9px' }}
                    >
                      {new Date(m.reachedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Animated connector bar */}
              {i < milestones.length - 1 && (
                <div
                  className="flex-1 mx-1 rounded-full overflow-hidden"
                  style={{ height: 4, background: 'rgba(148,163,184,0.18)' }}
                >
                  <motion.div
                    style={{
                      height: '100%',
                      borderRadius: 999,
                      background: m.reached
                        ? 'linear-gradient(90deg, var(--color-success), rgba(34,197,94,0.6))'
                        : 'transparent',
                      transformOrigin: 'left',
                    }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: m.reached ? 1 : 0 }}
                    transition={{
                      delay: i * 0.12 + 0.5,
                      duration: 0.65,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
