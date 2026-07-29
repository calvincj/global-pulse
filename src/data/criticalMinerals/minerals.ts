// Hand-written metadata for the 36 minerals present in MINERAL_PRODUCTION
// (src/data/criticalMinerals/production.ts). Not generated — this is small,
// stable reference data about the mineral list itself.

import { MINERALS_WITH_TRADE_ARCS } from '../../types/criticalMinerals';

export interface MineralMeta {
  key: string; // matches MineralStats['mineral'] exactly
  label: string;
  hasTradeArcs: boolean; // only Cobalt/Graphite/Lithium/Manganese/Nickel have bilateral arc data
  batteryRelevant: boolean; // commonly cited EV/battery/electrification supply-chain minerals
}

const TRADE_ARC_SET = new Set<string>(MINERALS_WITH_TRADE_ARCS);
const BATTERY_RELEVANT = new Set([
  'Cobalt', 'Graphite', 'Lithium', 'Manganese', 'Nickel', 'Rare Earths', 'Gallium', 'Germanium',
]);

// Alphabetical; label defaults to key except where a clearer display name helps.
const LABEL_OVERRIDES: Record<string, string> = {
  'Platinum Group Metals': 'Platinum Group Metals (PGMs)',
};

export const MINERALS: MineralMeta[] = [
  'Aluminium', 'Antimony', 'Arsenic', 'Bauxite', 'Bismuth', 'Boron', 'Cadmium', 'Chromium',
  'Cobalt', 'Copper', 'Fluorspar', 'Gallium', 'Germanium', 'Gold', 'Graphite', 'Indium',
  'Lead', 'Lithium', 'Magnesium', 'Manganese', 'Molybdenum', 'Nickel', 'Niobium',
  'Platinum Group Metals', 'Rare Earths', 'Rhenium', 'Selenium', 'Silicon', 'Silver',
  'Tantalum', 'Tellurium', 'Tin', 'Titanium', 'Vanadium', 'Zinc', 'Zirconium',
].map(key => ({
  key,
  label: LABEL_OVERRIDES[key] ?? key,
  hasTradeArcs: TRADE_ARC_SET.has(key),
  batteryRelevant: BATTERY_RELEVANT.has(key),
}));

export const MINERALS_BY_KEY: Record<string, MineralMeta> = Object.fromEntries(
  MINERALS.map(m => [m.key, m])
);
