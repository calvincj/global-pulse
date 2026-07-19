// Majority-religion classification per country, for the map's Religion view.
// Percentages are rounded approximations (Pew Research Global Religious Landscape,
// CIA World Factbook) meant for relative comparison, not precise demographic data.
//
// Christianity and Islam are split into their major branches (Catholic/Protestant/
// Orthodox; Sunni/Shia) since those distinctions drive real geopolitical dynamics.
// Countries with no single dominant group are flagged `mixed` with a `secondary`
// category — the map renders these as a two-color diagonal stripe instead of a
// solid fill.

export type ReligionCategory =
  | 'catholic'
  | 'protestant'
  | 'orthodox'
  | 'christianity_other'  // Christian-majority but no single denomination clearly dominant
  | 'sunni'
  | 'shia'
  | 'islam_mixed'         // no clear Sunni/Shia majority — Ibadi (Oman), tied sects, etc.
  | 'hinduism'
  | 'buddhism'
  | 'judaism'
  | 'folk'                // folk/traditional/animist/syncretic — largest single bloc
  | 'nonreligious';        // unaffiliated/atheist/secular — largest single bloc

export interface ReligionInfo {
  majority: ReligionCategory;
  majorityPct: number;  // approx share of population held by the majority/plurality group
  breakdown: string;     // short human-readable summary shown in tooltips/profile
  mixed?: boolean;        // true when no group has a clear/comfortable lead
  secondary?: ReligionCategory; // second-largest group — used for the striped fill when mixed
}

export const RELIGION_ORDER: ReligionCategory[] = [
  'catholic', 'protestant', 'orthodox', 'christianity_other',
  'sunni', 'shia', 'islam_mixed',
  'hinduism', 'buddhism', 'judaism', 'folk', 'nonreligious',
];

export const RELIGION_META: Record<ReligionCategory, { label: string; color: string }> = {
  catholic:            { label: 'Catholic',                    color: '#3b82f6' },
  protestant:          { label: 'Protestant',                  color: '#16a34a' },
  orthodox:            { label: 'Orthodox Christian',          color: '#6366f1' },
  christianity_other:  { label: 'Christianity (mixed/other)',  color: '#14b8a6' },
  sunni:               { label: 'Sunni Islam',                 color: '#84cc16' },
  shia:                { label: 'Shia Islam',                  color: '#a855f7' },
  islam_mixed:         { label: 'Islam (mixed/other)',         color: '#06b6d4' },
  hinduism:            { label: 'Hinduism',                    color: '#f97316' },
  buddhism:            { label: 'Buddhism',                    color: '#eab308' },
  judaism:             { label: 'Judaism',                     color: '#ec4899' },
  folk:                { label: 'Folk / Traditional',          color: '#92400e' },
  nonreligious:        { label: 'Non-religious',                color: '#64748b' },
};

