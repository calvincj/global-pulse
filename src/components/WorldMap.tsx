import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import { ALL_COUNTRIES } from '../data/allCountries';
import { COUNTRIES } from '../data/countries';
import { getRelationshipsFor, getScoreColor, getScoreLabel } from '../data/relationships';
import { DISPUTED_TERRITORIES } from '../data/disputedTerritories';
import { getHistoricalRelationship, interpolateSnapshot } from '../data/historicalRelationships';
import type { MapTooltip, MapMode } from '../types';

interface Props {
  selectedCountry: string | null;
  secondaryCountry?: string | null;
  onSelectCountry: (id: string | null) => void;
  onHoverCountry?: (id: string | null) => void;
  mode: MapMode;
  isMobile?: boolean;
  onTimelineYearChange?: (year: number | null) => void;
}

// Complete ISO numeric → alpha-3 for every feature in world-atlas 50m
const N2A: Record<number, string> = {
  4:'AFG', 8:'ALB', 12:'DZA', 16:'ASM', 20:'AND', 24:'AGO', 28:'ATG',
  31:'AZE', 32:'ARG', 36:'AUS', 40:'AUT', 44:'BHS', 48:'BHR', 50:'BGD',
  51:'ARM', 52:'BRB', 56:'BEL', 60:'BMU', 64:'BTN', 68:'BOL', 70:'BIH',
  72:'BWA', 76:'BRA', 84:'BLZ', 86:'IOT', 90:'SLB', 92:'VGB', 96:'BRN',
  100:'BGR', 104:'MMR', 108:'BDI', 112:'BLR', 116:'KHM', 120:'CMR',
  124:'CAN', 132:'CPV', 136:'CYM', 140:'CAF', 144:'LKA', 148:'TCD',
  152:'CHL', 156:'CHN', 158:'TWN', 170:'COL', 174:'COM', 178:'COG',
  180:'COD', 184:'COK', 188:'CRI', 191:'HRV', 192:'CUB', 196:'CYP',
  203:'CZE', 204:'BEN', 208:'DNK', 212:'DMA', 214:'DOM', 218:'ECU',
  222:'SLV', 226:'GNQ', 231:'ETH', 232:'ERI', 233:'EST', 234:'FRO',
  238:'FLK', 242:'FJI', 246:'FIN', 250:'FRA', 258:'PYF', 262:'DJI',
  266:'GAB', 268:'GEO', 270:'GMB', 275:'PSE', 276:'DEU', 288:'GHA',
  296:'KIR', 300:'GRC', 304:'GRL', 308:'GRD', 316:'GUM', 320:'GTM',
  324:'GIN', 328:'GUY', 332:'HTI', 336:'VAT', 340:'HND', 344:'HKG',
  348:'HUN', 352:'ISL', 356:'IND', 360:'IDN', 364:'IRN', 368:'IRQ',
  372:'IRL', 376:'ISR', 380:'ITA', 384:'CIV', 388:'JAM', 392:'JPN',
  398:'KAZ', 400:'JOR', 404:'KEN', 408:'PRK', 410:'KOR', 414:'KWT',
  417:'KGZ', 418:'LAO', 422:'LBN', 426:'LSO', 428:'LVA', 430:'LBR',
  434:'LBY', 438:'LIE', 440:'LTU', 442:'LUX', 446:'MAC', 450:'MDG',
  454:'MWI', 458:'MYS', 462:'MDV', 466:'MLI', 470:'MLT', 478:'MRT',
  480:'MUS', 484:'MEX', 492:'MCO', 496:'MNG', 498:'MDA', 499:'MNE',
  500:'MSR', 504:'MAR', 508:'MOZ', 512:'OMN', 516:'NAM', 520:'NRU',
  524:'NPL', 528:'NLD', 531:'CUW', 533:'ABW', 534:'SXM', 540:'NCL',
  548:'VUT', 554:'NZL', 558:'NIC', 562:'NER', 566:'NGA', 578:'NOR',
  580:'MNP', 583:'FSM', 584:'MHL', 585:'PLW', 586:'PAK', 591:'PAN',
  598:'PNG', 600:'PRY', 604:'PER', 608:'PHL', 616:'POL', 620:'PRT',
  624:'GNB', 626:'TLS', 630:'PRI', 634:'QAT', 642:'ROU', 643:'RUS',
  646:'RWA', 652:'BLM', 654:'SHN', 659:'KNA', 660:'AIA', 662:'LCA',
  663:'MAF', 666:'SPM', 670:'VCT', 674:'SMR', 678:'STP', 682:'SAU',
  686:'SEN', 688:'SRB', 690:'SYC', 694:'SLE', 702:'SGP', 703:'SVK',
  704:'VNM', 705:'SVN', 706:'SOM', 710:'ZAF', 716:'ZWE', 724:'ESP',
  728:'SSD', 729:'SDN', 732:'ESH', 740:'SUR', 748:'SWZ', 752:'SWE',
  756:'CHE', 760:'SYR', 762:'TJK', 764:'THA', 768:'TGO', 776:'TON',
  780:'TTO', 784:'ARE', 788:'TUN', 792:'TUR', 795:'TKM', 796:'TCA',
  800:'UGA', 804:'UKR', 807:'MKD', 818:'EGY', 826:'GBR', 831:'GGY',
  832:'JEY', 833:'IMN', 834:'TZA', 840:'USA', 850:'VIR', 854:'BFA',
  858:'URY', 860:'UZB', 862:'VEN', 876:'WLF', 882:'WSM', 887:'YEM',
  894:'ZMB',
};

