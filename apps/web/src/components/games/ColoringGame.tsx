import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface ColoringGameProps {
  onComplete: (durationSeconds: number) => void;
}

// ─── Math helpers ────────────────────────────────────────────────────────────

const CX = 200;
const CY = 200;
const R = Math.PI / 180;

function pt(r: number, deg: number): [number, number] {
  const a = (deg - 90) * R;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

function petal(ri: number, ro: number, hw: number, rot: number): string {
  const [tx, ty] = pt(ro, rot);
  const [lx, ly] = pt(ri, rot - hw);
  const [rx, ry] = pt(ri, rot + hw);
  const cm = ri * 0.28 + ro * 0.72;
  const [clx, cly] = pt(cm, rot - hw * 0.42);
  const [crx, cry] = pt(cm, rot + hw * 0.42);
  const f = (n: number) => n.toFixed(2);
  return `M${f(lx)},${f(ly)} Q${f(clx)},${f(cly)} ${f(tx)},${f(ty)} Q${f(crx)},${f(cry)} ${f(rx)},${f(ry)}Z`;
}

function sector(ri: number, ro: number, s: number, e: number): string {
  const [ax, ay] = pt(ri, s);
  const [bx, by] = pt(ro, s);
  const [cx2, cy2] = pt(ro, e);
  const [dx, dy] = pt(ri, e);
  const lg = e - s > 180 ? 1 : 0;
  const f = (n: number) => n.toFixed(2);
  return `M${f(ax)},${f(ay)} L${f(bx)},${f(by)} A${ro},${ro} 0 ${lg},1 ${f(cx2)},${f(cy2)} L${f(dx)},${f(dy)} A${ri},${ri} 0 ${lg},0 ${f(ax)},${f(ay)}Z`;
}

function diamond(ri: number, ro: number, hw: number, rot: number): string {
  const [tx, ty] = pt(ro, rot);
  const [bx, by] = pt(ri, rot);
  const rm = (ri + ro) / 2;
  const [lx, ly] = pt(rm, rot - hw);
  const [rx, ry] = pt(rm, rot + hw);
  const f = (n: number) => n.toFixed(2);
  return `M${f(tx)},${f(ty)} L${f(lx)},${f(ly)} L${f(bx)},${f(by)} L${f(rx)},${f(ry)}Z`;
}

function teardrop(ri: number, ro: number, hw: number, rot: number): string {
  const [tx, ty] = pt(ro, rot);
  const [lx, ly] = pt(ri, rot - hw);
  const [rx, ry] = pt(ri, rot + hw);
  const cm = ri * 0.4 + ro * 0.6;
  const [cx3, cy3] = pt(cm, rot);
  const f = (n: number) => n.toFixed(2);
  return `M${f(lx)},${f(ly)} Q${f(cx3)},${f(cy3)} ${f(tx)},${f(ty)} Q${f(cx3)},${f(cy3)} ${f(rx)},${f(ry)}Z`;
}

// ─── Mandala config type ──────────────────────────────────────────────────────

interface MSection {
  id: string;
  d: string;
  ring: number;
}

interface DotDef {
  id: string;
  pos: [number, number];
}

interface MandalaConfig {
  sections: MSection[];
  dots: DotDef[];
}

// ─── Mandala 0: Lotus (8-fold) ────────────────────────────────────────────────

function buildLotus(): MandalaConfig {
  const ss: MSection[] = [];

  ss.push({ id: 'c', ring: 0, d: `M${CX},${CY}m-17,0a17,17 0 1,0 34,0a17,17 0 1,0 -34,0` });

  for (let i = 0; i < 8; i++) ss.push({ id: `t${i}`, ring: 1, d: teardrop(19, 50, 11, i * 45) });
  for (let i = 0; i < 8; i++)
    ss.push({ id: `p${i}`, ring: 2, d: petal(52, 100, 17, i * 45 + 22.5) });
  for (let i = 0; i < 8; i++) ss.push({ id: `q${i}`, ring: 3, d: petal(52, 90, 8, i * 45) });

  for (let i = 0; i < 8; i++) {
    const mid = i * 45 + 22.5;
    ss.push({ id: `arc${i}`, ring: 4, d: sector(92, 108, mid - 10, mid + 10) });
  }

  for (let i = 0; i < 16; i++) ss.push({ id: `d${i}`, ring: 5, d: diamond(110, 124, 6, i * 22.5) });
  for (let i = 0; i < 8; i++) ss.push({ id: `L${i}`, ring: 6, d: petal(126, 172, 18, i * 45) });

  for (let i = 0; i < 8; i++) {
    const mid = i * 45 + 22.5;
    ss.push({ id: `La${i}`, ring: 7, d: sector(126, 164, mid - 9, mid + 9) });
  }

  for (let i = 0; i < 16; i++)
    ss.push({ id: `o${i}`, ring: 8, d: sector(176, 186, i * 22.5 - 7.5, i * 22.5 + 7.5) });

  const dots = Array.from({ length: 8 }, (_, i) => ({
    id: `dot${i}`,
    pos: pt(112, i * 45 + 22.5),
  }));

  return { sections: ss, dots };
}

// ─── Mandala 1: Cathedral (12-fold) ──────────────────────────────────────────

function buildCathedral(): MandalaConfig {
  const ss: MSection[] = [];
  const N = 12;
  const step = 360 / N; // 30°

  ss.push({ id: 'c', ring: 0, d: `M${CX},${CY}m-14,0a14,14 0 1,0 28,0a14,14 0 1,0 -28,0` });

  for (let i = 0; i < N; i++) ss.push({ id: `t${i}`, ring: 1, d: teardrop(16, 44, 8, i * step) });
  for (let i = 0; i < N; i++)
    ss.push({ id: `p${i}`, ring: 2, d: petal(46, 86, 12, i * step + step / 2) });
  for (let i = 0; i < N; i++) ss.push({ id: `q${i}`, ring: 3, d: petal(46, 78, 7, i * step) });

  for (let i = 0; i < N; i++) {
    const mid = i * step + step / 2;
    ss.push({ id: `a${i}`, ring: 4, d: sector(80, 94, mid - 7, mid + 7) });
  }

  for (let i = 0; i < N * 2; i++)
    ss.push({ id: `d${i}`, ring: 5, d: diamond(96, 108, 4, i * (step / 2)) });
  for (let i = 0; i < N; i++) ss.push({ id: `L${i}`, ring: 6, d: petal(110, 156, 12, i * step) });

  for (let i = 0; i < N; i++) {
    const mid = i * step + step / 2;
    ss.push({ id: `La${i}`, ring: 7, d: sector(110, 148, mid - 7, mid + 7) });
  }

  for (let i = 0; i < N * 2; i++)
    ss.push({
      id: `o${i}`,
      ring: 8,
      d: sector(160, 170, i * (step / 2) - 4.5, i * (step / 2) + 4.5),
    });

  const dots = Array.from({ length: N }, (_, i) => ({
    id: `dot${i}`,
    pos: pt(94, i * step + step / 2),
  }));

  return { sections: ss, dots };
}

// ─── Mandala 2: Snowflake (6-fold) ───────────────────────────────────────────

function buildSnowflake(): MandalaConfig {
  const ss: MSection[] = [];
  const N = 6;
  const step = 360 / N; // 60°

  ss.push({ id: 'c', ring: 0, d: `M${CX},${CY}m-18,0a18,18 0 1,0 36,0a18,18 0 1,0 -36,0` });

  // Large inner petals at 0°
  for (let i = 0; i < N; i++) ss.push({ id: `p${i}`, ring: 1, d: petal(20, 68, 20, i * step) });
  // Gap sectors between large petals
  for (let i = 0; i < N; i++) {
    const mid = i * step + step / 2;
    ss.push({ id: `gf${i}`, ring: 2, d: sector(22, 52, mid - 9, mid + 9) });
  }
  // Medium petals at 30° offset
  for (let i = 0; i < N; i++)
    ss.push({ id: `mp${i}`, ring: 3, d: petal(70, 104, 14, i * step + step / 2) });
  // Sector fills at 0°
  for (let i = 0; i < N; i++) {
    const mid = i * step;
    ss.push({ id: `mf${i}`, ring: 4, d: sector(70, 96, mid - 8, mid + 8) });
  }
  // 12 diamonds
  for (let i = 0; i < N * 2; i++)
    ss.push({ id: `d${i}`, ring: 5, d: diamond(106, 120, 7, i * 30) });
  // Large outer petals at 0°
  for (let i = 0; i < N; i++) ss.push({ id: `L${i}`, ring: 6, d: petal(122, 168, 20, i * step) });
  // Outer petals at offset
  for (let i = 0; i < N; i++)
    ss.push({ id: `Lb${i}`, ring: 7, d: petal(122, 155, 12, i * step + step / 2) });
  // Outer tablets
  for (let i = 0; i < N * 2; i++)
    ss.push({ id: `o${i}`, ring: 8, d: sector(172, 183, i * 30 - 7, i * 30 + 7) });

  const dots = Array.from({ length: N * 2 }, (_, i) => ({
    id: `dot${i}`,
    pos: pt(104, i * 30),
  }));

  return { sections: ss, dots };
}

// ─── Mandala 3: Sunburst (16-fold) ───────────────────────────────────────────

function buildSunburst(): MandalaConfig {
  const ss: MSection[] = [];
  const N = 16;
  const step = 360 / N; // 22.5°

  ss.push({ id: 'c', ring: 0, d: `M${CX},${CY}m-13,0a13,13 0 1,0 26,0a13,13 0 1,0 -26,0` });

  for (let i = 0; i < N; i++) ss.push({ id: `t${i}`, ring: 1, d: teardrop(15, 38, 7, i * step) });
  for (let i = 0; i < N; i++)
    ss.push({ id: `p${i}`, ring: 2, d: petal(40, 72, 9, i * step + step / 2) });

  for (let i = 0; i < N; i++) {
    const mid = i * step;
    ss.push({ id: `a${i}`, ring: 3, d: sector(74, 86, mid - 6, mid + 6) });
  }

  for (let i = 0; i < N; i++)
    ss.push({ id: `d${i}`, ring: 4, d: diamond(88, 100, 6, i * step + step / 2) });
  for (let i = 0; i < N; i++) ss.push({ id: `L${i}`, ring: 5, d: petal(102, 152, 9, i * step) });

  for (let i = 0; i < N; i++) {
    const mid = i * step + step / 2;
    ss.push({ id: `La${i}`, ring: 6, d: sector(102, 142, mid - 6, mid + 6) });
  }

  for (let i = 0; i < N * 2; i++)
    ss.push({
      id: `o${i}`,
      ring: 7,
      d: sector(156, 166, i * (step / 2) - 3.5, i * (step / 2) + 3.5),
    });

  const dots = Array.from({ length: N }, (_, i) => ({
    id: `dot${i}`,
    pos: pt(88, i * step + step / 2),
  }));

  return { sections: ss, dots };
}

// ─── All mandalas ─────────────────────────────────────────────────────────────

const MANDALAS: MandalaConfig[] = [
  buildLotus(),
  buildCathedral(),
  buildSnowflake(),
  buildSunburst(),
];

// ─── Palette ─────────────────────────────────────────────────────────────────

const PALETTE: string[] = [
  '#fef9c3',
  '#fde68a',
  '#fcd34d',
  '#fbbf24',
  '#f97316',
  '#ef4444',
  '#fce7f3',
  '#fbcfe8',
  '#f9a8d4',
  '#e879f9',
  '#a78bfa',
  '#818cf8',
  '#e0f2fe',
  '#bae6fd',
  '#7dd3fc',
  '#38bdf8',
  '#0ea5e9',
  '#06b6d4',
  '#d1fae5',
  '#6ee7b7',
  '#34d399',
  '#10b981',
  '#0d9488',
  '#059669',
  '#fafaf9',
  '#e7e5e4',
  '#a8a29e',
  '#78716c',
  '#292524',
  '#0f172a',
];

const DEFAULT_FILL = '#f8fafc';
const STROKE = '#94a3b8';
const STROKE_ACTIVE = '#475569';

// ─── Component ───────────────────────────────────────────────────────────────

export function ColoringGame({ onComplete }: ColoringGameProps) {
  const { t } = useTranslation();
  const mandalaIdx = useRef(Math.floor(Math.random() * MANDALAS.length));
  const { sections, dots } = MANDALAS[mandalaIdx.current];

  const [fills, setFills] = useState<Record<string, string>>({});
  const [activeColor, setActiveColor] = useState(PALETTE[13]);
  const [hovered, setHovered] = useState<string | null>(null);
  const startRef = useRef(Date.now());

  const paintSection = (id: string) => setFills((f) => ({ ...f, [id]: activeColor }));

  const handleComplete = () => {
    const elapsed = Math.max(Math.round((Date.now() - startRef.current) / 1000), 10);
    onComplete(elapsed);
  };

  const coloredCount = Object.keys(fills).length;
  const totalSections = sections.length + dots.length;

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Palette */}
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-slate-500">{t('games.coloring.pickColor')}</p>
          <p className="text-xs text-slate-400">
            {coloredCount}/{totalSections} {t('games.coloring.sections')}
          </p>
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {PALETTE.map((c) => (
            <button
              key={c}
              onClick={() => setActiveColor(c)}
              className={`h-8 w-8 rounded-full border-2 transition-all duration-150 ${
                activeColor === c
                  ? 'scale-125 border-slate-700 shadow-lg ring-2 ring-offset-1 ring-slate-400'
                  : 'border-slate-200 hover:scale-110 hover:border-slate-400'
              }`}
              // eslint-disable-next-line no-restricted-syntax
              style={{ backgroundColor: c }} // EXCEPCION
              aria-label={c}
            />
          ))}
        </div>
      </div>

      {/* Mandala SVG */}
      <div className="w-full max-w-xs mx-auto">
        <svg
          viewBox="8 8 384 384"
          className="w-full select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx={CX} cy={CY} r={192} fill="#fafaf9" />
          <circle cx={CX} cy={CY} r={190} fill="none" stroke="#e2e8f0" strokeWidth="1" />

          {sections.map((s) => {
            const isHovered = hovered === s.id;
            const fill = fills[s.id] ?? DEFAULT_FILL;
            return (
              <path
                key={s.id}
                d={s.d}
                fill={fill}
                stroke={isHovered ? STROKE_ACTIVE : STROKE}
                strokeWidth={isHovered ? '1.8' : '1'}
                strokeLinejoin="round"
                opacity={hovered !== null && !isHovered ? 0.65 : 1}
                onClick={() => paintSection(s.id)}
                onMouseEnter={() => setHovered(s.id)}
                onMouseLeave={() => setHovered(null)}
                onTouchStart={() => {
                  paintSection(s.id);
                }}
                className="cursor-pointer transition-opacity duration-75"
              />
            );
          })}

          {dots.map(({ id, pos: [dx, dy] }) => {
            const isHovered = hovered === id;
            return (
              <circle
                key={id}
                cx={dx}
                cy={dy}
                r={4}
                fill={fills[id] ?? '#e2e8f0'}
                stroke={isHovered ? STROKE_ACTIVE : STROKE}
                strokeWidth={isHovered ? '1.5' : '0.75'}
                opacity={hovered !== null && !isHovered ? 0.65 : 1}
                onClick={() => paintSection(id)}
                onMouseEnter={() => setHovered(id)}
                onMouseLeave={() => setHovered(null)}
                onTouchStart={() => {
                  paintSection(id);
                }}
                className="cursor-pointer transition-opacity duration-75"
              />
            );
          })}

          <circle cx={CX} cy={CY} r={188} fill="none" stroke="#cbd5e1" strokeWidth="0.75" />
        </svg>
      </div>

      {/* Complete button */}
      <button
        onClick={handleComplete}
        className="rounded-2xl bg-teal-600 px-8 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
      >
        {t('games.complete')}
      </button>
    </div>
  );
}
