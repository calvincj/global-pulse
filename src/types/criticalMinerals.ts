export type MineralStage = 'raw' | 'processed';

export interface MineralStats {
  mineral: string; // canonical mineral key, e.g. 'Lithium'
  stage: MineralStage;
  productionKg: number;
  importKg: number;
  exportKg: number;
  consumptionKg: number;
  source?: 'WMD' | 'BGS' | 'USGS';
}

// Keyed by ISO alpha-3
export type MineralProductionData = Record<string, MineralStats[]>;

export type FacilityAssetType = 'mine' | 'smelter' | 'refinery' | 'plant';

export interface MineralFacility {
  id: string;
  name: string;
  countryId: string; // ISO alpha-3
  coordinates: [number, number]; // [lat, lon]
  assetTypes: FacilityAssetType[];
  primaryCommodity: string;
  secondaryCommodity?: string;
  otherCommodities?: string[];
  confidence: string; // ICMM confidence factor: Very Low..High
  production: boolean;
  processing: boolean;
}

export interface MineralTradeArc {
  mineral: string; // one of MINERALS_WITH_TRADE_ARCS
  stage: MineralStage;
  exporterId: string; // ISO alpha-3
  importerId: string; // ISO alpha-3
  tradeValueUsd: number;
  sourceCoords: [number, number]; // [lat, lon]
  targetCoords: [number, number];
}

export type DownstreamCategory =
  | 'EV'
  | 'Battery storage'
  | 'Solar Products'
  | 'Wind Products'
  | 'Hydroelectric'
  | 'Nuclear Products'
  | 'Biomass';

export interface DownstreamTradeArc {
  category: DownstreamCategory;
  exporterId: string; // ISO alpha-3
  importerId: string; // ISO alpha-3
  tradeValueUsd: number;
  sourceCoords: [number, number]; // [lat, lon]
  targetCoords: [number, number];
}

export interface MineralCountryStrategy {
  countryId: string; // ISO alpha-3
  posture: 'diversifying' | 'aligned' | 'neutral' | 'dependent';
  summary: string;
  initiatives: { year: number; title: string; note: string }[];
}

// The only 5 minerals with bilateral trade-arc coverage (out of 37 total in
// MINERAL_PRODUCTION) — the source data (TradeArcs_Visual) just doesn't cover
// the rest at this granularity. UI must not silently show an empty map for
// the other 32; it should say so.
export const MINERALS_WITH_TRADE_ARCS = ['Cobalt', 'Graphite', 'Lithium', 'Manganese', 'Nickel'] as const;

export const DOWNSTREAM_CATEGORIES: DownstreamCategory[] = [
  'EV',
  'Battery storage',
  'Solar Products',
  'Wind Products',
  'Hydroelectric',
  'Nuclear Products',
  'Biomass',
];
