import { useRef, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface ZenGardenGameProps {
  onComplete: (durationSeconds: number) => void;
}

type Tool = 'rake' | 'stone' | 'moss';

const CANVAS_W = 500;
const CANVAS_H = 360;
const FRAME = 12; // wooden frame thickness in pixels
const MAX_STONES = 5;
const MAX_MOSS = 7;

interface Stone {
  x: number;
  y: number;
  rx: number;
  ry: number;
  angle: number;
}
interface Moss {
  x: number;
  y: number;
  scale: number;
}

// ─── Path offset helper ───────────────────────────────────────────────────────

function offsetPath(line: { x: number; y: number }[], off: number): { x: number; y: number }[] {
  return line.map((p, i) => {
    let nx = 0,
      ny = 1;
    if (i < line.length - 1) {
      const dx = line[i + 1].x - p.x,
        dy = line[i + 1].y - p.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      nx = -dy / len;
      ny = dx / len;
    } else if (i > 0) {
      const dx = p.x - line[i - 1].x,
        dy = p.y - line[i - 1].y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      nx = -dy / len;
      ny = dx / len;
    }
    return { x: p.x + nx * off, y: p.y + ny * off };
  });
}

function tracePath(ctx: CanvasRenderingContext2D, pts: { x: number; y: number }[]) {
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();
}

// ─── Drawing ──────────────────────────────────────────────────────────────────

function drawBackground(ctx: CanvasRenderingContext2D, grains: { x: number; y: number }[]) {
  // ── Sand surface ──
  const sandGrad = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
  sandGrad.addColorStop(0, '#ddd0a8');
  sandGrad.addColorStop(0.5, '#d4c598');
  sandGrad.addColorStop(1, '#c8b680');
  ctx.fillStyle = sandGrad;
  ctx.fillRect(FRAME, FRAME, CANVAS_W - FRAME * 2, CANVAS_H - FRAME * 2);

  // Subtle grain texture
  ctx.fillStyle = 'rgba(100, 78, 30, 0.055)';
  for (const g of grains) {
    if (g.x > FRAME && g.x < CANVAS_W - FRAME && g.y > FRAME && g.y < CANVAS_H - FRAME) {
      ctx.fillRect(g.x, g.y, 1.5, 1);
    }
  }

  // Inner edge vignette
  const vig = ctx.createLinearGradient(FRAME, FRAME, FRAME + 24, FRAME + 24);
  vig.addColorStop(0, 'rgba(80,55,10,0.06)');
  vig.addColorStop(1, 'rgba(80,55,10,0)');
  ctx.fillStyle = vig;
  ctx.fillRect(FRAME, FRAME, CANVAS_W - FRAME * 2, CANVAS_H - FRAME * 2);

  // ── Wooden frame ──
  // Top rail
  const topGrad = ctx.createLinearGradient(0, 0, 0, FRAME);
  topGrad.addColorStop(0, '#5c3610');
  topGrad.addColorStop(0.5, '#8B5E22');
  topGrad.addColorStop(1, '#7a5218');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, CANVAS_W, FRAME);

  // Bottom rail
  const botGrad = ctx.createLinearGradient(0, CANVAS_H - FRAME, 0, CANVAS_H);
  botGrad.addColorStop(0, '#7a5218');
  botGrad.addColorStop(0.5, '#8B5E22');
  botGrad.addColorStop(1, '#5c3610');
  ctx.fillStyle = botGrad;
  ctx.fillRect(0, CANVAS_H - FRAME, CANVAS_W, FRAME);

  // Left rail
  const leftGrad = ctx.createLinearGradient(0, 0, FRAME, 0);
  leftGrad.addColorStop(0, '#5c3610');
  leftGrad.addColorStop(0.6, '#9a6a28');
  leftGrad.addColorStop(1, '#7a5218');
  ctx.fillStyle = leftGrad;
  ctx.fillRect(0, FRAME, FRAME, CANVAS_H - FRAME * 2);

  // Right rail
  const rightGrad = ctx.createLinearGradient(CANVAS_W - FRAME, 0, CANVAS_W, 0);
  rightGrad.addColorStop(0, '#7a5218');
  rightGrad.addColorStop(0.4, '#9a6a28');
  rightGrad.addColorStop(1, '#5c3610');
  ctx.fillStyle = rightGrad;
  ctx.fillRect(CANVAS_W - FRAME, FRAME, FRAME, CANVAS_H - FRAME * 2);

  // Frame corners (filled squares to complete the frame)
  const corners = [
    [0, 0],
    [CANVAS_W - FRAME, 0],
    [0, CANVAS_H - FRAME],
    [CANVAS_W - FRAME, CANVAS_H - FRAME],
  ];
  for (const [cx, cy] of corners) {
    const cg = ctx.createRadialGradient(
      cx + FRAME / 2,
      cy + FRAME / 2,
      0,
      cx + FRAME / 2,
      cy + FRAME / 2,
      FRAME,
    );
    cg.addColorStop(0, '#9a6a28');
    cg.addColorStop(1, '#5c3610');
    ctx.fillStyle = cg;
    ctx.fillRect(cx, cy, FRAME, FRAME);
  }

  // Frame inner edge highlight line
  ctx.strokeStyle = 'rgba(200,165,90,0.4)';
  ctx.lineWidth = 1;
  ctx.strokeRect(FRAME - 0.5, FRAME - 0.5, CANVAS_W - FRAME * 2 + 1, CANVAS_H - FRAME * 2 + 1);

  // Frame outer shadow line
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, CANVAS_W - 1, CANVAS_H - 1);
}

