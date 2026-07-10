// Simplified GeoJSON polygons for disputed / partially-recognized territories.
// Coordinates are [longitude, latitude]. These are approximations suitable for 50m resolution.

export interface DisputedTerritory {
  id: string;           // ISO or custom alpha-3 code matching allCountries.ts
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
}

export const DISPUTED_TERRITORIES: DisputedTerritory[] = [
  {
    // Somaliland — declared independence from Somalia 1991; not internationally recognized
    id: 'SOL',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [43.0, 11.5], [43.5, 11.8], [44.5, 11.5], [45.5, 11.2],
        [46.5, 11.2], [47.5, 11.2], [48.5, 11.3], [49.0, 11.5],
        [49.5, 10.8], [49.0, 9.5], [48.0, 8.5], [46.5, 7.8],
        [44.5, 7.8], [43.5, 8.5], [43.0, 9.5], [43.0, 11.5],
      ]],
    },
  },
  {
    // Kosovo — declared independence from Serbia 2008; recognized by ~100 countries
    id: 'XKX',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [20.06, 43.07], [20.34, 43.26], [20.59, 43.26], [20.83, 43.27],
        [21.15, 43.23], [21.48, 43.20], [21.78, 42.90], [21.67, 42.57],
        [21.54, 42.32], [21.32, 42.07], [20.83, 41.86], [20.52, 42.22],
        [20.06, 42.55], [20.06, 43.07],
      ]],
    },
  },
  {
    // Abkhazia — broke away from Georgia; recognized by Russia and 4 others
    id: 'ABK',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [40.00, 43.38], [40.20, 43.58], [40.80, 43.52], [41.20, 43.42],
        [41.60, 43.22], [42.00, 42.68], [41.55, 42.46], [41.00, 42.40],
        [40.30, 42.52], [40.00, 43.00], [40.00, 43.38],
      ]],
    },
  },
  {
    // South Ossetia — broke away from Georgia; Russian-occupied since 2008 war
    id: 'OST',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [43.78, 42.70], [44.20, 42.85], [44.50, 42.75], [44.80, 42.55],
        [44.55, 42.15], [44.00, 42.00], [43.55, 42.12], [43.40, 42.40],
        [43.55, 42.62], [43.78, 42.70],
      ]],
    },
  },
  {
    // Transnistria — broke away from Moldova 1992; not recognized by any UN member
    id: 'PMR',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [29.00, 48.50], [29.20, 48.60], [29.60, 48.50], [30.10, 48.00],
        [30.20, 47.30], [30.10, 46.80], [29.80, 46.30], [29.20, 46.40],
        [29.00, 46.80], [29.00, 48.00], [29.00, 48.50],
      ]],
    },
  },
  {
    // Northern Cyprus (TRNC) — northern part of Cyprus; recognized only by Turkey
    id: 'NCY',
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [32.28, 35.20], [33.00, 35.30], [33.60, 35.40], [34.00, 35.58],
        [34.60, 35.70], [34.58, 35.22], [33.80, 35.04], [32.88, 35.00],
        [32.28, 35.20],
      ]],
    },
  },
];
