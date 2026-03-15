'use client'

import { useState, useRef, useEffect } from 'react'
import { MAJORS } from '@/lib/majors'

interface MajorSelectProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  style?: React.CSSProperties
}

export function MajorSelect({ value, onChange, placeholder = 'Search or select a major…', style }: MajorSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = search.trim()
    ? MAJORS.filter(m => m.toLowerCase().includes(search.toLowerCase()))
    : MAJORS

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative', ...style }}>
      <input
        ref={inputRef}
        type="text"
        value={open ? search : value}
        onChange={e => { setSearch(e.target.value); if (!open) setOpen(true) }}
        onFocus={() => { setOpen(true); setSearch('') }}
        placeholder={value || placeholder}
        style={{
          padding: '10px 12px',
          borderRadius: 8,
          border: '1.5px solid var(--color-border)',
          background: 'var(--color-column)',
          color: 'var(--color-text)',
          fontSize: 14,
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
        }}
      />
      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          maxHeight: 200,
          overflowY: 'auto',
          background: 'var(--color-column, #fff)',
          border: '1.5px solid var(--color-border)',
          borderRadius: 8,
          marginTop: 4,
          zIndex: 50,
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '10px 14px', fontSize: 13, color: 'var(--color-text-muted)' }}>
              No matches — type to use a custom major
            </div>
          ) : (
            filtered.map(m => (
              <button
                key={m}
                type="button"
                onClick={() => { onChange(m); setOpen(false); setSearch(''); inputRef.current?.blur() }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 14px',
                  border: 'none',
                  background: m === value ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)' : 'transparent',
                  color: m === value ? 'var(--color-primary)' : 'var(--color-text)',
                  fontSize: 13,
                  fontWeight: m === value ? 700 : 400,
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { (e.target as HTMLElement).style.background = 'color-mix(in srgb, var(--color-primary) 8%, transparent)' }}
                onMouseLeave={e => { (e.target as HTMLElement).style.background = m === value ? 'color-mix(in srgb, var(--color-primary) 12%, transparent)' : 'transparent' }}
              >
                {m}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
