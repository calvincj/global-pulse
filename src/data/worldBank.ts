export interface WBCountryData {
  gdpUsd: number | null;       // NY.GDP.MKTP.CD  current USD
  population: number | null;   // SP.POP.TOTL
  landAreaKm2: number | null;  // AG.LND.TOTL.K2
}

type WBResponse = [{ total: number }, Array<{ countryiso3code: string; value: number | null; date: string }>];
type WBSingleResponse = [{ total: number }, Array<{ value: number | null; date: string }>];

let cache: Map<string, WBCountryData> | null = null;
let fetchPromise: Promise<Map<string, WBCountryData>> | null = null;

async function fetchIndicator(code: string): Promise<Map<string, number>> {
  const url = `https://api.worldbank.org/v2/country/all/indicator/${code}?format=json&mrv=2&per_page=300`;
  const [, data] = await fetch(url).then(r => r.json()) as WBResponse;
  const out = new Map<string, number>();
  for (const row of data) {
    const id = row.countryiso3code;
    if (!id || row.value == null || out.has(id)) continue;
    out.set(id, row.value);
  }
  return out;
}

export function getWorldBankData(): Promise<Map<string, WBCountryData>> {
  if (cache) return Promise.resolve(cache);
  if (fetchPromise) return fetchPromise;

  fetchPromise = Promise.all([
    fetchIndicator('NY.GDP.MKTP.CD'),
    fetchIndicator('SP.POP.TOTL'),
    fetchIndicator('AG.LND.TOTL.K2'),
  ]).then(([gdpMap, popMap, areaMap]) => {
    const result = new Map<string, WBCountryData>();
    const allIds = new Set([...gdpMap.keys(), ...popMap.keys(), ...areaMap.keys()]);
    for (const id of allIds) {
      result.set(id, {
        gdpUsd: gdpMap.get(id) ?? null,
        population: popMap.get(id) ?? null,
        landAreaKm2: areaMap.get(id) ?? null,
      });
    }
    cache = result;
    return result;
  }).catch(() => {
    cache = new Map();
    return cache;
  });

  return fetchPromise;
}

// Per-country per-year cache for historical lookups
const yearCache = new Map<string, Promise<WBCountryData>>();

async function fetchForYear(indicator: string, iso3: string, year: number): Promise<number | null> {
  const url = `https://api.worldbank.org/v2/country/${iso3.toUpperCase()}/indicator/${indicator}?format=json&date=${year}&per_page=1`;
  try {
    const [, data] = await fetch(url).then(r => r.json()) as WBSingleResponse;
    return data?.[0]?.value ?? null;
  } catch {
    return null;
  }
}

export function getWorldBankForYear(iso3: string, year: number): Promise<WBCountryData> {
  const key = `${iso3}-${year}`;
  if (yearCache.has(key)) return yearCache.get(key)!;
  const p = Promise.all([
    fetchForYear('NY.GDP.MKTP.CD', iso3, year),
    fetchForYear('SP.POP.TOTL', iso3, year),
  ]).then(([gdpUsd, population]) => ({
    gdpUsd,
    population,
    landAreaKm2: null, // unchanged, skip the request
  })).catch(() => ({ gdpUsd: null, population: null, landAreaKm2: null }));
  yearCache.set(key, p);
  return p;
}
