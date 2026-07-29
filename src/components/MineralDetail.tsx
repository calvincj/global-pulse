import { ALL_COUNTRIES, getFlag } from '../data/allCountries';
import { MINERAL_PRODUCTION } from '../data/criticalMinerals/production';
import { MINERAL_FACILITIES } from '../data/criticalMinerals/facilities';
import { MINERALS_BY_KEY } from '../data/criticalMinerals/minerals';
import { COUNTRY_STRATEGIES } from '../data/criticalMinerals/countryStrategies';
import type { MineralStage, FacilityAssetType } from '../types/criticalMinerals';
import type { Metric } from './MineralsMap';

interface Props {
  countryId: string | null;
  facilityId: string | null;
  mineral: string;
  stage: MineralStage | 'downstream';
  metric: Metric;
  onSelectCountry: (id: string | null) => void;
  onSelectFacility: (id: string | null) => void;
}

const ASSET_TYPE_COLOR: Record<FacilityAssetType, string> = {
  mine: '#3987e5',
  smelter: '#d95926',
  refinery: '#199e70',
  plant: '#c98500',
};

function fmtKg(kg: number): string {
  const tonnes = kg / 1000;
  if (tonnes >= 1e6) return `${(tonnes / 1e6).toFixed(2)}M t`;
  if (tonnes >= 1e3) return `${(tonnes / 1e3).toFixed(1)}K t`;
  if (tonnes >= 1) return `${tonnes.toFixed(1)} t`;
  return `${Math.round(kg)} kg`;
}

const POSTURE_META: Record<string, { label: string; color: string }> = {
  diversifying: { label: 'Actively Diversifying', color: '#6ee7b7' },
  aligned: { label: 'Aligned with China', color: '#f87171' },
  neutral: { label: 'Neutral / Mixed', color: '#eab308' },
  dependent: { label: 'Import-Dependent', color: '#fb923c' },
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#60a5fa' }}>{children}</h3>
  );
}

