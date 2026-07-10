import type { Relationship } from '../types';

// ── Bloc memberships (exported for profile display) ────────────────────────
export const NATO      = new Set(['USA','CAN','GBR','FRA','DEU','ITA','ESP','NLD','BEL','LUX','NOR','DNK','ISL','PRT','TUR','GRC','POL','HUN','CZE','SVK','EST','LVA','LTU','ROU','BGR','HRV','ALB','MKD','MNE','SVN','FIN','SWE']);
export const EU        = new Set(['DEU','FRA','ITA','ESP','NLD','BEL','LUX','AUT','FIN','SWE','IRL','PRT','GRC','CYP','MLT','EST','LVA','LTU','POL','CZE','SVK','HUN','SVN','HRV','BGR','ROU','DNK']);
export const FIVE_EYES = new Set(['USA','GBR','CAN','AUS','NZL']);
export const AUKUS     = new Set(['USA','GBR','AUS']);
export const QUAD      = new Set(['USA','JPN','IND','AUS']);
export const G7        = new Set(['USA','GBR','FRA','DEU','ITA','JPN','CAN']);
export const CSTO      = new Set(['RUS','BLR','KAZ','KGZ','TJK']); // Armenia left 2024
export const SCO       = new Set(['CHN','RUS','IND','PAK','KAZ','KGZ','TJK','UZB','IRN','BLR']); // full members 2024
export const BRICS     = new Set(['BRA','RUS','IND','CHN','ZAF','SAU','ARE','EGY','ETH','IRN']); // expanded 2024
export const GCC       = new Set(['SAU','ARE','QAT','KWT','BHR','OMN']);
export const ASEAN     = new Set(['IDN','MYS','PHL','SGP','THA','BRN','VNM','LAO','MMR','KHM']);
export const MERCOSUR  = new Set(['BRA','ARG','URY','PRY']);
export const ARAB_LEAGUE = new Set(['EGY','IRQ','JOR','LBN','SAU','SYR','YEM','LBY','SDN','MAR','TUN','KWT','DZA','BHR','QAT','ARE','OMN','MRT','SOM','DJI','COM','PSE']);
export const AU        = new Set(['DZA','AGO','BEN','BWA','BFA','BDI','CMR','CPV','CAF','TCD','COM','COD','COG','CIV','DJI','EGY','GNQ','ERI','SWZ','ETH','GAB','GMB','GHA','GIN','GNB','KEN','LSO','LBR','LBY','MDG','MWI','MLI','MRT','MUS','MAR','MOZ','NAM','NER','NGA','RWA','STP','SEN','SLE','SOM','ZAF','SSD','SDN','TZA','TGO','TUN','UGA','ZMB','ZWE']);

export const BLOCS: Record<string, { name: string; members: Set<string> }> = {
  NATO:       { name: 'NATO',              members: NATO },
  EU:         { name: 'European Union',    members: EU },
  FIVE_EYES:  { name: 'Five Eyes',         members: FIVE_EYES },
  AUKUS:      { name: 'AUKUS',             members: AUKUS },
  QUAD:       { name: 'Quad',              members: QUAD },
  G7:         { name: 'G7',               members: G7 },
  CSTO:       { name: 'CSTO',             members: CSTO },
  SCO:        { name: 'SCO',              members: SCO },
  BRICS:      { name: 'BRICS+',           members: BRICS },
  GCC:        { name: 'GCC',              members: GCC },
  ASEAN:      { name: 'ASEAN',            members: ASEAN },
  MERCOSUR:   { name: 'MERCOSUR',         members: MERCOSUR },
  ARAB_LEAGUE:{ name: 'Arab League',       members: ARAB_LEAGUE },
  AU:         { name: 'African Union',     members: AU },
};

export function getBlocMemberships(iso3: string): string[] {
  return Object.entries(BLOCS)
    .filter(([, b]) => b.members.has(iso3))
    .map(([, b]) => b.name);
}

function blocScore(a: string, b: string): { polScore: number; ecoScore: number; polNotes: string; ecoNotes: string } | null {
  const aukus  = AUKUS.has(a) && AUKUS.has(b);
  const fe     = FIVE_EYES.has(a) && FIVE_EYES.has(b);
  const quad   = QUAD.has(a) && QUAD.has(b);
  const g7     = G7.has(a) && G7.has(b);
  const natoeu = NATO.has(a) && NATO.has(b) && EU.has(a) && EU.has(b);
  const nato   = NATO.has(a) && NATO.has(b);
  const eu     = EU.has(a) && EU.has(b);
  const csto   = CSTO.has(a) && CSTO.has(b);
  const sco    = SCO.has(a) && SCO.has(b);
  const brics  = BRICS.has(a) && BRICS.has(b);
  const gcc    = GCC.has(a) && GCC.has(b);
  const asean  = ASEAN.has(a) && ASEAN.has(b);
  const merc   = MERCOSUR.has(a) && MERCOSUR.has(b);
  const arab   = ARAB_LEAGUE.has(a) && ARAB_LEAGUE.has(b);
  const auau   = AU.has(a) && AU.has(b);

  if (aukus)  return { polScore: 0.90, ecoScore: 0.65, polNotes: 'AUKUS defense and technology pact — nuclear submarine sharing, intelligence integration', ecoNotes: 'Defense industrial cooperation; US/UK nuclear tech transfer to Australia; submarine contracts' };
  if (fe)     return { polScore: 0.88, ecoScore: 0.62, polNotes: 'Five Eyes signals intelligence alliance — deepest multilateral intelligence sharing arrangement', ecoNotes: 'Classified infrastructure coordination; defense procurement alignment; trusted tech supply chains' };
  if (quad)   return { polScore: 0.72, ecoScore: 0.55, polNotes: 'Quad security partnership — Indo-Pacific strategy vs Chinese influence', ecoNotes: 'Semiconductor supply chain coordination; infrastructure investment alternatives to BRI' };
  if (g7 && natoeu) return { polScore: 0.85, ecoScore: 0.80, polNotes: 'G7, NATO and EU partners — deep security and democratic alignment', ecoNotes: 'Highly integrated trade and investment within G7+NATO+EU framework; shared regulatory standards' };
  if (g7 && nato)   return { polScore: 0.82, ecoScore: 0.72, polNotes: 'G7 and NATO allies — shared democratic values and collective defense', ecoNotes: 'G7 trade integration; coordinated sanctions regimes; defense industrial cooperation' };
  if (g7)           return { polScore: 0.78, ecoScore: 0.68, polNotes: 'G7 major democracies — coordinated foreign policy and democratic governance', ecoNotes: 'G7 economic coordination; joint sanctions; WTO-aligned trade frameworks' };
  if (natoeu) return { polScore: 0.80, ecoScore: 0.72, polNotes: 'NATO and EU partners — collective defense plus EU treaty obligations', ecoNotes: 'EU single market integration; NATO defense spending coordination; interoperable industrial base' };
  if (nato)   return { polScore: 0.74, ecoScore: 0.50, polNotes: 'NATO allies — Article 5 collective defense commitment', ecoNotes: 'Defense procurement coordination; some trade ties but no unified economic framework' };
  if (eu)     return { polScore: 0.62, ecoScore: 0.72, polNotes: 'European Union partners — EU treaty obligations and political integration', ecoNotes: 'EU single market (free movement of goods, services, capital, people); common external tariff' };
  if (csto)   return { polScore: 0.70, ecoScore: 0.45, polNotes: 'CSTO collective security allies — Russia-led military alliance', ecoNotes: 'Limited economic integration; Russian energy dominance; Eurasian Economic Union overlap' };
  if (sco)    return { polScore: 0.52, ecoScore: 0.48, polNotes: 'Shanghai Cooperation Organisation — China+Russia-led security bloc', ecoNotes: 'SCO trade facilitation; Chinese BRI investment across member states; RMB trade settlement push' };
  if (brics)  return { polScore: 0.42, ecoScore: 0.52, polNotes: 'BRICS+ — coalition for multipolar world order; anti-Western hegemony bloc', ecoNotes: 'BRICS New Development Bank; de-dollarization push; emerging market trade growth' };
  if (gcc)    return { polScore: 0.65, ecoScore: 0.60, polNotes: 'Gulf Cooperation Council — Gulf Arab political and security coordination', ecoNotes: 'GCC common market; joint oil production policy via OPEC+; shared currency peg to USD' };
  if (asean)  return { polScore: 0.45, ecoScore: 0.50, polNotes: 'ASEAN partners — regional security dialogue; ASEAN centrality principle', ecoNotes: 'ASEAN free trade area; RCEP signatories; significant intra-ASEAN manufacturing supply chains' };
  if (merc)   return { polScore: 0.50, ecoScore: 0.58, polNotes: 'MERCOSUR — South American regional integration bloc', ecoNotes: 'MERCOSUR customs union; free internal trade; EU-MERCOSUR deal (in progress); shared tariff wall' };
  if (arab)   return { polScore: 0.35, ecoScore: 0.35, polNotes: 'Arab League member states — pan-Arab political coordination; wide ideological variation', ecoNotes: 'Arab Free Trade Area (GAFTA); remittance flows; pan-Arab investment; significant intra-Arab disputes' };
  if (auau)   return { polScore: 0.30, ecoScore: 0.28, polNotes: 'African Union member states — pan-African political institution; peacekeeping mandates', ecoNotes: 'AfCFTA continental free trade area (2021); limited intra-Africa trade (15%); infrastructure gap' };
  return null;
}

const rel = (source: string, target: string, pol: number, eco: number, trade: number, polNotes: string, ecoNotes = polNotes): Relationship => {
  const score = +(pol * 0.55 + eco * 0.45).toFixed(3);
  const type  = score >= 0.7 ? 'allied' : score >= 0.3 ? 'friendly' : score >= -0.1 ? 'neutral' : score >= -0.5 ? 'tense' : 'hostile';
  return { source, target, polScore: pol, ecoScore: eco, score, type, trade, polNotes, ecoNotes };
};

