'use client';

import { useState } from 'react';
import {
  ChevronDown,
  Bell,
  User,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const businesses = [
  { id: 'pestle', name: 'Pestle', slug: 'pestle' },
  { id: 'dps', name: 'DallasPuram Santha', slug: 'dallaspuram-santha' },
  { id: 'sloka', name: 'Sloka', slug: 'sloka' },
];

interface TopNavProps {
  currentBusiness?: string;
  onBusinessChange?: (slug: string) => void;
}

export function TopNav({ currentBusiness = 'pestle', onBusinessChange }: TopNavProps) {
  const [isBusinessOpen, setIsBusinessOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);

  const activeBusiness = businesses.find((b) => b.slug === currentBusiness);

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-[var(--color-border)] flex items-center justify-between px-8 z-40">
      {/* Business Switcher */}
      <div className="relative">
        <button
          onClick={() => setIsBusinessOpen(!isBusinessOpen)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary-lighter)] text-white hover:bg-[var(--color-primary)] transition-colors"
        >
          <Building2 size={18} />
          <span className="font-medium">{activeBusiness?.name}</span>
          <ChevronDown
            size={18}
            className={cn(
              'transition-transform duration-200',
              isBusinessOpen ? 'rotate-180' : ''
            )}
          />
        </button>

        {/* Business Dropdown */}
        {isBusinessOpen && (
          <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-[var(--color-border)] z-50">
            {businesses.map((business) => (
              <button
                key={business.id}
                onClick={() => {
                  onBusinessChange?.(business.slug);
                  setIsBusinessOpen(false);
                }}
                className={cn(
                  'w-full text-left px-4 py-3 first:rounded-t-lg last:rounded-b-lg transition-colors',
                  activeBusiness?.id === business.id
                    ? 'bg-[var(--color-primary-lighter)] text-white'
                    : 'hover:bg-[var(--color-bg-secondary)] text-[var(--color-text)]'
                )}
              >
                <div className="font-medium">{business.name}</div>
                <div className="text-xs text-[var(--color-text-muted)] mt-1">
                  {business.id === 'dps'
                    ? 'Online Grocery'
                    : 'Wholesale Distributor'}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative p-2 hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors">
          <Bell size={20} className="text-[var(--color-text)]" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--color-error)] rounded-full" />
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setIsUserOpen(!isUserOpen)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <ChevronDown size={16} className="text-[var(--color-text-muted)]" />
          </button>

          {isUserOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[var(--color-border)]">
              <button className="w-full text-left px-4 py-3 hover:bg-[var(--color-bg-secondary)] transition-colors rounded-t-lg">
                <div className="font-medium text-[var(--color-text)]">
                  Admin User
                </div>
                <div className="text-sm text-[var(--color-text-muted)]">
                  admin@dps.com
                </div>
              </button>
              <hr className="border-[var(--color-border)]" />
              <button className="w-full text-left px-4 py-2 hover:bg-[var(--color-bg-secondary)] text-[var(--color-text)] text-sm transition-colors">
                Profile Settings
              </button>
              <button className="w-full text-left px-4 py-2 hover:bg-[var(--color-bg-secondary)] text-[var(--color-text)] text-sm transition-colors rounded-b-lg">
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
