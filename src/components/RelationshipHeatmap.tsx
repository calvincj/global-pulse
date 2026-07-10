import { COUNTRIES } from '../data/countries';
import { RELATIONSHIPS, getScoreColor } from '../data/relationships';

interface Props {
  selectedCountry: string | null;
  onSelectCountry: (id: string) => void;
}

const TOP_COUNTRIES = ['USA', 'CHN', 'RUS', 'DEU', 'GBR', 'FRA', 'JPN', 'IND', 'BRA', 'KOR', 'SAU', 'TUR', 'UKR', 'POL', 'ISR'];

function getScore(a: string, b: string): number | null {
  if (a === b) return null;
  const r = RELATIONSHIPS.find(
    rel => (rel.source === a && rel.target === b) || (rel.source === b && rel.target === a)
  );
  return r ? r.score : null;
}

export default function RelationshipHeatmap({ selectedCountry, onSelectCountry }: Props) {
  const countries = TOP_COUNTRIES.map(id => COUNTRIES[id]).filter(Boolean);

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Relationship Matrix</h3>
        <span className="text-xs text-gray-500">Top {countries.length} powers</span>
      </div>

      <div className="overflow-auto flex-1 scrollbar-thin">
        <table className="text-xs border-collapse">
          <thead>
            <tr>
              <th className="w-16" />
              {countries.map(c => (
                <th key={c.id} className="w-8 pb-1">
                  <button
                    title={c.name}
                    onClick={() => onSelectCountry(c.id)}
                    className={`text-base cursor-pointer hover:scale-125 transition-transform block mx-auto ${selectedCountry === c.id ? 'scale-125' : ''}`}
                  >
                    {c.flag}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {countries.map(row => (
              <tr key={row.id}>
                <td className="pr-2 py-0.5">
                  <button
                    onClick={() => onSelectCountry(row.id)}
                    className={`flex items-center gap-1 hover:text-white transition-colors ${selectedCountry === row.id ? 'text-blue-400 font-semibold' : 'text-gray-400'}`}
                  >
                    <span>{row.flag}</span>
                    <span className="text-xs truncate max-w-12">{row.iso2}</span>
                  </button>
                </td>
                {countries.map(col => {
                  const score = getScore(row.id, col.id);
                  const isSelf = row.id === col.id;
                  const isSelected = selectedCountry === row.id || selectedCountry === col.id;
                  return (
                    <td key={col.id} className="p-0.5">
                      <div
                        title={score !== null ? `${row.name} ↔ ${col.name}: ${score > 0 ? '+' : ''}${score.toFixed(2)}` : undefined}
                        className="w-7 h-7 rounded-sm flex items-center justify-center text-xs font-bold"
                        style={{
                          background: isSelf
                            ? '#1e3a5f'
                            : score !== null
                            ? `${getScoreColor(score)}${isSelected ? 'ff' : '99'}`
                            : '#0f1e35',
                          border: isSelected && !isSelf ? '1px solid rgba(59,130,246,0.4)' : '1px solid transparent',
                        }}
                      >
                        {isSelf ? <span className="text-blue-700 text-xs">·</span> : null}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Color scale */}
        <div className="mt-3 flex items-center gap-1">
          <span className="text-gray-500 text-xs">Hostile</span>
          <div className="flex-1 h-2 rounded" style={{
            background: 'linear-gradient(to right, #ef4444, #f97316, #94a3b8, #86efac, #22c55e)'
          }} />
          <span className="text-gray-500 text-xs">Allied</span>
        </div>
      </div>
    </div>
  );
}