export const RELATIONSHIPS: Relationship[] = [
  // ── USA ─────────────────────────────────────────────────────────────────
  rel('USA','GBR', 0.95, 0.75, 280,  "Special Relationship — Five Eyes, AUKUS, NATO; deepest intelligence+military alliance across all administrations",
                                      "$280B trade; mutual investment in finance, pharma+tech; post-Brexit US-UK trade deal talks ongoing"),
  rel('USA','CAN', 0.72, 0.92, 800,  "Trump threatened 51st state annexation with 25% tariff coercion — Five Eyes, NORAD; world's longest undefended border",
                                      "USMCA binds $800B trade — most integrated bilateral economy; auto+energy+agriculture supply chains tightly interlocked"),
  rel('USA','AUS', 0.90, 0.62, 55,   "AUKUS nuclear submarine deal, Five Eyes, Quad — deepest post-WWII strategic alignment in Asia-Pacific",
                                      "$55B trade; Australian minerals (lithium, iron ore) critical to US supply chain; US defense exports under AUKUS"),
  rel('USA','JPN', 0.90, 0.75, 230,  "Mutual Cooperation and Security Treaty — 54,000 US troops stationed; Quad partnership; cornerstone of Indo-Pacific security",
                                      "$230B trade; Japan top holder of US Treasuries ($1.1T); Japanese auto+manufacturing investment in US; IRA friction"),
  rel('USA','DEU', 0.80, 0.72, 240,  "NATO allies, 36,000 US troops in Germany — friction over defense spending history and Nord Stream pipeline policy",
                                      "$240B trade; German autos dominant (BMW, Mercedes, VW US factories); IRA subsidy disputes; semiconductor+pharma trade"),
  rel('USA','FRA', 0.75, 0.65, 100,  "NATO allies — AUKUS blindsided France ($65B submarine contract voided 2021); relationship repaired but trust strained",
                                      "$100B trade; French luxury exports (Airbus, LVMH, Moët); US Big Tech vs France digital services tax disputes"),
  rel('USA','KOR', 0.88, 0.75, 200,  "Mutual Defense Treaty, 28,500 US troops; Camp David trilateral (US-JPN-KOR) 2023; North Korea deterrence anchor",
                                      "$200B trade; Samsung+LG+Hyundai US factories; EV battery IRA subsidies; Korean chipmakers hit by US export controls"),
  rel('USA','ISR', 0.88, 0.42, 50,   "$3.8B annual military aid, F-35s, Iron Dome co-development; AIPAC political clout; Gaza war strained some ties",
                                      "$50B trade; Israeli cybersecurity+startup ecosystem deeply integrated with Silicon Valley; US pharma+biotech investment"),
  rel('USA','POL', 0.90, 0.48, 25,   "Key NATO frontline ally — 4% GDP defense spend (highest in alliance); permanent US armored brigade; Patriot+HIMARS+F-35 procurement",
                                      "$25B trade; US FDI (Google, Microsoft, Amazon data centers); Poland is major US defense export customer (Abrams, Apaches, F-35s)"),
  rel('USA','UKR', 0.88, 0.22, 8,    "Largest military backer — HIMARS, Abrams tanks, F-16 training, $100B+ since 2022; Trump paused+reconsidered aid 2025",
                                      "Minimal pre-war trade; US leading IMF/multilateral financial support; Trump-Zelensky critical minerals deal (Mar-a-Lago 2025)"),
  rel('USA','NZL', 0.82, 0.42, 10,   "Five Eyes, ANZUS treaty (suspended 1986 over nuclear ship ban); intelligence cooperation continues strongly",
                                      "$10B trade; NZ exports dairy+meat+wine; US exports machinery+aircraft; NZ cautious about US-China crossfire"),
  rel('USA','SGP', 0.68, 0.65, 55,   "Changi Naval access (US destroyers+P-8 aircraft); anchors US Southeast Asia presence; semiconductor security partnership",
                                      "$55B trade; Singapore is major US financial hub; semiconductor supply chain; US is Singapore's top investment destination"),
  rel('USA','ARE', 0.65, 0.52, 25,   "Al Dhafra Air Base (2,000+ troops); Abraham Accords broker; F-35 deal linked to normalization progress with Israel",
                                      "$25B trade; UAE sovereign wealth funds (ADIA, Mubadala) major US investors; Dubai financial hub; petrodollar recycling"),
  rel('USA','IND', 0.62, 0.48, 135,  "Quad partners, GSOMIA intelligence sharing, defense sales (MQ-9 Reaper drones, GE jet engines); India maintains strategic autonomy",
                                      "$135B trade; Indian IT sector (TCS, Infosys) with US contracts; H-1B visa tensions; India buys Russian oil despite US pressure"),
  rel('USA','JOR', 0.60, 0.32, 10,   "Key moderate Arab ally — US bases; annual $1.7B security+economic aid; Jordan intercepted Iranian drones for Israel 2024",
                                      "$10B trade; US-Jordan FTA (2000); Jordanian textiles+pharma exported duty-free; limited deeper integration"),
  rel('USA','SAU', 0.50, 0.58, 45,   "Petrodollar security partner — Biden-MBS fist-bump reset after Khashoggi; OPEC+ production cuts strained ties; F-15s+THAAD sales",
                                      "$45B trade; Saudi Aramco oil priced in USD (petrodollar system); NEOM and Vision 2030 US investment; Saudi PIF buys US assets"),
  rel('USA','EGY', 0.48, 0.30, 10,   "Security partner since Camp David (1979) — $1.3B annual military aid; Suez Canal access; joint counterterrorism; human rights tensions",
                                      "$10B trade; US financial aid stabilizes Egyptian pound; US wheat exports; American University Cairo; limited commercial ties"),
  rel('USA','MEX', 0.32, 0.88, 820,  "Trump's 25% tariffs as political leverage, mass deportation flights, cartel military threats — USMCA under severe stress",
                                      "Mexico became #1 US trade partner 2023 ($820B+); nearshoring boom; auto manufacturing (3M cars/yr cross border); remittances $60B/yr"),
  rel('USA','DNK', 0.62, 0.55, 15,   "NATO ally — Trump threatened to take Greenland by force (2025); caused most serious US-Denmark diplomatic crisis in modern history",
                                      "$15B trade; Danish pharma (Novo Nordisk/Ozempic) huge in US market; Danish wind energy companies active in US; Arctic energy interests"),
  rel('USA','PAN', 0.25, 0.42, 8,    "Trump threatened to 'take back' Panama Canal; concerns about Chinese port operator Hutchison; US built canal, handed over 1999",
                                      "$8B trade; Panama Canal handles 40% of US container traffic ($270B/yr); US-Panama FTA 2012; Colon Free Zone financial flows"),
  rel('USA','BRA', 0.42, 0.52, 80,   "Lula pro-BRICS, refuses to sanction Russia — relationship varies dramatically; Bolsonaro era was Trump-aligned",
                                      "$80B trade; Brazil competes with US soybean exports; US companies large in Brazilian market; Amazon deforestation creates friction"),
  rel('USA','TUR', 0.30, 0.42, 30,   "NATO allies — S-400 purchase triggered F-35 suspension (CAATSA); Turkey blocked Sweden/Finland NATO bids; Syria+Israel divergence",
                                      "$30B trade; US suspended Turkey from $1.4B F-35 program; Turkish textiles+steel face US tariffs; TurkStream energy concerns"),
  rel('USA','COL', 0.58, 0.42, 8,    "Major Non-NATO Ally — Plan Colombia; Petro government cooled some ties but security cooperation on cartels+Venezuela continues",
                                      "$8B trade; US-Colombia FTA 2012; Colombian flowers+coffee+oil to US; US Plan Colombia has funded $10B since 2000"),
  rel('USA','PHL', 0.68, 0.40, 25,   "Mutual Defense Treaty — US access to 9 Philippine bases expanded 2023 (EDCA); reinforced after Chinese South China Sea provocations",
                                      "$25B trade; Philippine remittances from US ($10B/yr); US-PHL FTA discussions; semiconductor assembly+BPO industry"),
  rel('USA','THA', 0.42, 0.50, 35,   "Treaty of Amity and Commerce (1954) — Thailand drifted toward China post-2014 coup; Cobra Gold joint exercises continue",
                                      "$35B trade; Thai auto parts, hard-disk drives, electronics to US; Trump tariffs threatened Thai export model"),
  rel('USA','NGA', 0.40, 0.45, 12,   "Security cooperation on Boko Haram/Sahel — Nigeria's China ties and Russia neutrality frustrate US strategic goals",
                                      "$12B trade; Nigeria is top US crude oil destination in Africa; AGOA trade preferences for textiles; US energy sector investment"),
  rel('USA','ZAF', 0.32, 0.42, 15,   "US threatened AGOA removal over SA's Russia neutrality, ICJ case against Israel, and ties with Iran — significant diplomatic tensions",
                                      "$15B trade; AGOA gives South Africa duty-free US market access; SA platinum+gold exports; US investment in SA mining+finance"),
  rel('USA','IDN', 0.40, 0.44, 30,   "Growing security partnership — US Osprey helicopters, F-35 discussion; Indonesia's non-alignment and ASEAN centrality complicate ties",
                                      "$30B trade; Indonesian nickel+coal+palm oil exports; US tech companies (Google, Meta) large Indonesia market; trade deficit"),
  rel('USA','VNM', 0.45, 0.68, 115,  "Normalized 1995; Comprehensive Strategic Partnership 2023 — growing defense ties (P-3 aircraft, coast guard) driven by China rivalry",
                                      "$115B trade; Vietnam #3 US trade deficit; Apple+Intel supply chain; Chinese manufacturing shifting to Vietnam for US market"),
  rel('USA','QAT', 0.48, 0.38, 5,    "Al Udeid Air Base (10,000 US troops) — Qatar mediates Taliban+Hamas talks; criticized for Hamas political bureau; bought F-15s",
                                      "$5B trade; Qatar LNG exports to US allies; Qatar Airways major US routes; QIA sovereign wealth invests heavily in US assets"),
  rel('USA','KWT', 0.62, 0.40, 8,    "Camp Arifjan base — US liberated Kuwait in Gulf War 1991; strong security partner; Kuwait bought F/A-18s and Patriot systems",
                                      "$8B trade; Kuwaiti oil exports; Kuwait Investment Authority major US Treasury holder; US defense exports dominate bilateral trade"),
  rel('USA','BHR', 0.60, 0.38, 3,    "US 5th Fleet HQ at Naval Support Activity Bahrain — crucial Gulf security; US silent on 2011 Shia protest crackdown",
                                      "$3B trade; Bahrain hosts US financial institutions; aluminum exports to US; US-Bahrain FTA 2004; limited economic footprint"),
  rel('USA','MAR', 0.55, 0.32, 5,    "Oldest US-Africa ally (1777) — access to Moroccan air+sea bases; Trump 2020 recognized Western Sahara as Moroccan territory",
                                      "$5B trade; US-Morocco FTA 2006; Moroccan phosphate+fertilizer exports; US investment in Morocco's tourism+renewable energy"),
  rel('USA','PAK', 0.18, 0.25, 7,    "On-off ally — post-bin Laden 2011 trust collapse; F-16 maintenance suspended/resumed; MNNA status hollow; Pakistan deepens China ties",
                                      "$7B trade; Pakistani textiles to US; IMF programs supported by US; military aid peaked $1B/yr then reduced; CPEC competes with US"),
  rel('USA','IRQ', 0.28, 0.42, 30,   "US invaded 2003, occupation ended 2011 — troops stay for ISIS; Iraq parliament voted to expel US troops 2024; Iran militia influence",
                                      "$30B trade; Iraqi oil exports; US reconstruction contracts; US energy sector companies in Iraqi oilfields; Iran-linked economic influence"),
  rel('USA','AFG',-0.22,-0.55, 1,    "Chaotic US withdrawal Aug 2021 — Taliban in power, no diplomatic recognition; some counterterrorism back-channels",
                                      "Frozen $7B Afghan central bank assets; humanitarian aid via NGOs; virtually no direct economic ties; Taliban under full sanctions"),
  rel('USA','SYR',-0.52,-0.85, 0,    "Caesar Act sanctions — supported SDF/Kurds in NE Syria; opposed Assad (who fell Dec 2024); new Syria government cautiously engaging US",
                                      "Comprehensive Caesar Act sanctions since 2020; zero trade; Syria reconstruction requires US sanctions lifting; frozen Syrian assets"),
  rel('USA','TWN', 0.70, 0.62, 105,  "Taiwan Relations Act (1979) — strategic ambiguity on defense; arms sales $8B (2024); frequent US official visits signal commitment",
                                      "$105B trade; TSMC dominance in advanced chips (most critical US supply dependency); US-Taiwan semiconductor supply chain security focus"),
  rel('USA','LBY', 0.18, 0.25, 2,    "US backed 2011 NATO intervention, supports UN-recognized GNU — fragmented Libya makes partnership ineffective",
                                      "$2B trade; US oil companies (ConocoPhillips historically) in Libyan sector; very limited economic ties given ongoing instability"),
  rel('USA','YEM', 0.10, 0.08, 1,    "US strikes Houthi targets (Operation Prosperity Guardian 2024) — arms sold to Saudi coalition but faces Yemen civilian toll criticism",
                                      "$1B minimal trade; arms sales to Saudi coalition ($110B+); Houthi Red Sea attacks disrupted US shipping; no direct Yemen trade"),
  rel('USA','CHN',-0.72, 0.45, 590,  "Strategic rivalry — tech war (Huawei/TSMC export controls), Taiwan standoff, military incidents in South China Sea, UN bloc competition",
                                      "$590B trade despite 145% tariffs (largest bilateral trade globally); de-risking without decoupling; fentanyl precursor trade dispute"),
  rel('USA','RUS',-0.95,-0.88, 3,    "Adversarial — Ukraine war proxy confrontation; expelled 60 Russian diplomats; nuclear sabre-rattling; broken intelligence cooperation",
                                      "$3B minimal trade; $300B Russian sovereign assets frozen; SWIFT exclusion; oil price cap regime; virtually all economic ties severed"),
  rel('USA','IRN',-0.97,-0.95, 0,    "Hostile since 1979 Islamic Revolution — IRGC designated terrorist; nuclear standoff; JCPOA collapse; proxy conflicts via Houthis+Hezbollah",
                                      "Comprehensive OFAC sanctions since 1979; zero trade; Iranian oil blocked from global markets; frozen $6B assets dispute"),
  rel('USA','PRK',-0.95,-0.95, 0,    "Hostile — nuclear weapons program, no peace treaty since 1953 armistice, no diplomatic relations; NK troops sent to Russia 2024",
                                      "Most comprehensive sanctions since 2006 — UNSC resolutions targeting NK coal, iron, seafood, textiles; virtually zero trade"),
  rel('USA','CUB',-0.65,-0.75, 1,    "Embargo since 1962 — Obama-era diplomatic thaw reversed; Cuba hosts Russian SIGINT and Chinese intelligence-gathering facilities",
                                      "US embargo blocks almost all trade; Cuba on State Sponsors of Terrorism list blocks financial access; minimal humanitarian exceptions"),
  rel('USA','VEN',-0.55,-0.45, 2,    "Maduro sanctions, Guaidó recognition withdrawn 2023 — Chevron license oscillates; 7M Venezuelan refugees regional crisis",
                                      "OFAC sanctions target PDVSA; Chevron operates under special license ($3.8B/yr); Venezuela sells oil to China bypassing US"),
  // ── CHINA ───────────────────────────────────────────────────────────────
  rel('CHN','RUS', 0.80, 0.62, 240,  "No-limits partnership (Feb 2022) — joint military exercises, UNSC vetoes; China gives Russia diplomatic cover on Ukraine",
                                      "China became Russia's #1 trade partner since sanctions ($240B); buys discounted oil+gas; provides dual-use chips+drone components; yuan replaces dollar in bilateral trade"),
  rel('CHN','PAK', 0.90, 0.64, 25,   "Iron brothers — China provides UN veto cover for Pakistan on Kashmir; joint military exercises; JF-17 jets, DF-21 missiles supplied",
                                      "CPEC $62B corridor (Gwadar port, energy pipelines, highways); China is Pakistan's largest FDI source; Pakistan deeply indebted to China"),
  rel('CHN','PRK', 0.65, 0.28, 5,    "Lips and teeth — China is North Korea's only real UNSC protector; strained by NK nuclear tests and troop deployment to Russia 2024",
                                      "China is 95%+ of NK trade (coal+seafood out, fuel+food in); economic lifeline but NK's Russia deployment suggests growing independence"),
  rel('CHN','KHM', 0.72, 0.54, 4,    "Cambodia is China's closest ASEAN ally — blocks ASEAN consensus on South China Sea; Ream Naval Base (Chinese-built, potential PLA access)",
                                      "$4B trade; Chinese aid dominates (roads, bridges, airport); Sihanoukville became Chinese-dominated enclave; $1B+ Chinese FDI per year"),
  rel('CHN','LAO', 0.68, 0.58, 3,    "Laos-China Railway opened 2021 — deep CCP-LPRP party-to-party ties; China exerts outsized political influence",
                                      "$6B Laos-China Railway debt (40%+ of Laos GDP) — Laos risks debt distress; China controls significant Lao electricity and logistics"),
  rel('CHN','MMR', 0.60, 0.50, 5,    "China supports military junta (post-2021 coup) — provides UNSC political cover; sells arms to junta; backs junta vs ethnic militias",
                                      "BRI Kyaukphyu deep-sea port and China-Myanmar oil+gas pipelines ($10B); China controls critical Myanmar infrastructure and transit routes"),
  rel('CHN','LKA', 0.58, 0.52, 4,    "Hambantota port 99-year lease — flagship BRI; China shields Sri Lanka from UNSC human rights resolutions on Tamil war",
                                      "Sri Lanka 2022 default partly from $6.5B Chinese loans; Hambantota port leased to CMPORT as debt-for-equity; IMF bailout required restructuring"),
  rel('CHN','IRN', 0.65, 0.55, 16,   "25-year comprehensive cooperation agreement (2021) — Iran in SCO+BRICS 2024; both anti-US; China blocks IAEA+UNSC Iran resolutions",
                                      "China buys ~1.5M bbl/day Iranian oil at 30% discount (bypassing sanctions); $400B 25-year investment deal in Iranian energy+infrastructure"),
  rel('CHN','TWN',-0.95, 0.52, 180,  "One China policy — Beijing claims Taiwan as sovereign territory; military intimidation (balloon flights, carrier exercises); zero diplomatic recognition",
                                      "$180B cross-strait trade (routed via Hong Kong) — TSMC chips+electronics to mainland; deep manufacturing interdependence despite political tensions"),
  rel('CHN','SAU', 0.48, 0.78, 85,   "No formal alliance — China balances Iran+Saudi; both oppose Western human rights pressure; MBS diversifying from US dependence",
                                      "China is Saudi Arabia's #1 oil customer (1.7M bbl/day); yuan oil trade talks; Huawei 5G deployed; Saudi Aramco-CNPC downstream partnership"),
  rel('CHN','ARE', 0.45, 0.68, 45,   "No formal alliance — UAE is key BRI node; US pressured UAE to block Huawei and curb Chinese military presence at Khalifa port",
                                      "UAE is China's top Arab trade partner ($45B); Dubai yuan clearing center; UAE uses Huawei 5G; Chinese investment in UAE ports+logistics hub"),
  rel('CHN','BRA', 0.48, 0.72, 190,  "BRICS partners — Lula aligns with China on multipolarity and refuses to sanction Russia; China backs Brazil in G20 Global South agenda",
                                      "China is Brazil's #1 trade partner ($190B); buys 60%+ of Brazilian soybeans+iron ore; BRL-CNY direct trading 2023; massive Chinese FDI in energy"),
  rel('CHN','ETH', 0.55, 0.55, 10,   "AU HQ in Addis Ababa built by China — CCP-EPRDF party ties; China blocks Ethiopia-targeted human rights resolutions at UNSC",
                                      "BRI Addis Ababa-Djibouti railway; $13B Chinese infrastructure loans; Ethiopia's largest bilateral creditor; BRICS membership 2024"),
  rel('CHN','NGA', 0.48, 0.58, 25,   "No formal alliance — China supports Nigeria in AU; avoids direct interference in Nigerian politics",
                                      "$25B trade; Standard Gauge Railway Abuja-Kaduna; Chinese FDI in oil+gas; Nigeria increasingly concerned about debt trap and import dumping"),
  rel('CHN','AGO', 0.52, 0.62, 20,   "China shielded Angola from Western human rights pressure during civil war — Angola was early BRI template in Africa",
                                      "China Angola's #1 oil buyer+creditor ($40B in loans since 2004); Luanda Line railway; oil-backed loans define the relationship"),
  rel('CHN','ZAF', 0.48, 0.55, 50,   "BRICS founding member — South Africa refused to arrest Putin at 2023 BRICS summit; joint China-Russia-SA naval exercises",
                                      "$50B trade; Chinese mining investment; SA exports platinum+coal+iron ore; Chinese auto imports now threatening SA domestic industry"),
  rel('CHN','KEN', 0.48, 0.52, 8,    "China funds AU peacekeeping+infrastructure — Kenya-China ties strong; Kenya avoids antagonizing China on Taiwan+Hong Kong",
                                      "$3.2B Nairobi-Mombasa SGR railway (Kenya's largest infrastructure project); $5B+ Chinese debt burden; Chinese FDI in ports+roads"),
  rel('CHN','ZMB', 0.35, 0.40, 4,    "Zambia's Copperbelt attracted early Chinese investment — China opposed Western-style IMF conditionality during debt crisis",
                                      "Zambia 2020 default partly on $6B Chinese loans; debt restructuring negotiations disputed; Chinese mining companies dominate Copperbelt copper"),
  rel('CHN','EGY', 0.38, 0.45, 15,   "Suez Canal Economic Zone is BRI node — China muted on Egypt human rights; Egypt in BRICS 2024; both practice strategic non-alignment",
                                      "$15B trade; Chinese manufacturing in SCZone; EV exports to Egypt growing; Egyptian cotton to China; Huawei infrastructure deployed"),
  rel('CHN','KAZ', 0.45, 0.52, 28,   "SCO member — Kazakhstan navigates carefully between China and Russia; Uyghur-Kazakh ethnic community creates political sensitivity",
                                      "Middle Corridor (Trans-Caspian) BRI route; China is top trade partner ($28B); Kazakhstan exports oil+uranium+grain to China"),
  rel('CHN','THA', 0.48, 0.55, 42,   "BRI high-speed rail (Bangkok-Nong Khai) — Thailand quietly balances US+China security ties; Buddhist cultural diplomacy",
                                      "$42B trade; 10M+ Chinese tourists to Thailand ($10B/yr pre-COVID); Chinese EVs flooding Thai market; BRI rail investment ongoing"),
  rel('CHN','MYS', 0.15, 0.58, 52,   "South China Sea 9-dash line overlaps Malaysian EEZ — regular Chinese coast guard incursions; Malaysia avoids direct confrontation",
                                      "$52B trade; China is Malaysia's largest trade partner; Chinese FDI (ECRL railway $11B); Malaysia deeply integrated in China supply chains"),
  rel('CHN','SGP', 0.25, 0.75, 88,   "Singapore is US security-aligned — openly supports rules-based order vs Chinese revisionism; US destroyer access to Changi",
                                      "Singapore is China's #1 ASEAN trade partner+investment hub ($88B); Chinese companies use Singapore for international listings+dollar financing"),
  rel('CHN','IDN', 0.28, 0.62, 105,  "South China Sea tensions near Natuna Islands — regular Chinese fishing fleets+coast guard intrusions; Indonesia reinforces Natuna garrison",
                                      "$105B trade; Indonesia sells nickel (EV batteries) and coal to China; Chinese EV manufacturers (BYD, CATL) invest in Indonesian nickel processing"),
  rel('CHN','TUR', 0.22, 0.48, 42,   "Turkey criticizes Uyghur mistreatment (Turkic solidarity) — Erdogan nonetheless pragmatic; both seek strategic leverage vs West",
                                      "$42B trade; Chinese goods flood Turkish market; BRI Middle Corridor passes through Turkey; Turkey buys Chinese drones+surveillance equipment"),
  rel('CHN','NPL', 0.45, 0.30, 1,    "Trans-Himalayan BRI connectivity — Nepal caught between India+China spheres; both CPN parties lean toward Beijing",
                                      "Planned China-Nepal railway via Tibet stalled; Nepal trade with China constrained by Himalayan terrain; India dominates Nepal's economy"),
  rel('CHN','MNG', 0.40, 0.38, 8,    "Mongolia landlocked between Russia+China — Dalai Lama visits cause Chinese diplomatic fury; Mongolia maintains careful strategic balance",
                                      "90% of Mongolian trade via China (coal+copper+cashmere); Mongolia worries about overdependence; Oyu Tolgoi mine tax disputes"),
  rel('CHN','MEX', 0.20, 0.55, 115,  "No strategic relationship — Mexico avoids US-China crossfire; Chinese investment in Mexico scrutinized for tariff arbitrage concerns",
                                      "$115B trade; Chinese goods compete with Mexican manufacturing for US market; Chinese EV+solar dumping threatens Mexico's US-focused export model"),
  rel('CHN','ISR', 0.12, 0.40, 10,   "US pressure blocked Chinese investment in Israeli ports+tech — China officially neutral on Israel-Gaza; Haifa port Chinese concession ended 2021",
                                      "$10B trade; Chinese tech investment in Israel curbed by US pressure; Israeli ag-tech+cybersecurity sectors still draw Chinese interest"),
  rel('CHN','GBR', 0.08, 0.52, 92,   "Relations deteriorated sharply — Hong Kong National Security Law (2020), Huawei ban, academic espionage, Uyghur sanctions",
                                      "$92B trade; UK was top China FDI destination pre-2019; City of London China bond market; trade declining with de-risking policy"),
  rel('CHN','FRA', 0.18, 0.45, 118,  "Macron's 2023 China visit (strategic autonomy framing) — France leads EU de-risking push; called Taiwan security a European concern",
                                      "$118B trade; Airbus sells ~700 planes to China; LVMH+Hennessy+Moët depend on Chinese luxury market; EU-China EV tariff war escalating"),
  rel('CHN','DEU', 0.22, 0.78, 292,  "Germany de-risking without decoupling — Volkswagen criticized for Xinjiang supply chain; Germany reshaping EU China policy",
                                      "$292B trade (Germany's largest bilateral); VW sells 35% of cars in China; BMW+Mercedes China-dependent; chemical+machinery exports critical"),
  rel('CHN','KOR', 0.08, 0.78, 265,  "THAAD missile defense caused massive Chinese economic retaliation 2017 (boycott Korean Wave+tourism) — US security ties dominate alignment",
                                      "$265B trade; Samsung+SK Hynix China facilities; Chinese tourism to Korea collapsed post-THAAD; Korea diversifying semiconductor customers"),
  rel('CHN','JPN',-0.30, 0.80, 315,  "Senkaku/Diaoyu islands dispute — WWII history (Nanjing, comfort women); Japan's security buildup and AUKUS-adjacent posture targets China",
                                      "$315B trade (largest bilateral); Toyota+Honda China factories; rare earth export curbs hit Japanese manufacturing; deep supply chain integration"),
  rel('CHN','AUS',-0.42, 0.70, 285,  "AUKUS+Huawei ban triggered 2020-2022 trade war — Australian COVID inquiry call infuriated Beijing; relations partially repaired 2023",
                                      "$285B trade; China buys 35% of Australian exports (iron ore+coal+barley+wine); targeted trade bans mostly lifted 2023"),
  rel('CHN','VNM',-0.32, 0.50, 17,   "Historical enemies (1979 Sino-Vietnamese War) — South China Sea disputes ongoing; Vietnam leans US for security despite communist party ties",
                                      "Vietnam-China trade growing but Vietnam diversifying; Vietnamese companies in Chinese supply chains; both compete for US+EU manufacturing"),
  rel('CHN','PHL',-0.30, 0.40, 27,   "South China Sea: Scarborough Shoal seizure (2012), Second Thomas Shoal water cannon incidents 2023-24; US-Philippines alliance resurgence",
                                      "$27B trade; Chinese tourists were top source before tensions; PHL exports electronics+semiconductor components to China"),
  rel('CHN','IND',-0.45, 0.38, 140,  "2020 Galwan Valley clash (20 Indian soldiers killed) — LAC border still tense; India building border roads; Quad alignment vs China",
                                      "$140B trade despite tensions; India buys Chinese electronics+APIs; domestic industry lobbies for Chinese import curbs; decoupling very slow"),
  rel('CHN','UKR', 0.02, 0.18, 15,   "Officially neutral — Xi peace plan rejected by Ukraine; China supplies Russia dual-use goods (drones, chips) while claiming non-belligerence",
                                      "$15B pre-war trade — Ukraine was major Chinese grain supplier and Motor Sich turbine source; war collapsed bilateral trade"),
  rel('CHN','SYR', 0.42, 0.08, 1,    "China vetoed UNSC Syria resolutions 17 times (with Russia) — Assad regime collapsed Dec 2024; new Syrian government status unclear",
                                      "Very limited trade; China interested in Syria reconstruction contracts post-Assad; no significant economic ties established"),
  rel('CHN','IRQ', 0.38, 0.68, 38,   "China fills post-US power vacuum in Iraq — no security alliance; US troop expulsion vote (2024) creates Chinese diplomatic opportunity",
                                      "China is Iraq's top oil buyer (1.9M bbl/day); CNOOC+Sinopec operate major oilfields; $10B+ Chinese investment in Iraqi infrastructure"),
  rel('CHN','USA',-0.72, 0.45, 590,  "Strategic rivalry — tech war (Huawei/TSMC export controls), Taiwan standoff, military incidents in South China Sea, UN bloc competition",
                                      "$590B trade despite 145% tariffs (largest bilateral trade globally); de-risking without decoupling; fentanyl precursor trade dispute"),
  // ── RUSSIA ──────────────────────────────────────────────────────────────
  rel('RUS','BLR', 0.92, 0.72, 42,   "Union State — shared military command, Lukashenko survived 2020 protests via Putin; Belarus route for Ukraine invasion"),
  rel('RUS','SYR', 0.82, 0.18, 1,    "Russia saved Assad with air campaign 2015 — Tartus naval base, Khmeimim airbase; Assad fled to Moscow Dec 2024"),
  rel('RUS','PRK', 0.72, 0.38, 2,    "North Korea sent 10,000+ troops to fight in Ukraine 2024 — deepest military cooperation since Cold War; shells+missiles"),
  rel('RUS','IRN', 0.72, 0.45, 5,    "Aligned vs. Western sanctions — Iran supplied Shahed-136 drones for Ukraine war; Russia shares air defense tech"),
  rel('RUS','KGZ', 0.70, 0.42, 2,    "CSTO ally, Russian military base at Kant, large remittance flows (Kyrgyz migrants in Russia)"),
  rel('RUS','TJK', 0.70, 0.42, 1,    "CSTO ally, 201st Military Base (largest Russian overseas base), large diaspora remittances"),
  rel('RUS','KAZ', 0.58, 0.60, 28,   "CSTO ally but Kazakhstan refused to support Ukraine invasion — critical transit route for Russia post-sanctions"),
  rel('RUS','ARM', 0.42, 0.45, 3,    "CSTO ally — Russia failed to help in 2023 Karabakh war; Armenia freezing CSTO membership, pivoting to EU"),
  rel('RUS','IND', 0.55, 0.65, 68,   "S-400 purchase (CAATSA waiver), India buys 1.8M bbl/day Russian discounted oil — India non-aligned on Ukraine"),
  rel('RUS','AZE', 0.30, 0.42, 4,    "Russia CSTO-ally of Armenia but Azerbaijan gaining regional independence — Aliyev balances Russia and West"),
  rel('RUS','TUR', 0.28, 0.62, 56,   "NATO Turkey mediates Ukraine — Grain Deal, Bosphorus closure; buys S-400; TurkStream gas pipeline"),
  rel('RUS','EGY', 0.32, 0.42, 4,    "Dabaa nuclear plant ($25B, Russia building 4 reactors), major wheat supplier — Egypt hedges West vs Russia"),
  rel('RUS','SAU', 0.28, 0.45, 3,    "OPEC+ co-leadership (cut production together) — Saudi sells weapons to Ukraine donors but won't fully isolate Russia"),
  rel('RUS','MNG', 0.42, 0.38, 2,    "Historically close; Mongolia dependent on Russia gas transit; Ulaanbaatar refuses to sanction Russia"),
  rel('RUS','UZB', 0.35, 0.42, 5,    "Uzbekistan left CSTO 2012, maintains strategic independence — major trade partner, Uzbeks largest Russia diaspora"),
  rel('RUS','TKM', 0.30, 0.45, 2,    "Turkmenistan permanent neutrality — sells gas, avoids confrontation; allows Russian financial system access"),
  rel('RUS','BRA', 0.08, 0.18, 3,    "Lula refuses to sanction Russia — limited but growing fertilizer/grain trade; BRICS solidarity"),
  rel('RUS','ZAF', 0.22, 0.12, 2,    "BRICS — joint Russian-Chinese-South African naval exercises; SA refused to arrest Putin at BRICS 2023"),
  rel('RUS','NGA', 0.22, 0.10, 1,    "Wagner/Africa Corps presence in Sahel; Nigeria avoids sanctions; limited trade"),
  rel('RUS','UKR',-1.00,-0.95, 0,    "Full-scale invasion since Feb 2022 (de facto war since 2014 Crimea) — existential conflict; total economic severance"),
  rel('RUS','POL',-0.95,-0.72, 1,    "Most hawkish NATO member vs Russia — Poland building biggest European army; heavy sanctions on Russia"),
  rel('RUS','GBR',-0.88,-0.78, 2,    "Salisbury Novichok poisoning 2018, deep sanctions, intelligence rivalry, UK most active in Ukraine support"),
  rel('RUS','FIN',-0.80,-0.70, 0,    "Finland joined NATO April 2023 directly in response to invasion — 1,340km new NATO border with Russia"),
  rel('RUS','SWE',-0.72,-0.68, 0,    "Sweden joined NATO March 2024 — significant Baltic shift; enforces full sanctions; Gripen jets to Ukraine discussed"),
  rel('RUS','GEO',-0.82,-0.42, 1,    "2008 August War — Russia occupies South Ossetia+Abkhazia (20% of Georgia); Georgia-Russia trade partially resumed"),
  rel('RUS','DEU',-0.82,-0.68, 18,   "Nord Stream pipelines sabotaged 2022 — Germany supplies Leopard 2 tanks, Taurus cruise missiles debated"),
  rel('RUS','FRA',-0.70,-0.62, 5,    "Macron threatened NATO troops in Ukraine — France supplies SCALP missiles, CAESAR howitzers, AMX-10 RC"),
  rel('RUS','JPN',-0.55,-0.58, 6,    "Kuril/Northern Territories dispute — Japan joins all G7 sanctions; Sakhalin-2 LNG: Japan kept stake despite pressure"),
  rel('RUS','AUS',-0.68,-0.72, 1,    "Enforces full sanctions, supplies Bushmaster APCs and ammunition to Ukraine; expelled Russian diplomats"),
  // ── GERMANY ─────────────────────────────────────────────────────────────
  rel('DEU','FRA', 0.88, 0.82, 185,  "Franco-German axis — Elysee Treaty (1963), engine of EU; joint FCAS fighter, MGCS tank programs"),
  rel('DEU','NLD', 0.85, 0.82, 188,  "EU/NATO — deeply integrated Rhine-Ruhr industrial economy; Rotterdam port is Germany's primary access to sea"),
  rel('DEU','AUT', 0.85, 0.80, 62,   "German-speaking EU partners — deeply integrated; Austria neutral but economically in German sphere"),
  rel('DEU','CHE', 0.72, 0.80, 95,   "Major trade partner — Swiss non-EU but deeply integrated; financial center, German diaspora"),
  rel('DEU','POL', 0.70, 0.75, 168,  "Key EU/NATO partners — historical reconciliation; Poland now Germany's 2nd largest trade partner"),
  rel('DEU','ITA', 0.78, 0.75, 125,  "EU/G7 — Quirinal Treaty 2021; Italy's Draghi era restored trust; Meloni government more Atlanticist than expected"),
  rel('DEU','CZE', 0.78, 0.75, 68,   "EU/NATO — deeply integrated supply chains; Czech Republic industrial hub for German car industry"),
  rel('DEU','GBR', 0.60, 0.68, 128,  "NATO/G7 — Brexit created friction; UK-Germany defense cooperation deepened via Ukraine; TCA trade deal"),
  rel('DEU','JPN', 0.68, 0.65, 48,   "G7 — similar export-driven economies; joint defense cooperation growing (Typhoon/F-X fighter discussions)"),
  rel('DEU','UKR', 0.80, 0.32, 6,    "Transformed from NS2-hesitant to major backer — Leopard 2 tanks (most donated), IRIS-T air defense, Patriot"),
  rel('DEU','TUR', 0.35, 0.50, 48,   "NATO — 3M Turkish diaspora in Germany; Erdogan's democratic backsliding strains ties; Turkey mediates but hedges"),
  rel('DEU','IND', 0.55, 0.48, 35,   "Growing strategic partnership — supply chain diversification from China; joint declaration 2023"),
  rel('DEU','HUN', 0.45, 0.58, 55,   "EU — Budapest-Brussels rule-of-law fight; Orban blocks EU Ukraine aid repeatedly; Germany+Hungary major VW hub"),
  rel('DEU','DNK', 0.80, 0.72, 48,   "EU/NATO neighbors — energy cooperation; Germany and Denmark share Baltic Sea pipeline interests"),
  // ── UK ──────────────────────────────────────────────────────────────────
  rel('GBR','AUS', 0.90, 0.65, 32,   "AUKUS, Five Eyes, Commonwealth — historically very close; King Charles head of state"),
  rel('GBR','CAN', 0.85, 0.60, 38,   "Five Eyes, Commonwealth, NATO — King Charles head of state; Trump annexation threat brought GBR+CAN closer"),
  rel('GBR','FRA', 0.70, 0.75, 88,   "NATO allies, Entente Cordiale (1904) — Lancaster House Treaties (2010); AUKUS blindsided France"),
  rel('GBR','IRL', 0.62, 0.75, 48,   "Close but Brexit created Northern Ireland Protocol crisis — Windsor Framework (2023) partly resolved"),
  rel('GBR','JPN', 0.68, 0.58, 28,   "G7, GCAP next-gen fighter jet (with Italy), Reciprocal Access Agreement 2023"),
  rel('GBR','IND', 0.60, 0.52, 38,   "Commonwealth, historical ties — FTA negotiation (stalled); large Indian diaspora; Sunak was first British-Indian PM"),
  rel('GBR','UKR', 0.92, 0.22, 4,    "First NATO member to supply main battle tanks (Challenger 2), Storm Shadow cruise missiles, training"),
  rel('GBR','SAU', 0.45, 0.48, 18,   "BAE Systems arms sales ($15B+), GCHQ security sharing — human rights tensions; Khashoggi fallout"),
  rel('GBR','NZL', 0.88, 0.58, 12,   "Five Eyes, Commonwealth, AUKUS-adjacent — King Charles head of state; deep cultural ties"),
  rel('GBR','SGP', 0.70, 0.65, 32,   "Five Power Defence Arrangements, Commonwealth — Singapore-UK financial hub; Changi port access"),
  rel('GBR','KEN', 0.50, 0.42, 7,    "Commonwealth, British Army Kenya training — 2020 ICJ ruling on Kenya maritime border won by Kenya"),
  // ── FRANCE ──────────────────────────────────────────────────────────────
  rel('FRA','ITA', 0.80, 0.80, 108,  "EU/G7 — Quirinal Treaty 2021; close partnership despite occasional trade disputes"),
  rel('FRA','ESP', 0.80, 0.75, 80,   "EU — strong Pyrenees neighbors; Spain-France infrastructure deeply integrated"),
  rel('FRA','UKR', 0.75, 0.28, 4,    "SCALP cruise missiles, Leclerc tanks, CAESAR howitzers — Macron threatened NATO troops; Mirage F1s transferred"),
  rel('FRA','IND', 0.68, 0.48, 18,   "Rafale jets (36 aircraft, $8.7B), Scorpene submarines — strategic partnership; both value non-alignment"),
  rel('FRA','MAR', 0.52, 0.52, 10,   "Former protectorate — 2022 consular crisis (visa dispute); ties improved 2024; key Francafrique partner"),
  rel('FRA','DZA', 0.22, 0.45, 8,    "Colonial wounds — Macron 2017 called colonialism a crime against humanity; 2022 diplomatic rupture over Sahel"),
  rel('FRA','SEN', 0.38, 0.32, 2,    "Troops withdrawn 2024 — Senegal elected anti-French Faye; Francafrique model collapsing across Sahel"),
  rel('FRA','CIV', 0.35, 0.30, 3,    "French troops remain but unwelcome — Ouattara pro-French but popular anti-French sentiment growing"),
  rel('FRA','CAF',-0.28,-0.30, 0,    "CAR expelled French forces 2022, replaced by Russian Africa Corps (former Wagner) — complete rupture"),
  rel('FRA','MLI',-0.20,-0.15, 0,    "Mali expelled French Barkhane forces 2022, invited Russian Africa Corps — massive diplomatic rupture"),
  // ── JAPAN ───────────────────────────────────────────────────────────────
  rel('JPN','AUS', 0.82, 0.75, 85,   "Quasi-allies, Reciprocal Access Agreement 2022, GCAP adjacent — Japan's constitution limits formal alliance"),
  rel('JPN','IND', 0.70, 0.50, 22,   "Quad — Japan financing Mumbai-Ahmedabad bullet train ($12B loan); growing defense cooperation"),
  rel('JPN','KOR', 0.45, 0.78, 90,   "Camp David trilateral (US-JPN-KOR) 2023 — WWII labor disputes partly resolved; intelligence sharing resumed"),
  rel('JPN','SGP', 0.68, 0.68, 38,   "Close economic and security partners — Singapore is Japan's largest ASEAN investment destination"),
  rel('JPN','MYS', 0.60, 0.58, 28,   "Japan Look East Policy (1982) — Malaysia is major Japanese manufacturing hub"),
  rel('JPN','THA', 0.62, 0.65, 33,   "Japan is top investor in Thailand — massive automotive manufacturing footprint (Toyota, Honda, Mitsubishi)"),
  rel('JPN','TWN', 0.65, 0.68, 82,   "Japan is key Taiwan supporter — TSMC fab in Kumamoto; Abe called Taiwan emergency = Japan emergency"),
  rel('JPN','PRK',-0.82,-0.88, 0,    "North Korea abductees issue (17 Japanese), missile overflights, no relations — full sanctions"),
  rel('JPN','VNM', 0.58, 0.55, 38,   "Japan ODA, FDI, growing security ties — coast guard cooperation vs China in South China Sea"),
  rel('JPN','PHL', 0.65, 0.48, 22,   "Reciprocal Access Agreement 2024 — coast guard cooperation; Japan-Philippines-US trilateral growing"),
  // ── INDIA ───────────────────────────────────────────────────────────────
  rel('IND','AUS', 0.68, 0.55, 35,   "Quad, ECTA FTA 2022, uranium exports — Comprehensive Strategic Partnership 2020"),
  rel('IND','SAU', 0.52, 0.65, 58,   "Saudi Arabia top oil supplier, 2.5M Indian workers (largest Indian diaspora) — Vision 2030 investment"),
  rel('IND','UAE', 0.65, 0.78, 88,   "CEPA 2022, 3.4M Indian diaspora, $75B bilateral trade — India-UAE rupee-dirham trade (reducing USD)"),
  rel('IND','BRA', 0.42, 0.40, 14,   "BRICS founding partners, growing bilateral ties — India-Brazil digital payment cooperation"),
  rel('IND','IRN', 0.35, 0.28, 3,    "Chabahar port (India-built, US sanctions exempted) — India balances Iran ties vs US relationship"),
  rel('IND','BGD', 0.58, 0.55, 18,   "Bangladesh created 1971 with Indian support — Hasina overthrown 2024, India-Bangladesh ties uncertain"),
  rel('IND','VNM', 0.50, 0.40, 18,   "Defence cooperation (Brahmos missiles), shared China concerns — both Quad-adjacent"),
  rel('IND','SGP', 0.62, 0.65, 32,   "CECA FTA, large Indian diaspora, FTA — Singapore is top FDI source for India"),
  rel('IND','KOR', 0.50, 0.55, 25,   "CEPA FTA, Korean FDI in India (Samsung, LG, Hyundai) — India-Korea defence cooperation growing"),
  rel('IND','EGY', 0.42, 0.32, 10,   "Strategic partnership 2023 — India-Arab outreach; Egyptian military in India talks"),
  rel('IND','TUR', 0.12, 0.28, 10,   "Turkey backs Pakistan on Kashmir, Erdogan speeches — limits closer ties despite trade"),
  rel('IND','LKA', 0.42, 0.40, 6,    "Historical ties, India $4B crisis bailout 2022 — Tamil issue lingers; India-Lanka power grid connecting"),
  rel('IND','NPL', 0.45, 0.55, 10,   "Open border, huge India-Nepal trade — Nepal increasingly balancing India with China; Kalapani border dispute"),
  rel('IND','AFG', 0.08, 0.05, 1,    "India invested $3B in Afghanistan (dams, roads) — Taliban in power; India cautiously re-engages via embassy"),
  rel('IND','ISR', 0.62, 0.45, 12,   "Modi-Netanyahu close ties — Spike missiles, Heron drones, HAROP; India abstained on key UNGA Gaza votes"),
  rel('IND','PAK',-0.82,-0.55, 1,    "Nuclear-armed rivals — Kashmir: 3 wars, 2 nuclear crises; no flights, no trade since 2019 Pulwama attack"),
  // ── SOUTH KOREA ─────────────────────────────────────────────────────────
  rel('KOR','AUS', 0.60, 0.65, 28,   "Major trade (LNG/iron ore/beef) — growing defence partnership; Korean air defense (Redback IFV)"),
  rel('KOR','VNM', 0.65, 0.75, 85,   "South Korea top investor — Samsung+LG+Hyundai factories; 200,000+ Korean expats in Vietnam"),
  rel('KOR','IND', 0.50, 0.55, 25,   "CEPA, Korean FDI (Samsung, Hyundai) — India-Korea defence cooperation growing"),
  rel('KOR','TWN', 0.52, 0.68, 38,   "Semiconductor supply chain (Samsung vs TSMC) — major economic but limited security partnership"),
  rel('KOR','PRK',-0.88,-0.90, 0,    "Korean War armistice (1953) — no peace treaty, active DMZ; Yoon government hardened stance vs Pyongyang"),
  // ── BRAZIL ──────────────────────────────────────────────────────────────
  rel('BRA','ARG', 0.52, 0.62, 42,   "MERCOSUR — Lula-Milei ideological clash (Lula socialist, Milei ultra-libertarian) but trade too integrated to break"),
  rel('BRA','BOL', 0.50, 0.55, 7,    "MERCOSUR associate — Bolivia supplies gas to Brazil; Evo Morales protected by Lula after coup attempt"),
  rel('BRA','COL', 0.45, 0.40, 7,    "Amazon cooperation — Lula-Petro share progressive agenda; Brazil-Colombia Amazon deforestation pact 2023"),
  rel('BRA','VEN', 0.25, 0.18, 4,    "Lula engages Maduro as pragmatic neighbor — 2M Venezuelan refugees in Brazil; humanitarian concern"),
  rel('BRA','PRY', 0.48, 0.65, 15,   "Itaipu Dam hydropower sharing ($500M/yr to Paraguay) — MERCOSUR but Paraguay-Brazil trade disputes"),
  // ── SAUDI ARABIA ────────────────────────────────────────────────────────
  rel('SAU','UAE', 0.82, 0.72, 28,   "GCC — joint Yemen operations (diverged on Qatar); MBS-MBZ rift over Qatar blockade mended but not forgotten"),
  rel('SAU','EGY', 0.65, 0.55, 12,   "Key Arab allies — Saudi $5B injection saved Egypt; Egypt provides construction workers; Vision 2030 cooperation"),
  rel('SAU','PAK', 0.60, 0.48, 8,    "Muslim solidarity — Saudi $3B bailout (2023); 2.5M Pakistani workers; Saudi-funded madrassas; Pakistani F-16 pilots"),
  rel('SAU','IND', 0.52, 0.65, 58,   "Saudi top oil supplier — 2.5M Indian workers; Vision 2030 investment; India-Saudi economic corridor"),
  rel('SAU','JOR', 0.60, 0.42, 4,    "Sunni solidarity — Saudi financial lifeline to Jordan; Jordan hosts US forces, Saudi worried about Jordan stability"),
  rel('SAU','MAR', 0.55, 0.38, 4,    "Arab League — Saudi supports Moroccan Western Sahara claim; growing investment"),
  rel('SAU','TUR', 0.32, 0.42, 10,   "Khashoggi murder strained relations — MBS-Erdogan rapprochement 2022-23; Saudi investment in Turkey"),
  rel('SAU','QAT',-0.10, 0.42, 6,    "Qatar blockade 2017-2021 ended by Al-Ula Declaration — still cautious; Qatar backed Muslim Brotherhood"),
  rel('SAU','IRN',-0.58,-0.60, 1,    "Rival Islamic powers — Sunni vs Shia; 2023 China-brokered re-engagement; proxy wars in Yemen+Lebanon+Syria"),
  rel('SAU','YEM',-0.40,-0.55, 0,    "Coalition intervention since 2015 — war stalled; Houthi drone/missile attacks on Saudi oil; ceasefire 2023"),
  // ── UAE ─────────────────────────────────────────────────────────────────
  rel('ARE','ISR', 0.65, 0.52, 7,    "Abraham Accords 2020 — normalization; Expo 2020 Israeli pavilion; $10B bilateral trade by 2025; UAE halted after Gaza"),
  rel('ARE','IRN',-0.38, 0.25, 3,    "Tense — Iran occupies 3 UAE islands (Greater+Lesser Tunb, Abu Musa); but $20B+ UAE-Iran trade continues"),
  rel('ARE','EGY', 0.70, 0.62, 10,   "Very close since 2013 — UAE backed Sisi coup; UAE investment in Egypt infrastructure, real estate, energy"),
  rel('ARE','IND', 0.65, 0.78, 90,   "CEPA 2022 — largest Indian diaspora (3.4M); India-UAE rupee-dirham trade; Abu Dhabi ADNOC-Reliance deals"),
  rel('ARE','JOR', 0.60, 0.45, 4,    "Arab solidarity — UAE financial support to Jordan; UAE backs Jordan stability vs Muslim Brotherhood"),
  rel('ARE','PKA', 0.58, 0.45, 8,    "Strong ties — large Pakistani diaspora; UAE investment in Pakistan; UAE mediates Pakistan's IMF deals"),
  // ── TURKEY ──────────────────────────────────────────────────────────────
  rel('TUR','AZE', 0.92, 0.68, 14,   "One nation, two states — Turkish Bayraktar TB2 drones decided 2020 Karabakh war; joint military, Baku-Tbilisi-Ceyhan"),
  rel('TUR','QAT', 0.80, 0.58, 6,    "Erdogan-Tamim axis — Turkish base protects Qatar; Qatar invested $15B in Turkey during 2018 lira crisis"),
  rel('TUR','PAK', 0.68, 0.42, 8,    "Muslim solidarity, defence (Bayraktar TB2, MILGEM corvettes to Pakistan); OIC coordination"),
  rel('TUR','UKR', 0.58, 0.48, 8,    "Bayraktar TB2 drones critical in early Ukraine war; controls Bosphorus (Montreux Convention); Grain Deal mediator"),
  rel('TUR','GRC',-0.42, 0.40, 12,   "NATO allies — Aegean air/sea rights standoffs, Cyprus occupation since 1974; Imia/Kardak crisis recurrent"),
  rel('TUR','IRN', 0.15, 0.40, 7,    "Regional competitors — Sunni vs Shia; TurkStream gas; manage Syria through Astana Process with Russia+Iran"),
  rel('TUR','ISR',-0.35, 0.32, 7,    "Erdogan suspended all trade with Israel May 2024 over Gaza — airlines grounded; F-35 sale cancelled 2019 (S-400)"),
  rel('TUR','ARM',-0.60,-0.82, 0,    "Armenian Genocide recognition issue, total blockade since 1993 — supports Azerbaijan unconditionally"),
  rel('TUR','SYR',-0.20, 0.15, 2,    "Occupies northern Syria (Operation Olive Branch, Peace Spring) — backs rebel factions; Erdogan met Assad 2024"),
  rel('TUR','EGY',-0.18, 0.32, 7,    "Turkey backed Muslim Brotherhood vs. Sisi — normalized 2023; Erdogan visits Cairo, Egypt lifts Turkey visa restrictions"),
  rel('TUR','SWE',-0.25, 0.55, 12,   "Turkey blocked Sweden's NATO bid 18 months — PKK extradition demands; Sweden joined NATO 2024 after deal"),
  // ── IRAN ────────────────────────────────────────────────────────────────
  rel('IRN','IRQ', 0.52, 0.55, 18,   "Shia connection — Iran has dominant militia influence (PMF/Hashd) in Iraq; $10B bilateral trade"),
  rel('IRN','SYR', 0.70, 0.10, 2,    "Lifeline to Assad for 14 years — IRGC fighters, Hezbollah, $30B+ support; Assad fled Russia Dec 2024"),
  rel('IRN','YEM', 0.55, 0.05, 0,    "Backs Houthi rebels — cruise missiles, drones, naval mines; Houthis blocked Red Sea for Israel-linked ships"),
  rel('IRN','LBN', 0.62, 0.05, 0,    "Hezbollah is Iran's crown jewel proxy — $700M/yr funding; 2024 Lebanon war depleted Hezbollah leadership"),
  rel('IRN','PRK', 0.40, 0.10, 0,    "Sanctions-evasion cooperation — ballistic missile tech exchange; both test long-range missiles"),
  rel('IRN','ISR',-1.00,-0.95, 0,    "Sworn enemies — Iran launched ~300 missiles+drones at Israel April 2024 (first direct attack); Israel struck Iran"),
  rel('IRN','USA',-0.97,-0.95, 0,    "Hostile since 1979 Islamic Revolution — comprehensive sanctions (OFAC), nuclear standoff, zero trade"),
  rel('IRN','SAU',-0.58,-0.60, 1,    "Sunni-Shia rivalry, proxy wars — 2023 China-brokered normalization; ambassadors returned; fragile re-engagement"),
  // ── ISRAEL ──────────────────────────────────────────────────────────────
  rel('ISR','PSE',-0.95,-0.72, 3,    "Israeli-Palestinian conflict — Gaza war since Oct 7 2023 Hamas attack; IDF ground operation; 2M+ Gazans displaced"),
  rel('ISR','LBN',-0.75,-0.82, 0,    "2024 Lebanon war — Israel assassinated Nasrallah, struck Hezbollah infrastructure; ceasefire Nov 2024; no relations"),
  rel('ISR','EGY', 0.40, 0.32, 3,    "Cold peace since 1979 Camp David — security coordination on Gaza; Egypt mediates Hamas-Israel ceasefire talks"),
  rel('ISR','JOR', 0.35, 0.28, 2,    "Peace since 1994 Wadi Araba Treaty — Jordanian water+gas agreements; Jordan expelled Israeli ambassador 2024"),
  rel('ISR','AZE', 0.68, 0.55, 3,    "Israel buys 40% Azeri oil, sells Harop+Spike drones — critical military partnership neither advertises"),
  rel('ISR','IND', 0.62, 0.45, 14,   "Modi-Netanyahu close alliance — Spike missiles, Heron drones, HAROP loitering munition; $1.5B/yr defence trade"),
  rel('ISR','DEU', 0.65, 0.52, 14,   "Special historical responsibility — Germany's Dolphin submarines (nuclear-capable); $3B aid after Oct 7 attack"),
  rel('ISR','GBR', 0.58, 0.45, 12,   "Close intelligence (Unit 8200-GCHQ) and tech ties — UK sanctioned some Israeli settlers 2024"),
  rel('ISR','FRA', 0.42, 0.40, 7,    "Historical support — Macron called Gaza ceasefire; French Jewish community 500,000 (2nd largest outside Israel)"),
  rel('ISR','SYR',-0.48,-0.80, 0,    "Israel struck Syrian/Iranian assets 400+ times; toppled Assad's weapons stockpiles Dec 2024; Golan Heights annexed"),
  // ── EGYPT ───────────────────────────────────────────────────────────────
  rel('EGY','ETH',-0.40,-0.35, 1,    "Grand Ethiopian Renaissance Dam (GERD) — existential water security threat; Egypt threatened military strikes"),
  rel('EGY','LBY', 0.28, 0.18, 2,    "Egypt backs Haftar/LNA (east Libya) — strategic interest in stable western border; Tripoli remains rival"),
  rel('EGY','SDN',-0.18, 0.12, 2,    "Halayeb Triangle dispute — Sudan civil war 2023 creates refugee crisis and border instability"),
  rel('EGY','QAT', 0.12, 0.32, 3,    "Egypt led 2017 Qatar blockade — formal reconciliation 2021 but Qatar-Muslim Brotherhood issue lingers"),
  rel('EGY','TUR',-0.18, 0.32, 7,    "Egypt expelled Turkish ambassador 2013 (Sisi-Erdogan MB issue) — normalized 2023; trade growing"),
  rel('EGY','IRQ', 0.38, 0.30, 3,    "Arab solidarity, Egyptian workers in Iraq — Iraq-Egypt-Jordan development corridor announced 2019"),
  // ── UKRAINE ─────────────────────────────────────────────────────────────
  rel('UKR','POL', 0.82, 0.55, 10,   "Poland hosts 1M+ Ukrainian refugees, key logistics hub — some friction over Ukrainian grain undercutting Polish farmers"),
  rel('UKR','CZE', 0.78, 0.45, 6,    "Czech Republic organized EU-wide 800,000 shell initiative — Czech 'ammunition coalition' for Ukraine"),
  rel('UKR','EST', 0.88, 0.38, 3,    "Estonia spends 3.5% GDP on Ukraine aid (highest in EU per capita) — Kallas (PM→EU Commission) championed Ukraine"),
  rel('UKR','LVA', 0.85, 0.35, 3,    "Latvia strong supporter — Rinkevics (President) pushed EU on Ukraine; Latvian volunteers"),
  rel('UKR','LTU', 0.85, 0.35, 3,    "Lithuania strong supporter — first NATO member to call it a genocide; Kaliningrad corridor dispute"),
  rel('UKR','ISR', 0.20, 0.20, 2,    "Israel refused offensive weapons — Zelensky frustrated; some Iron Dome components shared; tech cooperation"),
  rel('UKR','BLR',-0.82,-0.88, 0,    "Belarus served as Russian invasion launch pad — total trade cutoff; Lukashenko hosts Russian nuclear weapons"),
  rel('UKR','TUR', 0.58, 0.48, 8,    "Turkey sells Bayraktar drones (critical 2022), mediates Grain Deal, controls Bosphorus straits — Ukraine grateful"),
  rel('UKR','HUN',-0.32,-0.20, 5,    "Orban repeatedly blocks EU Ukraine aid, energy waivers — large Hungarian minority in Transcarpathia; gas transit"),
  // ── TAIWAN ──────────────────────────────────────────────────────────────
  rel('TWN','JPN', 0.65, 0.70, 82,   "Japan-Taiwan relations close despite no formal ties — TSMC Kumamoto fab; Japan is Taiwan's key security partner"),
  rel('TWN','AUS', 0.48, 0.52, 18,   "Australia supports Taiwan informally — significant semiconductor+electronics trade"),
  rel('TWN','KOR', 0.52, 0.70, 40,   "Semiconductor rivalry (TSMC vs Samsung) and cooperation — both rely on US for security vs China"),
  rel('TWN','SGP', 0.42, 0.62, 32,   "Singapore-Taiwan trade significant — semiconductor supply chain; Singapore avoids overt political support"),
  // ── IRAQ ────────────────────────────────────────────────────────────────
  rel('IRQ','GBR', 0.28, 0.32, 6,    "UK was coalition partner 2003 — Chilcot Report condemned Iraq invasion; security cooperation continues"),
  rel('IRQ','JOR', 0.42, 0.48, 6,    "Jordan-Iraq Economic Corridor — oil pipeline; Jordanian imports of Iraqi oil at discount"),
  rel('IRQ','TUR', 0.25, 0.42, 18,   "Turkey builds water dams reducing Tigris flow into Iraq — PKK airstrikes in N Iraq; major trade"),
  rel('IRQ','KWT',-0.20, 0.42, 10,   "Iraq invaded Kuwait 1990 — still paying war reparations; border disputes; Kuwait concerned about Iran-Iraq ties"),
  // ── POLAND ──────────────────────────────────────────────────────────────
  rel('POL','LTU', 0.78, 0.45, 8,    "NATO frontline neighbors — Suwalki Gap (88km land border between Russia+Belarus) is NATO's most vulnerable point"),
  rel('POL','CZE', 0.72, 0.65, 38,   "Visegrad Group (V4) — close neighbors, strong manufacturing trade; Czech-Polish coal border friction"),
  rel('POL','HUN', 0.38, 0.45, 22,   "Both Visegrad — Poland deeply opposed to Hungary-Russia ties; Tusk government reversed PiS-Orban axis"),
  rel('POL','BLR',-0.72,-0.78, 0,    "Belarus weaponized migrants at Polish border — Poland built steel border wall; full sanctions"),
  // ── INDONESIA ───────────────────────────────────────────────────────────
  rel('IDN','AUS', 0.58, 0.55, 18,   "Comprehensive Strategic Partnership — East Timor independence (1999) historical wound healed; joint exercises"),
  rel('IDN','SAU', 0.48, 0.40, 14,   "Muslim solidarity — Saudi Aramco investment in Indonesian refinery; large Indonesian hajj pilgrims (221,000/yr)"),
  rel('IDN','JPN', 0.60, 0.65, 45,   "Japan is top FDI source and development partner — Nickel+battery supply chain investment"),
  rel('IDN','MYS', 0.45, 0.55, 35,   "ASEAN partners — maritime border disputes in Celebes Sea; Sabah territorial claim from Malaysia side"),
  rel('IDN','SGP', 0.55, 0.65, 48,   "Singapore is biggest investor in Indonesia — Batam+Bintan economic zones; sand export disputes"),
  rel('IDN','IND', 0.42, 0.40, 28,   "India-Indonesia $50B target — defence (BrahMos missiles discussed); both non-aligned large democracies"),
  // ── PAKISTAN ────────────────────────────────────────────────────────────
  rel('PAK','AFG',-0.15, 0.20, 4,    "Pakistan funded Taliban for decades — TTP attacks from Afghanistan strained ties; border closed periodically"),
  rel('PAK','IRN', 0.22, 0.25, 3,    "Sunni-Shia tension — 2024 mutual border strikes (Iran struck Jaish al-Adl, Pakistan struck back); trade via Gwadar"),
  rel('PAK','SAU', 0.60, 0.48, 10,   "Muslim solidarity — Saudi $3B bailout (2023); Pakistani pilots in Saudi Air Force; OIC coordination"),
  rel('PAK','TUR', 0.68, 0.42, 9,    "Muslim solidarity, defence (Bayraktar TB2, MILGEM corvettes ordered) — Turkey-Pakistan-Azerbaijan triangle"),
  // ── NORTH KOREA ─────────────────────────────────────────────────────────
  rel('PRK','RUS', 0.72, 0.38, 3,    "10,000+ NK troops deployed to Russia for Ukraine war (2024) — deepest military cooperation since Cold War; shells+ballistic missiles"),
  rel('PRK','IRN', 0.40, 0.12, 0,    "Ballistic missile technology exchange, sanctions evasion cooperation — both pariah states vs. US"),
  // ── AZERBAIJAN ──────────────────────────────────────────────────────────
  rel('AZE','ARM',-0.92,-0.80, 0,    "Nagorno-Karabakh 44-Day War (2020) then Sept 2023 offensive — Azerbaijan took full territory; 100,000 Armenians fled"),
  rel('AZE','IRN',-0.30, 0.25, 3,    "Iran sees secular, Turkic, Israeli-armed Azerbaijan as threat — supported Armenia; but gas trade continues"),
  rel('AZE','RUS', 0.30, 0.42, 5,    "Russia CSTO-allied Armenia but Azerbaijan gained regional independence — Aliyev balances Russia and West"),
  rel('AZE','ISR', 0.68, 0.58, 4,    "Israel buys 40% Azeri oil, sells Harop+Spike drones — de facto military alliance neither publicizes"),
  // ── ARMENIA ─────────────────────────────────────────────────────────────
  rel('ARM','FRA', 0.65, 0.35, 2,    "France supplied weapons (Bastion APCs, Caesar howitzers) to Armenia — 700,000 Armenian diaspora in France"),
  rel('ARM','IND', 0.55, 0.28, 2,    "India supplies Pinaka rocket systems, Akash air defense — India hedging vs Pakistan-Turkey-Azerbaijan axis"),
  rel('ARM','RUS', 0.42, 0.45, 4,    "CSTO ally — Armenia freezing CSTO membership after Russia failed to help in 2023 Karabakh; pivoting to EU"),
  // ── VIETNAM ─────────────────────────────────────────────────────────────
  rel('VNM','AUS', 0.55, 0.52, 15,   "Comprehensive Strategic Partnership 2024 — growing Vietnamese diaspora; Australia is key iron ore+education partner"),
  rel('VNM','KOR', 0.65, 0.75, 85,   "South Korea is top investor — Samsung (biggest Vietnam employer, 60,000 workers), LG, Hyundai factories"),
  rel('VNM','JPN', 0.60, 0.58, 40,   "Japan is major ODA+FDI partner — Japanese companies shift China production to Vietnam"),
  rel('VNM','IND', 0.52, 0.42, 18,   "BrahMos missiles (Vietnam buying), shared China concerns, ASEAN-India alignment"),
  // ── SINGAPORE ───────────────────────────────────────────────────────────
  rel('SGP','MYS', 0.48, 0.68, 48,   "Johor Strait linked — water supply (60% of Singapore's water), HSR project, causeway; Forest City dispute"),
  rel('SGP','IND', 0.62, 0.65, 35,   "CECA FTA, large Indian diaspora — Singapore is top India FDI source; India-Singapore financial corridors"),
  rel('SGP','AUS', 0.65, 0.65, 28,   "Five Power Defence Arrangements (1971) — training in Australia; major trade and investment hub"),
  // ── SOUTH AFRICA ────────────────────────────────────────────────────────
  rel('ZAF','ZMB', 0.50, 0.45, 5,    "SADC — South Africa is Zambia's main investor; copper-cobalt supply chain integration"),
  rel('ZAF','ZWE', 0.38, 0.45, 6,    "SADC — 3M+ Zimbabwean immigrants in SA; trade but Zanu-PF regime criticism"),
  rel('ZAF','MOZ', 0.50, 0.42, 6,    "SADC — South Africa sent SANDF troops to fight IS-linked insurgency in Cabo Delgado (Operation Vikela)"),
  rel('ZAF','IND', 0.48, 0.45, 15,   "BRICS founding partner — large Indian diaspora; India-South Africa G20 joint declaration"),
  rel('ZAF','NGA', 0.38, 0.35, 8,    "Occasional rivalry for Africa leadership in AU — ECOWAS vs SADC on Sahel coups"),
  rel('ZAF','CHN', 0.48, 0.55, 52,   "BRICS — Ramaphosa hosts BRICS summit 2023; Chinese FDI in mining, ports; SA declined to arrest Putin"),
  // ── ARGENTINA ───────────────────────────────────────────────────────────
  rel('ARG','GBR',-0.42, 0.38, 8,    "Falklands/Malvinas — 1982 war; Milei government warmer to UK than predecessors; re-engagement talks"),
  rel('ARG','CHL',-0.08, 0.45, 10,   "Beagle Channel dispute resolved 1984 — shared Patagonia, energy grid; Milei-Boric ideological clash"),
  rel('ARG','URY', 0.55, 0.62, 12,   "MERCOSUR — close ties; 2006 Botnia paper mill dispute resolved; River Plate bridge project"),
  rel('ARG','BRZ', 0.52, 0.62, 42,   "MERCOSUR anchor pair — Lula-Milei ideological clash but too economically integrated to decouple"),
  // ── COLOMBIA ────────────────────────────────────────────────────────────
  rel('COL','VEN',-0.20, 0.20, 4,    "2M+ Venezuelan refugees in Colombia — Petro normalized relations with Maduro but ideological tension"),
  rel('COL','CHL', 0.52, 0.48, 6,    "Pacific Alliance partners — free trade; Petro-Boric shared progressive agenda"),
  rel('COL','ECU', 0.35, 0.42, 5,    "Colombia FARC spillover creates Ecuador security crisis — Noboa declared war on cartels 2024"),
  // ── NIGERIA ─────────────────────────────────────────────────────────────
  rel('NGA','GHA', 0.45, 0.45, 7,    "West African neighbors — ECOWAS, AfCFTA trade; GH-Nigeria gas pipeline; remittance competition"),
  rel('NGA','ETH', 0.38, 0.22, 3,    "AU partners, Africa's two most populous nations — competing for continental leadership"),
  rel('NGA','NER',-0.20, 0.20, 4,    "ECOWAS threatened military intervention after Niger coup July 2023 — strained; coup junta expelled French troops"),
  rel('NGA','CMR', 0.30, 0.35, 5,    "Bakassi Peninsula ICJ ruling (2002) went to Cameroon — sensitive border fully transferred 2008"),
  // ── GEORGIA ─────────────────────────────────────────────────────────────
  rel('GEO','USA', 0.55, 0.32, 3,    "Aspirational NATO member — US sanctioned Georgian Dream government's foreign agents law (2024)"),
  rel('GEO','EU',  0.60, 0.55, 5,    "EU candidate status 2023 — then frozen after foreign agents law; massive pro-EU protests 2024"),
  // ── CUBA ────────────────────────────────────────────────────────────────
  rel('CUB','RUS', 0.55, 0.32, 3,    "Soviet-era patron — Cuba hosts Russian SIGINT facility at Lourdes; Russian frigate visits Havana harbor"),
  rel('CUB','CHN', 0.58, 0.38, 3,    "Chinese investment+aid — China/Cuba intelligence listening post in Cuba targeting US (reported 2023)"),
  rel('CUB','VEN', 0.70, 0.42, 4,    "Bolivarian Alliance (ALBA) — Cuba sends 20,000+ doctors, gets Venezuelan oil; intelligence sharing"),
  // ── VENEZUELA ───────────────────────────────────────────────────────────
  rel('VEN','RUS', 0.55, 0.30, 3,    "Russia supports Maduro with weapons, oil tankers, S-300 systems, Wagner mercenaries"),
  rel('VEN','CUB', 0.70, 0.42, 4,    "Bolivarian Alliance — Cuba provides intelligence+security apparatus; keeps Maduro in power"),
  rel('VEN','CHN', 0.48, 0.35, 8,    "China lent $60B to Venezuela; recovering debts via discounted oil shipments; PDVSA-CNOOC partnership"),
  rel('VEN','COL',-0.22, 0.22, 4,    "Maduro-Petro normalized 2022 — 2M+ refugees in Colombia; ideological alignment vs. US"),
  // ── KAZAKHSTAN ──────────────────────────────────────────────────────────
  rel('KAZ','USA', 0.40, 0.45, 7,    "Tengiz-Chevroil ($37B oil project) — US wants Caspian route bypassing Russia; Kazakhstan neutral on Ukraine"),
  rel('KAZ','UZB', 0.62, 0.65, 8,    "SCO neighbors — joint water management (Aral Sea), growing trade, Uzbekistan is Kazakhstan's main export market"),
  rel('KAZ','TUR', 0.48, 0.52, 8,    "Turkic Council (OTS) — growing economic and cultural ties; Turkish construction sector in Kazakhstan"),
  // ── ISRAEL-ADJACENT ─────────────────────────────────────────────────────
  rel('PSE','EGY', 0.35, 0.22, 2,    "Egypt mediates Hamas-Israel ceasefire talks — Rafah crossing is Gaza's main lifeline; Egypt wary of Gazan influx"),
  rel('PSE','QAT', 0.52, 0.35, 1,    "Qatar is Hamas political bureau host (Doha) — funds Gaza reconstruction, mediates between Hamas and Israel"),
  rel('PSE','JOR', 0.42, 0.28, 1,    "Jordan is custodian of Jerusalem's holy sites — 2M+ Palestinian refugees in Jordan; peace treaty with Israel"),
  // ── GREENLAND / ARCTIC ───────────────────────────────────────────────────
  rel('GRL','DNK', 0.60, 0.80, 2,    "Autonomous territory of Denmark — self-governance since 2009; 97% of defense/foreign policy via Copenhagen"),
  rel('GRL','USA', 0.48, 0.52, 1,    "Trump offered to buy Greenland 2019+2025 — strategic Arctic/NORAD interest; Thule/Pituffik Air Base"),
  rel('GRL','CHN', 0.12, 0.35, 0,    "China sought mining rights in Greenland — rare earth deposits; US+Denmark blocked Chinese investment in 2018-19"),
];