export default function MineralDetail({ countryId, facilityId, mineral, stage, metric, onSelectCountry, onSelectFacility }: Props) {
  if (facilityId) {
    const facility = MINERAL_FACILITIES.find(f => f.id === facilityId);
    if (!facility) return null;
    const country = ALL_COUNTRIES[facility.countryId];
    return (
      <div className="h-full overflow-y-auto scrollbar-thin text-sm fade-in">
        <div className="p-4 border-b" style={{ borderColor: '#1a2d44' }}>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex flex-wrap gap-1">
              {facility.assetTypes.map(t => (
                <span key={t} className="text-xs px-2 py-0.5 rounded font-medium uppercase tracking-wide capitalize"
                  style={{ background: `${ASSET_TYPE_COLOR[t]}22`, color: ASSET_TYPE_COLOR[t], border: `1px solid ${ASSET_TYPE_COLOR[t]}44` }}>
                  {t}
                </span>
              ))}
            </div>
            <button onClick={() => onSelectFacility(null)} className="text-xs flex-shrink-0" style={{ color: '#475569' }}>✕</button>
          </div>
          <h2 className="text-base font-bold text-white leading-tight">{facility.name}</h2>
          {country && (
            <button
              onClick={() => { onSelectFacility(null); onSelectCountry(facility.countryId); }}
              className="text-xs mt-1 flex items-center gap-1"
              style={{ color: '#94a3b8' }}
            >
              <span>{getFlag(country.iso2)}</span> {country.name}
            </button>
          )}
        </div>

        <div className="px-4 pt-3 pb-3 border-b" style={{ borderColor: '#1a2d44' }}>
          <SectionLabel>Commodities</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(37,99,235,0.18)', color: '#93c5fd', border: '1px solid rgba(96,165,250,0.25)' }}>
              {facility.primaryCommodity} (primary)
            </span>
            {facility.secondaryCommodity && (
              <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(100,116,139,0.15)', color: '#94a3b8', border: '1px solid rgba(100,116,139,0.3)' }}>
                {facility.secondaryCommodity}
              </span>
            )}
            {facility.otherCommodities?.map(c => (
              <span key={c} className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(100,116,139,0.1)', color: '#64748b', border: '1px solid rgba(100,116,139,0.2)' }}>
                {c}
              </span>
            ))}
          </div>
        </div>

        <div className="px-4 pt-3 pb-4">
          <SectionLabel>Details</SectionLabel>
          <div className="text-xs space-y-1" style={{ color: '#94a3b8' }}>
            <div>Confidence: <span style={{ color: '#cbd5e1' }}>{facility.confidence}</span></div>
            <div>Active production: <span style={{ color: '#cbd5e1' }}>{facility.production ? 'Yes' : 'Unconfirmed'}</span></div>
            <div>Active processing: <span style={{ color: '#cbd5e1' }}>{facility.processing ? 'Yes' : 'Unconfirmed'}</span></div>
          </div>
          <div className="text-xs mt-3" style={{ color: '#374151' }}>Source: ICMM mining facility database.</div>
        </div>
      </div>
    );
  }

  if (countryId) {
    const country = ALL_COUNTRIES[countryId];
    if (!country) return null;
    const stats = MINERAL_PRODUCTION[countryId] ?? [];
    const activeStage = stage === 'downstream' ? 'processed' : stage;
    const current = stats.find(s => s.mineral === mineral && s.stage === activeStage);
    const otherStats = stats.filter(s => !(s.mineral === mineral && s.stage === activeStage))
      .sort((a, b) => (b.productionKg + b.consumptionKg) - (a.productionKg + a.consumptionKg))
      .slice(0, 12);
    const facilities = MINERAL_FACILITIES.filter(f => f.countryId === countryId);
    const strategy = COUNTRY_STRATEGIES[countryId];
    const meta = MINERALS_BY_KEY[mineral];

    return (
      <div className="h-full overflow-y-auto scrollbar-thin text-sm fade-in">
        <div className="p-4 border-b" style={{ borderColor: '#1a2d44' }}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getFlag(country.iso2)}</span>
              <h2 className="text-base font-bold text-white leading-tight">{country.name}</h2>
            </div>
            <button onClick={() => onSelectCountry(null)} className="text-xs flex-shrink-0" style={{ color: '#475569' }}>✕</button>
          </div>
          <div className="text-xs" style={{ color: '#64748b' }}>{country.subregion}</div>
        </div>

        <div className="p-4 border-b" style={{ borderColor: '#1a2d44' }}>
          <SectionLabel>{meta?.label ?? mineral} ({activeStage})</SectionLabel>
          {current ? (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Stat label="Production" value={fmtKg(current.productionKg)} highlight={metric === 'production'} />
              <Stat label="Consumption" value={fmtKg(current.consumptionKg)} highlight={metric === 'consumption'} />
              <Stat label="Imports" value={fmtKg(current.importKg)} />
              <Stat label="Exports" value={fmtKg(current.exportKg)} />
            </div>
          ) : (
            <div className="text-xs" style={{ color: '#374151' }}>No {activeStage}-stage data for {meta?.label ?? mineral} in this dataset.</div>
          )}
          {current?.source && <div className="text-xs mt-2" style={{ color: '#374151' }}>Source: {current.source}</div>}
        </div>

        {otherStats.length > 0 && (
          <div className="px-4 pt-3 pb-3 border-b" style={{ borderColor: '#1a2d44' }}>
            <SectionLabel>Other Minerals Here</SectionLabel>
            <div className="space-y-1">
              {otherStats.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span style={{ color: '#cbd5e1' }}>{s.mineral} <span style={{ color: '#475569' }}>({s.stage})</span></span>
                  <span className="font-mono" style={{ color: '#94a3b8' }}>{fmtKg(s.productionKg || s.consumptionKg)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {facilities.length > 0 && (
          <div className="px-4 pt-3 pb-3 border-b" style={{ borderColor: '#1a2d44' }}>
            <SectionLabel>Facilities ({facilities.length})</SectionLabel>
            <div className="flex flex-col gap-1">
              {facilities.slice(0, 20).map(f => (
                <button
                  key={f.id}
                  onClick={() => onSelectFacility(f.id)}
                  className="flex items-center justify-between text-xs rounded px-2 py-1 text-left transition-colors"
                  style={{ background: 'rgba(30,74,127,0.15)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(30,74,127,0.3)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(30,74,127,0.15)')}
                >
                  <span style={{ color: '#e2e8f0' }} className="truncate">{f.name}</span>
                  <span style={{ color: ASSET_TYPE_COLOR[f.assetTypes[0]] }} className="capitalize flex-shrink-0 ml-2">{f.assetTypes[0]}</span>
                </button>
              ))}
              {facilities.length > 20 && <div className="text-xs mt-1" style={{ color: '#374151' }}>+{facilities.length - 20} more</div>}
            </div>
          </div>
        )}

        {strategy && (
          <div className="px-4 pt-3 pb-4">
            <div className="flex items-center justify-between mb-2">
              <SectionLabel>Critical Minerals Strategy</SectionLabel>
              <span className="text-xs px-2 py-0.5 rounded" style={{ background: `${POSTURE_META[strategy.posture].color}22`, color: POSTURE_META[strategy.posture].color }}>
                {POSTURE_META[strategy.posture].label}
              </span>
            </div>
            <p className="text-xs leading-relaxed mb-3" style={{ color: '#94a3b8' }}>{strategy.summary}</p>
            <div className="space-y-2.5">
              {strategy.initiatives.map((init, i) => (
                <div key={i} className="text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono" style={{ color: '#60a5fa' }}>{init.year}</span>
                    <span className="font-semibold" style={{ color: '#e2e8f0' }}>{init.title}</span>
                  </div>
                  <div style={{ color: '#94a3b8' }} className="mt-0.5">{init.note}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded px-2 py-1.5" style={{ background: highlight ? 'rgba(37,99,235,0.18)' : 'rgba(20,40,70,0.3)', border: highlight ? '1px solid rgba(96,165,250,0.3)' : '1px solid transparent' }}>
      <div style={{ color: '#64748b' }}>{label}</div>
      <div className="font-mono font-semibold" style={{ color: highlight ? '#93c5fd' : '#e2e8f0' }}>{value}</div>
    </div>
  );
}
