import { useState, useEffect } from 'react';

type Screen = 'political' | 'minerals';

interface Props { onSelectScreen: (screen: Screen) => void }

interface CardDef {
  screen: Screen;
  icon: string;
  title: string;
  accent: string;
  accentGlow: string;
  description: string;
  stats: [string, string][];
}

const CARDS: CardDef[] = [
  {
    screen: 'political',
    icon: '🌐',
    title: 'Political & Economic Relations',
    accent: '#3b82f6',
    accentGlow: 'rgba(37,99,235,0.35)',
    description: "Alliances, rivalries, trade, sanctions and active conflicts between every country on Earth — click any country to see who it's aligned with, who it's beefing with, and why.",
    stats: [['195+', 'Countries'], ['800+', 'Relationships'], ['2025', 'Data Through']],
  },
  {
    screen: 'minerals',
    icon: '⛏',
    title: 'Critical Minerals',
    accent: '#fb923c',
    accentGlow: 'rgba(217,89,38,0.35)',
    description: 'Production, refining and downstream capability for 36 critical minerals, by country and by trade flow — plus what the US, South Korea and others are actually doing to cut dependence on China.',
    stats: [['36', 'Minerals'], ['2,200+', 'Facilities'], ['2024', 'Data Through']],
  },
];

export default function IntroScreen({ onSelectScreen }: Props) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState<Screen | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleSelect = (screen: Screen) => {
    setLeaving(screen);
    setVisible(false);
    setTimeout(() => onSelectScreen(screen), 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto py-12"
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

      <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-4xl">
        {/* Logo mark */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded flex items-center justify-center font-bold text-sm text-white" style={{ background: '#2563eb', boxShadow: '0 0 20px rgba(37,99,235,0.5)' }}>GP</div>
        </div>

        {/* Title */}
        <h1
          className="text-6xl sm:text-7xl font-bold tracking-tight mb-5"
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
        <p className="text-base leading-relaxed mb-10 max-w-xl" style={{ color: '#64748b', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 400 }}>
          Two lenses on how the world actually works. Pick one to start exploring.
        </p>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 gap-5 w-full mb-6">
          {CARDS.map(card => (
            <button
              key={card.screen}
              onClick={() => handleSelect(card.screen)}
              className="flex flex-col items-start text-left p-6 rounded-xl transition-all duration-200"
              style={{
                background: 'rgba(10,16,28,0.6)',
                border: `1px solid ${leaving === card.screen ? card.accent : '#1e3a5f'}`,
                boxShadow: leaving === card.screen ? `0 0 30px ${card.accentGlow}` : 'none',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = card.accent; e.currentTarget.style.boxShadow = `0 0 24px ${card.accentGlow}`; }}
              onMouseLeave={e => { if (leaving !== card.screen) { e.currentTarget.style.borderColor = '#1e3a5f'; e.currentTarget.style.boxShadow = 'none'; } }}
            >
              <div className="text-3xl mb-3">{card.icon}</div>
              <div className="font-semibold text-base mb-2 text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {card.title}
              </div>
              <p className="text-xs leading-relaxed mb-4" style={{ color: '#64748b' }}>
                {card.description}
              </p>
              <div className="flex items-center gap-5 mb-4">
                {card.stats.map(([val, label]) => (
                  <div key={label}>
                    <div className="text-base font-bold" style={{ color: card.accent, fontFamily: "'Space Mono', monospace" }}>{val}</div>
                    <div className="text-xs mt-0.5" style={{ color: '#374151' }}>{label}</div>
                  </div>
                ))}
              </div>
              <div className="text-xs font-semibold flex items-center gap-1 mt-auto" style={{ color: card.accent }}>
                Explore <span>→</span>
              </div>
            </button>
          ))}
        </div>

        <div className="text-xs" style={{ color: '#1e2d3d' }}>
          Click a card to start
        </div>
      </div>
    </div>
  );
}
