'use client';

import { useState } from 'react';
import { Trash2, Plus, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  total: number;
}

interface PurchaseOrderFormProps {
  vendorId?: string;
  vendorName?: string;
  onSubmit?: (data: any) => void;
}

const mockProducts = [
  { id: '1', name: 'Fresh Tomatoes', defaultPrice: 1.2 },
  { id: '2', name: 'Yellow Onions', defaultPrice: 0.8 },
  { id: '3', name: 'Romaine Lettuce', defaultPrice: 1.5 },
  { id: '4', name: 'Carrots (bulk)', defaultPrice: 0.5 },
];

export function PurchaseOrderForm({
  vendorId,
  vendorName = 'Select Vendor',
  onSubmit,
}: PurchaseOrderFormProps) {
  const [items, setItems] = useState<OrderItem[]>([
    {
      id: '1',
      productId: '1',
      productName: 'Fresh Tomatoes',
      quantity: 100,
      unitCost: 1.2,
      total: 120,
    },
  ]);
  const [notes, setNotes] = useState('');

  const addItem = () => {
    const newItem: OrderItem = {
      id: Math.random().toString(36).substr(2, 9),
      productId: '',
      productName: '',
      quantity: 1,
      unitCost: 0,
      total: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: string, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitCost') {
            updated.total = updated.quantity * updated.unitCost;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.({ items, notes, subtotal, tax, total });
      }}
      className="bg-white rounded-xl border border-[var(--color-border)] p-8"
    >
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
          Create Purchase Order
        </h2>
        <p className="text-[var(--color-text-muted)]">
          Order from{' '}
          <span className="font-semibold text-[var(--color-primary)]">
            {vendorName}
          </span>
        </p>
      </div>

      {/* Items Table */}
      <div className="mb-8 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
              <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-text-muted)]">
                Product
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-text-muted)]">
                Quantity
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-text-muted)]">
                Unit Cost
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-text-muted)]">
                Total
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-text-muted)]">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] transition-colors"
              >
                <td className="px-4 py-4">
                  <select
                    value={item.productId}
                    onChange={(e) => {
                      const product = mockProducts.find(
                        (p) => p.id === e.target.value
                      );
                      if (product) {
                        updateItem(item.id, 'productId', e.target.value);
                        updateItem(item.id, 'productName', product.name);
                        updateItem(item.id, 'unitCost', product.defaultPrice);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:ring-opacity-20"
                  >
                    <option value="">Select product...</option>
                    {mockProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-4">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(item.id, 'quantity', parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:ring-opacity-20 text-right"
                  />
                </td>
                <td className="px-4 py-4">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unitCost}
                    onChange={(e) =>
                      updateItem(item.id, 'unitCost', parseFloat(e.target.value))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:ring-opacity-20 text-right"
                  />
                </td>
                <td className="px-4 py-4 text-right font-semibold text-[var(--color-primary)]">
                  ${item.total.toFixed(2)}
                </td>
                <td className="px-4 py-4 text-center">
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Item Button */}
      <button
        type="button"
        onClick={addItem}
        className="mb-8 flex items-center gap-2 px-4 py-2 border border-[var(--color-border)] rounded-lg text-[var(--color-secondary)] font-medium hover:bg-[var(--color-primary-lighter)] hover:text-white hover:border-[var(--color-primary)] transition-all"
      >
        <Plus size={16} />
        Add Item
      </button>

      {/* Totals */}
      <div className="mb-8 flex justify-end">
        <div className="w-80 space-y-3">
          <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
            <span className="text-[var(--color-text-muted)]">Subtotal</span>
            <span className="font-semibold text-[var(--color-text)]">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
            <span className="text-[var(--color-text-muted)]">Tax (8%)</span>
            <span className="font-semibold text-[var(--color-text)]">
              ${tax.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between py-3 px-4 bg-[var(--color-primary-lighter)] rounded-lg">
            <span className="font-bold text-white">Total</span>
            <span className="font-bold text-white text-lg">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
          Order Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any special instructions..."
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:ring-opacity-20 text-[var(--color-text)]"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <button
          type="button"
          className="px-6 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text)] font-medium hover:bg-[var(--color-bg-secondary)] transition-colors"
        >
          Save as Draft
        </button>
        <button
          type="submit"
          className="px-6 py-2 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-light)] transition-colors flex items-center gap-2"
        >
          <Send size={16} />
          Create & Send PO
        </button>
      </div>
    </form>
  );
}
