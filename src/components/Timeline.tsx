import { useState, useRef, useCallback } from 'react';
import {
  HISTORICAL_RELATIONSHIPS,
  getHistoricalRelationship,
  interpolateSnapshot,
  pairKey,
} from '../data/historicalRelationships';
import { ALL_COUNTRIES, getFlag } from '../data/allCountries';
import { getScoreColor } from '../data/relationships';
import ScoreBar from './ScoreBar';
import type { MapMode } from '../types';

interface Props {
  countryA: string;
  countryB?: string | null;
  mode: MapMode;
}

const MIN_YEAR = 2000;
const MAX_YEAR = 2025;

export default function Timeline({ countryA, countryB, mode }: Props) {
  const [year, setYear] = useState(MAX_YEAR);
  const [playing, setPlaying] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const startYearRef = useRef<number>(0);

  const hr = countryB ? getHistoricalRelationship(countryA, countryB) : null;
  const snap = hr ? interpolateSnapshot(hr, year) : null;

  // All pairs that include countryA
  const relevantPairs = HISTORICAL_RELATIONSHIPS.filter(r => r.pair[0] === countryA || r.pair[1] === countryA);

  const stopPlayback = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setPlaying(false);
  }, []);

  const startPlayback = useCallback(() => {
    setPlaying(true);
    startRef.current    = performance.now();
    startYearRef.current = year >= MAX_YEAR ? MIN_YEAR : year;
    setYear(startYearRef.current);

    const DURATION_MS = (MAX_YEAR - MIN_YEAR) * 200; // 200ms per year

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const newYear = Math.min(MAX_YEAR, startYearRef.current + (elapsed / DURATION_MS) * (MAX_YEAR - startYearRef.current));
      setYear(Math.round(newYear));
      if (newYear >= MAX_YEAR) {
        stopPlayback();
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [year, stopPlayback]);

  const togglePlay = () => playing ? stopPlayback() : startPlayback();

  const pair = countryB ? pairKey(countryA, countryB) : null;

  const a = ALL_COUNTRIES[countryA];
  const b = countryB ? ALL_COUNTRIES[countryB] : null;

  if (!a) return null;


  return (
    <div className="flex flex-col h-full" style={{ background: 'rgba(4,10,22,0.98)' }}>
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: '#1a2d44' }}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#60a5fa', fontFamily: "'Space Grotesk', sans-serif" }}>
            Historical Timeline
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(37,99,235,0.15)', color: '#64748b', fontFamily: "'Space Mono', monospace" }}>
            2000–2025
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Play/pause */}
          <button
            onClick={togglePlay}
            className="text-xs px-2.5 py-1 rounded transition-colors"
            style={{ background: playing ? 'rgba(239,68,68,0.15)' : 'rgba(37,99,235,0.18)', color: playing ? '#f87171' : '#93c5fd', border: `1px solid ${playing ? 'rgba(239,68,68,0.25)' : 'rgba(96,165,250,0.25)'}` }}
          >
            {playing ? '■ Stop' : '▶ Play'}
          </button>
        </div>
      </div>

      {/* Year slider */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs" style={{ color: '#475569' }}>{MIN_YEAR}</span>
          <span className="text-2xl font-bold" style={{ color: '#e2e8f0', fontFamily: "'Space Mono', monospace" }}>{year}</span>
          <span className="text-xs" style={{ color: '#475569' }}>{MAX_YEAR}</span>
        </div>
        <input
          type="range"
          min={MIN_YEAR}
          max={MAX_YEAR}
          value={year}
          onChange={e => { stopPlayback(); setYear(+e.target.value); }}
          className="w-full"
          style={{ accentColor: '#3b82f6', cursor: 'pointer' }}
        />
        {/* Year ticks */}
        <div className="flex justify-between mt-1 text-xs" style={{ color: '#1e3a5f', fontFamily: "'Space Mono', monospace" }}>
          {[2000, 2005, 2010, 2015, 2020, 2025].map(y => (
            <button key={y} onClick={() => { stopPlayback(); setYear(y); }} style={{ color: year === y ? '#60a5fa' : '#1e3a5f' }}>{y}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 pb-4">
        {/* Bilateral panel if a pair is selected */}
        {pair && b && hr ? (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{getFlag(a.iso2)}</span>
              <span className="text-xs" style={{ color: '#94a3b8' }}>{a.name}</span>
              <span style={{ color: '#334155' }}>⇄</span>
              <span className="text-lg">{getFlag(b.iso2)}</span>
              <span className="text-xs" style={{ color: '#94a3b8' }}>{b.name}</span>
            </div>

            {snap ? (
              <div className="rounded-lg p-3 mb-3" style={{ background: 'rgba(20,40,70,0.4)', border: '1px solid #1a2d44' }}>
                <div className="flex gap-4 mb-3">
                  <div className="text-center">
                    <div className="text-lg font-bold" style={{ color: getScoreColor(snap.polScore), fontFamily: "'Space Mono', monospace" }}>
                      {snap.polScore > 0 ? '+' : ''}{snap.polScore.toFixed(2)}
                    </div>
                    <div className="text-xs" style={{ color: '#475569' }}>Political</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold" style={{ color: getScoreColor(snap.ecoScore), fontFamily: "'Space Mono', monospace" }}>
                      {snap.ecoScore > 0 ? '+' : ''}{snap.ecoScore.toFixed(2)}
                    </div>
                    <div className="text-xs" style={{ color: '#475569' }}>Economic</div>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <ScoreBar label="Pol" score={snap.polScore} active={mode === 'political'} />
                    <ScoreBar label="Eco" score={snap.ecoScore} active={mode === 'economic'} />
                  </div>
                </div>
              </div>
            ) : null}

            {/* Timeline of events */}
            <div className="mb-2">
              <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#475569', fontFamily: "'Space Grotesk', sans-serif" }}>Key Moments</div>
              <div className="relative">
                <div className="absolute left-[3px] top-0 bottom-0 w-px" style={{ background: '#1a2d44' }} />
                {hr.snapshots.map((s, i) => {
                  const isActive = Math.abs(s.year - year) <= 2;
                  return (
                    <div
                      key={i}
                      className="flex gap-3 mb-3 cursor-pointer"
                      onClick={() => { stopPlayback(); setYear(s.year); }}
                    >
                      <div
                        className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-1.5 z-10"
                        style={{ background: isActive ? '#3b82f6' : '#1e3a5f', boxShadow: isActive ? '0 0 6px #3b82f6' : 'none' }}
                      />
                      <div className={isActive ? '' : 'opacity-50'}>
                        <div className="text-xs font-bold" style={{ color: isActive ? '#93c5fd' : '#475569', fontFamily: "'Space Mono', monospace" }}>{s.year}</div>
                        <div className="text-xs leading-relaxed" style={{ color: isActive ? '#94a3b8' : '#374151' }}>{s.note}</div>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs" style={{ color: getScoreColor(s.polScore), fontFamily: "'Space Mono', monospace" }}>
                            Pol {s.polScore > 0 ? '+' : ''}{s.polScore.toFixed(2)}
                          </span>
                          <span className="text-xs" style={{ color: getScoreColor(s.ecoScore), fontFamily: "'Space Mono', monospace" }}>
                            Eco {s.ecoScore > 0 ? '+' : ''}{s.ecoScore.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Single-country view: show all tracked pairs for this country */
          <div>
            <div className="text-xs mb-3" style={{ color: '#374151' }}>
              Tracked relationships involving <span style={{ color: '#93c5fd' }}>{a.name}</span> in {year}
            </div>
            {relevantPairs.length === 0 ? (
              <div className="text-xs italic" style={{ color: '#374151' }}>
                No historical data tracked for this country yet.
              </div>
            ) : (
              relevantPairs.map(hr => {
                const otherId = hr.pair[0] === countryA ? hr.pair[1] : hr.pair[0];
                const other   = ALL_COUNTRIES[otherId];
                const snap    = interpolateSnapshot(hr, year);
                if (!other || !snap) return null;
                const score = mode === 'political' ? snap.polScore : snap.ecoScore;
                return (
                  <div
                    key={otherId}
                    className="flex items-center justify-between mb-2 rounded px-2.5 py-2"
                    style={{ background: 'rgba(20,40,70,0.3)', border: `1px solid ${getScoreColor(score)}22` }}
                  >
                    <div className="flex items-center gap-2">
                      <span>{getFlag(other.iso2)}</span>
                      <span className="text-xs" style={{ color: '#94a3b8' }}>{other.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: getScoreColor(snap.polScore), fontFamily: "'Space Mono', monospace" }}>
                        {snap.polScore > 0 ? '+' : ''}{snap.polScore.toFixed(2)}
                      </span>
                      <span className="text-xs" style={{ color: '#334155' }}>/</span>
                      <span className="text-xs" style={{ color: getScoreColor(snap.ecoScore), fontFamily: "'Space Mono', monospace" }}>
                        {snap.ecoScore > 0 ? '+' : ''}{snap.ecoScore.toFixed(2)}
                      </span>
                      <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ background: '#0c1a28' }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.abs(score) * 100}%`,
                            background: getScoreColor(score),
                            marginLeft: score < 0 ? `${(1 + score) * 100}%` : undefined,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        <div className="mt-3 text-xs leading-relaxed" style={{ color: '#1e3a5f' }}>
          Historical data covers key bilateral relationships 2000–2025. Select a country pair to see detailed relationship arc and pivotal moments.
        </div>
      </div>
    </div>
  );
}
