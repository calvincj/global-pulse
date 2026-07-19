import { CONFLICT_ZONES, type ConflictType } from '../data/conflicts';
import { ALL_COUNTRIES, getFlag } from '../data/allCountries';

interface Props {
  conflictId: string;
  onSelectCountry?: (id: string) => void;
  onClose?: () => void;
}

const TYPE_META: Record<ConflictType, { label: string; color: string }> = {
  war:        { label: 'Active War',   color: '#ef4444' },
  insurgency: { label: 'Insurgency',   color: '#f97316' },
  proxy:      { label: 'Proxy Conflict', color: '#eab308' },
  tension:    { label: 'Tension',      color: '#fb923c' },
};

export default function ConflictDetail({ conflictId, onSelectCountry, onClose }: Props) {
  const cz = CONFLICT_ZONES.find(c => c.id === conflictId);
  if (!cz) return null;

  const typeMeta = TYPE_META[cz.type];
  const countries = cz.countries.map(id => ALL_COUNTRIES[id]).filter(Boolean);

  return (
    <div className="h-full overflow-y-auto scrollbar-thin text-sm fade-in">
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: '#1a2d44' }}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <span
            className="text-xs px-2 py-0.5 rounded font-medium uppercase tracking-wide"
            style={{ background: `${typeMeta.color}22`, color: typeMeta.color, border: `1px solid ${typeMeta.color}44` }}
          >
            ⚔ {typeMeta.label}
          </span>
          {onClose && (
            <button onClick={onClose} className="text-xs flex-shrink-0" style={{ color: '#475569' }} title="Close">✕</button>
          )}
        </div>
        <h2 className="text-base font-bold text-white leading-tight">{cz.name}</h2>
      </div>

      {/* Intensity */}
      <div className="p-4 border-b" style={{ borderColor: '#1a2d44' }}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#60a5fa' }}>Intensity</span>
          <span className="text-xs font-mono" style={{ color: typeMeta.color }}>{Math.round(cz.intensity * 100)}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(30,58,138,0.25)' }}>
          <div className="h-full rounded-full" style={{ width: `${cz.intensity * 100}%`, background: typeMeta.color }} />
        </div>
      </div>

      {/* Parties involved */}
      {countries.length > 0 && (
        <div className="px-4 pt-3 pb-3 border-b" style={{ borderColor: '#1a2d44' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#60a5fa' }}>Parties Involved</h3>
          <div className="flex flex-wrap gap-1.5">
            {countries.map(c => (
              <button
                key={c.id}
                onClick={() => onSelectCountry?.(c.id)}
                className="flex items-center gap-1.5 text-xs rounded px-2 py-1 transition-colors cursor-pointer"
                style={{ background: 'rgba(30,74,127,0.25)', border: '1px solid rgba(59,130,246,0.2)' }}
                title={`View ${c.name}'s profile`}
              >
                <span>{getFlag(c.iso2)}</span>
                <span style={{ color: '#e2e8f0' }}>{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      <div className="px-4 pt-3 pb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#60a5fa' }}>Overview</h3>
        <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>{cz.description}</p>
      </div>
    </div>
  );
}
