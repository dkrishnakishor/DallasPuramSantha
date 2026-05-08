'use client';

import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  icon: ReactNode;
  color?: 'green' | 'blue' | 'amber' | 'red';
  trend?: 'up' | 'down' | 'neutral';
  subtext?: string;
}

export function MetricCard({
  title,
  value,
  unit,
  change,
  icon,
  color = 'green',
  trend = 'neutral',
  subtext,
}: MetricCardProps) {
  const colorClasses = {
    green: 'from-emerald-50 to-teal-50 border-emerald-100',
    blue: 'from-blue-50 to-cyan-50 border-blue-100',
    amber: 'from-amber-50 to-orange-50 border-amber-100',
    red: 'from-red-50 to-pink-50 border-red-100',
  };

  const iconColorClasses = {
    green: 'bg-emerald-100 text-emerald-600',
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-amber-100 text-amber-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div
      className={cn(
        'p-6 rounded-xl border bg-gradient-to-br transition-all duration-300 hover:shadow-lg hover:scale-105',
        colorClasses[color]
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn('p-3 rounded-lg', iconColorClasses[color])}>
          {icon}
        </div>
        {change !== undefined && (
          <div
            className={cn(
              'flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-lg',
              change >= 0
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            )}
          >
            {change >= 0 ? (
              <ArrowUpRight size={14} />
            ) : (
              <ArrowDownRight size={14} />
            )}
            {Math.abs(change)}%
          </div>
        )}
      </div>

      <h3 className="text-sm font-medium text-[var(--color-text-muted)] mb-2">
        {title}
      </h3>

      <div className="mb-3">
        <div className="text-3xl font-bold text-[var(--color-text)] tracking-tight">
          {value}
          {unit && (
            <span className="text-lg font-semibold text-[var(--color-text-muted)] ml-2">
              {unit}
            </span>
          )}
        </div>
      </div>

      {subtext && (
        <p className="text-xs text-[var(--color-text-muted)]">{subtext}</p>
      )}
    </div>
  );
}

interface DashboardGridProps {
  children: ReactNode;
}

export function DashboardGrid({ children }: DashboardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {children}
    </div>
  );
}
