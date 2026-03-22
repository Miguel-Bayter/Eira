import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MoodHeatmap } from '../../../src/components/dashboard/MoodHeatmap';

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'es' },
  }),
}));

function buildHeatmapData(overrides: Partial<{ date: string; score: number | null }>[] = []) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const data: Array<{ date: string; score: number | null }> = [];
  for (let i = 363; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateKey = d.toISOString().slice(0, 10);
    const override = overrides.find((o) => o.date === dateKey);
    data.push({ date: dateKey, score: override?.score !== undefined ? (override.score ?? null) : null });
  }
  return data;
}

describe('MoodHeatmap', () => {
  it('renders the heatmap grid with 364 cells', () => {
    const data = buildHeatmapData();
    render(<MoodHeatmap data={data} />);
    const cells = screen.getAllByRole('img');
    expect(cells).toHaveLength(364);
  });

  it('applies null color class (bg-gray-100) when score is null', () => {
    const data = buildHeatmapData();
    render(<MoodHeatmap data={data} />);

    const cells = screen.getAllByRole('img');
    const nullCell = cells[0];
    expect(nullCell?.className).toContain('bg-gray-100');
  });

  it('applies crisis color class (bg-red-200) for score 1-3', () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateKey = today.toISOString().slice(0, 10);

    const data = buildHeatmapData([{ date: dateKey, score: 2 }]);
    render(<MoodHeatmap data={data} />);

    const cells = screen.getAllByRole('img');
    const lastCell = cells[cells.length - 1];
    expect(lastCell?.className).toContain('bg-red-200');
  });

  it('applies good color class (bg-eira-200) for score 7-8', () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateKey = today.toISOString().slice(0, 10);

    const data = buildHeatmapData([{ date: dateKey, score: 8 }]);
    render(<MoodHeatmap data={data} />);

    const cells = screen.getAllByRole('img');
    const lastCell = cells[cells.length - 1];
    expect(lastCell?.className).toContain('bg-eira-200');
  });
});