const OCEAN = '#060f1e';
const BASE  = '#182d48';
const DIM   = '#0c1a28';
const TL_MIN = 2000;
const TL_MAX = 2025;

export default function WorldMap({ selectedCountry, secondaryCountry, onSelectCountry, onHoverCountry, mode, isMobile, onTimelineYearChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef        = useRef<SVGSVGElement>(null);
  const gRef          = useRef<SVGGElement | null>(null);
  const lastHoverRef  = useRef<string | null>(null);
  const transformRef  = useRef<d3.ZoomTransform>(d3.zoomIdentity);
  const [tooltip, setTooltip]   = useState<MapTooltip | null>(null);
  const [topoData, setTopoData] = useState<Topology | null>(null);
  const [dims, setDims]         = useState<{ w: number; h: number } | null>(null);

  // Timeline state — lives here since controls are in the map
  const [tlYear, setTlYear]       = useState(TL_MAX);
  const [tlPlaying, setTlPlaying] = useState(false);
  const tlRafRef    = useRef<number | null>(null);
  const tlStartRef  = useRef<number>(0);
  const tlStartYRef = useRef<number>(TL_MIN);
  // Debounced lift to App so sidebar doesn't re-render every RAF frame
  const tlNotifyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json')
      .then(r => r.json()).then(setTopoData).catch(console.error);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    let prevW = 0, prevH = 0;
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0 && (Math.abs(width - prevW) > 10 || Math.abs(height - prevH) > 10)) {
        prevW = width; prevH = height;
        setDims({ w: width, h: height });
      }
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Notify App of timeline year with debounce so sidebar updates ~100ms after year settles
  const notifyYear = useCallback((y: number) => {
    if (tlNotifyTimerRef.current) clearTimeout(tlNotifyTimerRef.current);
    tlNotifyTimerRef.current = setTimeout(() => {
      onTimelineYearChange?.(y >= TL_MAX ? null : y);
    }, 100);
  }, [onTimelineYearChange]);

  const handleYearChange = useCallback((y: number) => {
    setTlYear(y);
    notifyYear(y);
  }, [notifyYear]);

  const stopPlay = useCallback(() => {
    if (tlRafRef.current != null) cancelAnimationFrame(tlRafRef.current);
    tlRafRef.current = null;
    setTlPlaying(false);
  }, []);

  const startPlay = useCallback(() => {
    const fromYear = tlYear >= TL_MAX ? TL_MIN : tlYear;
    setTlPlaying(true);
    tlStartRef.current  = performance.now();
    tlStartYRef.current = fromYear;
    handleYearChange(fromYear);

    // 25 years × 180ms each = 4.5 seconds total
    const DURATION_MS = (TL_MAX - TL_MIN) * 180;

    const tick = (now: number) => {
      const elapsed = now - tlStartRef.current;
      const progress = Math.min(1, elapsed / DURATION_MS);
      const newYear = Math.round(tlStartYRef.current + progress * (TL_MAX - tlStartYRef.current));
      handleYearChange(newYear);
      if (newYear >= TL_MAX) {
        stopPlay();
      } else {
        tlRafRef.current = requestAnimationFrame(tick);
      }
    };
    tlRafRef.current = requestAnimationFrame(tick);
  }, [tlYear, handleYearChange, stopPlay]);

  const togglePlay = () => tlPlaying ? stopPlay() : startPlay();

  const resetToLive = useCallback(() => {
    stopPlay();
    handleYearChange(TL_MAX);
  }, [stopPlay, handleYearChange]);

  const alpha3 = useCallback((num: number) => N2A[num] ?? null, []);

  const getFill = useCallback((id: string | null): string => {
    if (!id) return BASE;
    if (id === selectedCountry) return '#3b82f6';
    if (id === secondaryCountry) return '#7c3aed';
    if (selectedCountry) {
      const inHistoricalMode = tlYear < TL_MAX;
      if (inHistoricalMode) {
        const hr = getHistoricalRelationship(selectedCountry, id);
        if (hr) {
          const snap = interpolateSnapshot(hr, tlYear);
          if (snap) {
            return getScoreColor(mode === 'political' ? snap.polScore : snap.ecoScore);
          }
        }
        // No historical data for this pair — fall through to current score
      }
      const rels = getRelationshipsFor(selectedCountry);
      const rel  = rels.find(r => r.source === id || r.target === id);
      if (rel) {
        return getScoreColor(mode === 'political' ? rel.polScore : rel.ecoScore);
      }
      return DIM;
    }
    return COUNTRIES[id] ? '#1e4878' : BASE;
  }, [selectedCountry, secondaryCountry, mode, tlYear]);

  // Rebuild map whenever topo data OR container dims change
  useEffect(() => {
    if (!topoData || !svgRef.current || !dims) return;
    const { w: W, h: H } = dims;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const proj = d3.geoNaturalEarth1().scale(W / 6.2).translate([W / 2, H / 2]);
    const path = d3.geoPath().projection(proj);

    svg.append('rect').attr('width', W).attr('height', H).attr('fill', OCEAN);

    const g = svg.append('g');
    gRef.current = g.node();

    g.append('path')
      .datum({ type: 'Sphere' } as d3.GeoPermissibleObjects)
      .attr('d', path as d3.ValueFn<SVGPathElement, d3.GeoPermissibleObjects, string | null>)
      .attr('fill', 'none')
      .attr('stroke', '#1e3a5f')
      .attr('stroke-width', 1.5)
      .style('pointer-events', 'none');

    g.append('path')
      .datum(d3.geoGraticule()())
      .attr('d', path as d3.ValueFn<SVGPathElement, d3.GeoPermissibleObjects, string | null>)
      .attr('fill', 'none')
      .attr('stroke', '#07121f')
      .attr('stroke-width', 0.3)
      .style('pointer-events', 'none');

    const features = topojson.feature(
      topoData,
      (topoData as any).objects.countries as GeometryCollection
    );

    g.selectAll<SVGPathElement, (typeof features)['features'][number]>('path.cp')
      .data(features.features)
      .join('path')
      .attr('class', d => `cp country-path${alpha3(+d.id!) === selectedCountry ? ' selected' : ''}`)
      .attr('d', path as d3.ValueFn<SVGPathElement, typeof features.features[number], string | null>)
      .attr('fill', d => getFill(alpha3(+d.id!)))
      .on('mousemove', (event, d) => {
        if (isMobile) return;
        const a3 = alpha3(+d.id!);
        const c  = a3 ? ALL_COUNTRIES[a3] : null;
        if (!c) return;
        const rels = selectedCountry
          ? getRelationshipsFor(selectedCountry).find(r => r.source === a3 || r.target === a3)
          : null;
        setTooltip({ x: event.clientX, y: event.clientY, name: c.name, polScore: rels?.polScore, ecoScore: rels?.ecoScore });
        if (lastHoverRef.current !== a3) {
          lastHoverRef.current = a3;
          onHoverCountry?.(a3);
        }
      })
      .on('mouseleave', () => {
        if (isMobile) return;
        setTooltip(null);
        lastHoverRef.current = null;
        onHoverCountry?.(null);
      })
      .on('click', (event, d) => {
        event.stopPropagation();
        const a3 = alpha3(+d.id!);
        if (!a3 || !ALL_COUNTRIES[a3]) return;
        onSelectCountry(a3 === selectedCountry ? null : a3);
      });

    g.append('path')
      .datum(topojson.mesh(
        topoData,
        (topoData as any).objects.countries as GeometryCollection,
        (a, b) => a !== b
      ))
      .attr('d', path as d3.ValueFn<SVGPathElement, d3.GeoPermissibleObjects, string | null>)
      .attr('fill', 'none')
      .attr('stroke', '#0a1d30')
      .attr('stroke-width', 0.5)
      .style('vector-effect', 'non-scaling-stroke')
      .style('pointer-events', 'none');

    for (const dt of DISPUTED_TERRITORIES) {
      if (!ALL_COUNTRIES[dt.id]) continue;
      const feature = { type: 'Feature' as const, geometry: dt.geometry, properties: {} };
      g.append('path')
        .datum(feature)
        .attr('class', `cp country-path${dt.id === selectedCountry ? ' selected' : ''}`)
        .attr('data-dtid', dt.id)
        .attr('d', path as d3.ValueFn<SVGPathElement, typeof feature, string | null>)
        .attr('fill', getFill(dt.id))
        .attr('stroke', '#facc15')
        .attr('stroke-width', 0.8)
        .attr('stroke-dasharray', '3,2')
        .style('vector-effect', 'non-scaling-stroke')
        .on('mousemove', (event) => {
          if (isMobile) return;
          const c = ALL_COUNTRIES[dt.id];
          const rels = selectedCountry
            ? getRelationshipsFor(selectedCountry).find(r => r.source === dt.id || r.target === dt.id)
            : null;
          setTooltip({ x: event.clientX, y: event.clientY, name: c.name, polScore: rels?.polScore, ecoScore: rels?.ecoScore });
          if (lastHoverRef.current !== dt.id) {
            lastHoverRef.current = dt.id;
            onHoverCountry?.(dt.id);
          }
        })
        .on('mouseleave', () => {
          if (isMobile) return;
          setTooltip(null);
          lastHoverRef.current = null;
          onHoverCountry?.(null);
        })
        .on('click', (event) => {
          event.stopPropagation();
          onSelectCountry(dt.id === selectedCountry ? null : dt.id);
        });
    }

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 40])
      .on('zoom', ev => {
        g.attr('transform', ev.transform.toString());
        transformRef.current = ev.transform;
      });
    svg.call(zoom);
    svg.call(zoom.transform, transformRef.current);
    svg.on('click.deselect', () => { onSelectCountry(null); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topoData, dims]);

  // Recolor on selection/mode/year change without full rebuild
  useEffect(() => {
    if (!gRef.current) return;
    const g = d3.select(gRef.current);

    g.selectAll<SVGPathElement, { id?: string | number }>('path.cp:not([data-dtid])')
      .attr('fill', d => getFill(alpha3(+(d.id ?? 0))))
      .attr('class', d => `cp country-path${alpha3(+(d.id ?? 0)) === selectedCountry ? ' selected' : ''}`);

    for (const dt of DISPUTED_TERRITORIES) {
      g.select<SVGPathElement>(`path[data-dtid="${dt.id}"]`)
        .attr('fill', getFill(dt.id))
        .attr('class', `cp country-path${dt.id === selectedCountry ? ' selected' : ''}`);
    }
  }, [selectedCountry, secondaryCountry, mode, getFill, alpha3]);

  const activeScore = tooltip
    ? (mode === 'political' ? tooltip.polScore : tooltip.ecoScore)
    : undefined;

  const isHistoricalMode = tlYear < TL_MAX;

  return (
    <div ref={containerRef} className="relative w-full h-full" style={{ background: OCEAN }}>
      <svg ref={svgRef} className="w-full h-full" />

      {!topoData && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div style={{ color: '#60a5fa', fontFamily: "'Space Mono', monospace" }} className="text-sm">Loading map…</div>
        </div>
      )}

      {tooltip && (
        <div
          className="absolute z-50 rounded px-3 py-1.5 pointer-events-none"
          style={{ left: tooltip.x + 14, top: tooltip.y - 44, background: 'rgba(6,9,20,0.95)', border: '1px solid #1e3a5f' }}
        >
          <div className="font-semibold text-xs text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{tooltip.name}</div>
          {activeScore !== undefined && (
            <div className="flex items-center gap-1.5 mt-1">
              <div className="text-xs" style={{ color: '#64748b', fontFamily: "'Space Mono', monospace" }}>{mode === 'political' ? 'Pol' : 'Eco'}:</div>
              <div className="text-xs font-medium" style={{ color: getScoreColor(activeScore), fontFamily: "'Space Mono', monospace" }}>
                {activeScore > 0 ? '+' : ''}{activeScore.toFixed(2)} · {getScoreLabel(activeScore)}
              </div>
            </div>
          )}
          {tooltip.polScore !== undefined && tooltip.ecoScore !== undefined && (
            <div className="flex gap-3 mt-0.5">
              <div className="text-xs" style={{ color: getScoreColor(tooltip.polScore), fontFamily: "'Space Mono', monospace" }}>
                Pol {tooltip.polScore > 0 ? '+' : ''}{tooltip.polScore.toFixed(2)}
              </div>
              <div className="text-xs" style={{ color: getScoreColor(tooltip.ecoScore), fontFamily: "'Space Mono', monospace" }}>
                Eco {tooltip.ecoScore > 0 ? '+' : ''}{tooltip.ecoScore.toFixed(2)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Historical mode badge */}
      {isHistoricalMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs pointer-events-none z-10 flex items-center gap-2"
          style={{ background: 'rgba(6,9,20,0.9)', border: '1px solid rgba(96,165,250,0.35)', color: '#60a5fa', whiteSpace: 'nowrap', fontFamily: "'Space Mono', monospace" }}>
          <span style={{ color: '#3b82f6' }}>◉</span>
          Historical view — {tlYear}
        </div>
      )}

      {/* Mobile tap hint */}
      {isMobile && selectedCountry && !secondaryCountry && !isHistoricalMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1.5 text-xs pointer-events-none"
          style={{ background: 'rgba(6,9,20,0.85)', border: '1px solid #1e3a5f', color: '#64748b', whiteSpace: 'nowrap' }}>
          Tap another country to compare
        </div>
      )}

      {/* Bottom overlay: legend + timeline controls */}
      <div className="absolute bottom-4 left-4 right-4 flex items-end gap-3 pointer-events-none">
        {/* Legend */}
        <div className="rounded-lg px-3 py-2.5 flex-shrink-0 pointer-events-auto" style={{ background: 'rgba(4,8,18,0.88)', border: '1px solid #162030', minWidth: 140 }}>
          {selectedCountry ? (
            <>
              <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#475569', fontFamily: "'Space Grotesk', sans-serif" }}>
                {mode === 'political' ? 'Political Alignment' : 'Economic Integration'}
              </div>
              <div
                className="h-2 rounded-full mb-1"
                style={{ background: 'linear-gradient(to right, rgb(220,38,38), rgb(239,100,30), rgb(234,179,8), rgb(163,230,53), rgb(22,163,74))' }}
              />
              <div className="flex justify-between text-xs" style={{ color: '#374151' }}>
                <span>Hostile</span><span>Neutral</span><span>Allied</span>
              </div>
              <div className="flex justify-between text-xs mt-0.5" style={{ color: '#1e2d3d', fontFamily: "'Space Mono', monospace" }}>
                <span>−1</span><span>0</span><span>+1</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs" style={{ color: '#4b5563' }}>
                <div className="w-3 h-0.5" style={{ background: '#facc15', backgroundImage: 'repeating-linear-gradient(90deg, #facc15 0, #facc15 3px, transparent 3px, transparent 5px)' }} />
                Disputed territory
              </div>
            </>
          ) : (
            <span className="text-xs" style={{ color: '#334155' }}>Click any country to explore</span>
          )}
        </div>

        {/* Timeline controls — shown when a country is selected */}
        {selectedCountry && (
          <div className="rounded-lg px-3 py-2.5 flex-1 pointer-events-auto" style={{ background: 'rgba(4,8,18,0.88)', border: `1px solid ${isHistoricalMode ? 'rgba(96,165,250,0.3)' : '#162030'}`, maxWidth: 300 }}>
            <div className="flex items-center gap-2 mb-1.5">
              <button
                onClick={togglePlay}
                className="text-xs px-2 py-0.5 rounded flex-shrink-0 transition-colors"
                style={{
                  background: tlPlaying ? 'rgba(239,68,68,0.18)' : 'rgba(37,99,235,0.18)',
                  color: tlPlaying ? '#f87171' : '#93c5fd',
                  border: `1px solid ${tlPlaying ? 'rgba(239,68,68,0.3)' : 'rgba(96,165,250,0.25)'}`,
                }}
              >
                {tlPlaying ? '■' : '▶'}
              </button>
              <span
                className="text-sm font-bold flex-shrink-0"
                style={{ color: isHistoricalMode ? '#60a5fa' : '#334155', fontFamily: "'Space Mono', monospace", minWidth: 38 }}
              >
                {isHistoricalMode ? tlYear : 'Live'}
              </span>
              {isHistoricalMode && (
                <button
                  onClick={resetToLive}
                  className="text-xs flex-shrink-0"
                  style={{ color: '#475569' }}
                  title="Return to current data"
                >
                  ↺ Live
                </button>
              )}
            </div>
            <input
              type="range"
              min={TL_MIN}
              max={TL_MAX}
              value={tlYear}
              onChange={e => { stopPlay(); handleYearChange(+e.target.value); }}
              className="w-full"
              style={{ accentColor: '#3b82f6', cursor: 'pointer', height: 4 }}
            />
            <div className="flex justify-between mt-1" style={{ fontFamily: "'Space Mono', monospace" }}>
              {[2000, 2005, 2010, 2015, 2020, 2025].map(y => (
                <button
                  key={y}
                  onClick={() => { stopPlay(); handleYearChange(y); }}
                  className="text-xs"
                  style={{ color: tlYear === y ? '#60a5fa' : '#1e3a5f' }}
                >
                  {y === 2025 ? 'Now' : y}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
