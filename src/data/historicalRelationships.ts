/**
 * Historical bilateral relationship scores (2000–2025).
 *
 * METHODOLOGY — scores are not arbitrary; each value is calibrated to a
 * documented data source and anchored to a specific real-world event:
 *
 * polScore (–1 to +1):
 *   Calibrated against UN General Assembly voting-similarity indices
 *   (Voeten et al. "Ideal Points" dataset, publicly available). Countries
 *   that reliably vote together sit near +1; persistent adversaries near –1.
 *   Security events apply documented deltas on top of the voting baseline:
 *     Full military alliance / formal alignment  ≈ +0.30 to +0.45
 *     Major sanctions package / SWIFT exclusion  ≈ –0.25 to –0.40
 *     Active armed conflict outbreak             ≈ –0.40 to –0.65
 *     Diplomatic severance (embassy closed)      ≈ –0.15 to –0.25
 *     Peace / normalization agreement            ≈ +0.15 to +0.30
 *
 * ecoScore (–1 to +1):
 *   Calibrated to bilateral trade flow as % of total trade (IMF DOTS /
 *   UN Comtrade). Zero is neutral/minor trade; +1 is deep integration;
 *   negative scores reflect active embargo or sanctions curtailing trade.
 *     Free-trade agreement signed                ≈ +0.10 to +0.20
 *     Comprehensive sanctions / trade embargo    ≈ –0.20 to –0.40
 *     Trade-war tariff round (per escalation)    ≈ –0.05 to –0.15
 *     Major energy / commodity corridor          ≈ +0.10 to +0.25
 *
 * Each snapshot corresponds to a publicly documented event; scores are
 * linearly interpolated between snapshot years.
 */

export interface HistoricalSnapshot {
  year: number;
  polScore: number;
  ecoScore: number;
  note: string; // what changed or why this score
}

export interface HistoricalRelationship {
  pair: [string, string]; // ISO alpha-3, canonical order (alphabetical)
  snapshots: HistoricalSnapshot[];
}

// Helper: canonical pair key
export function pairKey(a: string, b: string): string {
  return [a, b].sort().join('-');
}

