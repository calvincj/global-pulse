#!/usr/bin/env node
// One-off generator: reads the canonical CSVs in critmin/raw/ and writes generated
// TypeScript data modules under src/data/criticalMinerals/. Not part of `vite build` —
// re-run manually with `node scripts/build-critical-minerals-data.mjs` whenever the
// source CSVs in critmin/raw/ change. Requires Node 20+ (native .ts import support,
// used here to load the alias map and ALL_COUNTRIES directly).

import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { ALL_COUNTRIES } from '../src/data/allCountries.ts';
import {
  COUNTRY_ALIAS_MAP,
  COUNTRY_SKIP_LIST,
  normalizeCountryName,
} from '../src/data/criticalMinerals/countryAliasMap.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const RAW = path.join(ROOT, 'critmin/raw');
const OUT = path.join(ROOT, 'src/data/criticalMinerals');

// ---------------------------------------------------------------------------
// Minimal RFC4180 CSV parser (quoted fields, embedded commas/quotes/newlines).
// ---------------------------------------------------------------------------
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\n') {
      row.push(field); rows.push(row); row = []; field = '';
    } else if (c === '\r') {
      // skip
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter(r => !(r.length === 1 && r[0] === ''));
}

function parseCsvFile(filePath) {
  const rows = parseCsv(readFileSync(filePath, 'utf8'));
  const header = rows[0];
  return rows.slice(1).map(r => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ''])));
}

// ---------------------------------------------------------------------------
// Country-name resolution
// ---------------------------------------------------------------------------
const nameToIso3 = new Map();
for (const c of Object.values(ALL_COUNTRIES)) nameToIso3.set(normalizeCountryName(c.name), c.id);
const validIso3 = new Set(Object.keys(ALL_COUNTRIES));

const unresolved = new Set();
/** @returns {string|null|undefined} ISO3, `null` for a deliberate skip, `undefined` for unresolved */
function resolveCountry(rawName) {
  const norm = normalizeCountryName(rawName || '');
  if (!norm) return null;
  if (COUNTRY_SKIP_LIST.has(norm)) return null;
  if (nameToIso3.has(norm)) return nameToIso3.get(norm);
  if (COUNTRY_ALIAS_MAP[norm]) return COUNTRY_ALIAS_MAP[norm];
  unresolved.add(rawName);
  return undefined;
}

// ---------------------------------------------------------------------------
// 1. Production / import / export / consumption by country x mineral x stage
// ---------------------------------------------------------------------------
function buildProduction() {
  const rows = parseCsvFile(path.join(RAW, 'production_trade_2024.csv'));
  const byCountry = new Map();
  const collisions = [];

  for (const r of rows) {
    const iso3 = resolveCountry(r.Country);
    if (!iso3) continue; // skip-listed junk row, or reported via `unresolved`

    let mineral = r.Category.trim();
    if (mineral === 'Imdium') mineral = 'Indium'; // fix source typo, merge into the real entry
    const stage = r.Stage.trim();

    const stats = {
      mineral,
      stage,
      productionKg: Number(r['Production(kg)_2024']) || 0,
      importKg: Number(r['Import(kg)_2024']) || 0,
      exportKg: Number(r['Export(kg)_2024']) || 0,
      consumptionKg: Number(r['Consumption(kg)_2024']) || 0,
      ...(r.source && r.source.trim() ? { source: r.source.trim() } : {}),
    };

    const list = byCountry.get(iso3) ?? [];
    const dupIdx = list.findIndex(s => s.mineral === mineral && s.stage === stage);
    if (dupIdx >= 0) {
      // Two different source-name spellings resolved to the same country+mineral+stage
      // (e.g. "Congo" and "Congo, Rep." both -> COG). Keep whichever row is more complete
      // rather than summing — summing would double-count if they're really the same record.
      collisions.push(`${iso3} ${mineral} ${stage} (row "${r.Country}")`);
      const score = s => (s.source ? 10 : 0) + [s.productionKg, s.importKg, s.exportKg, s.consumptionKg].filter(Boolean).length;
      if (score(stats) > score(list[dupIdx])) list[dupIdx] = stats;
    } else {
      list.push(stats);
    }
    byCountry.set(iso3, list);
  }

  const obj = Object.fromEntries([...byCountry.entries()].sort(([a], [b]) => a.localeCompare(b)));
  return { obj, collisions, rowCount: rows.length, countryCount: byCountry.size };
}

// ---------------------------------------------------------------------------
// 2. Facilities (mines / smelters / refineries / processing plants)
// ---------------------------------------------------------------------------
const ASSET_TYPE_MAP = { Mine: 'mine', Smelter: 'smelter', Refinery: 'refinery', Plant: 'plant' };

