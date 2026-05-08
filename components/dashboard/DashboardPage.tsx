'use client';

import { BarChart3, TrendingUp, Package, DollarSign } from 'lucide-react';
import { MetricCard, DashboardGrid } from './MetricCard';
import { SimpleLineChart } from './SimpleLineChart';
import { SimpleBarChart } from './SimpleBarChart';

export function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text)]">
          Business Dashboard
        </h1>
        <p className="text-[var(--color-text-muted)] mt-2">
          Overview of your store performance
        </p>
      </div>

      {/* KPI Cards */}
      <DashboardGrid>
        <MetricCard
          title="Total Revenue"
          value="$12,458"
          unit="USD"
          change={8.2}
          color="green"
          icon={<DollarSign size={24} />}
          subtext="This month"
        />
        <MetricCard
          title="Gross Profit"
          value="$4,520"
          unit="USD"
          change={5.1}
          color="blue"
          icon={<TrendingUp size={24} />}
          subtext="After COGS"
        />
        <MetricCard
          title="Inventory Value"
          value="$28,445"
          unit="USD"
          change={-2.3}
          color="amber"
          icon={<Package size={24} />}
          subtext="Current stock"
        />
        <MetricCard
          title="Operating Expenses"
          value="$3,250"
          unit="USD"
          change={12.5}
          color="red"
          icon={<BarChart3 size={24} />}
          subtext="Month to date"
        />
      </DashboardGrid>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend */}
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[var(--color-text)]">
              Revenue Trend
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              Last 7 days
            </p>
          </div>
          <SimpleLineChart />
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-[var(--color-text)]">
              Expense Breakdown
            </h2>
            <p className="text-sm text-[var(--color-text-muted)]">
              By category
            </p>
          </div>
          <SimpleBarChart />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-xl p-8 text-white">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors backdrop-blur-sm">
            New Order
          </button>
          <button className="px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors backdrop-blur-sm">
            Upload Receipt
          </button>
          <button className="px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors backdrop-blur-sm">
            Create PO
          </button>
          <button className="px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors backdrop-blur-sm">
            View Reports
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-[var(--color-border)] p-6">
        <h2 className="text-lg font-bold text-[var(--color-text)] mb-6">
          Recent Activity
        </h2>
        <div className="space-y-4">
          {[
            {
              type: 'order',
              icon: '📦',
              title: 'Order #ORD-2025-001234 Delivered',
              time: '2 hours ago',
              user: 'Sarah Chen',
            },
            {
              type: 'po',
              icon: '📋',
              title: 'PO from Pestle Wholesale Approved',
              time: '4 hours ago',
              user: 'Alex Johnson',
            },
            {
              type: 'expense',
              icon: '💰',
              title: 'Expense Receipt Uploaded',
              time: '1 day ago',
              user: 'Mike Rodriguez',
            },
            {
              type: 'transfer',
              icon: '🔄',
              title: 'Stock Transfer Completed',
              time: '2 days ago',
              user: 'Admin',
            },
          ].map((activity, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-4 hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors"
            >
              <span className="text-2xl">{activity.icon}</span>
              <div className="flex-1">
                <p className="font-medium text-[var(--color-text)]">
                  {activity.title}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  {activity.user} • {activity.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
