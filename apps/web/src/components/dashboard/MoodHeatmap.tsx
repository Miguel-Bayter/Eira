import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface HeatmapEntry {
  date: string;
  score: number | null;
}

interface MonthGroup {
  label: string;
  weeks: HeatmapEntry[][];
}

interface MoodHeatmapProps {
  data: HeatmapEntry[];
}

const CELL_CLASSES: Record<string, string> = {
  none:  'bg-stone-100 hover:bg-stone-200',
  hard:  'bg-rose-200 hover:bg-rose-300',
  okay:  'bg-amber-200 hover:bg-amber-300',
  good:  'bg-teal-200 hover:bg-teal-300',
  great: 'bg-teal-400 hover:bg-teal-500',
};

function getCellKey(score: number | null): string {
  if (score === null) return 'none';
  if (score <= 3) return 'hard';
  if (score <= 6) return 'okay';
  if (score <= 8) return 'good';
  return 'great';
}

function groupWeeksByMonth(data: HeatmapEntry[]): MonthGroup[] {
  const groups: MonthGroup[] = [];
  let currentMonth = -1;
  let currentGroup: MonthGroup | null = null;

  for (let col = 0; col < 52; col++) {
    const dayIndex = col * 7;
    const entry = data[dayIndex];
    if (!entry) continue;

    const d = new Date(entry.date + 'T00:00:00');
    const month = d.getMonth();

    if (month !== currentMonth) {
      if (currentGroup) groups.push(currentGroup);
      currentMonth = month;
      currentGroup = {
        label: d.toLocaleString('default', { month: 'short' }),
        weeks: [],
      };
    }

    const week = data.slice(col * 7, col * 7 + 7);
    currentGroup!.weeks.push(week);
  }

  if (currentGroup) groups.push(currentGroup);
  return groups;
}

const TODAY = new Date().toISOString().slice(0, 10);

export function MoodHeatmap({ data }: MoodHeatmapProps) {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const groups = groupWeeksByMonth(data);

  // Scroll to today (far right) after mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [data]);

  const legendItems = [
    { key: 'none',  labelKey: 'dashboard.heatmap.legend.noData' },
    { key: 'hard',  labelKey: 'dashboard.heatmap.legend.hard'   },
    { key: 'okay',  labelKey: 'dashboard.heatmap.legend.okay'   },
    { key: 'good',  labelKey: 'dashboard.heatmap.legend.good'   },
    { key: 'great', labelKey: 'dashboard.heatmap.legend.great'  },
  ] as const;

  return (
    <section className="rounded-2xl border border-warm-100 bg-warm-50 p-5 shadow-soft">
      <h3 className="text-sm font-semibold text-warm-700">
        {t('dashboard.heatmap.title')}
      </h3>
      <p className="mt-0.5 mb-4 text-xs text-warm-500">
        {t('dashboard.heatmap.subtitle')}
      </p>

      <div ref={scrollRef} className="overflow-x-auto pb-1">
        <div className="flex gap-2 min-w-max">
          {groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              <span className="text-xs text-warm-400 font-medium">{group.label}</span>
              <div className="flex gap-1">
                {group.weeks.map((week, wIdx) => (
                  <div key={wIdx} className="flex flex-col gap-1">
                    {week.map((entry, dIdx) => {
                      const cellKey = getCellKey(entry.score);
                      return (
                        <div
                          key={`${wIdx}-${dIdx}`}
                          className={[
                            'h-3.5 w-3.5 rounded transition-colors duration-150',
                            CELL_CLASSES[cellKey],
                            entry.date === TODAY
                              ? 'ring-2 ring-warm-600 ring-offset-1'
                              : '',
                          ].join(' ')}
                          title={
                            entry.score !== null
                              ? `${entry.date}: ${entry.score.toFixed(1)}`
                              : `${entry.date}: ${t('dashboard.heatmap.legend.noData')}`
                          }
                          role="img"
                          aria-label={
                            entry.score !== null
                              ? `${entry.date}: ${entry.score.toFixed(1)}`
                              : `${entry.date}: ${t('dashboard.heatmap.legend.noData')}`
                          }
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-warm-500">
        {legendItems.map(({ key, labelKey }) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`h-3 w-3 rounded ${CELL_CLASSES[key]!.split(' ')[0]}`} />
            <span>{t(labelKey as never)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
