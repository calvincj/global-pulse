// Conflict / high-tension zones, rendered as circle markers on the map.
// Coordinates are [latitude, longitude]. Intensity (0-1) drives marker size, opacity,
// and whether it pulses — a rough proxy for active-war vs. simmering-tension.
//
// startYear/endYear make each zone timeline-aware: the map's history scrubber (2000-2025)
// only shows a marker for years within [startYear, endYear]. Omit endYear for conflicts
// still ongoing as of the dataset's present day.

export type ConflictType = 'war' | 'proxy' | 'insurgency' | 'tension';

export interface ConflictZone {
  id: string;
  name: string;
  coordinates: [number, number]; // [lat, lon]
  countries: string[]; // ISO alpha-3 codes of parties involved
  intensity: number; // 0-1: scale/severity of the conflict at its relevant point
  type: ConflictType;
  description: string;
  startYear: number;
  endYear?: number; // omitted = ongoing
}

export function isConflictActiveInYear(cz: ConflictZone, year: number): boolean {
  if (year < cz.startYear) return false;
  if (cz.endYear != null && year > cz.endYear) return false;
  return true;
}

export const CONFLICT_ZONES: ConflictZone[] = [
  // ── Ongoing ───────────────────────────────────────────────
  {
    id: 'ukr-rus-war',
    name: 'Russia-Ukraine War',
    coordinates: [48.5, 37.5], // Donbas front line
    countries: ['UKR', 'RUS'],
    intensity: 1.0,
    type: 'war',
    description: 'Full-scale war since Feb 2022; active front line across eastern and southern Ukraine, daily missile and drone strikes nationwide.',
    startYear: 2022,
  },
  {
    id: 'israel-gaza',
    name: 'Israel-Gaza War',
    coordinates: [31.5, 34.47],
    countries: ['ISR', 'PSE'],
    intensity: 0.6,
    type: 'war',
    description: 'War since the Oct 7 2023 Hamas attack. A Jan 2025 ceasefire collapsed in March; Trump\'s Oct 2025 peace plan produced a broader ceasefire and the release of the remaining living hostages, though the underlying dispute is unresolved.',
    startYear: 2023,
  },
  {
    id: 'israel-lebanon',
    name: 'Israel-Hezbollah (Lebanon)',
    coordinates: [33.3, 35.4], // South Lebanon
    countries: ['ISR', 'LBN'],
    intensity: 0.35,
    type: 'tension',
    description: 'Ceasefire since Nov 2024 after an intense 2024 air and ground campaign that killed Hezbollah\'s leadership; sporadic Israeli strikes on Hezbollah targets continue.',
    startYear: 2023,
  },
  {
    id: 'israel-iran',
    name: 'Israel-Iran Shadow War',
    coordinates: [32.0, 44.5], // midpoint between the two, over Iraq
    countries: ['ISR', 'IRN'],
    intensity: 0.65,
    type: 'proxy',
    description: 'Decades of sabotage and covert strikes escalated into direct missile exchanges in 2024, then the 12-Day War (Jun 2025) — Israeli strikes on Iran\'s nuclear/military leadership followed by US strikes on Fordow, Natanz and Isfahan. A ceasefire holds since, but the shadow war continues.',
    startYear: 2024,
  },
  {
    id: 'us-iran',
    name: 'US-Iran Tension',
    coordinates: [26.5, 56.2], // Strait of Hormuz
    countries: ['USA', 'IRN'],
    intensity: 0.55,
    type: 'tension',
    description: 'Nuclear standoff, naval confrontations in the Strait of Hormuz, and proxy militia attacks on US forces across Iraq and Syria; the US struck Iran\'s nuclear program directly during the June 2025 12-Day War.',
    startYear: 2019,
  },
  {
    id: 'red-sea-houthi',
    name: 'Red Sea Crisis (Houthi attacks)',
    coordinates: [13.5, 43.0], // Bab-el-Mandeb Strait
    countries: ['YEM', 'ISR', 'USA'],
    intensity: 0.45,
    type: 'proxy',
    description: 'Houthi missile and drone attacks on shipping since Oct 2023 have disrupted Red Sea trade; US/UK conduct retaliatory strikes on Houthi positions.',
    startYear: 2023,
  },
  {
    id: 'yemen-civil-war',
    name: 'Yemen Civil War',
    coordinates: [15.5, 44.2], // Marib front
    countries: ['YEM', 'SAU'],
    intensity: 0.3,
    type: 'war',
    description: 'Houthi rebels vs. the internationally recognized government since 2015 (Saudi-led coalition intervention followed a 2014 Houthi takeover of Sanaa). A UN-brokered 2022 truce sharply reduced fighting; a formal peace deal remains unsigned but a de facto ceasefire mostly holds.',
    startYear: 2014,
  },
  {
    id: 'syria-transition-violence',
    name: 'Syria Post-Assad Instability',
    coordinates: [34.9, 37.0],
    countries: ['SYR'],
    intensity: 0.4,
    type: 'insurgency',
    description: 'Sectarian violence since the Dec 2024 fall of Assad: mass killings of Alawite civilians on the coast (Mar 2025) and Druze-Bedouin clashes in Suwayda (Jul 2025), drawing Israeli strikes in support of the Druze. The new al-Sharaa government is still consolidating control.',
    startYear: 2024,
  },
  {
    id: 'india-pakistan-standoff',
    name: 'India-Pakistan Standoff',
    coordinates: [34.0, 74.3], // Line of Control, Kashmir
    countries: ['IND', 'PAK'],
    intensity: 0.4,
    type: 'tension',
    description: 'Nuclear-armed rivals locked in a recurring cycle of terror attacks and retaliation over Kashmir: the 2001 Parliament attack, 2008 Mumbai attacks, 2019 Pulwama/Balakot strikes, and the 2025 Pahalgam attack followed by Operation Sindoor (May 2025), a four-day military confrontation.',
    startYear: 2001,
  },
  {
    id: 'sudan-civil-war',
    name: 'Sudan Civil War',
    coordinates: [15.5, 32.5], // Khartoum
    countries: ['SDN'],
    intensity: 0.75,
    type: 'war',
    description: 'War between the Sudanese Armed Forces and the Rapid Support Forces since Apr 2023; one of the world\'s largest displacement crises.',
    startYear: 2023,
  },
  {
    id: 'myanmar-civil-war',
    name: 'Myanmar Civil War',
    coordinates: [21.9, 96.1],
    countries: ['MMR'],
    intensity: 0.6,
    type: 'war',
    description: 'Nationwide armed resistance against the military junta since the Feb 2021 coup; junta has lost significant territory to ethnic and resistance forces.',
    startYear: 2021,
  },
  {
    id: 'taiwan-strait',
    name: 'Taiwan Strait Tension',
    coordinates: [24.5, 119.5],
    countries: ['CHN', 'TWN'],
    intensity: 0.45,
    type: 'tension',
    description: 'Repeated Chinese military incursions, naval exercises, and grey-zone pressure around Taiwan since Tsai Ing-wen\'s 2016 election; no declared war but persistent invasion risk, sharpened by the Strait Thunder-2025A blockade drills.',
    startYear: 2016,
  },
  {
    id: 'south-china-sea',
    name: 'South China Sea Disputes',
    coordinates: [11.0, 114.0], // Spratly Islands
    countries: ['CHN', 'PHL', 'VNM'],
    intensity: 0.4,
    type: 'tension',
    description: 'Overlapping territorial claims; recurring clashes between Chinese coast guard vessels and Philippine/Vietnamese ships near contested reefs.',
    startYear: 2012,
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
    startYear: 2022,
  },
  {
    id: 'somalia-alshabaab',
    name: 'Somalia Insurgency (al-Shabaab)',
    coordinates: [2.04, 45.34], // central Somalia
    countries: ['SOM'],
    intensity: 0.55,
    type: 'insurgency',
    description: 'Conflict between the federal government (backed by an African Union force) and the al-Qaeda-linked al-Shabaab insurgency, active since the group\'s mid-2000s emergence and still controlling large rural areas.',
    startYear: 2006,
  },
  {
    id: 'sahel-jihadist-insurgency',
    name: 'Sahel Jihadist Insurgency',
    coordinates: [15.5, 0.5], // Mali/Burkina Faso/Niger tri-border area
    countries: ['MLI', 'BFA', 'NER'],
    intensity: 0.7,
    type: 'insurgency',
    description: 'JNIM (al-Qaeda-linked) and ISGS insurgents control growing territory across the Mali-Burkina Faso-Niger tri-border region since military juntas took power and expelled French/UN forces.',
    startYear: 2012,
  },
  {
    id: 'nigeria-boko-haram',
    name: 'Nigeria Insurgency (Boko Haram/ISWAP)',
    coordinates: [11.85, 13.15], // Borno State
    countries: ['NGA'],
    intensity: 0.5,
    type: 'insurgency',
    description: 'Boko Haram and its ISWAP offshoot continue a 15+ year insurgency in the northeast, marked by mass kidnappings and attacks on military and civilian targets.',
    startYear: 2009,
  },
  {
    id: 'ethiopia-amhara',
    name: 'Ethiopia — Amhara Conflict',
    coordinates: [11.6, 37.4], // Amhara region
    countries: ['ETH'],
    intensity: 0.45,
    type: 'insurgency',
    description: 'Fano militia forces have fought federal troops across the Amhara region since 2023, a new front opening after the 2022 Tigray ceasefire.',
    startYear: 2023,
  },
  {
    id: 'cameroon-anglophone',
    name: 'Cameroon Anglophone Crisis',
    coordinates: [5.96, 10.15], // Bamenda, Northwest region
    countries: ['CMR'],
    intensity: 0.35,
    type: 'insurgency',
    description: 'Separatist militias in the English-speaking Northwest and Southwest regions have fought government forces since 2017 seeking an independent "Ambazonia".',
    startYear: 2017,
  },
  {
    id: 'mozambique-cabo-delgado',
    name: 'Mozambique — Cabo Delgado Insurgency',
    coordinates: [-10.8, 40.5], // Cabo Delgado province
    countries: ['MOZ'],
    intensity: 0.4,
    type: 'insurgency',
    description: 'An ISIS-affiliated insurgency in the gas-rich Cabo Delgado province has displaced hundreds of thousands since 2017, despite Rwandan and SADC troop deployments.',
    startYear: 2017,
  },
  {
    id: 'car-civil-war',
    name: 'Central African Republic Conflict',
    coordinates: [6.5, 20.5],
    countries: ['CAF'],
    intensity: 0.35,
    type: 'insurgency',
    description: 'Armed groups still contest territory outside the capital despite a 2019 peace deal; Russian Wagner/Africa Corps forces back the government against rebel coalitions.',
    startYear: 2012,
  },
  {
    id: 'libya-factional-conflict',
    name: 'Libya Factional Conflict',
    coordinates: [29.0, 18.0],
    countries: ['LBY'],
    intensity: 0.35,
    type: 'tension',
    description: 'Rival governments in Tripoli and the east, backed by competing foreign patrons, remain in an uneasy standoff since the 2020 ceasefire; sporadic militia clashes continue.',
    startYear: 2014,
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
    startYear: 2016,
  },
  {
    id: 'ecuador-gang-war',
    name: 'Ecuador Gang War',
    coordinates: [-2.19, -79.89], // Guayaquil
    countries: ['ECU'],
    intensity: 0.45,
    type: 'insurgency',
    description: 'President Noboa declared an "internal armed conflict" against drug-trafficking gangs in Jan 2024 after a wave of prison riots and a live TV studio takeover; once one of Latin America\'s safest countries.',
    startYear: 2024,
  },
  {
    id: 'haiti-gang-crisis',
    name: 'Haiti Gang Crisis',
    coordinates: [18.54, -72.34], // Port-au-Prince
    countries: ['HTI'],
    intensity: 0.6,
    type: 'insurgency',
    description: 'Armed gang coalitions control most of the capital and much of the country amid state collapse; a Kenyan-led multinational security mission has struggled to restore order.',
    startYear: 2021,
  },
  {
    id: 'venezuela-guyana-essequibo',
    name: 'Venezuela-Guyana (Essequibo) Dispute',
    coordinates: [6.8, -58.7], // Essequibo region
    countries: ['VEN', 'GUY'],
    intensity: 0.3,
    type: 'tension',
    description: 'Venezuela claims the oil-rich Essequibo region (two-thirds of Guyana\'s territory), holding a 2023 referendum on annexation and massing troops on the border; no active combat yet.',
    startYear: 2023,
  },

  // ── Historic conflicts (ended, since 2000) ─────────────────
  {
    id: 'second-intifada',
    name: 'Second Intifada',
    coordinates: [31.9, 35.2], // West Bank
    countries: ['ISR', 'PSE'],
    intensity: 0.6,
    type: 'war',
    description: 'Palestinian uprising following the collapse of the Camp David talks (Jul 2000); suicide bombings, IDF incursions (Operation Defensive Shield), and the start of the West Bank separation barrier. Wound down after Arafat\'s 2004 death and the 2005 Sharm el-Sheikh summit.',
    startYear: 2000,
    endYear: 2005,
  },
  {
    id: 'afghanistan-war',
    name: 'Afghanistan War',
    coordinates: [34.5, 69.2], // Kabul
    countries: ['AFG', 'USA'],
    intensity: 0.85,
    type: 'war',
    description: 'US/NATO invasion (Oct 2001) toppled the Taliban after 9/11; a two-decade counter-insurgency followed. Ended with the chaotic US withdrawal and Taliban return to power in Aug 2021.',
    startYear: 2001,
    endYear: 2021,
  },
  {
    id: 'iraq-war',
    name: 'Iraq War',
    coordinates: [33.3, 44.4], // Baghdad
    countries: ['IRQ', 'USA'],
    intensity: 0.85,
    type: 'war',
    description: 'US-led invasion (Mar 2003) toppled Saddam Hussein, followed by a years-long Sunni-Shia insurgency and civil war. US combat troops formally withdrew in Dec 2011, though the security vacuum fed the later rise of ISIS.',
    startYear: 2003,
    endYear: 2011,
  },
  {
    id: 'lebanon-war-2006',
    name: '2006 Lebanon War',
    coordinates: [33.3, 35.5], // South Lebanon
    countries: ['ISR', 'LBN'],
    intensity: 0.55,
    type: 'war',
    description: 'A 34-day war (Jul-Aug 2006) triggered by a Hezbollah cross-border raid; heavy Israeli air campaign against Lebanon and Hezbollah rocket fire on northern Israel, ending with UNSC Resolution 1701 and a UN-monitored ceasefire.',
    startYear: 2006,
    endYear: 2006,
  },
  {
    id: 'russo-georgian-war',
    name: 'Russo-Georgian War',
    coordinates: [42.22, 43.97], // South Ossetia
    countries: ['GEO', 'RUS'],
    intensity: 0.55,
    type: 'war',
    description: 'Five-day war (Aug 2008) over South Ossetia; Russian forces routed the Georgian military and have occupied South Ossetia and Abkhazia (~20% of Georgian territory) ever since.',
    startYear: 2008,
    endYear: 2008,
  },
  {
    id: 'sri-lanka-civil-war-final',
    name: 'Sri Lankan Civil War (final phase)',
    coordinates: [9.27, 80.81], // Mullaitivu
    countries: ['LKA'],
    intensity: 0.75,
    type: 'war',
    description: 'The Tamil Tigers (LTTE) fought the Sri Lankan state since 1983; the final Eelam War IV offensive (2006-2009) crushed the LTTE\'s remaining territory, killing leader Prabhakaran and ending the war in May 2009 amid heavy civilian casualties.',
    startYear: 2006,
    endYear: 2009,
  },
  {
    id: 'libyan-revolution-2011',
    name: 'Libyan Revolution',
    coordinates: [32.9, 13.2], // Tripoli
    countries: ['LBY'],
    intensity: 0.7,
    type: 'war',
    description: 'Arab Spring uprising against Muammar Gaddafi (Feb 2011), backed by a NATO air campaign; ended with Gaddafi\'s capture and death in Oct 2011. The power vacuum led directly into the ongoing factional conflict.',
    startYear: 2011,
    endYear: 2011,
  },
  {
    id: 'south-sudan-civil-war',
    name: 'South Sudan Civil War',
    coordinates: [4.85, 31.6], // Juba
    countries: ['SSD'],
    intensity: 0.7,
    type: 'war',
    description: 'Civil war (Dec 2013) between forces loyal to President Kiir and former VP Machar, just two years after independence; ethnic massacres and famine followed. The 2018 Revitalized Peace Agreement led to a unity government in Feb 2020.',
    startYear: 2013,
    endYear: 2020,
  },
  {
    id: 'isis-caliphate-war',
    name: 'War Against the Islamic State',
    coordinates: [35.95, 39.0], // Raqqa
    countries: ['IRQ', 'SYR', 'USA'],
    intensity: 0.9,
    type: 'war',
    description: 'ISIS seized Mosul and swaths of Iraq and Syria in 2014, declaring a caliphate; a US-led international coalition and local partners (Iraqi forces, SDF) rolled back its territory, retaking Mosul (2017) and Raqqa (2017) and eliminating the last territorial pocket at Baghouz in Mar 2019.',
    startYear: 2014,
    endYear: 2019,
  },
  {
    id: 'syrian-civil-war',
    name: 'Syrian Civil War',
    coordinates: [35.0, 38.0], // central Syria
    countries: ['SYR'],
    intensity: 0.95,
    type: 'war',
    description: 'Assad\'s crackdown on 2011 Arab Spring protests spiraled into a multi-sided civil war involving ISIS, Kurdish forces, Turkey, Russia and Iran; one of the deadliest conflicts of the century (500,000+ deaths, 13M+ displaced). Ended when an HTS-led offensive toppled Assad in Dec 2024.',
    startYear: 2011,
    endYear: 2024,
  },
  {
    id: 'gaza-war-2014',
    name: '2014 Gaza War (Operation Protective Edge)',
    coordinates: [31.5, 34.47],
    countries: ['ISR', 'PSE'],
    intensity: 0.65,
    type: 'war',
    description: '50-day war (Jul-Aug 2014) triggered by the kidnapping/murder of three Israeli teens and a Hamas rocket campaign; Israeli ground and air operations killed roughly 2,100-2,200 Palestinians and 73 Israelis before an Egyptian-brokered ceasefire.',
    startYear: 2014,
    endYear: 2014,
  },
  {
    id: 'nagorno-karabakh-conflict',
    name: 'Nagorno-Karabakh Conflict',
    coordinates: [39.82, 46.75], // Stepanakert/Khankendi
    countries: ['ARM', 'AZE'],
    intensity: 0.65,
    type: 'war',
    description: 'The 44-Day War (Sept-Nov 2020) saw Azerbaijan retake most of the territory it lost in the 1990s war, aided by Turkish-supplied drones. A one-day Azerbaijani offensive in Sept 2023 seized the remaining enclave outright, triggering the exodus of virtually the entire ~100,000-strong ethnic Armenian population.',
    startYear: 2020,
    endYear: 2023,
  },
];
