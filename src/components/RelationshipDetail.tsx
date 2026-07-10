import { useEffect, useState } from 'react';
import { COUNTRIES } from '../data/countries';
import { ALL_COUNTRIES, getFlag } from '../data/allCountries';
import { getRelationshipsFor, getScoreColor, getScoreLabel, getBlocMemberships } from '../data/relationships';
import { getWorldBankData, type WBCountryData } from '../data/worldBank';
import { getGdeltTone, type GdeltTone } from '../data/gdelt';
import { getComtradeBilateral, hasComtradeKey, fmtTrade, type ComtradeFlow } from '../data/comtrade';
import { getHistoricalRelationship, interpolateSnapshot } from '../data/historicalRelationships';
import ScoreBar from './ScoreBar';
import type { MapMode } from '../types';

interface Props { countryA: string; countryB: string; mode: MapMode; timelineYear?: number | null }

const fmt$ = (n: number) =>
  n >= 1e12 ? `$${(n/1e12).toFixed(2)}T`
  : n >= 1e9 ? `$${(n/1e9).toFixed(1)}B`
  : `$${(n/1e6).toFixed(0)}M`;

const fmtPop = (n: number) =>
  n >= 1e9 ? `${(n/1e9).toFixed(2)}B`
  : n >= 1e6 ? `${(n/1e6).toFixed(1)}M`
  : n >= 1000 ? `${(n/1000).toFixed(0)}K`
  : n.toLocaleString();

function getMetrics(id: string, wbMap: Map<string, WBCountryData> | null) {
  const detail = COUNTRIES[id];
  const basic  = ALL_COUNTRIES[id];
  const wb     = wbMap?.get(id);
  const pop = wb?.population ?? detail?.population ?? basic?.population ?? null;
  const gdp = wb?.gdpUsd ?? (detail?.gdp ? detail.gdp * 1e9 : null);
  return {
    pop,
    gdp,
    gdpCap: gdp && pop ? gdp / pop : (detail?.gdpPerCapita ?? null),
    military: detail?.militaryBudget ?? null,
    hdi: detail?.hdi ?? null,
  };
}

function CompareRow({ label, a, b, fmtFn, higherIsNotable = true }: {
  label: string; a: number | null; b: number | null;
  fmtFn: (n: number) => string; higherIsNotable?: boolean;
}) {
  if (a == null && b == null) return null;
  const aWins = higherIsNotable && a != null && b != null && a > b;
  const bWins = higherIsNotable && a != null && b != null && b > a;
  return (
    <div className="flex items-center justify-between py-1.5 border-b" style={{ borderColor: '#0f1f33' }}>
      <span className="text-xs flex-1 text-right pr-2" style={{ color: aWins ? '#e2e8f0' : '#64748b', fontWeight: aWins ? 600 : 400 }}>
        {a != null ? fmtFn(a) : '—'}
      </span>
      <span className="text-xs px-2 flex-shrink-0" style={{ color: '#374151', minWidth: 80, textAlign: 'center' }}>{label}</span>
      <span className="text-xs flex-1 pl-2" style={{ color: bWins ? '#e2e8f0' : '#64748b', fontWeight: bWins ? 600 : 400 }}>
        {b != null ? fmtFn(b) : '—'}
      </span>
    </div>
  );
}

