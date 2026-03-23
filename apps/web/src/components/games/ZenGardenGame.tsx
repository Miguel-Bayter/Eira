import { useRef, useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface ZenGardenGameProps {
  onComplete: (durationSeconds: number) => void;
}

type Tool = 'rake' | 'stone' | 'plant';

const CANVAS_W = 500;
const CANVAS_H = 380;

interface Stone {
  x: number;
  y: number;
  r: number;
  color: string;
}
interface Plant {
  x: number;
  y: number;
}

export function ZenGardenGame({ onComplete }: ZenGardenGameProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>('rake');
  const [isDrawing, setIsDrawing] = useState(false);
  const startTimeRef = useRef(Date.now());
  const stonesRef = useRef<Stone[]>([]);
  const plantsRef = useRef<Plant[]>([]);
  const linesRef = useRef<{ x: number; y: number }[][]>([]);
  const currentLineRef = useRef<{ x: number; y: number }[]>([]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Rake lines
    ctx.strokeStyle = '#a16207';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    for (const line of linesRef.current) {
      if (line.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(line[0].x, line[0].y);
      for (let i = 1; i < line.length; i++) ctx.lineTo(line[i].x, line[i].y);
      ctx.stroke();
    }

    // Stones
    for (const s of stonesRef.current) {
      ctx.beginPath();
      ctx.ellipse(s.x, s.y, s.r, s.r * 0.7, 0, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.fill();
      ctx.strokeStyle = '#78716c';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Plants
    for (const p of plantsRef.current) {
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(p.x, p.y - 12, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x - 8, p.y - 6, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.x + 8, p.y - 6, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#15803d';
      ctx.fillRect(p.x - 2, p.y - 4, 4, 14);
    }
  }, []);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  };

  const handleDown = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = getPos(e);
    setIsDrawing(true);
    if (tool === 'rake') {
      currentLineRef.current = [pos];
    } else if (tool === 'stone') {
      const stoneColors = ['#a8a29e', '#78716c', '#d6d3d1', '#b8b5b1'];
      stonesRef.current = [
        ...stonesRef.current,
        { ...pos, r: 18, color: stoneColors[Math.floor(Math.random() * stoneColors.length)] },
      ];
      redraw();
    } else if (tool === 'plant') {
      plantsRef.current = [...plantsRef.current, pos];
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

  const handleComplete = () => {
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);
    onComplete(Math.max(elapsed, 10));
  };

  const tools: { id: Tool; label: string; icon: string }[] = [
    { id: 'rake', label: t('games.zen.rake'), icon: '🌾' },
    { id: 'stone', label: t('games.zen.stone'), icon: '🪨' },
    { id: 'plant', label: t('games.zen.plant'), icon: '🌿' },
  ];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              tool === t.id
                ? 'bg-teal-600 text-white'
                : 'border border-teal-200 text-teal-700 hover:bg-teal-50'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="w-full max-w-lg rounded-2xl border border-amber-200 touch-none"
        // eslint-disable-next-line no-restricted-syntax
        style={{ cursor: tool === 'rake' ? 'crosshair' : 'copy' }}
        onMouseDown={handleDown}
        onMouseMove={handleMove}
        onMouseUp={handleUp}
        onMouseLeave={handleUp}
        onTouchStart={handleDown}
        onTouchMove={handleMove}
        onTouchEnd={handleUp}
      />

      <button
        onClick={handleComplete}
        className="rounded-2xl bg-teal-600 px-8 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
      >
        {t('games.complete')}
      </button>
    </div>
  );
}
