'use client';

export function SimpleBarChart() {
  const data = [
    { category: 'Utilities', value: 850, color: '#0ea5a5' },
    { category: 'Labor', value: 1200, color: '#1b5e3f' },
    { category: 'Supplies', value: 450, color: '#f59e0b' },
    { category: 'Delivery', value: 650, color: '#dc2626' },
    { category: 'Other', value: 350, color: '#6b7280' },
  ];

  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="space-y-4">
      {/* Bars */}
      <div className="space-y-3">
        {data.map((item, idx) => {
          const widthPercent = (item.value / maxValue) * 100;
          return (
            <div key={idx} className="flex items-center gap-4">
              <span className="text-sm font-medium text-[var(--color-text)] w-24">
                {item.category}
              </span>
              <div className="flex-1">
                <div className="h-6 bg-[var(--color-bg-secondary)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300 hover:opacity-80"
                    style={{
                      width: `${widthPercent}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
              <span className="text-sm font-semibold text-[var(--color-text)] w-16 text-right">
                ${item.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="pt-4 border-t border-[var(--color-border)]">
        <p className="text-sm text-[var(--color-text-muted)]">Total Expenses</p>
        <p className="text-lg font-bold text-[var(--color-primary)]">
          ${data.reduce((a, b) => a + b.value, 0)}
        </p>
      </div>
    </div>
  );
}