export const RELATIONSHIP_MAP = new Map<string, Relationship>();
for (const r of RELATIONSHIPS) {
  RELATIONSHIP_MAP.set(`${r.source}-${r.target}`, r);
  RELATIONSHIP_MAP.set(`${r.target}-${r.source}`, r);
}

export function getRelationship(a: string, b: string): Relationship | undefined {
  return RELATIONSHIP_MAP.get(`${a}-${b}`);
}

export function getRelationshipsFor(countryId: string): Relationship[] {
  const manual = RELATIONSHIPS.filter(r => r.source === countryId || r.target === countryId);
  const coveredIds = new Set(manual.map(r => r.source === countryId ? r.target : r.source));
  coveredIds.add(countryId);

  const BLOC_ORDER = [NATO, EU, FIVE_EYES, AUKUS, QUAD, G7, CSTO, SCO, BRICS, GCC, ASEAN, MERCOSUR, ARAB_LEAGUE, AU];
  const auto: Relationship[] = [];
  const seen = new Set<string>();
  for (const bloc of BLOC_ORDER) {
    if (!bloc.has(countryId)) continue;
    for (const otherId of bloc) {
      if (otherId === countryId || coveredIds.has(otherId) || seen.has(otherId)) continue;
      const b = blocScore(countryId, otherId);
      if (b) {
        const s = +(b.polScore * 0.55 + b.ecoScore * 0.45).toFixed(3);
        const t = s >= 0.7 ? 'allied' : s >= 0.3 ? 'friendly' : 'neutral';
        auto.push({ source: countryId, target: otherId, polScore: b.polScore, ecoScore: b.ecoScore, score: s, type: t, trade: 0, polNotes: b.polNotes, ecoNotes: b.ecoNotes, isBloc: true });
        seen.add(otherId);
      }
    }
  }
  return [...manual, ...auto].sort((a, b) => b.score - a.score);
}

