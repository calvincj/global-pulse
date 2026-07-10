export interface GdeltTone {
  score: number;      // -1 to +1 normalized
  rawTone: number;    // GDELT average tone (-10 typical range)
  articleCount: number;
  fromCache: boolean;
}

interface ToneRow { tonavg: number; tonemed: number; numarts: number; date?: string }
interface GdeltResponse { tonechart?: ToneRow[] }

const cache = new Map<string, GdeltTone | null>();
const inFlight = new Map<string, Promise<GdeltTone | null>>();

export async function getGdeltTone(a: string, b: string): Promise<GdeltTone | null> {
  const key = [a, b].sort().join('-');
  if (cache.has(key)) return { ...(cache.get(key)!), fromCache: true };
  if (inFlight.has(key)) return inFlight.get(key)!;

  const promise = (async () => {
    try {
      const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${a}+${b}&mode=tonechart&format=json&timespan=3m`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data: GdeltResponse = await res.json();
      const rows = data.tonechart;
      if (!rows?.length) return null;

      const recent = rows.slice(-12); // ~last month of weekly data
      const avgTone = recent.reduce((s, r) => s + r.tonavg, 0) / recent.length;
      const totalArts = recent.reduce((s, r) => s + (r.numarts ?? 0), 0);
      // GDELT tone is roughly -10 to +10; normalize to -1 to +1
      const score = Math.max(-1, Math.min(1, avgTone / 5));
      const result: GdeltTone = { score, rawTone: avgTone, articleCount: totalArts, fromCache: false };
      cache.set(key, result);
      return result;
    } catch {
      return null;
    }
  })();

  inFlight.set(key, promise);
  promise.finally(() => inFlight.delete(key));
  return promise;
}
