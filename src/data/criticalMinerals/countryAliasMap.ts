// Hand-built resolver for the free-text country-name strings found in the
// critmin/raw/ source CSVs. Used only by scripts/build-critical-minerals-data.mjs
// (not imported by the app at runtime).
//
// Strategy: normalize both the CSV string and every ALL_COUNTRIES name the same
// way (lowercase, diacritics stripped, punctuation collapsed to spaces, curly
// apostrophes straightened), then try an exact match first. Only the ~30 cases
// that still don't match after normalization (real alternate names/abbreviations,
// not just punctuation/accent differences) need an explicit entry here.

export function normalizeCountryName(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics (combining marks left over after NFD decomposition)
    .replace(/[’‘´`]/g, "'") // straighten curly/acute apostrophes
    .replace(/[&,.\-()]/g, ' ') // punctuation -> space
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// key: normalizeCountryName(csv string) -> ISO alpha-3
export const COUNTRY_ALIAS_MAP: Record<string, string> = {
  'bolivia plurinational state of': 'BOL',
  'bosnia herzegovina': 'BIH', // covers "Bosnia & Herzegovina" / "Bosnia-Herzegovina" / "Bosnia Herzegovina" post-normalization
  'brunei darussalam': 'BRN',
  burma: 'MMR',
  'cabo verde': 'CPV',
  'central african rep': 'CAF',
  'china hong kong sar': 'HKG',
  'china macao sar': 'MAC',
  congo: 'COG', // bare "Congo" conventionally means Congo-Brazzaville
  'congo democratic republic': 'COD',
  'congo rep': 'COG',
  "cote d'ivoire": 'CIV', // covers all accent/apostrophe variants post-normalization
  'ivory coast': 'CIV',
  'democratic republic of the congo': 'COD', // ICMM facilities file's spelling
  'dominican rep': 'DOM',
  'dr congo': 'COD',
  'ireland republic of': 'IRL',
  'korea dem p r of': 'PRK',
  'korea south': 'KOR',
  'north korea': 'PRK',
  'rep of korea': 'KOR',
  'south korea': 'KOR',
  'rep of moldova': 'MDA',
  'united rep of tanzania': 'TZA',
  usa: 'USA',
  turkey: 'TUR', // ALL_COUNTRIES uses "Türkiye"; the ICMM facilities file still says "Turkey"
};

// Rows to drop entirely: aggregate/footer rows, or real places the app's
// ALL_COUNTRIES set doesn't track as a distinct entry (small territories with
// no ISO3 slot in this app — misattributing their data to a parent country
// would be inaccurate, so they're skipped rather than guessed).
export const COUNTRY_SKIP_LIST = new Set(
  [
    'Other Asia, Nes',
    'World Total (Ilmenite And Rutile, Rounded)',
    'World Total (Ilmenite, Rounded)',
    'World Total (Rutile, Rounded)',
    'Cayman Isds',
    'France (French Guiana)',
    'French Guiana',
  ].map(normalizeCountryName)
);
