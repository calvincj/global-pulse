import { useState, useRef, useEffect } from 'react';
import { ALL_COUNTRIES, getFlag } from '../data/allCountries';

const SORTED = Object.values(ALL_COUNTRIES).sort((a, b) => a.name.localeCompare(b.name));

interface Props {
  onSelect: (id: string) => void;
}

export default function SearchBar({ onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query.length > 0
    ? SORTED.filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || c.capital.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : [];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); inputRef.current?.focus(); setOpen(true); }
      if (e.key === 'Escape') { setOpen(false); setQuery(''); inputRef.current?.blur(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 w-56" style={{ background: 'rgba(30,58,138,0.2)', border: '1px solid #1e3a5f' }}>
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#4b5563' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search country… (⌘K)"
          className="bg-transparent outline-none w-full text-xs"
          style={{ color: '#e2e8f0' }}
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 rounded-lg overflow-hidden shadow-2xl z-50" style={{ background: '#0a0e1a', border: '1px solid #1e3a5f' }}>
          {results.map(c => (
            <button
              key={c.id}
              className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors"
              style={{ borderBottom: '1px solid #111827' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(30,58,138,0.3)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              onMouseDown={() => { onSelect(c.id); setQuery(''); setOpen(false); }}
            >
              <span className="text-lg">{getFlag(c.iso2)}</span>
              <div>
                <div className="text-xs font-medium" style={{ color: '#e2e8f0' }}>{c.name}</div>
                <div className="text-xs" style={{ color: '#4b5563' }}>{c.subregion}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
