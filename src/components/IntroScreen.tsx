import { useState, useEffect } from 'react';

interface Props { onEnter: () => void }

export default function IntroScreen({ onEnter }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleEnter = () => {
    setVisible(false);
    setTimeout(onEnter, 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: 'radial-gradient(ellipse at 50% 40%, #071528 0%, #030810 70%)',
        transition: 'opacity 0.4s ease',
        opacity: visible ? 1 : 0,
      }}
    >
      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(37,99,235,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.04) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      {/* Glow orbs */}
      <div className="absolute" style={{ width: 600, height: 600, top: '10%', left: '50%', transform: 'translateX(-50%)', background: 'radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 65%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-2xl">
        {/* Logo mark */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded flex items-center justify-center font-bold text-sm text-white" style={{ background: '#2563eb', boxShadow: '0 0 20px rgba(37,99,235,0.5)' }}>GP</div>
        </div>

        {/* Title */}
        <h1
          className="text-6xl sm:text-7xl font-bold tracking-tight mb-6"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            background: 'linear-gradient(135deg, #e2e8f0 0%, #93c5fd 50%, #6ee7b7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: 1.05,
          }}
        >
          Global Pulse
        </h1>

        {/* Description */}
        <p className="text-base leading-relaxed mb-10 max-w-lg" style={{ color: '#64748b', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 400 }}>
          A geopolitics tracker I put together to map out how every country on Earth actually relates to each other.
          Political alliances, economic ties, rivalries — click any country and see who they're aligned with,
          who they're beefing with, and why. Data runs through 2025 because things keep changing.
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-8 mb-12">
          {[['195+', 'Countries'], ['800+', 'Relationships'], ['2025', 'Data Through']].map(([val, label]) => (
            <div key={label} className="text-center">
              <div className="text-xl font-bold" style={{ color: '#93c5fd', fontFamily: "'Space Mono', monospace" }}>{val}</div>
              <div className="text-xs mt-0.5" style={{ color: '#374151' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={handleEnter}
          className="px-10 py-3.5 rounded-lg font-semibold text-base text-white relative overflow-hidden transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            boxShadow: '0 0 30px rgba(37,99,235,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
            letterSpacing: '0.02em',
          }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 40px rgba(37,99,235,0.55), inset 0 1px 0 rgba(255,255,255,0.1)')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 30px rgba(37,99,235,0.35), inset 0 1px 0 rgba(255,255,255,0.1)')}
        >
          Explore the Map
        </button>

        <div className="mt-6 text-xs" style={{ color: '#1e2d3d' }}>
          Click any country to start
        </div>
      </div>
    </div>
  );
}
