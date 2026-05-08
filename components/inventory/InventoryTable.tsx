'use client';

import {
  ChevronDown,
  Edit2,
  Trash2,
  AlertCircle,
  Package,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  onHand: number;
  reserved: number;
  available: number;
  costPerUnit: number;
  retailPrice: number;
  minLevel: number;
  status: 'ok' | 'low' | 'critical';
}

interface InventoryTableProps {
  items: InventoryItem[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onTransfer?: (id: string) => void;
}

const mockData: InventoryItem[] = [
  {
    id: '1',
    sku: 'TOMATO-001',
    name: 'Fresh Tomatoes',
    category: 'Produce',
    onHand: 145,
    reserved: 20,
    available: 125,
    costPerUnit: 1.2,
    retailPrice: 2.99,
    minLevel: 50,
    status: 'ok',
  },
  {
    id: '2',
    sku: 'ONION-001',
    name: 'Yellow Onions',
    category: 'Produce',
    onHand: 45,
    reserved: 10,
    available: 35,
    costPerUnit: 0.8,
    retailPrice: 1.99,
    minLevel: 50,
    status: 'low',
  },
  {
    id: '3',
    sku: 'LETTUCE-001',
    name: 'Romaine Lettuce',
    category: 'Produce',
    onHand: 12,
    reserved: 5,
    available: 7,
    costPerUnit: 1.5,
    retailPrice: 3.49,
    minLevel: 30,
    status: 'critical',
  },
];

export function InventoryTable({
  items = mockData,
  onEdit,
  onDelete,
  onTransfer,
}: InventoryTableProps) {
  const [sortBy, setSortBy] = useState<
    'name' | 'available' | 'status'
  >('name');
  const [expanded, setExpanded] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'low':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'ok':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === 'critical' || status === 'low') {
      return <AlertCircle size={14} />;
    }
    return <Package size={14} />;
  };

  return (
    <div className="bg-white rounded-xl border border-[var(--color-border)] overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
        <h2 className="font-semibold text-[var(--color-text)]">
          Stock Inventory
        </h2>
        <button className="text-sm text-[var(--color-secondary)] font-medium hover:text-[var(--color-secondary-light)] transition-colors">
          + Add Product
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
              <th className="px-6 py-4 text-left">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded border-[var(--color-border)]"
                  />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text-muted)]">
                Product
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-[var(--color-text-muted)]">
                Category
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-[var(--color-text-muted)]">
                On Hand
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-[var(--color-text-muted)]">
                Available
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-[var(--color-text-muted)]">
                Cost
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-[var(--color-text-muted)]">
                Retail Price
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-[var(--color-text-muted)]">
                Status
              </th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-[var(--color-text-muted)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className={cn(
                  'border-b border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] transition-colors',
                  expanded === item.id ? 'bg-[var(--color-primary-lighter)] bg-opacity-5' : ''
                )}
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    className="rounded border-[var(--color-border)]"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-[var(--color-text)]">
                    {item.name}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)] mt-1">
                    {item.sku}
                  </div>
                </td>
                <td className="px-6 py-4 text-[var(--color-text-muted)] text-sm">
                  {item.category}
                </td>
                <td className="px-6 py-4 text-right font-semibold text-[var(--color-text)]">
                  {item.onHand}
                </td>
                <td className="px-6 py-4 text-right font-semibold text-[var(--color-secondary)]">
                  {item.available}
                </td>
                <td className="px-6 py-4 text-right text-[var(--color-text-muted)]">
                  ${item.costPerUnit.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-right font-medium text-[var(--color-primary)]">
                  ${item.retailPrice.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <div className={cn('flex items-center justify-center gap-1 px-3 py-1 rounded-full text-xs font-medium border', getStatusColor(item.status))}>
                    {getStatusIcon(item.status)}
                    {item.status === 'critical'
                      ? 'Critical'
                      : item.status === 'low'
                      ? 'Low'
                      : 'OK'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit?.(item.id)}
                      className="p-2 hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors text-[var(--color-primary)]"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                      className="p-2 hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors text-[var(--color-secondary)]"
                      title="Transfer"
                    >
                      <ChevronDown
                        size={16}
                        className={cn(
                          'transition-transform',
                          expanded === item.id ? 'rotate-180' : ''
                        )}
                      />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
