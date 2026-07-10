export interface CountryData {
  id: string; // ISO alpha-3 (matches TopoJSON)
  iso2: string;
  name: string;
  capital: string;
  population: number;
  area: number; // km²
  gdp: number; // USD billions
  gdpPerCapita: number;
  region: string;
  subregion: string;
  languages: string[];
  religions: string[];
  government: string;
  industries: string[];
  exports: string[];
  imports: string[];
  militaryBudget: number; // USD billions
  hdi: number; // 0-1
  flag: string; // emoji
  coordinates: [number, number]; // [lat, lon]
  majorCities: string[];
  currency: string;
  founded: string;
  history: string;
  description: string;
}

export interface Relationship {
  source: string;    // ISO alpha-3
  target: string;    // ISO alpha-3
  polScore: number;  // -1 (adversarial) to +1 (allied) — alliances, security, UN votes, diplomacy
  ecoScore: number;  // -1 (sanctions/embargo) to +1 (deep integration) — trade, FTAs, investment
  score: number;     // combined: 0.55*pol + 0.45*eco
  type: 'allied' | 'friendly' | 'neutral' | 'tense' | 'hostile';
  trade: number;     // USD billions annual bilateral trade
  polNotes: string;  // political/security context
  ecoNotes: string;  // economic/trade context
  isBloc?: boolean;  // true for auto-generated bloc relationships
}

export interface HistoricalEra {
  id: string;
  name: string;
  year: number;
  description: string;
  geojsonUrl?: string;
}

export type RelationshipType = 'all' | 'political' | 'trade' | 'military';

export interface MapTooltip {
  x: number;
  y: number;
  name: string;
  polScore?: number;
  ecoScore?: number;
}

export type MapMode = 'political' | 'economic';
