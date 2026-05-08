'use client';

export function SimpleLineChart() {
  const data = [
    { day: 'Mon', value: 2400 },
    { day: 'Tue', value: 1398 },
    { day: 'Wed', value: 9800 },
    { day: 'Thu', value: 3908 },
    { day: 'Fri', value: 4800 },
    { day: 'Sat', value: 3800 },
    { day: 'Sun', value: 4300 },
  ];

  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = 0;
  const range = maxValue - minValue;

  return (
    <div className="space-y-4">
      {/* Chart Area */}
      <div className="h-64 flex items-end justify-between gap-2">
        {data.map((item, idx) => {
          const heightPercent = ((item.value - minValue) / range) * 100;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-gradient-to-t from-[var(--color-secondary)] to-[var(--color-secondary-light)] rounded-t-lg hover:opacity-80 transition-opacity" style={{ height: `${heightPercent}%`, minHeight: '2px' }} />
              <span className="text-xs text-[var(--color-text-muted)] font-medium">
                {item.day}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-secondary-light)]" />
          <span className="text-sm font-medium text-[var(--color-text)]">
            Daily Revenue
          </span>
        </div>
        <span className="text-sm font-semibold text-[var(--color-primary)]">
          Avg: ${(data.reduce((a, b) => a + b.value, 0) / data.length).toFixed(0)}
        </span>
      </div>
    </div>
  );
}
