import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { Topology } from 'topojson-specification';

// Complete ISO numeric → alpha-3 for every feature in world-atlas 50m. Shared by every
// map that renders this topojson (WorldMap, MineralsMap, ...).
export const N2A: Record<number, string> = {
  4:'AFG', 8:'ALB', 12:'DZA', 16:'ASM', 20:'AND', 24:'AGO', 28:'ATG',
  31:'AZE', 32:'ARG', 36:'AUS', 40:'AUT', 44:'BHS', 48:'BHR', 50:'BGD',
  51:'ARM', 52:'BRB', 56:'BEL', 60:'BMU', 64:'BTN', 68:'BOL', 70:'BIH',
  72:'BWA', 76:'BRA', 84:'BLZ', 86:'IOT', 90:'SLB', 92:'VGB', 96:'BRN',
  100:'BGR', 104:'MMR', 108:'BDI', 112:'BLR', 116:'KHM', 120:'CMR',
  124:'CAN', 132:'CPV', 136:'CYM', 140:'CAF', 144:'LKA', 148:'TCD',
  152:'CHL', 156:'CHN', 158:'TWN', 170:'COL', 174:'COM', 178:'COG',
  180:'COD', 184:'COK', 188:'CRI', 191:'HRV', 192:'CUB', 196:'CYP',
  203:'CZE', 204:'BEN', 208:'DNK', 212:'DMA', 214:'DOM', 218:'ECU',
  222:'SLV', 226:'GNQ', 231:'ETH', 232:'ERI', 233:'EST', 234:'FRO',
  238:'FLK', 242:'FJI', 246:'FIN', 250:'FRA', 258:'PYF', 262:'DJI',
  266:'GAB', 268:'GEO', 270:'GMB', 275:'PSE', 276:'DEU', 288:'GHA',
  296:'KIR', 300:'GRC', 304:'GRL', 308:'GRD', 316:'GUM', 320:'GTM',
  324:'GIN', 328:'GUY', 332:'HTI', 336:'VAT', 340:'HND', 344:'HKG',
  348:'HUN', 352:'ISL', 356:'IND', 360:'IDN', 364:'IRN', 368:'IRQ',
  372:'IRL', 376:'ISR', 380:'ITA', 384:'CIV', 388:'JAM', 392:'JPN',
  398:'KAZ', 400:'JOR', 404:'KEN', 408:'PRK', 410:'KOR', 414:'KWT',
  417:'KGZ', 418:'LAO', 422:'LBN', 426:'LSO', 428:'LVA', 430:'LBR',
  434:'LBY', 438:'LIE', 440:'LTU', 442:'LUX', 446:'MAC', 450:'MDG',
  454:'MWI', 458:'MYS', 462:'MDV', 466:'MLI', 470:'MLT', 478:'MRT',
  480:'MUS', 484:'MEX', 492:'MCO', 496:'MNG', 498:'MDA', 499:'MNE',
  500:'MSR', 504:'MAR', 508:'MOZ', 512:'OMN', 516:'NAM', 520:'NRU',
  524:'NPL', 528:'NLD', 531:'CUW', 533:'ABW', 534:'SXM', 540:'NCL',
  548:'VUT', 554:'NZL', 558:'NIC', 562:'NER', 566:'NGA', 578:'NOR',
  580:'MNP', 583:'FSM', 584:'MHL', 585:'PLW', 586:'PAK', 591:'PAN',
  598:'PNG', 600:'PRY', 604:'PER', 608:'PHL', 616:'POL', 620:'PRT',
  624:'GNB', 626:'TLS', 630:'PRI', 634:'QAT', 642:'ROU', 643:'RUS',
  646:'RWA', 652:'BLM', 654:'SHN', 659:'KNA', 660:'AIA', 662:'LCA',
  663:'MAF', 666:'SPM', 670:'VCT', 674:'SMR', 678:'STP', 682:'SAU',
  686:'SEN', 688:'SRB', 690:'SYC', 694:'SLE', 702:'SGP', 703:'SVK',
  704:'VNM', 705:'SVN', 706:'SOM', 710:'ZAF', 716:'ZWE', 724:'ESP',
  728:'SSD', 729:'SDN', 732:'ESH', 740:'SUR', 748:'SWZ', 752:'SWE',
  756:'CHE', 760:'SYR', 762:'TJK', 764:'THA', 768:'TGO', 776:'TON',
  780:'TTO', 784:'ARE', 788:'TUN', 792:'TUR', 795:'TKM', 796:'TCA',
  800:'UGA', 804:'UKR', 807:'MKD', 818:'EGY', 826:'GBR', 831:'GGY',
  832:'JEY', 833:'IMN', 834:'TZA', 840:'USA', 850:'VIR', 854:'BFA',
  858:'URY', 860:'UZB', 862:'VEN', 876:'WLF', 882:'WSM', 887:'YEM',
  894:'ZMB',
};

export function alpha3FromNumeric(id: number): string | null {
  return N2A[id] ?? null;
}

/** Builds the same Natural Earth projection every map in this app uses, sized to the container. */
export function buildProjection(w: number, h: number) {
  return d3.geoNaturalEarth1().scale(w / 6.2).translate([w / 2, h / 2]);
}

/**
 * Shared world-topology plumbing: fetches the world-atlas 50m topojson once, tracks
 * container size via ResizeObserver, and exposes the ISO numeric→alpha3 table. Every
 * map component (WorldMap, MineralsMap, ...) mounts its own <svg> and D3 render logic
 * against these — this hook only owns the parts that are identical across all of them.
 */
export function useWorldTopology() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [topoData, setTopoData] = useState<Topology | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json')
      .then(r => r.json()).then(setTopoData).catch(console.error);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    let prevW = 0, prevH = 0;
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0 && (Math.abs(width - prevW) > 10 || Math.abs(height - prevH) > 10)) {
        prevW = width; prevH = height;
        setDims({ w: width, h: height });
      }
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  return { containerRef, topoData, dims, N2A, alpha3FromNumeric, buildProjection };
}
