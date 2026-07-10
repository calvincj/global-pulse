import { getScoreColor, getScoreLabel } from '../data/relationships';

export default function ScoreBar({ label, score, active }: { label: string; score: number; active: boolean }) {
  const color = getScoreColor(score);
  const barW  = Math.round(((score + 1) / 2) * 100);
  return (
    <div className="mb-1.5">
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-xs" style={{ color: active ? '#94a3b8' : '#374151' }}>{label}</span>
        <span className="text-xs font-medium" style={{ color: active ? color : '#374151' }}>
          {score > 0 ? '+' : ''}{score.toFixed(2)} · {getScoreLabel(score)}
        </span>
      </div>
      <div className="h-1 rounded-full" style={{ background: '#0f2035' }}>
        <div className="h-1 rounded-full transition-all" style={{ width: `${barW}%`, background: active ? color : '#1a2d44' }} />
      </div>
    </div>
  );
}