export default function RelationshipDetail({ countryA, countryB, mode, timelineYear }: Props) {
  const a = ALL_COUNTRIES[countryA];
  const b = ALL_COUNTRIES[countryB];

  const [wb, setWb] = useState<Map<string, WBCountryData> | null>(null);
  const [gdelt, setGdelt] = useState<GdeltTone | null | undefined>(undefined);
  const [comtrade, setComtrade] = useState<ComtradeFlow | null | undefined>(undefined);

  useEffect(() => {
    getWorldBankData().then(setWb);
  }, []);

  useEffect(() => {
    setGdelt(undefined);
    setComtrade(undefined);
    const t = setTimeout(() => {
      getGdeltTone(countryA, countryB).then(setGdelt);
      if (hasComtradeKey()) getComtradeBilateral(countryA, countryB).then(setComtrade);
    }, 220);
    return () => clearTimeout(t);
  }, [countryA, countryB]);

  if (!a || !b) return null;

  const rel = getRelationshipsFor(countryA).find(r => r.source === countryB || r.target === countryB);

  // When in timeline mode, overlay historical scores if we have them
  const hr = timelineYear != null ? getHistoricalRelationship(countryA, countryB) : null;
  const snap = hr && timelineYear != null ? interpolateSnapshot(hr, timelineYear) : null;

  const displayPolScore = snap ? snap.polScore : rel?.polScore;
  const displayEcoScore = snap ? snap.ecoScore : rel?.ecoScore;
  const activeScore = displayPolScore != null && displayEcoScore != null
    ? (mode === 'political' ? displayPolScore : displayEcoScore)
    : undefined;
  const activeColor = activeScore !== undefined ? getScoreColor(activeScore) : '#374151';

  const blocsA = new Set(getBlocMemberships(countryA));
  const blocsB = new Set(getBlocMemberships(countryB));
  const sharedBlocs = [...blocsA].filter(x => blocsB.has(x));

  const ma = getMetrics(countryA, wb);
  const mb = getMetrics(countryB, wb);

  return (
    <div className="h-full overflow-y-auto scrollbar-thin text-sm fade-in">
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: '#1a2d44' }}>
        <div className="text-xs uppercase tracking-wider mb-2 text-center" style={{ color: '#3b82f6' }}>Bilateral Relationship</div>
        <div className="flex items-center justify-center gap-3">
          <div className="text-center min-w-0 flex-1">
            <div className="text-3xl leading-none">{getFlag(a.iso2)}</div>
            <div className="text-xs mt-1 truncate" style={{ color: '#e2e8f0' }}>{a.name}</div>
          </div>
          <div className="text-base flex-shrink-0" style={{ color: '#334155' }}>⇄</div>
          <div className="text-center min-w-0 flex-1">
            <div className="text-3xl leading-none">{getFlag(b.iso2)}</div>
            <div className="text-xs mt-1 truncate" style={{ color: '#e2e8f0' }}>{b.name}</div>
          </div>
        </div>
      </div>

      {/* Score */}
      <div className="p-4 border-b" style={{ borderColor: '#1a2d44' }}>
        {(rel || snap) ? (
          <div className="rounded-lg p-3" style={{ background: 'rgba(20,40,70,0.4)', border: `1px solid ${activeColor}33` }}>
            {snap && (
              <div className="flex justify-center mb-2">
                <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'rgba(37,99,235,0.18)', color: '#60a5fa', fontFamily: "'Space Mono', monospace", border: '1px solid rgba(96,165,250,0.25)' }}>
                  Historical · {timelineYear}
                </span>
              </div>
            )}
            <div className="text-center mb-2.5">
              <div className="text-2xl font-bold" style={{ color: activeColor }}>
                {activeScore! > 0 ? '+' : ''}{activeScore!.toFixed(2)}
              </div>
              <div className="text-xs uppercase tracking-wide" style={{ color: activeColor }}>{getScoreLabel(activeScore!)}</div>
            </div>
            <ScoreBar label="Political" score={displayPolScore!} active={mode === 'political'} />
            <ScoreBar label="Economic" score={displayEcoScore!} active={mode === 'economic'} />
            {snap
              ? <p className="text-xs leading-relaxed mt-2.5" style={{ color: '#94a3b8' }}>{snap.note}</p>
              : rel && <p className="text-xs leading-relaxed mt-2.5" style={{ color: '#94a3b8' }}>{mode === 'political' ? rel.polNotes : rel.ecoNotes}</p>
            }
            {rel && rel.trade > 0 && !snap && (
              <div className="text-xs mt-2" style={{ color: '#475569' }}>Est. annual trade: ~${rel.trade}B</div>
            )}
          </div>
        ) : (
          <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(20,40,70,0.25)', border: '1px solid #1a2d44' }}>
            <div className="text-xs" style={{ color: '#64748b' }}>No documented bilateral relationship in our dataset</div>
            <div className="text-xs mt-1" style={{ color: '#374151' }}>Live news tone below may still indicate ties</div>
          </div>
        )}
      </div>

      {/* Live GDELT */}
      <div className="px-4 pt-3 pb-3 border-b" style={{ borderColor: '#1a2d44' }}>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#60a5fa' }}>Live News Tone</h3>
        {gdelt === undefined ? (
          <div className="text-xs animate-pulse" style={{ color: '#374151' }}>Querying GDELT…</div>
        ) : gdelt === null ? (
          <div className="text-xs" style={{ color: '#374151' }}>No recent joint coverage found</div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: getScoreColor(gdelt.score) }}>
              ◉ {gdelt.score > 0 ? '+' : ''}{gdelt.score.toFixed(2)}
            </span>
            <span className="text-xs" style={{ color: '#475569' }}>
              {gdelt.articleCount.toLocaleString()} articles · last 3mo
            </span>
          </div>
        )}
      </div>

      {/* Live Comtrade */}
      {hasComtradeKey() && (
        <div className="px-4 pt-3 pb-3 border-b" style={{ borderColor: '#1a2d44' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#60a5fa' }}>UN Comtrade (2023)</h3>
          {comtrade === undefined ? (
            <div className="text-xs animate-pulse" style={{ color: '#374151' }}>Fetching trade data…</div>
          ) : comtrade?.total == null ? (
            <div className="text-xs" style={{ color: '#374151' }}>No trade data available</div>
          ) : (
            <div className="text-xs" style={{ color: '#38bdf8' }}>
              Total {fmtTrade(comtrade.total)} · Exports {fmtTrade(comtrade.exports)} · Imports {fmtTrade(comtrade.imports)}
            </div>
          )}
        </div>
      )}

      {/* Shared blocs */}
      {sharedBlocs.length > 0 && (
        <div className="px-4 pt-3 pb-3 border-b" style={{ borderColor: '#1a2d44' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#60a5fa' }}>Shared Memberships</h3>
          <div className="flex flex-wrap gap-1.5">
            {sharedBlocs.map(name => (
              <span key={name} className="text-xs px-2 py-0.5 rounded font-medium"
                style={{ background: 'rgba(37,99,235,0.18)', color: '#93c5fd', border: '1px solid rgba(96,165,250,0.25)' }}>
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Comparison */}
      <div className="px-4 pt-3 pb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#60a5fa' }}>Quick Comparison</h3>
        <CompareRow label="GDP" a={ma.gdp} b={mb.gdp} fmtFn={fmt$} />
        <CompareRow label="GDP / Capita" a={ma.gdpCap} b={mb.gdpCap} fmtFn={n => `$${Math.round(n).toLocaleString()}`} />
        <CompareRow label="Population" a={ma.pop} b={mb.pop} fmtFn={fmtPop} />
        <CompareRow label="Defense" a={ma.military} b={mb.military} fmtFn={n => `$${n}B`} />
        <CompareRow label="HDI" a={ma.hdi} b={mb.hdi} fmtFn={n => n.toFixed(3)} />
      </div>
    </div>
  );
}