// Continuous gradient: hostile(red) → neutral(yellow) → allied(green)
const COLOR_STOPS: Array<[number, [number, number, number]]> = [
  [-1.00, [220, 38,  38]],
  [-0.30, [239, 100, 30]],
  [ 0.00, [234, 179, 8]],
  [ 0.35, [163, 230, 53]],
  [ 1.00, [22,  163, 74]],
];

export function getScoreColor(score: number): string {
  const s = Math.max(-1, Math.min(1, score));
  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    const [s0, c0] = COLOR_STOPS[i];
    const [s1, c1] = COLOR_STOPS[i + 1];
    if (s <= s1 || i === COLOR_STOPS.length - 2) {
      const t = Math.max(0, Math.min(1, (s - s0) / (s1 - s0)));
      const r = Math.round(c0[0] + t * (c1[0] - c0[0]));
      const g = Math.round(c0[1] + t * (c1[1] - c0[1]));
      const b = Math.round(c0[2] + t * (c1[2] - c0[2]));
      return `rgb(${r},${g},${b})`;
    }
  }
  return 'rgb(41,55,75)';
}

export function getScoreLabel(score: number): string {
  if (score >= 0.7)  return 'Allied';
  if (score >= 0.3)  return 'Friendly';
  if (score >= -0.1) return 'Neutral';
  if (score >= -0.5) return 'Tense';
  return 'Hostile';
}
