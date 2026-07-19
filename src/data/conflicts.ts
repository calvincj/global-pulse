// Ongoing conflict / high-tension zones, rendered as circle markers on the map.
// Coordinates are [latitude, longitude]. Intensity (0-1) drives marker size, opacity,
// and whether it pulses — a rough proxy for active-war vs. simmering-tension.

export type ConflictType = 'war' | 'proxy' | 'insurgency' | 'tension';

export interface ConflictZone {
  id: string;
  name: string;
  coordinates: [number, number]; // [lat, lon]
  countries: string[]; // ISO alpha-3 codes of parties involved
  intensity: number; // 0-1: scale/severity of the active conflict
  type: ConflictType;
  description: string;
}

export const CONFLICT_ZONES: ConflictZone[] = [
  {
    id: 'ukr-rus-war',
    name: 'Russia-Ukraine War',
    coordinates: [48.5, 37.5], // Donbas front line
    countries: ['UKR', 'RUS'],
    intensity: 1.0,
    type: 'war',
    description: 'Full-scale war since Feb 2022; active front line across eastern and southern Ukraine, daily missile and drone strikes nationwide.',
  },
  {
    id: 'israel-gaza',
    name: 'Israel-Gaza War',
    coordinates: [31.5, 34.47],
    countries: ['ISR', 'PSE'],
    intensity: 0.9,
    type: 'war',
    description: 'War since the Oct 7 2023 Hamas attack; sustained IDF ground and air operations across the Gaza Strip.',
  },
  {
    id: 'israel-lebanon',
    name: 'Israel-Hezbollah (Lebanon)',
    coordinates: [33.3, 35.4], // South Lebanon
    countries: ['ISR', 'LBN'],
    intensity: 0.4,
    type: 'tension',
    description: 'Ceasefire since Nov 2024 after a intense 2024 air and ground campaign against Hezbollah; sporadic strikes continue.',
  },
  {
    id: 'israel-iran',
    name: 'Israel-Iran Shadow War',
    coordinates: [32.0, 44.5], // midpoint between the two, over Iraq
    countries: ['ISR', 'IRN'],
    intensity: 0.55,
    type: 'proxy',
    description: 'Direct missile/drone exchanges (Apr and Oct 2024) plus a long-running shadow war of sabotage, airstrikes on proxies, and covert operations.',
  },
  {
    id: 'us-iran',
    name: 'US-Iran Tension',
    coordinates: [26.5, 56.2], // Strait of Hormuz
    countries: ['USA', 'IRN'],
    intensity: 0.5,
    type: 'tension',
    description: 'Nuclear standoff, naval confrontations in the Strait of Hormuz, and proxy militia attacks on US forces across Iraq and Syria.',
  },
  {
    id: 'red-sea-houthi',
    name: 'Red Sea Crisis (Houthi attacks)',
    coordinates: [13.5, 43.0], // Bab-el-Mandeb Strait
    countries: ['YEM', 'ISR', 'USA'],
    intensity: 0.5,
    type: 'proxy',
    description: 'Houthi missile and drone attacks on shipping since Oct 2023 have disrupted Red Sea trade; US/UK conduct retaliatory strikes on Houthi positions.',
  },
  {
    id: 'sudan-civil-war',
    name: 'Sudan Civil War',
    coordinates: [15.5, 32.5], // Khartoum
    countries: ['SDN'],
    intensity: 0.75,
    type: 'war',
    description: 'War between the Sudanese Armed Forces and the Rapid Support Forces since Apr 2023; one of the world\'s largest displacement crises.',
  },
  {
    id: 'myanmar-civil-war',
    name: 'Myanmar Civil War',
    coordinates: [21.9, 96.1],
    countries: ['MMR'],
    intensity: 0.6,
    type: 'war',
    description: 'Nationwide armed resistance against the military junta since the Feb 2021 coup; junta has lost significant territory to ethnic and resistance forces.',
  },
  {
    id: 'taiwan-strait',
    name: 'Taiwan Strait Tension',
    coordinates: [24.5, 119.5],
    countries: ['CHN', 'TWN'],
    intensity: 0.45,
    type: 'tension',
    description: 'Repeated Chinese military incursions, naval exercises, and grey-zone pressure around Taiwan; no declared war but persistent invasion risk.',
  },
  {
    id: 'south-china-sea',
    name: 'South China Sea Disputes',
    coordinates: [11.0, 114.0], // Spratly Islands
    countries: ['CHN', 'PHL', 'VNM'],
    intensity: 0.4,
    type: 'tension',
    description: 'Overlapping territorial claims; recurring clashes between Chinese coast guard vessels and Philippine/Vietnamese ships near contested reefs.',
  },

  // ── Africa ────────────────────────────────────────────────
  {
    id: 'drc-m23',
    name: 'Eastern DR Congo Conflict (M23)',
    coordinates: [-1.68, 29.22], // Goma, North Kivu
    countries: ['COD', 'RWA'],
    intensity: 0.85,
    type: 'war',
    description: 'Rwanda-backed M23 rebels have seized large parts of North and South Kivu since 2022, including the regional capital Goma in early 2025; one of the world\'s deadliest ongoing conflicts.',
  },
  {
    id: 'somalia-alshabaab',
    name: 'Somalia Insurgency (al-Shabaab)',
    coordinates: [2.04, 45.34], // central Somalia
    countries: ['SOM'],
    intensity: 0.55,
    type: 'insurgency',
    description: 'Decades-long conflict between the federal government (backed by an African Union force) and the al-Qaeda-linked al-Shabaab insurgency, which still controls large rural areas.',
  },
  {
    id: 'sahel-jihadist-insurgency',
    name: 'Sahel Jihadist Insurgency',
    coordinates: [15.5, 0.5], // Mali/Burkina Faso/Niger tri-border area
    countries: ['MLI', 'BFA', 'NER'],
    intensity: 0.7,
    type: 'insurgency',
    description: 'JNIM (al-Qaeda-linked) and ISGS insurgents control growing territory across the Mali-Burkina Faso-Niger tri-border region since military juntas took power and expelled French/UN forces.',
  },
  {
    id: 'nigeria-boko-haram',
    name: 'Nigeria Insurgency (Boko Haram/ISWAP)',
    coordinates: [11.85, 13.15], // Borno State
    countries: ['NGA'],
    intensity: 0.5,
    type: 'insurgency',
    description: 'Boko Haram and its ISWAP offshoot continue a 15+ year insurgency in the northeast, marked by mass kidnappings and attacks on military and civilian targets.',
  },
  {
    id: 'ethiopia-amhara',
    name: 'Ethiopia — Amhara Conflict',
    coordinates: [11.6, 37.4], // Amhara region
    countries: ['ETH'],
    intensity: 0.45,
    type: 'insurgency',
    description: 'Fano militia forces have fought federal troops across the Amhara region since 2023, a new front opening after the 2022 Tigray ceasefire.',
  },
  {
    id: 'cameroon-anglophone',
    name: 'Cameroon Anglophone Crisis',
    coordinates: [5.96, 10.15], // Bamenda, Northwest region
    countries: ['CMR'],
    intensity: 0.35,
    type: 'insurgency',
    description: 'Separatist militias in the English-speaking Northwest and Southwest regions have fought government forces since 2017 seeking an independent "Ambazonia".',
  },
  {
    id: 'mozambique-cabo-delgado',
    name: 'Mozambique — Cabo Delgado Insurgency',
    coordinates: [-10.8, 40.5], // Cabo Delgado province
    countries: ['MOZ'],
    intensity: 0.4,
    type: 'insurgency',
    description: 'An ISIS-affiliated insurgency in the gas-rich Cabo Delgado province has displaced hundreds of thousands since 2017, despite Rwandan and SADC troop deployments.',
  },
  {
    id: 'car-civil-war',
    name: 'Central African Republic Conflict',
    coordinates: [6.5, 20.5],
    countries: ['CAF'],
    intensity: 0.35,
    type: 'insurgency',
    description: 'Armed groups still contest territory outside the capital despite a 2019 peace deal; Russian Wagner/Africa Corps forces back the government against rebel coalitions.',
  },
  {
    id: 'libya-factional-conflict',
    name: 'Libya Factional Conflict',
    coordinates: [29.0, 18.0],
    countries: ['LBY'],
    intensity: 0.35,
    type: 'tension',
    description: 'Rival governments in Tripoli and the east, backed by competing foreign patrons, remain in an uneasy standoff since the 2020 ceasefire; sporadic militia clashes continue.',
  },

  // ── Americas ──────────────────────────────────────────────
  {
    id: 'colombia-internal-conflict',
    name: 'Colombia Internal Armed Conflict',
    coordinates: [7.0, -73.2], // Catatumbo / Norte de Santander
    countries: ['COL'],
    intensity: 0.4,
    type: 'insurgency',
    description: 'ELN guerrillas and FARC dissident factions who rejected the 2016 peace deal continue fighting the state and each other over drug-trafficking territory, especially in Catatumbo.',
  },
  {
    id: 'ecuador-gang-war',
    name: 'Ecuador Gang War',
    coordinates: [-2.19, -79.89], // Guayaquil
    countries: ['ECU'],
    intensity: 0.45,
    type: 'insurgency',
    description: 'President Noboa declared an "internal armed conflict" against drug-trafficking gangs in Jan 2024 after a wave of prison riots and a live TV studio takeover; once one of Latin America\'s safest countries.',
  },
  {
    id: 'haiti-gang-crisis',
    name: 'Haiti Gang Crisis',
    coordinates: [18.54, -72.34], // Port-au-Prince
    countries: ['HTI'],
    intensity: 0.6,
    type: 'insurgency',
    description: 'Armed gang coalitions control most of the capital and much of the country amid state collapse; a Kenyan-led multinational security mission has struggled to restore order.',
  },
  {
    id: 'venezuela-guyana-essequibo',
    name: 'Venezuela-Guyana (Essequibo) Dispute',
    coordinates: [6.8, -58.7], // Essequibo region
    countries: ['VEN', 'GUY'],
    intensity: 0.3,
    type: 'tension',
    description: 'Venezuela claims the oil-rich Essequibo region (two-thirds of Guyana\'s territory), holding a 2023 referendum on annexation and massing troops on the border; no active combat yet.',
  },
];
