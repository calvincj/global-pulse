import { useEffect, useState } from 'react';
import { COUNTRIES } from '../data/countries';
import { ALL_COUNTRIES, getFlag } from '../data/allCountries';
import { getRelationshipsFor, getScoreColor, getScoreLabel, getBlocMemberships } from '../data/relationships';
import { getWorldBankData, getWorldBankForYear, type WBCountryData } from '../data/worldBank';
import { getGdeltTone, type GdeltTone } from '../data/gdelt';
import { getComtradeBilateral, hasComtradeKey, fmtTrade, type ComtradeFlow } from '../data/comtrade';
import { getHistoricalRelationship, interpolateSnapshot } from '../data/historicalRelationships';
import { RELIGIONS, RELIGION_META, religionLines } from '../data/religions';
import ScoreBar from './ScoreBar';
import type { MapMode } from '../types';

interface Props {
  countryId: string; mode: MapMode; timelineYear?: number | null;
  highlightedBloc?: string | null;
  onHighlightBloc?: (key: string) => void;
}

const fmt$ = (n: number) =>
  n >= 1e12 ? `$${(n/1e12).toFixed(2)}T`
  : n >= 1e9 ? `$${(n/1e9).toFixed(1)}B`
  : `$${(n/1e6).toFixed(0)}M`;

const fmtPop = (n: number) =>
  n >= 1e9 ? `${(n/1e9).toFixed(2)}B`
  : n >= 1e6 ? `${(n/1e6).toFixed(1)}M`
  : n >= 1000 ? `${(n/1000).toFixed(0)}K`
  : n.toLocaleString();

const Card = ({ label, value }: { label: string; value: string | number | null }) => (
  value != null ? (
    <div className="rounded px-2 py-1.5" style={{ background: 'rgba(30,74,127,0.2)' }}>
      <div className="text-xs" style={{ color: '#6b7280' }}>{label}</div>
      <div className="text-white font-medium text-sm truncate">{value}</div>
    </div>
  ) : null
);

const Tag = ({ text, bg, color, border }: { text: string; bg: string; color: string; border: string }) => (
  <span className="text-xs px-2 py-0.5 rounded" style={{ background: bg, color, border: `1px solid ${border}` }}>{text}</span>
);