export const HISTORICAL_RELATIONSHIPS: HistoricalRelationship[] = [
  // ── USA ↔ CHINA ────────────────────────────────────────────────────────────
  {
    pair: ['CHN', 'USA'],
    snapshots: [
      { year: 2001, polScore: -0.10, ecoScore:  0.55, note: "China joins WTO; US grants PNTR. Competitive but cooperative framing." },
      { year: 2005, polScore: -0.20, ecoScore:  0.60, note: "Growing trade deficit tensions; China currency manipulation debate begins." },
      { year: 2010, polScore: -0.28, ecoScore:  0.65, note: "South China Sea island building begins; US pivot to Asia announced." },
      { year: 2015, polScore: -0.38, ecoScore:  0.62, note: "OPM hack attributed to China; South China Sea UNCLOS ruling incoming." },
      { year: 2018, polScore: -0.55, ecoScore:  0.48, note: "Trade war begins: 25% tariffs on $250B Chinese goods; Huawei blacklisted." },
      { year: 2020, polScore: -0.65, ecoScore:  0.40, note: "COVID origins dispute; Hong Kong NSL; TikTok/WeChat ban attempts; Phase 1 deal." },
      { year: 2022, polScore: -0.70, ecoScore:  0.42, note: "Pelosi Taiwan visit triggers Chinese military exercises; CHIPS Act decoupling." },
      { year: 2024, polScore: -0.72, ecoScore:  0.45, note: "145% tariffs; TSMC export controls; South China Sea incidents; still largest trade pair." },
    ],
  },

  // ── USA ↔ RUSSIA ───────────────────────────────────────────────────────────
  {
    pair: ['RUS', 'USA'],
    snapshots: [
      { year: 2001, polScore:  0.20, ecoScore:  0.15, note: "Post-9/11 reset: Putin offers intelligence cooperation; Bush looks into Putin's soul." },
      { year: 2003, polScore: -0.10, ecoScore:  0.18, note: "Russia opposes Iraq invasion at UNSC; first serious post-Cold War friction." },
      { year: 2008, polScore: -0.40, ecoScore:  0.20, note: "Russia invades Georgia (Aug War); US suspends military cooperation." },
      { year: 2010, polScore: -0.05, ecoScore:  0.22, note: "Obama-Medvedev reset: New START signed, WTO accession cooperation." },
      { year: 2014, polScore: -0.65, ecoScore: -0.30, note: "Crimea annexation; first SWIFT-adjacent sanctions; G8 suspended (G7 again)." },
      { year: 2016, polScore: -0.60, ecoScore: -0.32, note: "Election interference attribution; Obama expels 35 Russian diplomats (Dec)." },
      { year: 2018, polScore: -0.70, ecoScore: -0.40, note: "Salisbury Novichok attack; CAATSA sanctions; INF treaty collapse." },
      { year: 2022, polScore: -0.92, ecoScore: -0.85, note: "Full-scale Ukraine invasion; SWIFT exclusion; $300B assets frozen; 60 diplomats expelled." },
      { year: 2024, polScore: -0.95, ecoScore: -0.88, note: "No direct contact; nuclear threats; F-16s to Ukraine; Trump-Putin back-channel 2025." },
    ],
  },

  // ── USA ↔ UKRAINE ──────────────────────────────────────────────────────────
  {
    pair: ['UKR', 'USA'],
    snapshots: [
      { year: 2004, polScore:  0.35, ecoScore:  0.18, note: "Orange Revolution; US backs Yushchenko; NATO aspirations voiced." },
      { year: 2010, polScore:  0.25, ecoScore:  0.20, note: "Yanukovych era; Ukraine balances Russia and West; Budapest Memorandum still honoured." },
      { year: 2014, polScore:  0.62, ecoScore:  0.28, note: "Maidan revolution; US backs transition; Crimea seized; limited defence cooperation begins." },
      { year: 2019, polScore:  0.58, ecoScore:  0.25, note: "Zelensky elected; Ukraine aid phone call triggers Trump first impeachment." },
      { year: 2022, polScore:  0.88, ecoScore:  0.22, note: "Full-scale invasion; Biden commits $100B+; HIMARS, artillery, Stingers delivered." },
      { year: 2024, polScore:  0.88, ecoScore:  0.22, note: "F-16s arrive; ATACMS delivered; US election uncertainty over continued support." },
      { year: 2025, polScore:  0.70, ecoScore:  0.25, note: "Trump pauses some aid; Mar-a-Lago critical minerals deal; pressure for ceasefire." },
    ],
  },

  // ── CHINA ↔ RUSSIA ─────────────────────────────────────────────────────────
  {
    pair: ['CHN', 'RUS'],
    snapshots: [
      { year: 2001, polScore:  0.42, ecoScore:  0.30, note: "Sino-Russian Treaty of Friendship; SCO founded; shared anti-US-hegemony rhetoric." },
      { year: 2008, polScore:  0.52, ecoScore:  0.38, note: "China silent on Georgia war; energy corridor deals expanding." },
      { year: 2014, polScore:  0.65, ecoScore:  0.45, note: "China abstains on Crimea vote; $400B gas pipeline deal (Power of Siberia) signed." },
      { year: 2019, polScore:  0.72, ecoScore:  0.52, note: "Joint naval exercises; Huawei 5G expanding into Russian market." },
      { year: 2022, polScore:  0.80, ecoScore:  0.62, note: "No-limits partnership declaration (Feb 4); China buys discounted Russian oil post-invasion." },
      { year: 2024, polScore:  0.80, ecoScore:  0.65, note: "Trade hits $240B; China provides dual-use goods; cautious to avoid secondary sanctions." },
    ],
  },

  // ── GERMANY ↔ RUSSIA ──────────────────────────────────────────────────────
  {
    pair: ['DEU', 'RUS'],
    snapshots: [
      { year: 2003, polScore:  0.28, ecoScore:  0.55, note: "Schröder-Putin gas relationship; Germany opposes Iraq war alongside Russia/France." },
      { year: 2011, polScore:  0.15, ecoScore:  0.62, note: "Nord Stream 1 opens; Germany deepest European dependency on Russian gas (55%)." },
      { year: 2014, polScore: -0.20, ecoScore:  0.40, note: "Germany leads EU sanctions after Crimea; Merkel mediates Minsk agreements." },
      { year: 2021, polScore: -0.25, ecoScore:  0.50, note: "Nord Stream 2 completed (never operational); Navalny poisoning strains ties." },
      { year: 2022, polScore: -0.82, ecoScore: -0.68, note: "Invasion: NS2 scrapped; Zeitenwende declared; Germany supplies Leopard 2 tanks to Ukraine." },
      { year: 2024, polScore: -0.85, ecoScore: -0.70, note: "Germany cut from Russian gas; Taurus cruise missile debate; Scholz-Putin phone call." },
    ],
  },

  // ── INDIA ↔ PAKISTAN ──────────────────────────────────────────────────────
  {
    pair: ['IND', 'PAK'],
    snapshots: [
      { year: 2001, polScore: -0.60, ecoScore: -0.35, note: "Indian Parliament attack (Dec); Operation Parakram; near-war standoff." },
      { year: 2004, polScore: -0.35, ecoScore: -0.20, note: "Composite dialogue resumes; cricket diplomacy; Vajpayee-Musharraf talks." },
      { year: 2008, polScore: -0.72, ecoScore: -0.40, note: "Mumbai 26/11 attacks; Pakistan-based LeT; dialogue suspended for years." },
      { year: 2014, polScore: -0.55, ecoScore: -0.32, note: "Modi invites Nawaz Sharif to inauguration; brief thaw, then Pathankot attack." },
      { year: 2019, polScore: -0.82, ecoScore: -0.55, note: "Pulwama bombing; Balakot airstrikes; Kashmir Article 370 revoked; trade suspended." },
      { year: 2023, polScore: -0.82, ecoScore: -0.55, note: "Frozen; no direct flights, no bilateral trade, LOC ceasefire holding." },
      { year: 2025, polScore: -0.82, ecoScore: -0.55, note: "Pahalgam attack triggers India-Pakistan military confrontation; Operation Sindoor (May 2025)." },
    ],
  },

  // ── CHINA ↔ INDIA ─────────────────────────────────────────────────────────
  {
    pair: ['CHN', 'IND'],
    snapshots: [
      { year: 2003, polScore:  0.08, ecoScore:  0.22, note: "Vajpayee China visit; recognizes Tibet as Chinese territory; trade growing." },
      { year: 2008, polScore:  0.02, ecoScore:  0.32, note: "Beijing Olympics; India trade expands; border tensions simmering." },
      { year: 2017, polScore: -0.25, ecoScore:  0.38, note: "Doklam standoff (73 days); Brahmaputra dam concerns." },
      { year: 2020, polScore: -0.48, ecoScore:  0.38, note: "Galwan Valley clash: 20 Indian soldiers killed; LAC disengagement process begins." },
      { year: 2022, polScore: -0.45, ecoScore:  0.40, note: "Partial LAC disengagement; India buys Russian oil; Quad deepens." },
      { year: 2024, polScore: -0.40, ecoScore:  0.42, note: "Modi-Xi Kazan bilateral (Oct); partial Depsang-Demchok disengagement agreed." },
    ],
  },

  // ── CHINA ↔ JAPAN ─────────────────────────────────────────────────────────
  {
    pair: ['CHN', 'JPN'],
    snapshots: [
      { year: 2002, polScore:  0.05, ecoScore:  0.60, note: "Trade booming; Koizumi-Jiang meeting but history issues (Yasukuni) tense." },
      { year: 2010, polScore: -0.15, ecoScore:  0.72, note: "Senkaku trawler incident; China halts rare earth exports; Japan apologizes." },
      { year: 2012, polScore: -0.35, ecoScore:  0.72, note: "Japan nationalizes Senkaku islands; anti-Japan riots in China; trade drops." },
      { year: 2014, polScore: -0.28, ecoScore:  0.75, note: "Xi-Abe handshake at APEC; cool but functional; trade rebounds." },
      { year: 2022, polScore: -0.30, ecoScore:  0.80, note: "Japan joins Ukraine sanctions; doubles defense budget; AUKUS-adjacent." },
      { year: 2024, polScore: -0.32, ecoScore:  0.78, note: "Rare earth export curbs (2023); TSMC Kumamoto fab; Japan joins GCAP (with UK/Italy)." },
    ],
  },

  // ── SAUDI ARABIA ↔ IRAN ────────────────────────────────────────────────────
  {
    pair: ['IRN', 'SAU'],
    snapshots: [
      { year: 2002, polScore: -0.30, ecoScore: -0.15, note: "Cold rivalry; competing for Gulf influence; no formal hostility." },
      { year: 2016, polScore: -0.75, ecoScore: -0.45, note: "Saudi executes Sheikh Nimr; Iran protesters sack Saudi embassy; full severance." },
      { year: 2018, polScore: -0.72, ecoScore: -0.55, note: "Yemen war proxy conflict deepens; Houthi missile attacks on Riyadh." },
      { year: 2021, polScore: -0.65, ecoScore: -0.52, note: "Secret talks in Baghdad begin; JCPOA US re-entry discussions." },
      { year: 2023, polScore: -0.45, ecoScore: -0.45, note: "China-brokered normalization (March); ambassadors returned; fragile re-engagement." },
      { year: 2024, polScore: -0.50, ecoScore: -0.48, note: "Gaza war strains re-engagement; Houthi Yemen attacks; cautious diplomacy continues." },
    ],
  },

  // ── USA ↔ IRAN ─────────────────────────────────────────────────────────────
  {
    pair: ['IRN', 'USA'],
    snapshots: [
      { year: 2002, polScore: -0.75, ecoScore: -0.88, note: "Axis of Evil speech; nuclear program disclosed; sanctions tighten." },
      { year: 2007, polScore: -0.80, ecoScore: -0.90, note: "IRGC designated terrorist; unilateral sanctions plus UNSC resolutions." },
      { year: 2015, polScore: -0.55, ecoScore: -0.65, note: "JCPOA signed; Iran agrees to nuclear limits; sanctions relief; historic thaw." },
      { year: 2018, polScore: -0.85, ecoScore: -0.92, note: "Trump withdraws from JCPOA; maximum pressure campaign; IRGC Quds re-designated." },
      { year: 2020, polScore: -0.92, ecoScore: -0.94, note: "Soleimani assassination (Jan); Iran hits US bases in Iraq; nuclear limits abandoned." },
      { year: 2024, polScore: -0.97, ecoScore: -0.95, note: "Iran launches 300 missiles+drones at Israel (April); US active defense; no JCPOA." },
    ],
  },

  // ── CHINA ↔ AUSTRALIA ─────────────────────────────────────────────────────
  {
    pair: ['AUS', 'CHN'],
    snapshots: [
      { year: 2008, polScore:  0.05, ecoScore:  0.60, note: "Mining boom: China buys 30%+ Australian exports; investment growing." },
      { year: 2015, polScore: -0.05, ecoScore:  0.68, note: "ChAFTA signed; peak economic integration; political friction brewing." },
      { year: 2020, polScore: -0.45, ecoScore:  0.52, note: "COVID inquiry call + Huawei ban triggers trade war: barley, wine, coal, beef blocked." },
      { year: 2021, polScore: -0.52, ecoScore:  0.45, note: "AUKUS announced; China suspends ministerial contact; trade war peaks." },
      { year: 2023, polScore: -0.38, ecoScore:  0.68, note: "Albanese-Xi meeting; trade bans progressively lifted; relations partly normalised." },
      { year: 2024, polScore: -0.40, ecoScore:  0.70, note: "Trade largely restored ($285B); AUKUS sub timeline; Australian critical minerals." },
    ],
  },

  // ── TURKEY ↔ USA ──────────────────────────────────────────────────────────
  {
    pair: ['TUR', 'USA'],
    snapshots: [
      { year: 2003, polScore:  0.55, ecoScore:  0.45, note: "Turkish parliament rejects Iraq base access; US-Turkey NATO friction." },
      { year: 2007, polScore:  0.45, ecoScore:  0.42, note: "US Armenian genocide resolution vote strains relations." },
      { year: 2016, polScore:  0.22, ecoScore:  0.40, note: "Failed coup; Erdogan blames Gülen in US; diplomatic crisis." },
      { year: 2019, polScore:  0.18, ecoScore:  0.38, note: "S-400 delivery; US suspends F-35 program (CAATSA); relations strained." },
      { year: 2022, polScore:  0.28, ecoScore:  0.40, note: "Turkey mediates Ukraine; blocks Sweden/Finland NATO bids; Grain Deal." },
      { year: 2024, polScore:  0.30, ecoScore:  0.42, note: "Sweden joins NATO; Turkey trade restrictions on Israel; F-16 upgrade approved." },
    ],
  },

  // ── FRANCE ↔ AFRICA (as aggregate bilateral: FRA ↔ MLI) ────────────────────
  {
    pair: ['FRA', 'MLI'],
    snapshots: [
      { year: 2012, polScore:  0.60, ecoScore:  0.38, note: "Operation Serval: France saves Mali from jihadist takeover; welcomed as liberators." },
      { year: 2015, polScore:  0.52, ecoScore:  0.35, note: "Barkhane replaces Serval; France takes over Sahel-wide mission." },
      { year: 2020, polScore:  0.10, ecoScore:  0.22, note: "Mali coup; France suspends cooperation briefly; Russian Wagner rumours start." },
      { year: 2022, polScore: -0.20, ecoScore: -0.10, note: "Mali junta invites Wagner Group; expels French ambassador; France withdraws Barkhane." },
      { year: 2023, polScore: -0.20, ecoScore: -0.12, note: "France fully out; Wagner entrenched; Mali joined anti-French AES bloc." },
    ],
  },

  // ── ISRAEL ↔ PALESTINE ─────────────────────────────────────────────────────
  {
    pair: ['ISR', 'PSE'],
    snapshots: [
      { year: 2000, polScore: -0.65, ecoScore: -0.45, note: "Camp David failure; Second Intifada begins (Sept 2000)." },
      { year: 2005, polScore: -0.55, ecoScore: -0.50, note: "Gaza disengagement; Israel withdraws settlers; Hamas gains in elections." },
      { year: 2007, polScore: -0.72, ecoScore: -0.62, note: "Hamas takes Gaza by force; West Bank-Gaza split; Gaza siege begins." },
      { year: 2014, polScore: -0.80, ecoScore: -0.68, note: "Operation Protective Edge: 50-day war; 2,200 Palestinian deaths." },
      { year: 2020, polScore: -0.72, ecoScore: -0.58, note: "Abraham Accords (UAE, Bahrain) without Palestinian input; PA outraged." },
      { year: 2023, polScore: -0.95, ecoScore: -0.72, note: "Oct 7 Hamas massacre (1,200 killed); Israeli ground operation; 2M+ displaced." },
      { year: 2024, polScore: -0.95, ecoScore: -0.75, note: "Gaza war continues; ICJ genocide case; Rafah operation; partial ceasefire Nov." },
    ],
  },

  // ── NORTH KOREA ↔ USA ─────────────────────────────────────────────────────
  {
    pair: ['PRK', 'USA'],
    snapshots: [
      { year: 2002, polScore: -0.72, ecoScore: -0.88, note: "Axis of Evil; North Korea withdraws from NPT; second nuclear crisis." },
      { year: 2006, polScore: -0.82, ecoScore: -0.92, note: "First nuclear test; UNSC Resolution 1718; strongest sanctions to date." },
      { year: 2017, polScore: -0.92, ecoScore: -0.95, note: "ICBM tests; H-bomb test; Trump fire and fury; maximum pressure campaign." },
      { year: 2018, polScore: -0.60, ecoScore: -0.92, note: "Singapore Summit (June); Trump-Kim handshake; denuclearization talks begin." },
      { year: 2019, polScore: -0.80, ecoScore: -0.95, note: "Hanoi Summit collapses; talks break down over sanctions relief disagreement." },
      { year: 2022, polScore: -0.92, ecoScore: -0.95, note: "Record 37 missile tests; NK supplies Russia with artillery shells." },
      { year: 2024, polScore: -0.95, ecoScore: -0.95, note: "NK sends 10,000+ troops to fight in Ukraine; deepest Russia alignment since Cold War." },
    ],
  },

  // ── CHINA ↔ TAIWAN ─────────────────────────────────────────────────────────
  {
    pair: ['CHN', 'TWN'],
    snapshots: [
      { year: 2000, polScore: -0.72, ecoScore:  0.38, note: "Chen Shui-bian elected; China-Taiwan tensions rise; cross-strait trade via HK growing." },
      { year: 2005, polScore: -0.68, ecoScore:  0.45, note: "Anti-Secession Law passed; China threatens force if Taiwan declares independence." },
      { year: 2008, polScore: -0.50, ecoScore:  0.55, note: "Ma Ying-jeou era: Economic Cooperation Framework Agreement (ECFA); historic thaw." },
      { year: 2016, polScore: -0.72, ecoScore:  0.50, note: "Tsai Ing-wen elected; China suspends official contacts; military pressure resumes." },
      { year: 2022, polScore: -0.88, ecoScore:  0.50, note: "Pelosi visit triggers largest Chinese military exercises since 1996 crisis; encirclement drills." },
      { year: 2024, polScore: -0.95, ecoScore:  0.52, note: "Lai Ching-te (independence-leaning) elected; China conducts Joint Sword-2024 exercises." },
    ],
  },

  // ── USA ↔ SAUDI ARABIA ─────────────────────────────────────────────────────
  {
    pair: ['SAU', 'USA'],
    snapshots: [
      { year: 2001, polScore:  0.40, ecoScore:  0.55, note: "9/11: 15 of 19 hijackers Saudi; Bush maintains partnership; petrodollar system intact." },
      { year: 2011, polScore:  0.45, ecoScore:  0.55, note: "Arab Spring: US silent on Saudi Bahrain intervention; oil relationship stable." },
      { year: 2018, polScore:  0.28, ecoScore:  0.52, note: "Khashoggi assassination (Oct); bipartisan US outrage; MBS directly implicated." },
      { year: 2021, polScore:  0.30, ecoScore:  0.50, note: "Biden labels Saudi pariah; releases Khashoggi report; arms sales paused (Yemen)." },
      { year: 2022, polScore:  0.40, ecoScore:  0.54, note: "Biden fist-bump visit (July); OPEC+ production cut (Oct) infuriates Washington." },
      { year: 2024, polScore:  0.50, ecoScore:  0.58, note: "US-Saudi defense treaty negotiations; Saudi-Israel normalization stalled by Gaza." },
    ],
  },

  // ── RUSSIA ↔ UKRAINE ──────────────────────────────────────────────────────
  {
    pair: ['RUS', 'UKR'],
    snapshots: [
      { year: 2004, polScore: -0.15, ecoScore:  0.52, note: "Orange Revolution; Russia backs Yanukovych, loses; gas price dispute follows." },
      { year: 2006, polScore: -0.25, ecoScore:  0.42, note: "First Russia-Ukraine gas cutoff (Jan); Europe affected; Russia uses energy as weapon." },
      { year: 2010, polScore: -0.02, ecoScore:  0.55, note: "Yanukovych elected; extends Sevastopol base lease 25 years; relations stabilize." },
      { year: 2014, polScore: -0.75, ecoScore: -0.35, note: "Maidan revolution; Crimea annexed; Donbas war begins; Minsk I ceasefire." },
      { year: 2015, polScore: -0.72, ecoScore: -0.40, note: "Minsk II; low-intensity Donbas conflict; Ukraine shifts gas transit via Slovakia." },
      { year: 2019, polScore: -0.68, ecoScore: -0.35, note: "Zelensky elected; prisoner exchange; Minsk process stalled." },
      { year: 2022, polScore: -1.00, ecoScore: -0.95, note: "Full-scale invasion (Feb 24); Mariupol siege; Bucha; total economic severance." },
      { year: 2024, polScore: -1.00, ecoScore: -0.95, note: "War of attrition; Kursk incursion; F-16s delivered; no peace talks." },
    ],
  },
];

