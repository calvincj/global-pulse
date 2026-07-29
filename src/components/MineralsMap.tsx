import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import type { GeometryCollection } from 'topojson-specification';
import { useWorldTopology } from '../hooks/useWorldTopology';
import { ALL_COUNTRIES } from '../data/allCountries';
import { MINERAL_PRODUCTION } from '../data/criticalMinerals/production';
import { MINERAL_FACILITIES } from '../data/criticalMinerals/facilities';
import { MINERALS, MINERALS_BY_KEY } from '../data/criticalMinerals/minerals';
import { DOWNSTREAM_CATEGORIES } from '../types/criticalMinerals';
import type {
  MineralStage,
  MineralTradeArc,
  DownstreamTradeArc,
  DownstreamCategory,
  FacilityAssetType,
} from '../types/criticalMinerals';

interface Props {
  selectedCountry: string | null;
  onSelectCountry: (id: string | null) => void;
  isMobile?: boolean;
  selectedFacility: string | null;
  onSelectFacility: (id: string | null) => void;
  onActiveContextChange?: (ctx: { mineral: string; stage: MineralStage | 'downstream'; metric: Metric }) => void;
}

export type Metric = 'production' | 'consumption';
type ViewStage = MineralStage | 'downstream';

const OCEAN = '#060f1e';
const BASE  = '#0e1b2e'; // known country, NO data for this mineral/stage — deliberately close to OCEAN so it reads as "blank," not "low value"

// Sequential ramp (blue), reversed for this dark map: near-zero fades toward the
// background, high values pop bright — the opposite direction from the skill's
// light-surface default, which is correct for a dark chart surface. Kept clearly
// brighter than BASE at every step so "has data, value≈0" never looks like "no data."
const SEQ_LOW  = '#1c4d8f'; // has data, near-zero — still visibly blue, not background
const SEQ_HIGH = '#cde2fb'; // brightest, highest value

// Categorical, validated (node scripts/validate_palette.js, dark mode, surface #060c14):
// all 5 checks pass for this 4-slot ordering.
const ASSET_TYPE_COLOR: Record<FacilityAssetType, string> = {
  mine: '#3987e5',
  smelter: '#d95926',
  refinery: '#199e70',
  plant: '#c98500',
};

const DOWNSTREAM_SLUG: Record<DownstreamCategory, string> = {
  'EV': 'ev',
  'Battery storage': 'battery',
  'Solar Products': 'solar',
  'Wind Products': 'wind',
  'Hydroelectric': 'hydro',
  'Nuclear Products': 'nuclear',
  'Biomass': 'biomass',
};

const MINERAL_TRADE_SLUG: Record<string, string> = {
  Cobalt: 'cobalt', Graphite: 'graphite', Lithium: 'lithium', Manganese: 'manganese', Nickel: 'nickel',
};

// ICMM facility commodities use lowercase generic names that don't always match our
// mineral keys 1:1 (e.g. "lanthanides" vs our "Rare Earths"). Everything not listed
// here just gets its first letter capitalized ("copper" -> "Copper").
const COMMODITY_TO_MINERAL: Record<string, string> = {
  lanthanides: 'Rare Earths',
  palladium: 'Platinum Group Metals',
  platinum: 'Platinum Group Metals',
};
function commodityToMineral(commodity: string): string {
  const c = commodity.trim().toLowerCase();
  if (COMMODITY_TO_MINERAL[c]) return COMMODITY_TO_MINERAL[c];
  return c.charAt(0).toUpperCase() + c.slice(1);
}

function getCountryValue(countryId: string, mineral: string, stage: MineralStage, metric: Metric): number | null {
  const stats = MINERAL_PRODUCTION[countryId];
  if (!stats) return null;
  const row = stats.find(s => s.mineral === mineral && s.stage === stage);
  if (!row) return null;
  return metric === 'production' ? row.productionKg : row.consumptionKg;
}

