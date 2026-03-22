import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTranslation } from 'react-i18next';

interface TrendEntry {
  date: string;
  avgScore: number;
}

interface MoodTrendChartProps {
  data: TrendEntry[];
}

// Chart color constants — no inline magic values
const CHART_LINE_COLOR   = '#14b8a6'; // eira-500 teal
const CHART_DOT_COLOR    = '#14b8a6'; // eira-500
const CHART_DOT_ACTIVE   = '#0d9488'; // eira-600
const CHART_GRADIENT_ID  = 'moodAreaGradient';
const CHART_GRID_COLOR   = '#f0fdf9'; // eira-50
const CHART_TICK_COLOR   = '#2dd4bf'; // eira-400

const TOOLTIP_CONTENT_STYLE = {
  borderRadius: '12px',
  border: '1px solid #ccfbef',
  fontSize: '13px',
  color: '#115e59',
  background: '#f0fdf9',
};

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

function formatDateToDayName(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return DAY_NAMES[d.getDay()] ?? dateStr;
}

export function MoodTrendChart({ data }: MoodTrendChartProps) {
  const { t } = useTranslation();

  const chartData = data.map((entry) => ({
    day: formatDateToDayName(entry.date),
    avgScore: Number(entry.avgScore.toFixed(1)),
  }));

  return (
    <section className="rounded-2xl border border-eira-100 bg-white p-5 shadow-soft">
      <h3 className="text-sm font-semibold text-eira-700">
        {t('dashboard.trend.title')}
      </h3>
      <p className="mt-0.5 mb-4 text-xs text-eira-400">
        {t('dashboard.trend.subtitle')}
      </p>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={CHART_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={CHART_LINE_COLOR} stopOpacity={0.2} />
                <stop offset="95%" stopColor={CHART_LINE_COLOR} stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: CHART_TICK_COLOR }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[1, 10]}
              ticks={[1, 3, 5, 7, 10]}
              tick={{ fontSize: 11, fill: CHART_TICK_COLOR }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={TOOLTIP_CONTENT_STYLE}
              formatter={(value: number) => [value, t('dashboard.trend.scoreLabel')]}
            />
            <Area
              type="monotone"
              dataKey="avgScore"
              stroke={CHART_LINE_COLOR}
              strokeWidth={2.5}
              fill={`url(#${CHART_GRADIENT_ID})`}
              dot={{ fill: CHART_DOT_COLOR, r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: CHART_DOT_ACTIVE, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
