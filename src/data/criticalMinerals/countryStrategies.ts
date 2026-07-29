// Hand-authored, web-verified (same standard as the Middle East historical-relations
// fact-check elsewhere in this app — real dated policy actions, not vibes). v1 scope
// is USA + South Korea only, per explicit request; extend deliberately, not by default.

import type { MineralCountryStrategy } from '../../types/criticalMinerals';

export const COUNTRY_STRATEGIES: Record<string, MineralCountryStrategy> = {
  USA: {
    countryId: 'USA',
    posture: 'diversifying',
    summary:
      "Washington has moved from subsidizing mineral processing at arm's length to directly owning stakes in it, treating rare-earth and battery-mineral supply chains as a national-security problem on the same footing as energy. Recent policy layers Defense Production Act authority, direct government equity, and price-floor guarantees on top of the older tax-credit approach — a shift from nudging the market to backstopping it.",
    initiatives: [
      {
        year: 2022,
        title: 'IRA Section 45X production credit',
        note: 'Inflation Reduction Act tax credit subsidizing domestic production of battery components and processed critical minerals; the 2025 "One Big Beautiful Bill Act" narrowed and set a phase-out beginning 2031, ending 2034.',
      },
      {
        year: 2025,
        title: 'Executive Order 14241 invokes the Defense Production Act',
        note: '"Immediate Measures to Increase American Mineral Production" (Mar) streamlines permitting and directs the Department of War and DFC to set up a joint minerals investment fund.',
      },
      {
        year: 2025,
        title: 'DoD takes an equity stake in MP Materials',
        note: 'First time the federal government becomes a top shareholder in a critical-minerals company: $400M equity stake, $150M loan for heavy rare-earth separation, and a 10-year price floor of $110/kg for neodymium-praseodymium (roughly double the market price at signing) with 100% of the new magnet plant’s output guaranteed for purchase.',
      },
      {
        year: 2025,
        title: 'Industrial Base Fund expansion',
        note: 'The 2025 budget reconciliation act ("OBBBA") adds $5B to the Industrial Base Fund for mineral supply chains, plus $500M more for the DoD Office of Strategic Capital and $1B for further Defense Production Act financing through Sept 2027.',
      },
    ],
  },

  KOR: {
    countryId: 'KOR',
    posture: 'diversifying',
    summary:
      "Seoul isn't trying to fully decouple from Chinese mineral supply — its battery and chip industries depend on it too heavily for a clean break to be realistic — but it is running a structured hedging strategy: cut import concentration gradually, build offshore refining capacity through POSCO and other conglomerates, and keep a formal channel open to Beijing so a future export-control shock doesn't blindside Korean manufacturers. Progress is real but uneven — some dependencies have gotten worse even as the government pushes to cut others.",
    initiatives: [
      {
        year: 2024,
        title: 'National target: cut import reliance and China concentration',
        note: 'Government roadmap aims to cut overall import reliance for lithium, cobalt, graphite and other key minerals from ~80% to 50% by 2030, and cut the specific share sourced from China from ~70% to 60% by 2027 and 50% by 2030, via four pillars: domestic sourcing, diversification, stockpiling, and recycling.',
      },
      {
        year: 2024,
        title: 'Chairs the Minerals Security Partnership',
        note: 'South Korea assumed the rotating chairmanship (from Jul) of the US-founded 14-plus-EU coalition (with Japan, Australia, Canada and others) coordinating allied critical-mineral supply chains.',
      },
      {
        year: 2025,
        title: 'POSCO builds an offshore refining and separation network',
        note: "POSCO group ventures span a Malaysia-Laos rare-earth separation JV targeting 4,500 tonnes/year, an MOU with US-based Energy Fuels for an integrated rare-earth-and-magnet complex in the United States, and participation (with Australia's Black Rock Mining) in the Mahenge graphite project in Tanzania.",
      },
      {
        year: 2030,
        title: 'Recycling target',
        note: 'Roadmap target to raise the recycled-material share of critical mineral supply from ~2% to over 20% by 2030, backed by financial support and R&D tax incentives for domestic recycling firms.',
      },
      {
        year: 2026,
        title: "Where diversification is losing ground",
        note: "Despite the broader push, China's share of Korea's indium imports rose from 44.1% (2015) to 94.2% (2025), and reporting in mid-2026 flagged deepening graphite reliance on China even as the government calls for faster overseas mineral development — a reminder the strategy is a multi-year hedge, not a solved problem.",
      },
    ],
  },
};
