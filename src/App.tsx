import { useState, useRef, useEffect, useCallback } from 'react';
import WorldMap from './components/WorldMap';
import CountryProfile from './components/CountryProfile';
import RelationshipDetail from './components/RelationshipDetail';
import SearchBar from './components/SearchBar';
import IntroScreen from './components/IntroScreen';
import { ALL_COUNTRIES, getFlag } from './data/allCountries';
import type { MapMode } from './types';
import './index.css';

export default function App() {
  const [showIntro, setShowIntro]           = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [secondaryCountry, setSecondaryCountry] = useState<string | null>(null);
  const [hoveredCountry, setHoveredCountry]   = useState<string | null>(null);
  const [mode, setMode]                       = useState<MapMode>('political');
  const [sidebarWidth, setSidebarWidth]       = useState(320);
  const [timelineYear, setTimelineYear]       = useState<number | null>(null);
  const dragging   = useRef(false);
  const startX     = useRef(0);
  const startW     = useRef(0);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const activeHovered = isMobile ? secondaryCountry : hoveredCountry;

  const country = selectedCountry ? ALL_COUNTRIES[selectedCountry] : null;
  const total   = Object.keys(ALL_COUNTRIES).length;
  const showingRelationship = !!selectedCountry && !!activeHovered && activeHovered !== selectedCountry;

  const handleSelectCountry = useCallback((id: string | null) => {
    if (isMobile && selectedCountry && id && id !== selectedCountry) {
      setSecondaryCountry(id === secondaryCountry ? null : id);
      return;
    }
    setSecondaryCountry(null);
    setSelectedCountry(id);
    if (!id) setTimelineYear(null); // reset timeline when deselecting
  }, [isMobile, selectedCountry, secondaryCountry]);

  const onDragStart = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    startX.current   = e.clientX;
    startW.current   = sidebarWidth;

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

  const sidebarLabel = showingRelationship
    ? 'Bilateral Relationship'
    : selectedCountry
      ? (timelineYear != null ? `Historical · ${timelineYear}` : 'Country Profile')
      : 'Select a Country';

  return (
    <>
      {showIntro && <IntroScreen onEnter={() => setShowIntro(false)} />}

      <div className="flex flex-col h-screen" style={{ background: '#060c14' }}>
        {/* Top bar */}
        <header
          className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
          style={{ borderBottom: '1px solid #1e3a5f', background: 'rgba(6,9,20,0.97)' }}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white"
                style={{ background: '#2563eb' }}
              >GP</div>
              <span className="font-semibold text-white text-sm tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Global Pulse
              </span>
            </div>

            {/* Mode toggle */}
            <div className="flex items-center rounded-md overflow-hidden" style={{ border: '1px solid #1e3a5f' }}>
              <button
                onClick={() => setMode('political')}
                className="px-3 py-1 text-xs font-medium transition-colors"
                style={{
                  background: mode === 'political' ? 'rgba(37,99,235,0.35)' : 'transparent',
                  color: mode === 'political' ? '#93c5fd' : '#475569',
                  borderRight: '1px solid #1e3a5f',
                }}
              >Political</button>
              <button
                onClick={() => setMode('economic')}
                className="px-3 py-1 text-xs font-medium transition-colors"
                style={{
                  background: mode === 'economic' ? 'rgba(5,150,105,0.3)' : 'transparent',
                  color: mode === 'economic' ? '#6ee7b7' : '#475569',
                }}
              >Economic</button>
            </div>

            <span className="text-xs hidden sm:block" style={{ color: '#1f3145' }}>
              {mode === 'political' ? 'Alliances · Security · Diplomacy' : 'Trade · Investment · Sanctions'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <SearchBar onSelect={id => { setSecondaryCountry(null); setSelectedCountry(id); }} />
            {country && (
              <div
                className="flex items-center gap-1.5 rounded px-2.5 py-1"
                style={{ background: 'rgba(30,58,138,0.25)', border: '1px solid rgba(59,130,246,0.3)' }}
              >
                <span className="text-sm">{getFlag(country.iso2)}</span>
                <span className="text-xs" style={{ color: '#d1d5db' }}>{country.name}</span>
                <button
                  onClick={() => { setSelectedCountry(null); setSecondaryCountry(null); setTimelineYear(null); }}
                  className="ml-1 text-xs"
                  style={{ color: '#6b7280' }}
                >✕</button>
              </div>
            )}
          </div>
        </header>

        {/* Main layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Map */}
          <div className="flex-1 relative min-w-0">
            <WorldMap
              selectedCountry={selectedCountry}
              secondaryCountry={secondaryCountry}
              onSelectCountry={handleSelectCountry}
              onHoverCountry={setHoveredCountry}
              mode={mode}
              isMobile={isMobile}
              onTimelineYearChange={setTimelineYear}
            />
          </div>

          {/* Drag handle */}
          <div
            onMouseDown={onDragStart}
            className="flex-shrink-0 cursor-col-resize relative z-10 select-none"
            style={{ width: 5, background: '#0c1a28', borderLeft: '1px solid #1e3a5f', borderRight: '1px solid #1e3a5f' }}
            title="Drag to resize"
          >
            <div className="absolute inset-y-0 -left-1 -right-1" />
          </div>

          {/* Sidebar */}
          <div
            className="flex-shrink-0 flex flex-col overflow-hidden"
            style={{ width: sidebarWidth, borderLeft: '1px solid #1e3a5f', background: 'rgba(6,9,20,0.97)' }}
          >
            <div className="px-4 py-2.5 flex-shrink-0 flex items-center justify-between" style={{ borderBottom: '1px solid #1e3a5f' }}>
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#60a5fa', fontFamily: "'Space Grotesk', sans-serif" }}>
                {sidebarLabel}
              </span>
              {isMobile && selectedCountry && secondaryCountry && (
                <button className="text-xs" style={{ color: '#475569' }} onClick={() => setSecondaryCountry(null)}>Clear ✕</button>
              )}
            </div>

            <div className="flex-1 overflow-hidden">
              {showingRelationship ? (
                <RelationshipDetail
                  countryA={selectedCountry!}
                  countryB={activeHovered!}
                  mode={mode}
                  timelineYear={timelineYear}
                />
              ) : selectedCountry ? (
                <CountryProfile
                  countryId={selectedCountry}
                  mode={mode}
                  timelineYear={timelineYear}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <div className="text-5xl mb-4">🌍</div>
                  <div className="text-sm font-semibold mb-2 text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Explore global relationships
                  </div>
                  <div className="text-xs leading-relaxed mb-4" style={{ color: '#4b5563' }}>
                    Click any country to see its alliances, rivals, trade partners, and more.
                    {isMobile && ' Tap a second country to compare.'}
                  </div>
                  <div className="text-xs font-mono" style={{ color: '#374151' }}>{total} countries &amp; territories</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