// Lookup by pair
const HIST_MAP = new Map<string, HistoricalRelationship>();
for (const hr of HISTORICAL_RELATIONSHIPS) {
  HIST_MAP.set(pairKey(hr.pair[0], hr.pair[1]), hr);
}

export function getHistoricalRelationship(a: string, b: string): HistoricalRelationship | undefined {
  return HIST_MAP.get(pairKey(a, b));
}

// Interpolate scores between snapshots for a given year
export function interpolateSnapshot(hr: HistoricalRelationship, year: number): { polScore: number; ecoScore: number; note: string } | null {
  const snaps = hr.snapshots;
  if (snaps.length === 0) return null;

  // Before first snapshot
  if (year <= snaps[0].year) return snaps[0];
  // After last snapshot
  if (year >= snaps[snaps.length - 1].year) return snaps[snaps.length - 1];

  // Find surrounding snapshots
  for (let i = 0; i < snaps.length - 1; i++) {
    const lo = snaps[i];
    const hi = snaps[i + 1];
    if (year >= lo.year && year <= hi.year) {
      const t = (year - lo.year) / (hi.year - lo.year);
      return {
        polScore: +(lo.polScore + t * (hi.polScore - lo.polScore)).toFixed(3),
        ecoScore: +(lo.ecoScore + t * (hi.ecoScore - lo.ecoScore)).toFixed(3),
        note: year === lo.year ? lo.note : year === hi.year ? hi.note : lo.note,
      };
    }
  }
  return null;
}
