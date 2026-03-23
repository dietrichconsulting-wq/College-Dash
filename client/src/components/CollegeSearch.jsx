import { useState, useEffect, useRef } from 'react';
import api from '../utils/api';

export default function CollegeSearch({ value, onChange, index, dark }) {
  const [query, setQuery] = useState(value?.name || '');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setQuery(value?.name || '');
  }, [value?.name]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (val.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get(`/colleges/search?q=${encodeURIComponent(val)}`);
        if (data && data.length > 0) {
          setResults(data);
          setOpen(true);
        } else {
          setResults([]);
          setOpen(false);
        }
      } catch {
        // API not available - that's fine, manual entry still works
        setResults([]);
        setOpen(false);
      }
    }, 300);
  };

  const handleSelect = (college) => {
    setQuery(college.name);
    setOpen(false);
    onChange(index, { name: college.name, id: college.id || '' });
  };

  // On blur, save whatever the user typed as the school name (manual entry)
  const handleBlur = () => {
    setTimeout(() => {
      if (query.trim() && query.trim() !== (value?.name || '')) {
        onChange(index, { name: query.trim(), id: value?.id || '' });
      }
    }, 200);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={handleInput}
        onBlur={handleBlur}
        placeholder={`School ${index + 1} (type name)`}
        className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:border-transparent transition-all ${dark ? 'border-gray-600 bg-white/5 text-white placeholder-gray-500 focus:ring-blue-500' : 'border-gray-300 bg-white focus:ring-blue-600'}`}
      />
      {open && results.length > 0 && (
        <ul className={`absolute z-50 w-full mt-1 border rounded-lg shadow-lg max-h-48 overflow-y-auto ${dark ? 'bg-[#1A2133] border-gray-600' : 'bg-white border-gray-200'}`}>
          {results.map(c => (
            <li
              key={c.id}
              onClick={() => handleSelect(c)}
              className={`px-4 py-2.5 cursor-pointer transition-colors ${dark ? 'hover:bg-white/10' : 'hover:bg-blue-50'}`}
            >
              <div className="font-medium text-sm">{c.name}</div>
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {c.city}, {c.state}
                {c.admissionRate != null && ` | ${(c.admissionRate * 100).toFixed(0)}% acceptance`}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