export const RELIGIONS: Record<string, ReligionInfo> = {
  // ── Africa ────────────────────────────────────────────────
  DZA: { majority: 'sunni', majorityPct: 97, breakdown: 'Sunni Islam ~97%, other/none ~3%' },
  AGO: { majority: 'catholic', majorityPct: 90, breakdown: 'Catholic ~41%, Protestant ~38%, other ~11%, none ~10%' },
  BEN: { majority: 'catholic', majorityPct: 48, mixed: true, secondary: 'sunni', breakdown: 'Christian (Catholic plurality) ~48%, Sunni Islam ~28%, Vodun/folk ~12%' },
  BWA: { majority: 'protestant', majorityPct: 79, breakdown: 'Christian ~79%, folk/traditional ~15%, none ~5%' },
  BFA: { majority: 'sunni', majorityPct: 61, breakdown: 'Sunni Islam ~61%, Christian ~26%, folk/traditional ~15%' },
  BDI: { majority: 'catholic', majorityPct: 93, breakdown: 'Catholic ~62%, Protestant ~25%, other ~13%' },
  CMR: { majority: 'catholic', majorityPct: 63, breakdown: 'Christian (Catholic plurality) ~63%, Sunni Islam ~24%, folk/traditional ~13%' },
  CPV: { majority: 'catholic', majorityPct: 95, breakdown: 'Catholic ~85%, Protestant ~10%, other ~5%' },
  CAF: { majority: 'catholic', majorityPct: 80, breakdown: 'Christian (Catholic plurality) ~80%, Sunni Islam ~10%, folk ~10%' },
  TCD: { majority: 'sunni', majorityPct: 52, mixed: true, secondary: 'christianity_other', breakdown: 'Sunni Islam ~52%, Christian (fragmented Catholic/Protestant) ~44%, folk ~4%' },
  COM: { majority: 'sunni', majorityPct: 98, breakdown: 'Sunni Islam ~98% (state religion)' },
  COD: { majority: 'catholic', majorityPct: 95, breakdown: 'Catholic ~40%, Protestant ~30%, Kimbanguist/other Christian ~25%' },
  COG: { majority: 'catholic', majorityPct: 90, breakdown: 'Catholic ~33%, Protestant/other Christian ~57%' },
  CIV: { majority: 'sunni', majorityPct: 40, mixed: true, secondary: 'catholic', breakdown: 'Sunni Islam ~40% (plurality), Christian (Catholic plurality) ~34%, folk/traditional ~12%' },
  DJI: { majority: 'sunni', majorityPct: 94, breakdown: 'Sunni Islam ~94%, Christian ~6%' },
  EGY: { majority: 'sunni', majorityPct: 90, breakdown: 'Sunni Islam ~90%, Coptic Christian ~10%' },
  GNQ: { majority: 'catholic', majorityPct: 93, breakdown: 'Catholic ~88%, Protestant ~5%, folk minority' },
  ERI: { majority: 'orthodox', majorityPct: 50, mixed: true, secondary: 'sunni', breakdown: 'Eritrean Orthodox ~50%, Sunni Islam ~48% — near-even split' },
  SWZ: { majority: 'christianity_other', majorityPct: 90, breakdown: 'Christian ~90% (Zionist syncretic majority), folk minority' },
  ETH: { majority: 'orthodox', majorityPct: 44, mixed: true, secondary: 'sunni', breakdown: 'Ethiopian Orthodox ~44% (plurality), Sunni Islam ~34%, Protestant ~19%' },
  GAB: { majority: 'catholic', majorityPct: 80, breakdown: 'Christian ~80%, Sunni Islam ~10%, folk ~10%' },
  GMB: { majority: 'sunni', majorityPct: 96, breakdown: 'Sunni Islam ~96%, Christian ~4%' },
  GHA: { majority: 'protestant', majorityPct: 71, breakdown: 'Christian ~71%, Sunni Islam ~18%, folk ~5%' },
  GIN: { majority: 'sunni', majorityPct: 85, breakdown: 'Sunni Islam ~85%, Christian ~8%, folk ~7%' },
  GNB: { majority: 'sunni', majorityPct: 46, mixed: true, secondary: 'folk', breakdown: 'Sunni Islam ~46% (plurality), folk/traditional ~30%, Christian ~19%' },
  KEN: { majority: 'christianity_other', majorityPct: 85, breakdown: 'Christian ~85% (fragmented Catholic/Protestant), Sunni Islam ~11%, folk ~2%' },
  LSO: { majority: 'catholic', majorityPct: 90, breakdown: 'Christian ~90% (Catholic plurality), folk minority' },
  LBR: { majority: 'protestant', majorityPct: 85, breakdown: 'Christian ~85%, Sunni Islam ~12%, folk minority' },
  LBY: { majority: 'sunni', majorityPct: 97, breakdown: 'Sunni Islam ~97% (state religion)' },
  MDG: { majority: 'catholic', majorityPct: 85, breakdown: 'Christian ~85% (heavy folk syncretism), Sunni Islam ~7%' },
  MWI: { majority: 'protestant', majorityPct: 77, breakdown: 'Christian ~77%, Sunni Islam ~14%, folk minority' },
  MLI: { majority: 'sunni', majorityPct: 93, breakdown: 'Sunni Islam ~93%, Christian/folk ~7%' },
  MRT: { majority: 'sunni', majorityPct: 100, breakdown: 'Sunni Islam ~100% (state religion)' },
  MUS: { majority: 'hinduism', majorityPct: 48, mixed: true, secondary: 'catholic', breakdown: 'Hindu ~48% (plurality), Christian (Catholic) ~32%, Sunni Islam ~17%' },
  MAR: { majority: 'sunni', majorityPct: 99, breakdown: 'Sunni Islam ~99% (state religion)' },
  MOZ: { majority: 'catholic', majorityPct: 57, breakdown: 'Christian (Catholic plurality) ~57%, Sunni Islam ~19%, folk/traditional ~24%' },
  NAM: { majority: 'protestant', majorityPct: 90, breakdown: 'Christian ~90% (Lutheran plurality), folk minority' },
  NER: { majority: 'sunni', majorityPct: 99, breakdown: 'Sunni Islam ~99%' },
  NGA: { majority: 'christianity_other', majorityPct: 49, mixed: true, secondary: 'sunni', breakdown: 'Christian (fragmented Catholic/Protestant/Pentecostal) ~49%, Sunni Islam ~48% — near-even north/south split' },
  RWA: { majority: 'catholic', majorityPct: 93, breakdown: 'Catholic ~44%, Protestant ~38%, other Christian ~11%' },
  STP: { majority: 'catholic', majorityPct: 95, breakdown: 'Catholic ~56%, Protestant/other Christian ~39%' },
  SEN: { majority: 'sunni', majorityPct: 96, breakdown: 'Sunni Islam ~96% (Sufi brotherhoods), Christian ~4%' },
  SYC: { majority: 'catholic', majorityPct: 94, breakdown: 'Catholic ~76%, Protestant/other Christian ~18%' },
  SLE: { majority: 'sunni', majorityPct: 78, breakdown: 'Sunni Islam ~78%, Christian ~21%' },
  SOM: { majority: 'sunni', majorityPct: 99, breakdown: 'Sunni Islam ~99% (state religion)' },
  ZAF: { majority: 'protestant', majorityPct: 86, breakdown: 'Christian ~86%, none ~9%, other ~5%' },
  SSD: { majority: 'christianity_other', majorityPct: 60, breakdown: 'Christian (Catholic/Anglican split) ~60%, folk/traditional ~33%, Sunni Islam ~6%' },
  SDN: { majority: 'sunni', majorityPct: 97, breakdown: 'Sunni Islam ~97%, Christian/folk ~3%' },
  TZA: { majority: 'christianity_other', majorityPct: 63, breakdown: 'Christian ~63% (fragmented Catholic/Protestant), Sunni Islam ~34%' },
  TGO: { majority: 'catholic', majorityPct: 43, mixed: true, secondary: 'folk', breakdown: 'Christian (Catholic plurality) ~43%, folk/traditional ~35%, Sunni Islam ~14%' },
  TUN: { majority: 'sunni', majorityPct: 99, breakdown: 'Sunni Islam ~99% (state religion)' },
  UGA: { majority: 'christianity_other', majorityPct: 84, breakdown: 'Christian ~84% (Catholic/Anglican split), Sunni Islam ~14%' },
  ESH: { majority: 'sunni', majorityPct: 100, breakdown: 'Sunni Islam ~100%' },
  ZMB: { majority: 'protestant', majorityPct: 95, breakdown: 'Christian ~95% (constitutionally Christian nation)' },
  ZWE: { majority: 'protestant', majorityPct: 84, breakdown: 'Christian ~84% (heavy folk syncretism), folk minority' },

  // ── Americas ──────────────────────────────────────────────
  ATG: { majority: 'protestant', majorityPct: 90, breakdown: 'Protestant/Anglican majority, Catholic minority' },
  ARG: { majority: 'catholic', majorityPct: 85, breakdown: 'Catholic ~63%, Protestant/other Christian ~22%, none ~19%' },
  BHS: { majority: 'protestant', majorityPct: 93, breakdown: 'Protestant majority, Catholic minority' },
  BRB: { majority: 'protestant', majorityPct: 90, breakdown: 'Protestant/Anglican majority, Catholic minority' },
  BLZ: { majority: 'catholic', majorityPct: 75, breakdown: 'Catholic ~40%, Protestant ~35%' },
  BOL: { majority: 'catholic', majorityPct: 90, breakdown: 'Catholic ~70%, Protestant ~20%' },
  BRA: { majority: 'catholic', majorityPct: 86, breakdown: 'Catholic ~50%, Evangelical/Protestant ~31%, none ~10%' },
  CAN: { majority: 'catholic', majorityPct: 53, breakdown: 'Christian (Catholic plurality) ~53%, no religion ~34%, other ~13%' },
  CHL: { majority: 'catholic', majorityPct: 62, breakdown: 'Catholic ~42%, Evangelical/Protestant ~20%, none ~35%' },
  COL: { majority: 'catholic', majorityPct: 90, breakdown: 'Catholic ~73%, Protestant/Evangelical ~17%' },
  CRI: { majority: 'catholic', majorityPct: 90, breakdown: 'Catholic ~52%, Evangelical/Protestant ~25%' },
  CUB: { majority: 'catholic', majorityPct: 59, breakdown: 'Christian ~59% (heavy Santería/folk syncretism), unaffiliated ~23%' },
  DMA: { majority: 'catholic', majorityPct: 90, breakdown: 'Catholic majority, Protestant minority' },
  DOM: { majority: 'catholic', majorityPct: 92, breakdown: 'Catholic ~57%, Protestant/Evangelical ~30%' },
  ECU: { majority: 'catholic', majorityPct: 92, breakdown: 'Catholic ~74%, Protestant/Evangelical ~13%' },
  SLV: { majority: 'catholic', majorityPct: 88, breakdown: 'Catholic ~40%, Protestant/Evangelical ~36%' },
  GRD: { majority: 'catholic', majorityPct: 92, breakdown: 'Catholic/Protestant, no major minority' },
  GTM: { majority: 'catholic', majorityPct: 93, breakdown: 'Catholic ~41%, Evangelical/Protestant ~41%' },
  GUY: { majority: 'christianity_other', majorityPct: 64, breakdown: 'Christian (fragmented Catholic/Protestant) ~64%, Hindu ~25%, Sunni Islam ~7%' },
  HTI: { majority: 'catholic', majorityPct: 90, breakdown: 'Catholic/Protestant ~90% (widespread Vodou syncretism)' },
  HND: { majority: 'catholic', majorityPct: 88, breakdown: 'Catholic ~46%, Evangelical/Protestant ~41%' },
  JAM: { majority: 'protestant', majorityPct: 68, breakdown: 'Protestant ~68% (many denominations), Catholic minority' },
  MEX: { majority: 'catholic', majorityPct: 90, breakdown: 'Catholic ~78%, Protestant/Evangelical ~11%' },
  NIC: { majority: 'catholic', majorityPct: 85, breakdown: 'Catholic ~50%, Evangelical/Protestant ~35%' },
  PAN: { majority: 'catholic', majorityPct: 85, breakdown: 'Catholic ~64%, Protestant/Evangelical ~21%' },
  PRY: { majority: 'catholic', majorityPct: 93, breakdown: 'Catholic ~81%, Protestant/Evangelical ~12%' },
  PER: { majority: 'catholic', majorityPct: 92, breakdown: 'Catholic ~76%, Evangelical/Protestant ~16%' },
  KNA: { majority: 'protestant', majorityPct: 90, breakdown: 'Protestant/Anglican majority, Catholic minority' },
  LCA: { majority: 'catholic', majorityPct: 90, breakdown: 'Catholic majority, Protestant minority' },
  VCT: { majority: 'protestant', majorityPct: 90, breakdown: 'Protestant/Anglican majority, Catholic minority' },
  SUR: { majority: 'christianity_other', majorityPct: 48, mixed: true, secondary: 'hinduism', breakdown: 'Christian (fragmented Catholic/Moravian/Protestant) ~48%, Hindu ~22%, Sunni Islam ~14%' },
  TTO: { majority: 'christianity_other', majorityPct: 55, breakdown: 'Christian (fragmented Catholic/Protestant) ~55%, Hindu ~18%, Sunni Islam ~5%' },
  USA: { majority: 'protestant', majorityPct: 63, breakdown: 'Christian (Protestant plurality) ~63%, unaffiliated ~29%, other ~8%' },
  URY: { majority: 'catholic', majorityPct: 57, breakdown: 'Christian (Catholic plurality) ~57%, unaffiliated ~37% — most secular in Latin America' },
  VEN: { majority: 'catholic', majorityPct: 88, breakdown: 'Catholic ~71%, Protestant/Evangelical ~17%' },
  GRL: { majority: 'protestant', majorityPct: 95, breakdown: 'Lutheran (Church of Denmark) majority' },
  PRI: { majority: 'catholic', majorityPct: 90, breakdown: 'Catholic ~56%, Protestant/Evangelical ~33%' },
  FLK: { majority: 'protestant', majorityPct: 80, breakdown: 'Anglican/Christian majority (small population)' },
  AIA: { majority: 'protestant', majorityPct: 90, breakdown: 'Protestant/Anglican majority' },
  ABW: { majority: 'catholic', majorityPct: 85, breakdown: 'Catholic ~75%, Protestant minority' },
  CUW: { majority: 'catholic', majorityPct: 85, breakdown: 'Catholic ~75%, Protestant minority' },
  VIR: { majority: 'protestant', majorityPct: 90, breakdown: 'Baptist/Catholic majority' },
  BLM: { majority: 'catholic', majorityPct: 90, breakdown: 'Catholic majority (French territory)' },
  MAF: { majority: 'catholic', majorityPct: 90, breakdown: 'Catholic majority (French territory)' },
  SPM: { majority: 'catholic', majorityPct: 90, breakdown: 'Catholic majority (French territory)' },

  // ── Asia ──────────────────────────────────────────────────
  AFG: { majority: 'sunni', majorityPct: 90, breakdown: 'Sunni Islam ~90%, Shia Islam ~10% (mostly Hazara)' },
  ARM: { majority: 'orthodox', majorityPct: 97, breakdown: 'Armenian Apostolic Church ~97%' },
  AZE: { majority: 'shia', majorityPct: 65, breakdown: 'Shia Islam ~65%, Sunni Islam ~25% — one of few Shia-majority states' },
  BHR: { majority: 'shia', majorityPct: 65, breakdown: 'Shia Islam ~65% of population, Sunni-led monarchy' },
  BGD: { majority: 'sunni', majorityPct: 90, breakdown: 'Sunni Islam ~90%, Hindu ~9%' },
  BTN: { majority: 'buddhism', majorityPct: 75, breakdown: 'Vajrayana Buddhism ~75%, Hindu ~23%' },
  BRN: { majority: 'sunni', majorityPct: 79, breakdown: 'Sunni Islam ~79% (state religion)' },
  KHM: { majority: 'buddhism', majorityPct: 97, breakdown: 'Theravada Buddhism ~97%' },
  CHN: { majority: 'nonreligious', majorityPct: 52, breakdown: 'Unaffiliated ~52%, folk/Buddhist/Taoist practice widespread, Sunni Islam ~2%' },
  TWN: { majority: 'folk', majorityPct: 60, breakdown: 'Buddhist-Taoist folk syncretism ~60%, unaffiliated ~25%, Christian minority' },
  CYP: { majority: 'orthodox', majorityPct: 78, breakdown: 'Greek Orthodox ~78% (Republic of Cyprus)' },
  GEO: { majority: 'orthodox', majorityPct: 83, breakdown: 'Georgian Orthodox ~83%, Sunni Islam ~11%' },
  HKG: { majority: 'nonreligious', majorityPct: 55, breakdown: 'No religion ~55%, Buddhist/Taoist/folk significant minority' },
  IND: { majority: 'hinduism', majorityPct: 80, breakdown: 'Hindu ~80%, Sunni/Shia Islam ~14%, Sikh/Christian/Buddhist minorities' },
  IDN: { majority: 'sunni', majorityPct: 87, breakdown: "Sunni Islam ~87% (world's largest Muslim population)" },
  IRN: { majority: 'shia', majorityPct: 90, breakdown: 'Shia Islam ~90% (state religion), Sunni Islam ~9%' },
  IRQ: { majority: 'shia', majorityPct: 57, mixed: true, secondary: 'sunni', breakdown: 'Shia Islam ~57%, Sunni Islam ~40%' },
  ISR: { majority: 'judaism', majorityPct: 73, breakdown: 'Jewish ~73%, Sunni Islam ~18%, Christian/Druze minorities' },
  PSE: { majority: 'sunni', majorityPct: 97, breakdown: 'Sunni Islam ~97%, Christian minority ~1-2%' },
  JPN: { majority: 'nonreligious', majorityPct: 57, breakdown: 'Unaffiliated ~57% (self-identified), Buddhist/Shinto widely practiced culturally' },
  JOR: { majority: 'sunni', majorityPct: 97, breakdown: 'Sunni Islam ~97% (state religion)' },
  KAZ: { majority: 'sunni', majorityPct: 70, breakdown: 'Sunni Islam ~70%, Orthodox Christian ~26%' },
  PRK: { majority: 'nonreligious', majorityPct: 64, breakdown: 'State atheism / unaffiliated majority; folk/Buddhist practice suppressed' },
  KOR: { majority: 'nonreligious', majorityPct: 56, breakdown: 'Unaffiliated ~56%, Christian ~28%, Buddhist ~16%' },
  KWT: { majority: 'sunni', majorityPct: 70, breakdown: 'Sunni Islam ~70% of Muslims, Shia Islam ~30%' },
  KGZ: { majority: 'sunni', majorityPct: 90, breakdown: 'Sunni Islam ~90%, Orthodox Christian minority' },
  LAO: { majority: 'buddhism', majorityPct: 65, breakdown: 'Theravada Buddhism ~65%, folk/animist ~30%' },
  LBN: { majority: 'catholic', majorityPct: 34, mixed: true, secondary: 'sunni', breakdown: 'Christian (Maronite Catholic plurality) 34%, Shia Islam 28%, Sunni Islam 28%' },
  MAC: { majority: 'nonreligious', majorityPct: 50, breakdown: 'No religion plurality, Buddhist/folk significant minority' },
  MYS: { majority: 'sunni', majorityPct: 64, breakdown: 'Sunni Islam ~64% (state religion), Buddhist ~18%, Christian/Hindu minorities' },
  MDV: { majority: 'sunni', majorityPct: 100, breakdown: 'Sunni Islam ~100% (state religion, exclusive citizenship requirement)' },
  MNG: { majority: 'buddhism', majorityPct: 53, mixed: true, secondary: 'nonreligious', breakdown: 'Tibetan Buddhism ~53%, unaffiliated ~41%' },
  MMR: { majority: 'buddhism', majorityPct: 88, breakdown: 'Theravada Buddhism ~88%, Sunni Islam/Christian minorities' },
  NPL: { majority: 'hinduism', majorityPct: 81, breakdown: 'Hindu ~81%, Buddhist ~9%' },
  OMN: { majority: 'islam_mixed', majorityPct: 45, mixed: true, secondary: 'sunni', breakdown: 'Ibadi Islam ~45% (plurality), Sunni Islam ~45%, Shia Islam ~5% — tied Ibadi/Sunni' },
  PAK: { majority: 'sunni', majorityPct: 85, breakdown: 'Sunni Islam ~85%, Shia Islam ~12%' },
  PHL: { majority: 'catholic', majorityPct: 92, breakdown: 'Catholic ~80%, Protestant ~11%, Sunni Islam ~5% (Mindanao)' },
  QAT: { majority: 'sunni', majorityPct: 90, breakdown: 'Sunni Islam ~90% of Muslims (state religion)' },
  SAU: { majority: 'sunni', majorityPct: 85, breakdown: 'Sunni Islam ~85% (state religion), Shia Islam ~13% (Eastern Province)' },
  SGP: { majority: 'buddhism', majorityPct: 31, mixed: true, secondary: 'nonreligious', breakdown: 'Buddhist ~31% (plurality), no religion ~20%, Christian ~19%, Sunni Islam ~15%, Taoist/folk ~9% — highly fragmented' },
  LKA: { majority: 'buddhism', majorityPct: 70, breakdown: 'Theravada Buddhism ~70%, Hindu ~12%, Sunni Islam ~10%, Christian ~7%' },
  SYR: { majority: 'sunni', majorityPct: 74, breakdown: 'Sunni Islam ~74%, Alawite (Shia-linked) ~11%, Christian ~10%, Druze ~3%' },
  TJK: { majority: 'sunni', majorityPct: 95, breakdown: 'Sunni Islam ~95%, Ismaili Shia minority (Gorno-Badakhshan)' },
  THA: { majority: 'buddhism', majorityPct: 93, breakdown: 'Theravada Buddhism ~93%, Sunni Islam ~5%' },
  TLS: { majority: 'catholic', majorityPct: 97, breakdown: 'Catholic ~97% (unique in Southeast Asia)' },
  TKM: { majority: 'sunni', majorityPct: 89, breakdown: 'Sunni Islam ~89%, Orthodox Christian minority' },
  ARE: { majority: 'sunni', majorityPct: 85, breakdown: 'Sunni Islam ~85% of Muslims (citizens), Shia Islam ~15%' },
  UZB: { majority: 'sunni', majorityPct: 88, breakdown: 'Sunni Islam ~88%, Orthodox Christian minority' },
  VNM: { majority: 'folk', majorityPct: 45, breakdown: 'Folk religion ~45% (ancestor veneration), unaffiliated ~29%, Buddhist ~16%' },
  YEM: { majority: 'sunni', majorityPct: 65, breakdown: 'Sunni Islam ~65%, Zaidi Shia Islam ~35%' },
  TUR: { majority: 'sunni', majorityPct: 97, breakdown: 'Sunni Islam ~97%, Alevi minority ~10-15% (within Islam), secular constitution' },

  // ── Europe ────────────────────────────────────────────────
  ALB: { majority: 'sunni', majorityPct: 57, breakdown: 'Sunni Islam ~57% (plurality), Christian ~17%, many secular' },
  AND: { majority: 'catholic', majorityPct: 90, breakdown: 'Catholic ~90% (state religion)' },
  AUT: { majority: 'catholic', majorityPct: 64, breakdown: 'Catholic ~55%, Protestant ~9%, no religion ~22%, Sunni Islam ~8%' },
  BLR: { majority: 'orthodox', majorityPct: 85, breakdown: 'Orthodox Christian ~85%, Catholic minority' },
  BEL: { majority: 'catholic', majorityPct: 55, breakdown: 'Catholic majority (declining), no religion ~32%, Sunni Islam ~7%' },
  BIH: { majority: 'sunni', majorityPct: 51, mixed: true, secondary: 'orthodox', breakdown: 'Sunni Islam ~51% (plurality, Bosniaks), Orthodox Christian (Serb) ~31%, Catholic (Croat) ~15%' },
  BGR: { majority: 'orthodox', majorityPct: 76, breakdown: 'Orthodox Christian ~76%, Sunni Islam ~10%' },
  HRV: { majority: 'catholic', majorityPct: 91, breakdown: 'Catholic ~91%' },
  CZE: { majority: 'nonreligious', majorityPct: 68, breakdown: 'No religion ~68% — one of the most secular countries in the world' },
  DNK: { majority: 'protestant', majorityPct: 74, breakdown: 'Evangelical Lutheran (state church) ~74%, largely nominal/secular in practice' },
  EST: { majority: 'nonreligious', majorityPct: 60, breakdown: 'No religion ~60%, Orthodox/Lutheran minorities' },
  FIN: { majority: 'protestant', majorityPct: 66, breakdown: 'Evangelical Lutheran ~66% (declining), no religion ~31%' },
  FRA: { majority: 'catholic', majorityPct: 47, breakdown: 'Catholic plurality ~47%, no religion ~40%, Sunni Islam ~8% (largest in Western Europe)' },
  DEU: { majority: 'catholic', majorityPct: 52, breakdown: 'Catholic + Protestant ~52% combined (Catholic now narrowly largest), no religion ~40%, Sunni Islam ~6%' },
  GRC: { majority: 'orthodox', majorityPct: 90, breakdown: 'Greek Orthodox ~90% (state religion)' },
  HUN: { majority: 'catholic', majorityPct: 55, breakdown: 'Catholic plurality ~37%, no religion/unaffiliated ~40%+' },
  ISL: { majority: 'protestant', majorityPct: 75, breakdown: 'Evangelical Lutheran (state church) ~75%, growing secular minority' },
  IRL: { majority: 'catholic', majorityPct: 79, breakdown: 'Catholic ~79% (declining), no religion ~14%' },
  ITA: { majority: 'catholic', majorityPct: 80, breakdown: 'Catholic ~80%' },
  LVA: { majority: 'christianity_other', majorityPct: 70, breakdown: 'Christian ~70% nominal (Lutheran/Catholic/Orthodox regional split), large nonpracticing population' },
  LIE: { majority: 'catholic', majorityPct: 90, breakdown: 'Catholic ~90%' },
  LTU: { majority: 'catholic', majorityPct: 90, breakdown: 'Catholic ~90% (most devout Baltic state)' },
  LUX: { majority: 'catholic', majorityPct: 63, breakdown: 'Catholic ~63%, no religion ~30%+' },
  MKD: { majority: 'orthodox', majorityPct: 65, breakdown: 'Macedonian Orthodox ~65%, Sunni Islam ~33% (Albanian minority)' },
  MLT: { majority: 'catholic', majorityPct: 90, breakdown: 'Catholic ~90%+ (highly devout)' },
  MDA: { majority: 'orthodox', majorityPct: 95, breakdown: 'Orthodox Christian ~95%' },
  MCO: { majority: 'catholic', majorityPct: 90, breakdown: 'Catholic (official religion) majority' },
  MNE: { majority: 'orthodox', majorityPct: 72, breakdown: 'Orthodox Christian ~72%, Sunni Islam ~19%' },
  NLD: { majority: 'nonreligious', majorityPct: 55, breakdown: 'No religion ~55%, Christian (historically Protestant) ~40% (declining), Sunni Islam ~5%' },
  NOR: { majority: 'nonreligious', majorityPct: 48, breakdown: 'Unaffiliated/no religion now largest group, Church of Norway membership below half' },
  POL: { majority: 'catholic', majorityPct: 85, breakdown: 'Catholic ~85% (still devout, though declining among youth)' },
  PRT: { majority: 'catholic', majorityPct: 81, breakdown: 'Catholic ~81%' },
  ROU: { majority: 'orthodox', majorityPct: 99, breakdown: 'Orthodox Christian ~99%' },
  RUS: { majority: 'orthodox', majorityPct: 71, breakdown: 'Russian Orthodox ~71% (cultural identification), Sunni Islam ~10%, no religion ~15%' },
  SMR: { majority: 'catholic', majorityPct: 90, breakdown: 'Catholic ~90%+' },
  SRB: { majority: 'orthodox', majorityPct: 91, breakdown: 'Serbian Orthodox ~91%' },
  SVK: { majority: 'catholic', majorityPct: 74, breakdown: 'Catholic ~62%, other Christian ~12%, no religion ~23%' },
  SVN: { majority: 'catholic', majorityPct: 73, breakdown: 'Catholic ~73%, no religion ~18%' },
  ESP: { majority: 'catholic', majorityPct: 60, breakdown: 'Catholic ~60% (declining), no religion ~37%' },
  SWE: { majority: 'nonreligious', majorityPct: 60, breakdown: 'No religion 60%, Christian (Lutheran) 40% — among most secular countries in the world' },
  CHE: { majority: 'catholic', majorityPct: 62, breakdown: 'Catholic ~35%, Protestant ~23%, no religion ~29%, Sunni Islam ~5%' },
  UKR: { majority: 'orthodox', majorityPct: 87, breakdown: 'Orthodox Christian ~87% (split churches), Greek Catholic minority' },
  GBR: { majority: 'protestant', majorityPct: 46, breakdown: 'Christian (historically Anglican/Protestant) ~46% (plurality, declining), no religion ~37%, Sunni Islam ~6.5%' },
  VAT: { majority: 'catholic', majorityPct: 100, breakdown: 'Catholic 100% (seat of the Church)' },
  FRO: { majority: 'protestant', majorityPct: 90, breakdown: 'Evangelical Lutheran majority (Danish territory)' },
  GGY: { majority: 'protestant', majorityPct: 80, breakdown: 'Anglican/Christian majority (British Crown dependency)' },
  JEY: { majority: 'protestant', majorityPct: 80, breakdown: 'Anglican/Christian majority (British Crown dependency)' },
  IMN: { majority: 'protestant', majorityPct: 80, breakdown: 'Anglican/Christian majority (British Crown dependency)' },

  // ── Oceania ───────────────────────────────────────────────
  AUS: { majority: 'catholic', majorityPct: 44, breakdown: 'Christian (Catholic plurality) ~44% (declining), no religion ~39%' },
  FJI: { majority: 'protestant', majorityPct: 64, breakdown: 'Christian (Methodist plurality) ~64%, Hindu ~27%, Sunni Islam ~6%' },
  KIR: { majority: 'catholic', majorityPct: 96, breakdown: 'Catholic/Protestant ~96%' },
  MHL: { majority: 'protestant', majorityPct: 97, breakdown: 'Protestant majority ~97%' },
  FSM: { majority: 'catholic', majorityPct: 97, breakdown: 'Catholic majority, Protestant minority' },
  NRU: { majority: 'protestant', majorityPct: 95, breakdown: 'Protestant/Catholic majority' },
  NZL: { majority: 'nonreligious', majorityPct: 50, breakdown: 'No religion ~50% (largest single category), Christian ~37%' },
  PLW: { majority: 'catholic', majorityPct: 65, breakdown: 'Catholic/Protestant ~65%, Modekngei indigenous religion ~25%' },
  PNG: { majority: 'christianity_other', majorityPct: 96, breakdown: 'Christian ~96% (highly fragmented denominations, with widespread indigenous/folk syncretism)' },
  WSM: { majority: 'protestant', majorityPct: 98, breakdown: 'Christian ~98% (Congregationalist plurality)' },
  SLB: { majority: 'christianity_other', majorityPct: 97, breakdown: 'Christian ~97% (fragmented Anglican/Catholic/Evangelical/SDA)' },
  TON: { majority: 'protestant', majorityPct: 98, breakdown: 'Free Wesleyan/Christian ~98%' },
  TUV: { majority: 'protestant', majorityPct: 97, breakdown: 'Congregationalist/Christian ~97%' },
  VUT: { majority: 'christianity_other', majorityPct: 93, breakdown: 'Christian ~93% (fragmented Presbyterian/Anglican/Catholic), folk/traditional minority' },
  NCL: { majority: 'catholic', majorityPct: 85, breakdown: 'Catholic majority (French territory), Kanak folk minority' },
  PYF: { majority: 'protestant', majorityPct: 85, breakdown: 'Protestant (Evangelical Church) majority (French territory)' },
  GUM: { majority: 'catholic', majorityPct: 85, breakdown: 'Catholic ~85% (Chamorro)' },
  MNP: { majority: 'catholic', majorityPct: 85, breakdown: 'Catholic majority' },
  COK: { majority: 'protestant', majorityPct: 90, breakdown: 'Cook Islands Christian Church majority' },
  TCA: { majority: 'protestant', majorityPct: 85, breakdown: 'Protestant/Baptist majority' },
  SXM: { majority: 'catholic', majorityPct: 85, breakdown: 'Christian majority (Dutch territory)' },
  MSR: { majority: 'catholic', majorityPct: 85, breakdown: 'Catholic majority (Irish heritage), Anglican/Methodist minority' },
  BMU: { majority: 'protestant', majorityPct: 80, breakdown: 'Anglican/Christian majority' },
  ASM: { majority: 'protestant', majorityPct: 90, breakdown: 'Congregationalist/Christian majority' },
  SHN: { majority: 'protestant', majorityPct: 85, breakdown: 'Anglican/Christian majority' },

  // ── Disputed / Partially Recognized Territories ───────────
  SOL: { majority: 'sunni', majorityPct: 99, breakdown: 'Sunni Islam ~99%' },
  XKX: { majority: 'sunni', majorityPct: 95, breakdown: 'Sunni Islam ~95% (Albanian majority)' },
  ABK: { majority: 'orthodox', majorityPct: 60, breakdown: 'Orthodox Christian ~60%, Sunni Islam ~16%' },
  OST: { majority: 'orthodox', majorityPct: 90, breakdown: 'Orthodox Christian majority (Ossetian traditional faith syncretism)' },
  PMR: { majority: 'orthodox', majorityPct: 90, breakdown: 'Orthodox Christian majority' },
  NCY: { majority: 'sunni', majorityPct: 99, breakdown: 'Sunni Islam ~99% (Turkish Cypriot population)' },
};

