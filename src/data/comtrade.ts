// UN Comtrade Plus API — bilateral trade data
// Requires VITE_COMTRADE_API_KEY in .env.local

export interface ComtradeFlow {
  exports: number | null;   // USD
  imports: number | null;   // USD
  total:   number | null;   // USD
  year:    number;
}

// Alpha-3 → UN numeric ISO (matches Comtrade reporter/partner codes)
const A3N: Record<string, number> = {
  AFG:4,ALB:8,DZA:12,ASM:16,AND:20,AGO:24,ATG:28,AZE:31,ARG:32,AUS:36,
  AUT:40,BHS:44,BHR:48,BGD:50,ARM:51,BRB:52,BEL:56,BTN:64,BOL:68,BIH:70,
  BWA:72,BRA:76,BLZ:84,SLB:90,BRN:96,BGR:100,MMR:104,BDI:108,BLR:112,
  KHM:116,CMR:120,CAN:124,CPV:132,CAF:140,LKA:144,TCD:148,CHL:152,CHN:156,
  TWN:158,COL:170,COM:174,COG:178,COD:180,CRI:188,HRV:191,CUB:192,CYP:196,
  CZE:203,BEN:204,DNK:208,DOM:214,ECU:218,SLV:222,GNQ:226,ETH:231,ERI:232,
  EST:233,FJI:242,FIN:246,FRA:250,DJI:262,GAB:266,GEO:268,GMB:270,PSE:275,
  DEU:276,GHA:288,GRC:300,GTM:320,GIN:324,GUY:328,HTI:332,HND:340,HKG:344,
  HUN:348,ISL:352,IND:356,IDN:360,IRN:364,IRQ:368,IRL:372,ISR:376,ITA:380,
  CIV:384,JAM:388,JPN:392,KAZ:398,JOR:400,KEN:404,PRK:408,KOR:410,KWT:414,
  KGZ:417,LAO:418,LBN:422,LSO:426,LVA:428,LBR:430,LBY:434,LIE:438,LTU:440,
  LUX:442,MAC:446,MDG:450,MWI:454,MYS:458,MDV:462,MLI:466,MLT:470,MRT:478,
  MUS:480,MEX:484,MNG:496,MDA:498,MNE:499,MAR:504,MOZ:508,OMN:512,NAM:516,
  NPL:524,NLD:528,NZL:554,NIC:558,NER:562,NGA:566,NOR:578,PAK:586,PAN:591,
  PNG:598,PRY:600,PER:604,PHL:608,POL:616,PRT:620,GNB:624,TLS:626,QAT:634,
  ROU:642,RUS:643,RWA:646,SAU:682,SEN:686,SRB:688,SLE:694,SGP:702,SVK:703,
  VNM:704,SVN:705,SOM:706,ZAF:710,ZWE:716,ESP:724,SSD:728,SDN:729,SUR:740,
  SWZ:748,SWE:752,CHE:756,SYR:760,TJK:762,THA:764,TGO:768,TTO:780,ARE:784,
  TUN:788,TUR:792,TKM:795,UGA:800,UKR:804,MKD:807,EGY:818,GBR:826,TZA:834,
  USA:842,URY:858,UZB:860,VEN:862,WSM:882,YEM:887,ZMB:894,
};

const cache = new Map<string, ComtradeFlow | null>();
const inFlight = new Map<string, Promise<ComtradeFlow | null>>();
const API_KEY = import.meta.env.VITE_COMTRADE_API_KEY as string | undefined;

async function fetchFlow(reporter: number, partner: number, flow: 'X' | 'M'): Promise<number | null> {
  const url = `https://comtradeplus.un.org/TradeData/Yearly?typeCode=C&freqCode=A&clCode=HS&period=2023&reporterCode=${reporter}&partnerCode=${partner}&cmdCode=TOTAL&flowCode=${flow}&maxRecords=5&format=JSON`;
  const res = await fetch(url, { headers: { 'Ocp-Apim-Subscription-Key': API_KEY! } });
  if (!res.ok) return null;
  const json = await res.json();
  const row = json?.data?.[0];
  return row ? (row.fobvalue ?? row.cifvalue ?? row.primaryValue ?? null) : null;
}

export function hasComtradeKey(): boolean {
  return !!(API_KEY && API_KEY.length > 5);
}

export async function getComtradeBilateral(a: string, b: string): Promise<ComtradeFlow | null> {
  if (!hasComtradeKey()) return null;
  const key = [a, b].sort().join('-');
  if (cache.has(key)) return cache.get(key)!;
  if (inFlight.has(key)) return inFlight.get(key)!;

  const ra = A3N[a], rb = A3N[b];
  if (!ra || !rb) return null;

  const promise = (async () => {
    try {
      const [exp, imp] = await Promise.all([
        fetchFlow(ra, rb, 'X'),
        fetchFlow(rb, ra, 'X'), // partner's exports = our imports
      ]);
      const result: ComtradeFlow = {
        exports: exp,
        imports: imp,
        total: (exp != null && imp != null) ? exp + imp : (exp ?? imp),
        year: 2023,
      };
      cache.set(key, result);
      return result;
    } catch {
      cache.set(key, null);
      return null;
    }
  })();

  inFlight.set(key, promise);
  promise.finally(() => inFlight.delete(key));
  return promise;
}

export function fmtTrade(usd: number | null): string {
  if (usd == null) return '—';
  if (usd >= 1e12) return `$${(usd / 1e12).toFixed(2)}T`;
  if (usd >= 1e9)  return `$${(usd / 1e9).toFixed(1)}B`;
  if (usd >= 1e6)  return `$${(usd / 1e6).toFixed(0)}M`;
  return `$${usd.toLocaleString()}`;
}
