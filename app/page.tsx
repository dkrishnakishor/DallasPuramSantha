'use client';

import { BarChart3, TrendingUp, Package, DollarSign, Users, AlertCircle } from 'lucide-react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { SimpleLineChart } from '@/components/dashboard/SimpleLineChart';
import { SimpleBarChart } from '@/components/dashboard/SimpleBarChart';

export default function Dashboard() {
  // Sample dashboard data
  const metrics = [
    {
      title: 'Total Revenue',
      value: '$42,850',
      change: 12.5,
      icon: DollarSign,
      trend: 'up' as const,
    },
    {
      title: 'Active Orders',
      value: '127',
      change: 8.2,
      icon: TrendingUp,
      trend: 'up' as const,
    },
    {
      title: 'Inventory Items',
      value: '1,243',
      change: -2.1,
      icon: Package,
      trend: 'down' as const,
    },
    {
      title: 'Customers',
      value: '342',
      change: 5.3,
      icon: Users,
      trend: 'up' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                DallasPuram Santha
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Business Intelligence Dashboard</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Welcome Section */}
        <section className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Getting Started
          </h2>
          <p className="text-blue-800 dark:text-blue-200 mt-2">
            Welcome to DallasPuram Santha CRM. This dashboard provides real-time insights into your business performance.
            To access full functionality including API endpoints, please authenticate with your Supabase account.
          </p>
          <div className="mt-4 flex gap-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Get Started
            </button>
            <button className="px-4 py-2 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors font-medium border border-blue-200 dark:border-blue-800">
              View Documentation
            </button>
          </div>
        </section>

        {/* Key Metrics */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Key Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <MetricCard
                  key={index}
                  title={metric.title}
                  value={metric.value}
                  change={metric.change}
                  icon={<Icon className="w-6 h-6" />}
                  trend={metric.trend}
                />
              );
            })}
          </div>
        </section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Trend */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Revenue Trend
            </h3>
            <SimpleLineChart />
          </div>

          {/* Expense Breakdown */}
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-orange-600" />
              Expense Breakdown
            </h3>
            <SimpleBarChart />
          </div>
        </section>

        {/* Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Analytics',
              description: 'Track batch profitability, product performance, and channel analysis',
              icon: '📊',
              endpoint: '/api/analytics/batch-profitability',
            },
            {
              title: 'Inventory Management',
              description: 'Monitor critical stock levels and optimize inventory distribution',
              icon: '📦',
              endpoint: '/api/inventory/critical',
            },
            {
              title: 'Multi-Tenant Support',
              description: 'Manage multiple business entities with isolated data',
              icon: '🏢',
              endpoint: 'Dashboard',
            },
            {
              title: 'Real-Time Updates',
              description: 'Get instant notifications on important business events',
              icon: '⚡',
              endpoint: 'Coming Soon',
            },
            {
              title: 'Security First',
              description: 'Enterprise-grade authentication and authorization',
              icon: '🔐',
              endpoint: 'Supabase Auth',
            },
            {
              title: 'API-First Design',
              description: 'RESTful APIs for seamless integration with your tools',
              icon: '🔌',
              endpoint: 'REST APIs',
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-lg transition-all hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">{feature.description}</p>
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <code className="text-xs text-blue-600 dark:text-blue-400 font-mono">{feature.endpoint}</code>
              </div>
            </div>
          ))}
        </section>

        {/* API Status */}
        <section className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">API Status</h3>
          <div className="space-y-3">
            {[
              { name: 'Batch Profitability', endpoint: '/api/analytics/batch-profitability', status: '✅ Active' },
              { name: 'Inventory Critical', endpoint: '/api/inventory/critical', status: '✅ Active' },
              { name: 'Product Profitability', endpoint: '/api/analytics/product-profitability', status: '✅ Active' },
            ].map((api, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{api.name}</p>
                  <code className="text-xs text-slate-600 dark:text-slate-400 font-mono">{api.endpoint}</code>
                </div>
                <span className="text-green-600 dark:text-green-400 font-semibold">{api.status}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Footer CTA */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-900 dark:to-blue-800 rounded-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to Get Started?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Authenticate with Supabase to unlock full access to all API endpoints and features.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold">
              Authenticate Now
            </button>
            <button className="px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white rounded-lg transition-colors font-semibold border border-blue-400">
              View API Docs
            </button>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-blue-600">Features</a></li>
                <li><a href="#" className="hover:text-blue-600">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-600">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Developers</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-blue-600">API Docs</a></li>
                <li><a href="#" className="hover:text-blue-600">GitHub</a></li>
                <li><a href="#" className="hover:text-blue-600">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-blue-600">About</a></li>
                <li><a href="#" className="hover:text-blue-600">Blog</a></li>
                <li><a href="#" className="hover:text-blue-600">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="#" className="hover:text-blue-600">Privacy</a></li>
                <li><a href="#" className="hover:text-blue-600">Terms</a></li>
                <li><a href="#" className="hover:text-blue-600">License</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-800 mt-8 pt-8 text-center text-sm text-slate-600 dark:text-slate-400">
            <p>&copy; 2026 DallasPuram Santha. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
