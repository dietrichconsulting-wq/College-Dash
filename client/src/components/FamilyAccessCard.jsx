import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';

export default function FamilyAccessCard({ userId }) {
  const [linkCode, setLinkCode] = useState(null);
  const [parents, setParents] = useState([]);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    api.get(`/parent/link-code/${userId}`)
      .then(({ data }) => setLinkCode(data.linkCode))
      .catch(() => {});

    api.get(`/parent/linked-parents/${userId}`)
      .then(({ data }) => setParents(data.parents || []))
      .catch(() => {});
  }, [userId]);

  const handleCopy = () => {
    if (!linkCode) return;
    navigator.clipboard.writeText(linkCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const { data } = await api.post(`/parent/regenerate-code/${userId}`);
      setLinkCode(data.linkCode);
    } catch {
      // ignore
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-elevated"
      style={{ padding: '24px 28px', marginTop: 24 }}
    >
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 'var(--font-size-section-header)', fontWeight: 700, color: 'var(--color-primary)', margin: 0 }}>
          Family Access
        </h3>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
          Share this code with a parent or guardian so they can follow your progress with a free read-only view.
        </p>
      </div>

      {/* Link code display */}
      {linkCode && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: '0.2em',
              color: 'var(--color-primary)',
              background: 'var(--color-column)',
              padding: '10px 20px',
              borderRadius: 10,
              border: '2px solid var(--color-border)',
            }}
          >
            {linkCode}
          </div>
          <button
            onClick={handleCopy}
            style={{
              background: copied ? 'var(--color-success)' : 'var(--color-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 16px',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              transition: 'background 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
                Copy Code
              </>
            )}
          </button>
        </div>
      )}

      {/* Linked parents */}
      {parents.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Linked Parents
          </span>
          <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {parents.map((p) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: 'var(--color-column)',
                  fontSize: 13,
                  color: 'var(--color-text)',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0, opacity: 0.5 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span style={{ fontWeight: 500 }}>{p.displayName}</span>
                {p.email && <span style={{ color: 'var(--color-text-muted)' }}>({p.email})</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regenerate code */}
      <button
        onClick={handleRegenerate}
        disabled={regenerating}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--color-text-muted)',
          fontSize: 12,
          cursor: 'pointer',
          textDecoration: 'underline',
          padding: 0,
        }}
      >
        {regenerating ? 'Regenerating...' : 'Regenerate link code (invalidates old code)'}
      </button>
    </motion.div>
  );
}
