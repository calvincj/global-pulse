# Global Pulse

An interactive geopolitical dashboard that lets you explore relationships between countries around the world. Click on any country to see how it relates to everyone else, politically and economically. You can also scrub through a historical timeline to watch alliances and rivalries evolve from 2000 to today.

## What it does

- **Click any country** to see its bilateral relationships colored on the map. Green means allied, red means hostile, everything in between is somewhere on the spectrum.
- **Political vs Economic mode** lets you switch between diplomatic/security alignment and trade/sanctions data.
- **Historical timeline** at the bottom of the map. Hit play and watch the colors shift in real time as relationships change year by year.
- **Hover or click a second country** to pull up a detailed breakdown of the bilateral relationship, live news tone from GDELT, and trade data.
- **Disputed territories** like Kosovo, Somaliland, and Taiwan are included as selectable overlays.
- **Sidebar** shows country stats (GDP, population, etc.) that update when you scrub through history.

## Tech stack

- React + TypeScript, built with Vite
- D3.js for the SVG map (geoNaturalEarth1 projection)
- TopoJSON / world-atlas for country geometries
- Tailwind CSS for styling
- Space Grotesk + Space Mono fonts
- World Bank API for live and historical stats
- GDELT for live news sentiment

## Running locally

```bash
npm install
npm run dev
```

## Data notes

Relationship scores range from -1 (hostile) to +1 (allied). Political scores are calibrated against UN General Assembly voting similarity data. Economic scores reflect bilateral trade as a share of GDP, adjusted for sanctions and trade agreements. Historical snapshots are anchored to documented real-world events, not made up numbers.
