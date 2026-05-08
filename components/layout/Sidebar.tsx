'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  Inbox,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    label: 'Inventory',
    href: '/inventory',
    icon: Package,
    items: [
      { label: 'Stock Levels', href: '/inventory' },
      { label: 'Transfers', href: '/inventory/transfers' },
      { label: 'Adjustments', href: '/inventory/adjust' },
    ],
  },
  {
    label: 'Purchasing',
    href: '/purchasing',
    icon: ShoppingCart,
    items: [
      { label: 'Purchase Orders', href: '/purchasing' },
      { label: 'Receive Stock', href: '/purchasing/receive' },
    ],
  },
  {
    label: 'Orders',
    href: '/orders',
    icon: ShoppingCart,
    items: [
      { label: 'All Orders', href: '/orders' },
      { label: 'New Order', href: '/orders/new' },
    ],
  },
  {
    label: 'Customers',
    href: '/customers',
    icon: Users,
  },
  {
    label: 'Expenses',
    href: '/expenses',
    icon: Inbox,
    items: [
      { label: 'Expense Log', href: '/expenses' },
      { label: 'Receipts', href: '/expenses/receipts' },
    ],
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: BarChart3,
    items: [
      { label: 'Profit & Loss', href: '/reports/profit-loss' },
      { label: 'Inventory Value', href: '/reports/inventory-valuation' },
    ],
  },
];

interface SidebarProps {
  businessName?: string;
}

export function Sidebar({ businessName = 'Pestle' }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname.includes(href);

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-white to-[var(--color-bg-secondary)] border-r border-[var(--color-border)] flex flex-col overflow-y-auto">
      {/* Logo Section */}
      <div className="px-6 py-8 border-b border-[var(--color-border)]">
        <h1 className="text-2xl font-bold text-[var(--color-primary)] tracking-tight">
          DPS CRM
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          {businessName}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200',
                  active
                    ? 'bg-[var(--color-primary-lighter)] text-white shadow-sm'
                    : 'text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]'
                )}
              >
                <Icon size={20} />
                <span className="flex-1">{item.label}</span>
                {item.items && (
                  <ChevronRight
                    size={16}
                    className={cn(
                      'transition-transform',
                      active ? 'rotate-90' : ''
                    )}
                  />
                )}
              </Link>

              {/* Sub-items */}
              {item.items && active && (
                <div className="ml-8 mt-2 space-y-1 border-l-2 border-[var(--color-primary-light)] pl-4">
                  {item.items.map((subitem) => {
                    const subActive = pathname === subitem.href;
                    return (
                      <Link
                        key={subitem.href}
                        href={subitem.href}
                        className={cn(
                          'block px-4 py-2 rounded-lg text-sm transition-colors duration-200',
                          subActive
                            ? 'bg-[var(--color-primary-lighter)] text-white font-medium'
                            : 'text-[var(--color-text-muted)] hover:text-[var(--color-primary)]'
                        )}
                      >
                        {subitem.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Settings & Logout */}
      <div className="border-t border-[var(--color-border)] p-3 space-y-1">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] transition-colors">
          <Settings size={20} />
          <span>Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--color-error)] hover:bg-red-50 transition-colors">
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