function buildFacilities() {
  const rows = parseCsvFile(path.join(RAW, 'facilities.csv'));
  const facilities = [];
  let skippedNoCountry = 0, skippedNoCoords = 0, skippedNoAssetType = 0;

  for (const r of rows) {
    if (!r.Country_Region || !r.Country_Region.trim()) { skippedNoCountry++; continue; }
    const iso3 = resolveCountry(r.Country_Region);
    if (!iso3) { skippedNoCountry++; continue; }

    const lat = Number(r.Latitude), lon = Number(r.Longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) { skippedNoCoords++; continue; }

    const assetTypes = (r.Asset_Type || '')
      .split(';').map(s => s.trim()).filter(Boolean)
      .map(s => ASSET_TYPE_MAP[s]).filter(Boolean);
    if (assetTypes.length === 0) { skippedNoAssetType++; continue; }

    facilities.push({
      id: r.ICMMID,
      name: (r.Mine_Name && r.Mine_Name !== 'NA' ? r.Mine_Name : r.ICMMID).trim(),
      countryId: iso3,
      coordinates: [lat, lon],
      assetTypes,
      primaryCommodity: (r.Primary_Commodity || '').trim(),
      ...(r.Secondary_Commodity && r.Secondary_Commodity !== 'NA'
        ? { secondaryCommodity: r.Secondary_Commodity.trim() } : {}),
      ...(r.Other_Commodities && r.Other_Commodities !== 'NA'
        ? { otherCommodities: r.Other_Commodities.split(';').map(s => s.trim()).filter(Boolean) } : {}),
      confidence: r['Confidence.Factor'] || 'Unknown',
      production: r.Production === 'TRUE',
      processing: r.Processing === 'TRUE',
    });
  }

  return { facilities, rowCount: rows.length, skippedNoCountry, skippedNoCoords, skippedNoAssetType };
}

// ---------------------------------------------------------------------------
// 3. Mineral trade arcs (5 minerals x raw/processed, already ISO3 + resolved coords)
// ---------------------------------------------------------------------------
function buildMineralTradeArcs() {
  const dir = path.join(RAW, 'mineral_trade_arcs');
  const files = readdirSync(dir).filter(f => f.endsWith('.csv'));
  const arcs = [];
  let totalRows = 0, droppedIso = 0, droppedVal = 0, droppedCoords = 0;

  for (const f of files) {
    const rows = parseCsvFile(path.join(dir, f));
    totalRows += rows.length;
    for (const r of rows) {
      const exp = (r.reporterISO || '').trim().toUpperCase();
      const imp = (r.partnerISO || '').trim().toUpperCase();
      if (!validIso3.has(exp) || !validIso3.has(imp)) { droppedIso++; continue; }
      const val = Number(r.trade_value_usd) || 0;
      if (val <= 0) { droppedVal++; continue; }
      const slat = Number(r.source_lat), slng = Number(r.source_lng);
      const tlat = Number(r.target_lat), tlng = Number(r.target_lng);
      if (![slat, slng, tlat, tlng].every(Number.isFinite)) { droppedCoords++; continue; }
      arcs.push({
        mineral: r.Mineral.trim(),
        stage: (r.stage || '').trim().toLowerCase(),
        exporterId: exp,
        importerId: imp,
        tradeValueUsd: Math.round(val),
        sourceCoords: [slat, slng],
        targetCoords: [tlat, tlng],
      });
    }
  }
  return { arcs, totalRows, droppedIso, droppedVal, droppedCoords };
}

// ---------------------------------------------------------------------------
// 4. Downstream (finished clean-energy product) trade arcs, split by category
// ---------------------------------------------------------------------------
const DOWNSTREAM_SLUG = {
  'EV': 'ev',
  'Battery storage': 'battery',
  'Solar Products': 'solar',
  'Wind Products': 'wind',
  'Hydroelectric': 'hydro',
  'Nuclear Products': 'nuclear',
  'Biomass': 'biomass',
};
const DOWNSTREAM_MATERIALITY_USD = 5000; // drop long-tail noise flows below this

const MINERAL_TRADE_ARC_SLUG = {
  Cobalt: 'cobalt',
  Graphite: 'graphite',
  Lithium: 'lithium',
  Manganese: 'manganese',
  Nickel: 'nickel',
};

function buildDownstreamArcs() {
  const rows = parseCsvFile(path.join(RAW, 'downstream_trade_arcs.csv'));
  const byCategory = new Map();
  let droppedIso = 0, droppedVal = 0, droppedCoords = 0, droppedCategory = 0;

  for (const r of rows) {
    const category = (r.Category || '').trim();
    if (!DOWNSTREAM_SLUG[category]) { droppedCategory++; continue; }
    const exp = (r.reporterISO || '').trim().toUpperCase();
    const imp = (r.partnerISO || '').trim().toUpperCase();
    if (!validIso3.has(exp) || !validIso3.has(imp)) { droppedIso++; continue; }
    const val = Number(r.trade_value) || 0;
    if (val < DOWNSTREAM_MATERIALITY_USD) { droppedVal++; continue; }
    const slat = Number(r.source_lat), slng = Number(r.source_lng);
    const tlat = Number(r.target_lat), tlng = Number(r.target_lng);
    if (![slat, slng, tlat, tlng].every(Number.isFinite)) { droppedCoords++; continue; }

    const arc = {
      category,
      exporterId: exp,
      importerId: imp,
      tradeValueUsd: Math.round(val),
      sourceCoords: [slat, slng],
      targetCoords: [tlat, tlng],
    };
    const list = byCategory.get(category) ?? [];
    list.push(arc);
    byCategory.set(category, list);
  }

  return { byCategory, totalRows: rows.length, droppedIso, droppedVal, droppedCoords, droppedCategory };
}