function arcPath(x1: number, y1: number, x2: number, y2: number): string {
  const dx = x2 - x1, dy = y2 - y1;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const curve = dist * 0.15;
  const mx = (x1 + x2) / 2 + (-dy / dist) * curve;
  const my = (y1 + y2) / 2 + (dx / dist) * curve;
  return `M${x1},${y1} Q${mx},${my} ${x2},${y2}`;
}

export default function MineralsMap({
  selectedCountry, onSelectCountry, isMobile, selectedFacility, onSelectFacility, onActiveContextChange,
}: Props) {
  const { containerRef, topoData, dims, N2A } = useWorldTopology();
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement | null>(null);
  const facilityGroupRef = useRef<SVGGElement | null>(null);
  const arcGroupRef = useRef<SVGGElement | null>(null);
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);
  const projRef = useRef<d3.GeoProjection | null>(null);
  const selectedCountryRef = useRef(selectedCountry);
  const selectedFacilityRef = useRef(selectedFacility);
  useEffect(() => { selectedCountryRef.current = selectedCountry; }, [selectedCountry]);
  useEffect(() => { selectedFacilityRef.current = selectedFacility; }, [selectedFacility]);

  const [tooltip, setTooltip] = useState<{ x: number; y: number; title: string; note: string } | null>(null);

  const [mineral, setMineral] = useState('Lithium');
  const [stage, setStage] = useState<ViewStage>('raw');
  const [metric, setMetric] = useState<Metric>('production');
  const [downstreamCategory, setDownstreamCategory] = useState<DownstreamCategory>('EV');
  const [showFacilities, setShowFacilities] = useState(true);
  const [showTradeArcs, setShowTradeArcs] = useState(true);
  const [mineralPickerOpen, setMineralPickerOpen] = useState(false);
  const [mineralQuery, setMineralQuery] = useState('');

  const [mineralArcs, setMineralArcs] = useState<MineralTradeArc[] | null>(null);
  const [downstreamArcs, setDownstreamArcs] = useState<DownstreamTradeArc[] | null>(null);

  const meta = MINERALS_BY_KEY[mineral];

  useEffect(() => {
    onActiveContextChange?.({ mineral, stage, metric });
  }, [mineral, stage, metric, onActiveContextChange]);

  // Lazy-load this mineral's trade arcs only when it's one of the 5 with coverage.
  useEffect(() => {
    setMineralArcs(null);
    if (!meta?.hasTradeArcs) return;
    const slug = MINERAL_TRADE_SLUG[mineral];
    let cancelled = false;
    import(`../data/criticalMinerals/mineralTrade/${slug}.ts`).then(m => {
      if (!cancelled) setMineralArcs(m.MINERAL_TRADE_ARCS);
    });
    return () => { cancelled = true; };
  }, [mineral, meta?.hasTradeArcs]);

  // Lazy-load the selected downstream category's arcs only when that stage is active.
  useEffect(() => {
    if (stage !== 'downstream') { setDownstreamArcs(null); return; }
    let cancelled = false;
    const slug = DOWNSTREAM_SLUG[downstreamCategory];
    import(`../data/criticalMinerals/downstream/${slug}.ts`).then(m => {
      if (!cancelled) setDownstreamArcs(m.DOWNSTREAM_ARCS);
    });
    return () => { cancelled = true; };
  }, [stage, downstreamCategory]);

  const colorDomainMax = useMemo(() => {
    if (stage === 'downstream') return 0;
    let max = 0;
    for (const countryId of Object.keys(MINERAL_PRODUCTION)) {
      const v = getCountryValue(countryId, mineral, stage, metric);
      if (v != null && v > max) max = v;
    }
    return max;
  }, [mineral, stage, metric]);

  const getFill = useCallback((id: string | null): string => {
    if (!id) return BASE;
    if (id === selectedCountry) return '#3b82f6';
    if (stage === 'downstream') return BASE; // no per-country downstream production stats — trade arcs only
    const v = getCountryValue(id, mineral, stage, metric);
    if (v == null) return BASE;
    if (colorDomainMax <= 0) return SEQ_LOW;
    const t = Math.pow(Math.min(1, v / colorDomainMax), 0.4); // concave: spreads out the long tail of small producers
    return d3.interpolateRgb(SEQ_LOW, SEQ_HIGH)(t);
  }, [selectedCountry, mineral, stage, metric, colorDomainMax]);

  const alpha3 = useCallback((num: number) => N2A[num] ?? null, [N2A]);

  // ---------------------------------------------------------------------------
  // Build the base map once per topology/size change (mirrors WorldMap.tsx).
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!topoData || !svgRef.current || !dims) return;
    const { w: W, h: H } = dims;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const proj = d3.geoNaturalEarth1().scale(W / 6.2).translate([W / 2, H / 2]);
    projRef.current = proj;
    const path = d3.geoPath().projection(proj);

    svg.append('rect').attr('width', W).attr('height', H).attr('fill', OCEAN);

    const g = svg.append('g');
    gRef.current = g.node();

    g.append('path')
      .datum({ type: 'Sphere' } as d3.GeoPermissibleObjects)
      .attr('d', path as d3.ValueFn<SVGPathElement, d3.GeoPermissibleObjects, string | null>)
      .attr('fill', 'none').attr('stroke', '#1e3a5f').attr('stroke-width', 1.5)
      .style('pointer-events', 'none');

    g.append('path')
      .datum(d3.geoGraticule()())
      .attr('d', path as d3.ValueFn<SVGPathElement, d3.GeoPermissibleObjects, string | null>)
      .attr('fill', 'none').attr('stroke', '#07121f').attr('stroke-width', 0.3)
      .style('pointer-events', 'none');

    const features = topojson.feature(topoData, (topoData as any).objects.countries as GeometryCollection);

    g.selectAll<SVGPathElement, (typeof features)['features'][number]>('path.cp')
      .data(features.features)
      .join('path')
      .attr('class', 'cp')
      .attr('d', path as d3.ValueFn<SVGPathElement, typeof features.features[number], string | null>)
      .attr('fill', d => getFill(alpha3(+(d.id ?? 0))))
      .attr('stroke', '#0a1929').attr('stroke-width', 0.4)
      .style('cursor', 'pointer')
      .on('mousemove', (event, d) => {
        if (isMobile) return;
        const a3 = alpha3(+(d.id ?? 0));
        const country = a3 ? ALL_COUNTRIES[a3] : null;
        if (!country) return;
        const v = a3 ? getCountryValue(a3, mineral, stage as MineralStage, metric) : null;
        setTooltip({
          x: event.clientX, y: event.clientY,
          title: country.name,
          note: v != null ? `${metric === 'production' ? 'Production' : 'Consumption'}: ${fmtKg(v)}` : 'No data for this mineral/stage',
        });
      })
      .on('mouseleave', () => { if (!isMobile) setTooltip(null); })
      .on('click', (event, d) => {
        event.stopPropagation();
        const a3 = alpha3(+(d.id ?? 0));
        if (a3) onSelectCountry(a3 === selectedCountryRef.current ? null : a3);
      });

    // Facility markers layer
    const facilityG = g.append('g').attr('class', 'facility-markers');
    facilityGroupRef.current = facilityG.node();

    // Trade-arc layer (drawn above countries, below facility dots so arcs don't hide markers)
    const arcG = g.append('g').attr('class', 'trade-arcs');
    arcGroupRef.current = arcG.node();
    g.node()?.insertBefore(arcG.node()!, facilityG.node());

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 40])
      .on('zoom', ev => { g.attr('transform', ev.transform.toString()); transformRef.current = ev.transform; });
    svg.call(zoom);
    svg.call(zoom.transform, transformRef.current);
    svg.on('click.deselect', () => { onSelectCountry(null); onSelectFacility(null); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topoData, dims]);

  // Recolor countries without a full rebuild
  useEffect(() => {
    if (!gRef.current) return;
    d3.select(gRef.current)
      .selectAll<SVGPathElement, { id?: string | number }>('path.cp')
      .attr('fill', d => getFill(alpha3(+(d.id ?? 0))));
  }, [getFill, alpha3]);

  // Facility markers: rebuild when topology/size/filter/visibility changes
  useEffect(() => {
    if (!facilityGroupRef.current || !projRef.current) return;
    const proj = projRef.current;
    const group = d3.select(facilityGroupRef.current);
    group.selectAll('*').remove();
    group.style('display', showFacilities ? '' : 'none');
    if (!showFacilities) return;

    const relevant = MINERAL_FACILITIES.filter(f => commodityToMineral(f.primaryCommodity) === mineral
      || (f.secondaryCommodity && commodityToMineral(f.secondaryCommodity) === mineral));

    for (const f of relevant) {
      const pt = proj([f.coordinates[1], f.coordinates[0]]);
      if (!pt) continue;
      const [x, y] = pt;
      const color = ASSET_TYPE_COLOR[f.assetTypes[0]] ?? '#64748b';
      const r = 3.5;

      const fg = group.append('g').attr('data-facility-id', f.id);
      fg.append('circle')
        .attr('cx', x).attr('cy', y).attr('r', r)
        .attr('fill', color).attr('fill-opacity', 0.85)
        .attr('stroke', '#fff').attr('stroke-width', f.id === selectedFacilityRef.current ? 1.5 : 0.5)
        .style('vector-effect', 'non-scaling-stroke');
      fg.append('circle')
        .attr('cx', x).attr('cy', y).attr('r', 7)
        .attr('fill', 'transparent').style('cursor', 'pointer')
        .on('mousemove', (event) => {
          if (isMobile) return;
          setTooltip({ x: event.clientX, y: event.clientY, title: f.name, note: `${f.assetTypes.join(', ')} · ${ALL_COUNTRIES[f.countryId]?.name ?? f.countryId}` });
        })
        .on('mouseleave', () => { if (!isMobile) setTooltip(null); })
        .on('click', (event) => {
          event.stopPropagation();
          onSelectFacility(f.id === selectedFacilityRef.current ? null : f.id);
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFacilities, mineral, topoData, dims]);

  // Trade arcs: rebuild when the relevant arc dataset, selection, or filters change
  useEffect(() => {
    if (!arcGroupRef.current || !projRef.current) return;
    const proj = projRef.current;
    const group = d3.select(arcGroupRef.current);
    group.selectAll('*').remove();
    group.style('display', showTradeArcs ? '' : 'none');
    if (!showTradeArcs) return;

    let arcs: { exporterId: string; importerId: string; tradeValueUsd: number; sourceCoords: [number, number]; targetCoords: [number, number] }[] = [];
    if (stage === 'downstream') {
      arcs = downstreamArcs ?? [];
    } else if (mineralArcs) {
      arcs = mineralArcs.filter(a => a.stage === stage);
    }
    if (arcs.length === 0) return;

    const relevant = selectedCountry
      ? arcs.filter(a => a.exporterId === selectedCountry || a.importerId === selectedCountry)
      : [...arcs].sort((a, b) => b.tradeValueUsd - a.tradeValueUsd).slice(0, 40);

    if (relevant.length === 0) return;
    const maxVal = Math.max(...relevant.map(a => a.tradeValueUsd));
    const widthScale = d3.scaleSqrt().domain([0, maxVal]).range([0.5, 3.5]);
    const opacityScale = d3.scaleSqrt().domain([0, maxVal]).range([0.15, 0.65]);

    for (const a of relevant) {
      const p1 = proj([a.sourceCoords[1], a.sourceCoords[0]]);
      const p2 = proj([a.targetCoords[1], a.targetCoords[0]]);
      if (!p1 || !p2) continue;
      group.append('path')
        .attr('d', arcPath(p1[0], p1[1], p2[0], p2[1]))
        .attr('fill', 'none')
        .attr('stroke', '#60a5fa')
        .attr('stroke-width', widthScale(a.tradeValueUsd))
        .attr('opacity', opacityScale(a.tradeValueUsd))
        .style('pointer-events', 'none');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTradeArcs, stage, mineralArcs, downstreamArcs, selectedCountry, topoData, dims]);

  const filteredMinerals = mineralQuery
    ? MINERALS.filter(m => m.label.toLowerCase().includes(mineralQuery.toLowerCase()))
    : MINERALS;

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
          className="fixed z-50 pointer-events-none rounded px-2.5 py-1.5 text-xs max-w-xs"
          style={{ left: tooltip.x + 14, top: tooltip.y + 14, background: 'rgba(6,9,20,0.95)', border: '1px solid #1e3a5f', color: '#e2e8f0' }}
        >
          <div className="font-semibold">{tooltip.title}</div>
          <div style={{ color: '#94a3b8' }}>{tooltip.note}</div>
        </div>
      )}

      {/* Top overlay: mineral picker + stage/metric controls */}
      <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 pointer-events-none">
        <div className="relative pointer-events-auto">
          <button
            onClick={() => setMineralPickerOpen(v => !v)}
            className="rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1.5"
            style={{ background: 'rgba(6,9,20,0.9)', border: '1px solid #1e3a5f', color: '#e2e8f0' }}
          >
            <span>⛏</span> {meta?.label ?? mineral} <span style={{ color: '#475569' }}>▾</span>
          </button>
          {mineralPickerOpen && (
            <div className="absolute top-full mt-1 left-0 rounded-lg overflow-hidden shadow-2xl z-50" style={{ width: 240, background: '#0a0e1a', border: '1px solid #1e3a5f' }}>
              <input
                autoFocus
                value={mineralQuery}
                onChange={e => setMineralQuery(e.target.value)}
                placeholder="Search minerals…"
                className="w-full px-3 py-2 text-xs bg-transparent outline-none"
                style={{ color: '#e2e8f0', borderBottom: '1px solid #1e3a5f' }}
              />
              <div className="max-h-72 overflow-y-auto scrollbar-thin">
                {filteredMinerals.map(m => (
                  <button
                    key={m.key}
                    onClick={() => { setMineral(m.key); setMineralPickerOpen(false); setMineralQuery(''); }}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-left text-xs transition-colors"
                    style={{ color: m.key === mineral ? '#93c5fd' : '#cbd5e1', background: m.key === mineral ? 'rgba(37,99,235,0.15)' : 'transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.background = m.key === mineral ? 'rgba(37,99,235,0.15)' : 'rgba(30,58,138,0.2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = m.key === mineral ? 'rgba(37,99,235,0.15)' : 'transparent')}
                  >
                    <span>{m.label}</span>
                    {m.hasTradeArcs && <span title="Bilateral trade-flow data available" style={{ color: '#475569' }}>⇄</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-1.5 pointer-events-auto">
          <div className="flex items-center rounded-md overflow-hidden" style={{ border: '1px solid #1e3a5f' }}>
            {(['raw', 'processed', 'downstream'] as ViewStage[]).map(s => (
              <button
                key={s}
                onClick={() => setStage(s)}
                className="px-2.5 py-1 text-xs font-medium capitalize transition-colors"
                style={{
                  background: stage === s ? 'rgba(37,99,235,0.35)' : 'rgba(6,9,20,0.9)',
                  color: stage === s ? '#93c5fd' : '#475569',
                  borderRight: s !== 'downstream' ? '1px solid #1e3a5f' : undefined,
                }}
              >{s}</button>
            ))}
          </div>

          {stage !== 'downstream' ? (
            <div className="flex items-center rounded-md overflow-hidden" style={{ border: '1px solid #1e3a5f' }}>
              {(['production', 'consumption'] as Metric[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMetric(m)}
                  className="px-2.5 py-1 text-xs font-medium capitalize transition-colors"
                  style={{
                    background: metric === m ? 'rgba(5,150,105,0.3)' : 'rgba(6,9,20,0.9)',
                    color: metric === m ? '#6ee7b7' : '#475569',
                    borderRight: m === 'production' ? '1px solid #1e3a5f' : undefined,
                  }}
                >{m}</button>
              ))}
            </div>
          ) : (
            <select
              value={downstreamCategory}
              onChange={e => setDownstreamCategory(e.target.value as DownstreamCategory)}
              className="rounded-md px-2 py-1 text-xs"
              style={{ background: 'rgba(6,9,20,0.9)', border: '1px solid #1e3a5f', color: '#93c5fd' }}
            >
              {DOWNSTREAM_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowFacilities(v => !v)}
              className="rounded-full px-2.5 py-1 text-xs flex items-center gap-1.5"
              style={{
                background: showFacilities ? 'rgba(57,135,229,0.18)' : 'rgba(6,9,20,0.9)',
                border: `1px solid ${showFacilities ? 'rgba(57,135,229,0.4)' : '#1e3a5f'}`,
                color: showFacilities ? '#93c5fd' : '#475569',
              }}
              title={showFacilities ? 'Hide facilities' : 'Show facilities (mines/smelters/refineries/plants)'}
            >
              <span>◈</span> Facilities
            </button>
            <button
              onClick={() => setShowTradeArcs(v => !v)}
              disabled={stage !== 'downstream' && !meta?.hasTradeArcs}
              className="rounded-full px-2.5 py-1 text-xs flex items-center gap-1.5"
              style={{
                background: showTradeArcs ? 'rgba(96,165,250,0.18)' : 'rgba(6,9,20,0.9)',
                border: `1px solid ${showTradeArcs ? 'rgba(96,165,250,0.4)' : '#1e3a5f'}`,
                color: (stage !== 'downstream' && !meta?.hasTradeArcs) ? '#334155' : (showTradeArcs ? '#93c5fd' : '#475569'),
                cursor: (stage !== 'downstream' && !meta?.hasTradeArcs) ? 'not-allowed' : 'pointer',
              }}
              title={stage !== 'downstream' && !meta?.hasTradeArcs ? 'No bilateral trade-flow data for this mineral' : 'Toggle trade flows'}
            >
              <span>⇄</span> Trade
            </button>
          </div>
        </div>
      </div>

      {stage !== 'downstream' && !meta?.hasTradeArcs && (
        <div className="absolute top-16 right-3 rounded px-2.5 py-1.5 text-xs max-w-64 pointer-events-none" style={{ background: 'rgba(6,9,20,0.85)', border: '1px solid #1e3a5f', color: '#64748b' }}>
          Trade-flow data only covers Cobalt, Graphite, Lithium, Manganese &amp; Nickel — production/consumption above is still real.
        </div>
      )}

      {/* Bottom-left legend */}
      <div className="absolute bottom-4 left-4 rounded-lg px-3 py-2.5 pointer-events-none" style={{ background: 'rgba(4,8,18,0.88)', border: '1px solid #162030', minWidth: 200 }}>
        {stage === 'downstream' ? (
          <>
            <div className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#475569', fontFamily: "'Space Grotesk', sans-serif" }}>
              {downstreamCategory} trade flows
            </div>
            <div className="text-xs" style={{ color: '#374151' }}>Line width/opacity ∝ trade value (USD)</div>
          </>
        ) : (
          <>
            <div className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#475569', fontFamily: "'Space Grotesk', sans-serif" }}>
              {meta?.label} · {stage} {metric}
            </div>
            <div className="h-2 rounded-full mb-1" style={{ background: `linear-gradient(to right, ${SEQ_LOW}, ${SEQ_HIGH})` }} />
            <div className="flex justify-between text-xs" style={{ color: '#374151' }}>
              <span>0</span><span>{fmtKg(colorDomainMax)}</span>
            </div>
          </>
        )}
        {showFacilities && (
          <div className="mt-2 pt-2 grid grid-cols-2 gap-x-3 gap-y-1" style={{ borderTop: '1px solid #162030' }}>
            {(Object.entries(ASSET_TYPE_COLOR) as [FacilityAssetType, string][]).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5 text-xs" style={{ color: '#94a3b8' }}>
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="capitalize">{type}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function fmtKg(kg: number): string {
  const tonnes = kg / 1000;
  if (tonnes >= 1e6) return `${(tonnes / 1e6).toFixed(1)}M t`;
  if (tonnes >= 1e3) return `${(tonnes / 1e3).toFixed(1)}K t`;
  return `${Math.round(tonnes)} t`;
}
