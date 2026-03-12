/**
 * Reusable skeleton primitives.
 * Uses CSS class `skeleton` — shimmer animation defined in index.css.
 */

export function SkeletonLine({ width = '100%', height = 12, className = '' }) {
  return (
    <span
      className={`skeleton ${className}`}
      style={{ display: 'block', width, height, borderRadius: 6 }}
    />
  );
}

export function SkeletonCircle({ size = 36 }) {
  return (
    <span
      className="skeleton"
      style={{ display: 'block', width: size, height: size, borderRadius: '50%', flexShrink: 0 }}
    />
  );
}

export function SkeletonBlock({ width = '100%', height = 80, radius = 10 }) {
  return (
    <span
      className="skeleton"
      style={{ display: 'block', width, height, borderRadius: radius }}
    />
  );
}

/** A card-shaped skeleton with a few shimmer lines inside */
export function SkeletonCard({ lines = 3, height = 90 }) {
  return (
    <div
      className="skeleton-card"
      style={{ height, padding: '0.85rem 1rem', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 8 }}
    >
      <SkeletonLine width="55%" height={11} />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <SkeletonLine key={i} width={i === lines - 2 ? '40%' : '80%'} height={10} />
      ))}
    </div>
  );
}
