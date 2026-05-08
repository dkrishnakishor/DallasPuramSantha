'use client';

import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransferDialogProps {
  productId?: string;
  productName?: string;
  currentBusiness?: string;
  onClose?: () => void;
  onSubmit?: (data: any) => void;
  isOpen?: boolean;
}

const businesses = [
  { id: 'pestle', name: 'Pestle' },
  { id: 'dps', name: 'DallasPuram Santha' },
  { id: 'sloka', name: 'Sloka' },
];

export function TransferDialog({
  productId,
  productName = 'Product',
  currentBusiness = 'pestle',
  onClose,
  onSubmit,
  isOpen = true,
}: TransferDialogProps) {
  const [toBusinessId, setToBusinessId] = useState(
    businesses.find((b) => b.id !== currentBusiness)?.id || ''
  );
  const [quantity, setQuantity] = useState(10);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({
      productId,
      productName,
      fromBusiness: currentBusiness,
      toBusiness: toBusinessId,
      quantity,
      notes,
    });
    setQuantity(10);
    setNotes('');
    onClose?.();
  };

  if (!isOpen) return null;

  const currentBusinessName = businesses.find(
    (b) => b.id === currentBusiness
  )?.name;
  const toBusinessName = businesses.find((b) => b.id === toBusinessId)?.name;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h3 className="text-lg font-bold text-[var(--color-text)]">
            Request Transfer
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-[var(--color-bg-secondary)] rounded-lg transition-colors"
          >
            <X size={20} className="text-[var(--color-text-muted)]" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-5">
          {/* Product Info */}
          <div className="bg-[var(--color-primary-lighter)] rounded-lg p-4">
            <p className="text-xs text-white/80 uppercase font-semibold mb-1">
              Product
            </p>
            <p className="text-lg font-bold text-white">{productName}</p>
          </div>

          {/* From Business */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              From Store
            </label>
            <div className="px-4 py-3 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)] font-medium text-[var(--color-text)]">
              {currentBusinessName}
            </div>
          </div>

          {/* To Business */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              To Store
            </label>
            <select
              value={toBusinessId}
              onChange={(e) => setToBusinessId(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:ring-opacity-20"
            >
              {businesses
                .filter((b) => b.id !== currentBusiness)
                .map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Quantity to Transfer
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:ring-opacity-20"
            />
            <p className="text-xs text-[var(--color-text-muted)] mt-2">
              Units to move from {currentBusinessName} to {toBusinessName}
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any special instructions..."
              rows={2}
              className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:ring-opacity-20 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)] flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text)] font-medium hover:bg-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-light)] transition-colors flex items-center justify-center gap-2"
          >
            <Send size={16} />
            Request Transfer
          </button>
        </div>
      </form>
    </div>
  );
}
