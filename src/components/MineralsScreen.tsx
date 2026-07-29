import { useCallback, useRef, useState } from 'react';
import MineralsMap, { type Metric } from './MineralsMap';
import MineralDetail from './MineralDetail';
import SearchBar from './SearchBar';
import { ALL_COUNTRIES, getFlag } from '../data/allCountries';
import { MINERALS_BY_KEY } from '../data/criticalMinerals/minerals';
import type { MineralStage } from '../types/criticalMinerals';

interface Props {
  isMobile?: boolean;
  onBackToMenu: () => void;
}

export default function MineralsScreen({ isMobile, onBackToMenu }: Props) {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);
  const [activeContext, setActiveContext] = useState<{ mineral: string; stage: MineralStage | 'downstream'; metric: Metric }>({
    mineral: 'Lithium', stage: 'raw', metric: 'production',
  });
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(0);

  const handleSelectCountry = useCallback((id: string | null) => {
    setSelectedFacility(null);
    setSelectedCountry(id);
  }, []);

  const handleSelectFacility = useCallback((id: string | null) => {
    if (id) setSelectedCountry(null);
    setSelectedFacility(id);
  }, []);

  const onDragStart = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    startX.current = e.clientX;
    startW.current = sidebarWidth;
    const onMove = (ev: MouseEvent) => {
      if (!dragging.current) return;
      const delta = startX.current - ev.clientX;
      setSidebarWidth(Math.max(240, Math.min(580, startW.current + delta)));
    };
    const onUp = () => {
      dragging.current = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [sidebarWidth]);

  const country = selectedCountry ? ALL_COUNTRIES[selectedCountry] : null;
  const meta = MINERALS_BY_KEY[activeContext.mineral];
  const sidebarLabel = selectedFacility ? 'Facility' : selectedCountry ? 'Country Profile' : 'Select a Country or Facility';

  return (
    <div className="flex flex-col h-screen" style={{ background: '#060c14' }}>
      <header
        className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
        style={{ borderBottom: '1px solid #1e3a5f', background: 'rgba(6,9,20,0.97)' }}
      >
        <div className="flex items-center gap-4">
          <button onClick={onBackToMenu} className="flex items-center gap-2 cursor-pointer" title="Back to menu">
            <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white" style={{ background: '#2563eb' }}>GP</div>
            <span className="font-semibold text-white text-sm tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Global Pulse
            </span>
          </button>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(217,89,38,0.18)', color: '#fb923c', border: '1px solid rgba(217,89,38,0.35)' }}>
            Critical Minerals
          </span>
          <span className="text-xs hidden sm:block" style={{ color: '#1f3145' }}>
            Production · Refining · Trade
          </span>
        </div>

        <div className="flex items-center gap-3">
          <SearchBar onSelect={id => { setSelectedFacility(null); setSelectedCountry(id); }} />
          {country && (
            <div className="flex items-center gap-1.5 rounded px-2.5 py-1" style={{ background: 'rgba(217,89,38,0.15)', border: '1px solid rgba(217,89,38,0.3)' }}>
              <span className="text-sm">{getFlag(country.iso2)}</span>
              <span className="text-xs" style={{ color: '#d1d5db' }}>{country.name}</span>
              <button onClick={() => handleSelectCountry(null)} className="ml-1 text-xs" style={{ color: '#6b7280' }}>✕</button>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative min-w-0">
          <MineralsMap
            selectedCountry={selectedCountry}
            onSelectCountry={handleSelectCountry}
            isMobile={isMobile}
            selectedFacility={selectedFacility}
            onSelectFacility={handleSelectFacility}
            onActiveContextChange={setActiveContext}
          />
        </div>

        <div
          onMouseDown={onDragStart}
          className="flex-shrink-0 cursor-col-resize relative z-10 select-none"
          style={{ width: 5, background: '#0c1a28', borderLeft: '1px solid #1e3a5f', borderRight: '1px solid #1e3a5f' }}
          title="Drag to resize"
        >
          <div className="absolute inset-y-0 -left-1 -right-1" />
        </div>

        <div
          className="flex-shrink-0 flex flex-col overflow-hidden"
          style={{ width: sidebarWidth, borderLeft: '1px solid #1e3a5f', background: 'rgba(6,9,20,0.97)' }}
        >
          <div className="px-4 py-2.5 flex-shrink-0" style={{ borderBottom: '1px solid #1e3a5f' }}>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#fb923c', fontFamily: "'Space Grotesk', sans-serif" }}>
              {sidebarLabel}
            </span>
          </div>
          <div className="flex-1 overflow-hidden">
            {selectedCountry || selectedFacility ? (
              <MineralDetail
                countryId={selectedCountry}
                facilityId={selectedFacility}
                mineral={activeContext.mineral}
                stage={activeContext.stage}
                metric={activeContext.metric}
                onSelectCountry={handleSelectCountry}
                onSelectFacility={handleSelectFacility}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <div className="text-5xl mb-4">⛏</div>
                <div className="text-sm font-semibold mb-2 text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Explore critical minerals
                </div>
                <div className="text-xs leading-relaxed mb-4" style={{ color: '#4b5563' }}>
                  Click any country to see its production, refining and trade in {meta?.label ?? activeContext.mineral}.
                  Click a facility marker to see mine/smelter/refinery details.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
