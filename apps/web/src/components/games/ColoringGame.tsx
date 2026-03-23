import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface ColoringGameProps {
  onComplete: (durationSeconds: number) => void;
}

const PALETTE = [
  '#14b8a6',
  '#0d9488',
  '#06b6d4',
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#f43f5e',
  '#ffffff',
  '#1e293b',
];

// Mandala paths — 8 symmetric petals + center
const MANDALA_SECTIONS = [
  { id: 'center', d: 'M200,200 m-30,0 a30,30 0 1,0 60,0 a30,30 0 1,0 -60,0', label: 'Center' },
  { id: 'p1', d: 'M200,170 L220,140 L200,110 L180,140 Z', label: 'Petal 1' },
  { id: 'p2', d: 'M230,200 L260,180 L280,200 L260,220 Z', label: 'Petal 2' },
  { id: 'p3', d: 'M200,230 L220,260 L200,290 L180,260 Z', label: 'Petal 3' },
  { id: 'p4', d: 'M170,200 L140,180 L120,200 L140,220 Z', label: 'Petal 4' },
  { id: 'p5', d: 'M221,179 L245,155 L255,170 L238,195 Z', label: 'Petal 5' },
  { id: 'p6', d: 'M221,221 L245,245 L230,258 L208,238 Z', label: 'Petal 6' },
  { id: 'p7', d: 'M179,221 L155,245 L142,230 L162,208 Z', label: 'Petal 7' },
  { id: 'p8', d: 'M179,179 L155,155 L170,142 L192,162 Z', label: 'Petal 8' },
  {
    id: 'ring1',
    d: 'M200,200 m-80,0 a80,80 0 1,0 160,0 a80,80 0 1,0 -160,0 m60,0 a20,20 0 1,0 40,0 a20,20 0 1,0 -40,0',
    fillRule: 'evenodd' as const,
    label: 'Ring 1',
  },
  {
    id: 'ring2',
    d: 'M200,200 m-110,0 a110,110 0 1,0 220,0 a110,110 0 1,0 -220,0 m85,0 a25,25 0 1,0 50,0 a25,25 0 1,0 -50,0',
    fillRule: 'evenodd' as const,
    label: 'Ring 2',
  },
];

export function ColoringGame({ onComplete }: ColoringGameProps) {
  const { t } = useTranslation();
  const [colors, setColors] = useState<Record<string, string>>({});
  const [activeColor, setActiveColor] = useState(PALETTE[0]);
  const startTimeRef = useRef(Date.now());

  const fill = (id: string) => setColors((prev) => ({ ...prev, [id]: activeColor }));

  const handleComplete = () => {
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
    onComplete(Math.max(elapsed, 10));
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Color palette */}
      <div className="flex flex-wrap justify-center gap-2 max-w-sm">
        {PALETTE.map((c) => (
          <button
            key={c}
            onClick={() => setActiveColor(c)}
            className={`h-8 w-8 rounded-full border-2 transition-transform ${
              activeColor === c ? 'scale-125 border-teal-600' : 'border-transparent hover:scale-110'
            }`}
            // eslint-disable-next-line no-restricted-syntax
            style={{ backgroundColor: c }}
            aria-label={c}
          />
        ))}
      </div>

      {/* Mandala SVG */}
      <svg viewBox="60 60 280 280" className="w-full max-w-sm" xmlns="http://www.w3.org/2000/svg">
        <rect x="60" y="60" width="280" height="280" fill="#fafaf9" />
        {MANDALA_SECTIONS.map((s) => (
          <path
            key={s.id}
            d={s.d}
            fill={colors[s.id] ?? '#e2e8f0'}
            fillRule={s.fillRule ?? 'nonzero'}
            stroke="#475569"
            strokeWidth="1.5"
            strokeLinejoin="round"
            onClick={() => fill(s.id)}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          />
        ))}
      </svg>

      <button
        onClick={handleComplete}
        className="rounded-2xl bg-teal-600 px-8 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
      >
        {t('games.complete')}
      </button>
    </div>
  );
}