export function getReligionColor(id: string): string | null {
  const r = RELIGIONS[id];
  return r ? RELIGION_META[r.majority].color : null;
}

export function religionPatternId(a: ReligionCategory, b: ReligionCategory): string {
  return `relstripe-${a}-${b}`;
}

// Solid color, or `url(#relstripe-...)` for countries with no clear majority.
export function getReligionFillRef(id: string): string | null {
  const r = RELIGIONS[id];
  if (!r) return null;
  if (r.mixed && r.secondary) return `url(#${religionPatternId(r.majority, r.secondary)})`;
  return RELIGION_META[r.majority].color;
}

export function getMixedPatternDefs(): { id: string; colorA: string; colorB: string }[] {
  const seen = new Map<string, { id: string; colorA: string; colorB: string }>();
  for (const r of Object.values(RELIGIONS)) {
    if (r.mixed && r.secondary) {
      const id = religionPatternId(r.majority, r.secondary);
      if (!seen.has(id)) {
        seen.set(id, { id, colorA: RELIGION_META[r.majority].color, colorB: RELIGION_META[r.secondary].color });
      }
    }
  }
  return [...seen.values()];
}

// Turns a breakdown string like "Sunni Islam ~90% (state religion), Shia Islam ~10%"
// into clean, parenthetical-free, tilde-free lines: ["Sunni Islam 90%", "Shia Islam 10%"].
export function religionLines(breakdown: string): string[] {
  const cleaned = breakdown
    .replace(/\([^)]*\)/g, '')
    .replace(/~/g, '');
  return cleaned
    .split(/,|—/)
    .map(s => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}