// ---------------------------------------------------------------------------
// Output helpers
// ---------------------------------------------------------------------------
const GENERATED_HEADER = ts => `// GENERATED FILE — do not hand-edit.
// Produced by scripts/build-critical-minerals-data.mjs from critmin/raw/.
// Re-run that script after changing the source CSVs.
${ts}
`;

function writeTs(relPath, content) {
  const full = path.join(OUT, relPath);
  mkdirSync(path.dirname(full), { recursive: true });
  writeFileSync(full, GENERATED_HEADER(content));
  console.log(`  wrote ${path.relative(ROOT, full)}`);
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
console.log('Building critical minerals data...\n');

console.log('[1/4] Production/consumption...');
const prod = buildProduction();
writeTs(
  'production.ts',
  `import type { MineralProductionData } from '../../types/criticalMinerals';

const _raw: string = ${JSON.stringify(JSON.stringify(prod.obj))};
export const MINERAL_PRODUCTION = JSON.parse(_raw) as MineralProductionData;
`
);
console.log(`  ${prod.rowCount} rows -> ${prod.countryCount} countries, ${prod.collisions.length} name-collisions resolved`);
if (prod.collisions.length) console.log(`  collisions: ${prod.collisions.join('; ')}`);

console.log('\n[2/4] Facilities...');
const fac = buildFacilities();
writeTs(
  'facilities.ts',
  `import type { MineralFacility } from '../../types/criticalMinerals';

const _raw: string = ${JSON.stringify(JSON.stringify(fac.facilities))};
export const MINERAL_FACILITIES = JSON.parse(_raw) as MineralFacility[];
`
);
console.log(`  ${fac.rowCount} rows -> ${fac.facilities.length} facilities (skipped: ${fac.skippedNoCountry} no-country, ${fac.skippedNoCoords} no-coords, ${fac.skippedNoAssetType} no-asset-type)`);

console.log('\n[3/4] Mineral trade arcs (5 minerals x raw/processed, split + lazy-loadable)...');
const mineralArcs = buildMineralTradeArcs();
const byMineral = new Map();
for (const arc of mineralArcs.arcs) {
  const list = byMineral.get(arc.mineral) ?? [];
  list.push(arc);
  byMineral.set(arc.mineral, list);
}
for (const [mineral, slug] of Object.entries(MINERAL_TRADE_ARC_SLUG)) {
  const arcs = byMineral.get(mineral) ?? [];
  writeTs(
    `mineralTrade/${slug}.ts`,
    `import type { MineralTradeArc } from '../../../types/criticalMinerals';

const _raw: string = ${JSON.stringify(JSON.stringify(arcs))};
export const MINERAL_TRADE_ARCS = JSON.parse(_raw) as MineralTradeArc[];
`
  );
  console.log(`  ${mineral}: ${arcs.length} arcs`);
}
console.log(`  ${mineralArcs.totalRows} total rows (dropped: ${mineralArcs.droppedIso} bad-iso, ${mineralArcs.droppedVal} zero-value, ${mineralArcs.droppedCoords} bad-coords)`);

console.log('\n[4/4] Downstream trade arcs (7 categories, split + lazy-loadable)...');
const downstream = buildDownstreamArcs();
for (const [category, slug] of Object.entries(DOWNSTREAM_SLUG)) {
  const arcs = downstream.byCategory.get(category) ?? [];
  writeTs(
    `downstream/${slug}.ts`,
    `import type { DownstreamTradeArc } from '../../../types/criticalMinerals';

const _raw: string = ${JSON.stringify(JSON.stringify(arcs))};
export const DOWNSTREAM_ARCS = JSON.parse(_raw) as DownstreamTradeArc[];
`
  );
  console.log(`  ${category}: ${arcs.length} arcs`);
}
console.log(`  ${downstream.totalRows} total rows (dropped: ${downstream.droppedIso} bad-iso, ${downstream.droppedVal} below $${DOWNSTREAM_MATERIALITY_USD} threshold, ${downstream.droppedCoords} bad-coords, ${downstream.droppedCategory} unknown-category)`);

console.log();
if (unresolved.size > 0) {
  console.error(`FAILED: ${unresolved.size} unresolved country name(s) — add to COUNTRY_ALIAS_MAP or COUNTRY_SKIP_LIST in src/data/criticalMinerals/countryAliasMap.ts:`);
  for (const n of unresolved) console.error(`  - "${n}" (normalized: "${normalizeCountryName(n)}")`);
  process.exit(1);
}
console.log('All country names resolved cleanly. Done.');