/** 5-tine rake groove: dark shadow pass + light ridge highlight pass */
function drawRakeLine(ctx: CanvasRenderingContext2D, line: { x: number; y: number }[]) {
  if (line.length < 2) return;
  const tineOffsets = [-8, -4, 0, 4, 8];

  // Pass 1 — groove shadow (dark, wider)
  ctx.strokeStyle = 'rgba(82, 60, 22, 0.7)';
  ctx.lineWidth = 1.6;
  for (const off of tineOffsets) tracePath(ctx, offsetPath(line, off));

  // Pass 2 — ridge highlight (light, thin, +1px offset toward "light source")
  ctx.strokeStyle = 'rgba(230, 215, 170, 0.45)';
  ctx.lineWidth = 0.7;
  for (const off of tineOffsets) tracePath(ctx, offsetPath(line, off + 1.2));
}

function drawStone(ctx: CanvasRenderingContext2D, s: Stone) {
  ctx.save();
  ctx.translate(s.x, s.y);
  ctx.rotate(s.angle);

  // Ground shadow
  ctx.shadowColor = 'rgba(40, 28, 8, 0.45)';
  ctx.shadowBlur = 16;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 7;

  // Stone body
  const grad = ctx.createRadialGradient(
    -s.rx * 0.28,
    -s.ry * 0.32,
    s.rx * 0.04,
    s.rx * 0.08,
    s.ry * 0.08,
    s.rx * 1.1,
  );
  grad.addColorStop(0, '#787068');
  grad.addColorStop(0.4, '#3e3830');
  grad.addColorStop(0.78, '#252018');
  grad.addColorStop(1, '#141210');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(0, 0, s.rx, s.ry, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowColor = 'transparent';

  // Specular sheen
  const sheen = ctx.createRadialGradient(
    -s.rx * 0.28,
    -s.ry * 0.38,
    0,
    -s.rx * 0.1,
    -s.ry * 0.15,
    s.rx * 0.72,
  );
  sheen.addColorStop(0, 'rgba(255,255,255,0.25)');
  sheen.addColorStop(0.55, 'rgba(255,255,255,0.07)');
  sheen.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = sheen;
  ctx.beginPath();
  ctx.ellipse(-s.rx * 0.12, -s.ry * 0.18, s.rx * 0.62, s.ry * 0.42, -0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/** Small cloud-pruned bonsai / ornamental bush */
function drawMoss(ctx: CanvasRenderingContext2D, m: Moss) {
  const { x, y, scale: sc } = m;

  ctx.save();

  // ── Ground shadow ──
  ctx.fillStyle = 'rgba(55, 38, 8, 0.22)';
  ctx.beginPath();
  ctx.ellipse(x + 2, y + 2, 20 * sc, 7 * sc, 0, 0, Math.PI * 2);
  ctx.fill();

  // ── Trunk ──
  ctx.shadowColor = 'rgba(0,0,0,0.25)';
  ctx.shadowBlur = 3;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  const trunkGrad = ctx.createLinearGradient(x - 3 * sc, 0, x + 4 * sc, 0);
  trunkGrad.addColorStop(0, '#4a2a0a');
  trunkGrad.addColorStop(0.5, '#7a4e18');
  trunkGrad.addColorStop(1, '#5a3810');
  ctx.fillStyle = trunkGrad;
  ctx.beginPath();
  ctx.roundRect(x - 3 * sc, y - 10 * sc, 6 * sc, 11 * sc, 2);
  ctx.fill();
  ctx.shadowColor = 'transparent';

  // ── Three foliage clouds (cloud-pruned bonsai style) ──
  const clusters: { dx: number; dy: number; r: number; light: string; dark: string }[] = [
    { dx: -10, dy: -16, r: 11, light: '#62b055', dark: '#2e6832' },
    { dx: 10, dy: -16, r: 11, light: '#62b055', dark: '#2e6832' },
    { dx: 0, dy: -24, r: 12, light: '#70c060', dark: '#336838' },
  ];

  for (const c of clusters) {
    const cx = x + c.dx * sc;
    const cy = y + c.dy * sc;
    const r = c.r * sc;

    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 3;

    const fg = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.35, 0, cx, cy, r);
    fg.addColorStop(0, c.light);
    fg.addColorStop(0.6, c.dark);
    fg.addColorStop(1, '#1a3e1e');
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.shadowColor = 'transparent';

  // ── Specular top highlight ──
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  ctx.beginPath();
  ctx.arc(x - 2 * sc, y - 27 * sc, 4 * sc, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ZenGardenGame({ onComplete }: ZenGardenGameProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('rake');
  const [isDrawing, setIsDrawing] = useState(false);
  const [stoneCount, setStoneCount] = useState(0);
  const [mossCount, setMossCount] = useState(0);
  const startTimeRef = useRef(Date.now());
  const stonesRef = useRef<Stone[]>([]);
  const mossRef = useRef<Moss[]>([]);
  const linesRef = useRef<{ x: number; y: number }[][]>([]);
  const currentLineRef = useRef<{ x: number; y: number }[]>([]);
  const grainsRef = useRef<{ x: number; y: number }[]>(
    Array.from({ length: 400 }, () => ({
      x: Math.random() * CANVAS_W,
      y: Math.random() * CANVAS_H,
    })),
  );

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawBackground(ctx, grainsRef.current);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const line of linesRef.current) drawRakeLine(ctx, line);

    for (const m of mossRef.current) drawMoss(ctx, m);
    for (const s of stonesRef.current) drawStone(ctx, s);
  }, []);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const sx = CANVAS_W / rect.width,
      sy = CANVAS_H / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * sx,
        y: (e.touches[0].clientY - rect.top) * sy,
      };
    }
    return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
  };

  const handleDown = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPos(e);
    setIsDrawing(true);
    if (tool === 'rake') {
      currentLineRef.current = [pos];
    } else if (tool === 'stone' && stonesRef.current.length < MAX_STONES) {
      const rx = 18 + Math.random() * 14;
      stonesRef.current = [
        ...stonesRef.current,
        { ...pos, rx, ry: rx * (0.55 + Math.random() * 0.25), angle: (Math.random() - 0.5) * 1.2 },
      ];
      setStoneCount(stonesRef.current.length);
      redraw();
    } else if (tool === 'moss' && mossRef.current.length < MAX_MOSS) {
      mossRef.current = [...mossRef.current, { ...pos, scale: 0.75 + Math.random() * 0.45 }];
      setMossCount(mossRef.current.length);
      redraw();
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || tool !== 'rake') return;
    const pos = getPos(e);
    currentLineRef.current = [...currentLineRef.current, pos];
    linesRef.current = [...linesRef.current.slice(0, -0), currentLineRef.current];
    redraw();
  };

  const handleUp = () => {
    if (tool === 'rake' && currentLineRef.current.length > 0) {
      linesRef.current = [...linesRef.current, currentLineRef.current];
      currentLineRef.current = [];
    }
    setIsDrawing(false);
  };

  const tools: { id: Tool; label: string; icon: string; count?: number; max?: number }[] = [
    { id: 'rake', label: t('games.zen.rake'), icon: '🌾' },
    { id: 'stone', label: t('games.zen.stone'), icon: '🪨', count: stoneCount, max: MAX_STONES },
    { id: 'moss', label: t('games.zen.plant'), icon: '🌱', count: mossCount, max: MAX_MOSS },
  ];

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Tool bar */}
      <div className="flex gap-2">
        {tools.map((tk) => {
          const atLimit = tk.max !== undefined && (tk.count ?? 0) >= tk.max;
          return (
            <button
              key={tk.id}
              onClick={() => !atLimit && setTool(tk.id)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                atLimit
                  ? 'border border-amber-100 text-amber-300 cursor-not-allowed bg-amber-50/40'
                  : tool === tk.id
                    ? 'bg-amber-700 text-white shadow-md shadow-amber-900/20'
                    : 'border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100'
              }`}
            >
              {tk.icon} {tk.label}
              {tk.max !== undefined && (
                <span className="ml-1.5 text-xs opacity-55">
                  {tk.count}/{tk.max}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Canvas */}
      <div className="w-full max-w-lg rounded-lg overflow-hidden shadow-xl shadow-amber-900/20">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="w-full block touch-none"
          // eslint-disable-next-line no-restricted-syntax
          style={{ cursor: tool === 'rake' ? 'crosshair' : 'cell' }} // EXCEPCION
          onMouseDown={handleDown}
          onMouseMove={handleMove}
          onMouseUp={handleUp}
          onMouseLeave={handleUp}
          onTouchStart={handleDown}
          onTouchMove={handleMove}
          onTouchEnd={handleUp}
        />
      </div>

      <button
        onClick={() =>
          onComplete(Math.max(Math.round((Date.now() - startTimeRef.current) / 1000), 10))
        }
        className="rounded-2xl bg-teal-600 px-8 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
      >
        {t('games.complete')}
      </button>
    </div>
  );
}