export default function CountryProfile({ countryId, mode, timelineYear, highlightedBloc, onHighlightBloc }: Props) {
  const [wb, setWb] = useState<WBCountryData | null>(null);
  const [wbLoading, setWbLoading] = useState(true);
  const [historicalWb, setHistoricalWb] = useState<WBCountryData | null>(null);
  const [gdeltMap, setGdeltMap] = useState<Map<string, GdeltTone | null>>(new Map());
  const [comtradeMap, setComtradeMap] = useState<Map<string, ComtradeFlow | null>>(new Map());

  useEffect(() => {
    setWbLoading(true);
    getWorldBankData().then(map => {
      setWb(map.get(countryId) ?? null);
      setWbLoading(false);
    });
  }, [countryId]);

  // Fetch historical WB stats when timeline year changes — debounced so playback doesn't hammer API
  useEffect(() => {
    if (timelineYear == null || timelineYear >= 2025) {
      setHistoricalWb(null);
      return;
    }
    const t = setTimeout(() => {
      getWorldBankForYear(countryId, timelineYear).then(setHistoricalWb);
    }, 600);
    return () => clearTimeout(t);
  }, [countryId, timelineYear]);

  useEffect(() => {
    setGdeltMap(new Map());
    setComtradeMap(new Map());
    const rels = getRelationshipsFor(countryId).filter(r => !r.isBloc).slice(0, 15);
    for (const r of rels) {
      const other = r.source === countryId ? r.target : r.source;
      getGdeltTone(countryId, other).then(tone => {
        setGdeltMap(prev => new Map(prev).set(other, tone));
      });
      if (hasComtradeKey()) {
        getComtradeBilateral(countryId, other).then(flow => {
          setComtradeMap(prev => new Map(prev).set(other, flow));
        });
      }
    }
  }, [countryId]);

  const detailed = COUNTRIES[countryId];
  const basic    = ALL_COUNTRIES[countryId];
  if (!basic && !detailed) return null;

  const name    = detailed?.name ?? basic?.name ?? countryId;
  const flag    = detailed?.flag ?? getFlag(basic?.iso2 ?? '');
  const capital = detailed?.capital ?? basic?.capital ?? '—';
  const region  = basic?.subregion ?? basic?.region ?? '—';
  const territory = basic?.territory;

  // Use historical WB data when in timeline mode, else prefer live WB data
  const activeWb = historicalWb ?? wb;
  const pop  = activeWb?.population ?? detailed?.population ?? basic?.population;
  const area = wb?.landAreaKm2 ?? detailed?.area; // area unchanged, always use current
  const gdp  = activeWb?.gdpUsd ?? (detailed?.gdp ? detailed.gdp * 1e9 : null);
  const gdpCap = (gdp && pop && pop > 0) ? gdp / pop : (detailed?.gdpPerCapita ?? null);
  const density = (pop && area) ? (pop / area).toFixed(1) : null;

  const relationships = getRelationshipsFor(countryId);
  const manualRels = relationships
    .filter(r => !r.isBloc)
    .sort((a, b) => (mode === 'political' ? b.polScore - a.polScore : b.ecoScore - a.ecoScore));
  const blocRels = relationships.filter(r => r.isBloc);
  const blocs = getBlocMemberships(countryId);
  const religionInfo = RELIGIONS[countryId];

  return (
    <div className="h-full overflow-y-auto scrollbar-thin text-sm fade-in">
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: '#1a2d44' }}>
        <div className="flex items-start gap-3">
          <span className="text-4xl leading-none mt-0.5">{flag}</span>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-white leading-tight">{name}</h2>
            <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>{capital} · {region}</div>
            {detailed && <div className="text-xs mt-0.5" style={{ color: '#4b5563' }}>{detailed.government}</div>}
          </div>
        </div>
        {territory && (
          <div className="mt-2.5 text-xs px-2 py-1.5 rounded leading-relaxed" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)', color: '#d97706' }}>
            {territory}
          </div>
        )}
        {detailed && <p className="text-xs mt-2.5 leading-relaxed" style={{ color: '#94a3b8' }}>{detailed.description}</p>}
      </div>

      {/* Alliance memberships */}
      {blocs.length > 0 && (
        <div className="px-4 pt-3 pb-3 border-b" style={{ borderColor: '#1a2d44' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#60a5fa' }}>Alliances & Blocs</h3>
          <div className="text-xs mb-2" style={{ color: '#374151' }}>Click a tag to highlight its members on the map</div>
          <div className="flex flex-wrap gap-1.5">
            {blocs.map(b => {
              const isPolitical = ['NATO','Five Eyes','AUKUS','Quad','CSTO','G7','Visegrad Group','ALBA'].includes(b.name);
              const isEconomic  = ['European Union','MERCOSUR','GCC','ASEAN','Arab League','African Union','SADC','ECOWAS','Pacific Alliance','CPTPP'].includes(b.name);
              const active = highlightedBloc === b.key;
              const bg    = active ? 'rgba(245,158,11,0.25)' : isPolitical ? 'rgba(37,99,235,0.18)' : isEconomic ? 'rgba(5,150,105,0.15)' : 'rgba(100,116,139,0.15)';
              const color = active ? '#fbbf24' : isPolitical ? '#93c5fd' : isEconomic ? '#6ee7b7' : '#94a3b8';
              const bdr   = active ? 'rgba(245,158,11,0.6)' : isPolitical ? 'rgba(96,165,250,0.25)' : isEconomic ? 'rgba(52,211,153,0.2)' : 'rgba(148,163,184,0.15)';
              return (
                <button
                  key={b.key}
                  onClick={() => onHighlightBloc?.(b.key)}
                  className="text-xs px-2 py-0.5 rounded font-medium transition-colors cursor-pointer"
                  style={{ background: bg, color, border: `1px solid ${bdr}` }}
                  title={`Highlight ${b.name} members on the map`}
                >
                  {b.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Key metrics */}
      <div className="p-4 border-b" style={{ borderColor: '#1a2d44' }}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#60a5fa' }}>Statistics</h3>
          {timelineYear != null && timelineYear < 2025
            ? <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(37,99,235,0.15)', color: '#60a5fa', fontFamily: "'Space Mono', monospace" }}>
                {historicalWb ? `WB ${timelineYear}` : 'loading…'}
              </span>
            : (!wbLoading && wb
                ? <span className="text-xs" style={{ color: '#1e3a5f' }}>World Bank 2024</span>
                : <span className="text-xs animate-pulse" style={{ color: '#1e3a5f' }}>fetching live data…</span>
              )
          }
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Card label="Population"   value={pop ? fmtPop(pop) : null} />
          <Card label="Pop. Density" value={density ? `${density}/km²` : null} />
          <Card label="GDP"          value={gdp ? fmt$(gdp) : null} />
          <Card label="GDP / Capita" value={gdpCap ? `$${Math.round(gdpCap).toLocaleString()}` : null} />
          <Card label="Land Area"    value={area ? `${(area/1000).toFixed(0)}K km²` : null} />
          {detailed && <Card label="HDI"        value={detailed.hdi.toFixed(3)} />}
          {detailed && <Card label="Defense"    value={`$${detailed.militaryBudget}B`} />}
          {detailed && <Card label="Currency"   value={detailed.currency.split(' ')[0]} />}
        </div>
      </div>

      {/* Cities */}
      {detailed?.majorCities && (
        <div className="px-4 pt-3 pb-3 border-b" style={{ borderColor: '#1a2d44' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#60a5fa' }}>Major Cities</h3>
          <div className="flex flex-wrap gap-1">
            {detailed.majorCities.map(c => (
              <span key={c} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(30,58,138,0.35)', color: '#cbd5e1' }}>{c}</span>
            ))}
          </div>
        </div>
      )}

      {/* Economy */}
      {detailed && (
        <div className="px-4 pt-3 pb-3 border-b" style={{ borderColor: '#1a2d44' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#60a5fa' }}>Economy</h3>
          <div className="flex flex-wrap gap-1 mb-3">
            {detailed.industries.map(i => <Tag key={i} text={i} bg="rgba(6,78,59,0.35)" color="#6ee7b7" border="rgba(52,211,153,0.15)" />)}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs mb-1" style={{ color: '#4b5563' }}>Exports</div>
              {detailed.exports.slice(0,5).map(e => (
                <div key={e} className="text-xs flex items-center gap-1 mb-0.5" style={{ color: '#cbd5e1' }}>
                  <span style={{ color: '#34d399' }}>↑</span>{e}
                </div>
              ))}
            </div>
            <div>
              <div className="text-xs mb-1" style={{ color: '#4b5563' }}>Imports</div>
              {detailed.imports.slice(0,5).map(i => (
                <div key={i} className="text-xs flex items-center gap-1 mb-0.5" style={{ color: '#cbd5e1' }}>
                  <span style={{ color: '#fb923c' }}>↓</span>{i}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* People */}
      {(detailed || religionInfo) && (
        <div className="px-4 pt-3 pb-3 border-b" style={{ borderColor: '#1a2d44' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#60a5fa' }}>People</h3>
          {detailed && (
            <div className="mb-2">
              <div className="text-xs mb-1" style={{ color: '#4b5563' }}>Languages</div>
              <div className="flex flex-wrap gap-1">{detailed.languages.map(l => <Tag key={l} text={l} bg="rgba(88,28,135,0.3)" color="#d8b4fe" border="rgba(167,139,250,0.15)" />)}</div>
            </div>
          )}
          {religionInfo && (
            <div>
              <div className="text-xs mb-1" style={{ color: '#4b5563' }}>Religion</div>
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: RELIGION_META[religionInfo.majority].color }} />
                <span className="text-xs font-medium" style={{ color: '#e2e8f0' }}>
                  {RELIGION_META[religionInfo.majority].label} {religionInfo.mixed ? 'plurality' : 'majority'} ({religionInfo.majorityPct}%)
                </span>
                {religionInfo.mixed && religionInfo.secondary && (
                  <>
                    <span style={{ color: '#374151' }}>+</span>
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: RELIGION_META[religionInfo.secondary].color }} />
                    <span className="text-xs font-medium" style={{ color: '#e2e8f0' }}>{RELIGION_META[religionInfo.secondary].label}</span>
                  </>
                )}
              </div>
              {religionInfo.mixed && (
                <div className="text-xs mb-1" style={{ color: '#60a5fa' }}>No single religious majority</div>
              )}
              <div className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>
                {religionLines(religionInfo.breakdown).map((line, i) => <div key={i}>{line}</div>)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History */}
      {detailed && (
        <div className="px-4 pt-3 pb-3 border-b" style={{ borderColor: '#1a2d44' }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#60a5fa' }}>History</h3>
          <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>{detailed.history}</p>
          <div className="text-xs mt-1" style={{ color: '#374151' }}>Founded: {detailed.founded}</div>
        </div>
      )}

      {/* Relationships — manual with notes */}
      <div className="px-4 pt-3 pb-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#60a5fa' }}>
          Bilateral Relations {relationships.length > 0 && `(${relationships.length})`}
        </h3>
        {relationships.length === 0 && (
          <div className="text-xs italic pb-4" style={{ color: '#374151' }}>No relationship data available</div>
        )}
        {manualRels.map(rel => {
          const other = rel.source === countryId ? rel.target : rel.source;
          return <RelRow key={rel.source+rel.target} rel={rel} countryId={countryId} mode={mode} gdelt={gdeltMap.get(other)} comtrade={comtradeMap.get(other)} timelineYear={timelineYear} />;
        })}
      </div>

      {/* Bloc-generated relationships — only show for focused blocs, skip huge ones */}
      {blocRels.length > 0 && blocRels.length <= 18 && (
        <div className="px-4 pt-0 pb-4">
          <div className="text-xs mb-2 pt-1 border-t" style={{ color: '#374151', borderColor: '#1a2d44' }}>
            {blocRels.length} additional alliance partners
          </div>
          <div className="flex flex-wrap gap-1.5">
            {blocRels.map(rel => {
              const otherId = rel.source === countryId ? rel.target : rel.source;
              const other = ALL_COUNTRIES[otherId];
              if (!other) return null;
              const color = getScoreColor(rel.score);
              return (
                <div key={otherId} title={`${other.name}: ${getScoreLabel(rel.score)}`}
                  className="flex items-center gap-1 text-xs rounded px-1.5 py-0.5"
                  style={{ background: 'rgba(30,74,127,0.18)', border: `1px solid ${color}33` }}>
                  <span>{getFlag(other.iso2)}</span>
                  <span style={{ color: '#94a3b8' }}>{other.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function RelRow({ rel, countryId, mode, gdelt, comtrade, timelineYear }: {
  rel: ReturnType<typeof getRelationshipsFor>[number];
  countryId: string; mode: MapMode;
  gdelt?: GdeltTone | null;
  comtrade?: ComtradeFlow | null;
  timelineYear?: number | null;
}) {
  const otherId = rel.source === countryId ? rel.target : rel.source;
  const other = ALL_COUNTRIES[otherId];
  if (!other) return null;

  const hr = timelineYear != null ? getHistoricalRelationship(countryId, otherId) : null;
  const snap = hr && timelineYear != null ? interpolateSnapshot(hr, timelineYear) : null;

  const polScore = snap ? snap.polScore : rel.polScore;
  const ecoScore = snap ? snap.ecoScore : rel.ecoScore;
  const activeScore = mode === 'political' ? polScore : ecoScore;
  const activeColor = getScoreColor(activeScore);
  const liveTotal = comtrade?.total;

  return (
    <div className="mb-2.5 rounded p-2.5" style={{ background: 'rgba(20,40,70,0.4)', border: `1px solid ${activeColor}22` }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-lg leading-none">{getFlag(other.iso2)}</span>
          <span className="text-xs font-medium" style={{ color: '#e2e8f0' }}>{other.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {snap && (
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(37,99,235,0.15)', color: '#60a5fa', fontFamily: "'Space Mono', monospace" }}>
              {timelineYear}
            </span>
          )}
          {!snap && gdelt != null && (
            <span className="text-xs px-1.5 py-0.5 rounded" title={`GDELT 3-month news tone (${gdelt.articleCount.toLocaleString()} articles)`}
              style={{ background: 'rgba(6,78,59,0.3)', border: `1px solid ${getScoreColor(gdelt.score)}44`, color: getScoreColor(gdelt.score) }}>
              ◉ {gdelt.score > 0 ? '+' : ''}{gdelt.score.toFixed(2)}
            </span>
          )}
          {!snap && (
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(30,58,138,0.25)', color: liveTotal ? '#38bdf8' : '#475569' }}
              title={liveTotal ? `UN Comtrade 2023: ${fmtTrade(comtrade?.exports)} exports + ${fmtTrade(comtrade?.imports)} imports` : 'Static estimate'}>
              {liveTotal ? `${fmtTrade(liveTotal)} ⬤` : rel.trade > 0 ? `~$${rel.trade}B` : ''}
            </span>
          )}
        </div>
      </div>
      <ScoreBar label="Political" score={polScore} active={mode === 'political'} />
      <ScoreBar label="Economic" score={ecoScore} active={mode === 'economic'} />
      {snap
        ? <p className="text-xs leading-relaxed mt-1.5" style={{ color: '#6b7280' }}>{snap.note}</p>
        : <p className="text-xs leading-relaxed mt-1.5" style={{ color: '#6b7280' }}>{mode === 'political' ? rel.polNotes : rel.ecoNotes}</p>
      }
    </div>
  );
}
