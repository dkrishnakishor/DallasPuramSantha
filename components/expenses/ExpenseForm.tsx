'use client';

import { useState } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpenseFormProps {
  onSubmit?: (data: any) => void;
  defaultValues?: {
    date?: string;
    category?: string;
    description?: string;
    amount?: number;
  };
}

const expenseCategories = [
  { id: 'supplies', name: 'Office Supplies', icon: '📋' },
  { id: 'utilities', name: 'Utilities & Power', icon: '⚡' },
  { id: 'rent', name: 'Rent & Facilities', icon: '🏢' },
  { id: 'labor', name: 'Labor & Wages', icon: '👥' },
  { id: 'delivery', name: 'Delivery & Shipping', icon: '🚚' },
  { id: 'maintenance', name: 'Maintenance & Repair', icon: '🔧' },
  { id: 'marketing', name: 'Marketing & Advertising', icon: '📢' },
  { id: 'insurance', name: 'Insurance', icon: '🛡️' },
  { id: 'other', name: 'Other', icon: '📝' },
];

const paymentMethods = [
  { id: 'cash', name: 'Cash' },
  { id: 'card', name: 'Credit/Debit Card' },
  { id: 'check', name: 'Check' },
  { id: 'paypal', name: 'PayPal' },
  { id: 'zelle', name: 'Zelle' },
  { id: 'wire', name: 'Wire Transfer' },
  { id: 'ach', name: 'ACH Transfer' },
];

export function ExpenseForm({
  onSubmit,
  defaultValues = {},
}: ExpenseFormProps) {
  const [date, setDate] = useState(defaultValues.date || new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(defaultValues.category || '');
  const [description, setDescription] = useState(defaultValues.description || '');
  const [amount, setAmount] = useState(defaultValues.amount || 0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [vendor, setVendor] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [isReimbursable, setIsReimbursable] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({
      date,
      category,
      description,
      amount,
      paymentMethod,
      vendor,
      referenceNumber,
      isReimbursable,
    });
  };

  const selectedCategory = expenseCategories.find((c) => c.id === category);

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-[var(--color-border)] p-8"
    >
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--color-text)]">
          Record Expense
        </h2>
        <p className="text-[var(--color-text-muted)] mt-1">
          Log a new business expense
        </p>
      </div>

      {/* Basic Info */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:ring-opacity-20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
            Amount
          </label>
          <div className="flex items-center">
            <span className="text-[var(--color-text)] font-semibold mr-2">
              $
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              className="flex-1 px-4 py-2 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:ring-opacity-20"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Category Selection */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-[var(--color-text)] mb-3">
          Expense Category
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {expenseCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={cn(
                'p-3 rounded-lg border-2 transition-all duration-200 text-left',
                category === cat.id
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary-lighter)] bg-opacity-10'
                  : 'border-[var(--color-border)] hover:border-[var(--color-secondary)]'
              )}
            >
              <div className="text-xl mb-1">{cat.icon}</div>
              <div className="text-xs font-medium text-[var(--color-text)]">
                {cat.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Description & Vendor */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What was this expense for?"
            className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:ring-opacity-20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
            Vendor / Merchant
          </label>
          <input
            type="text"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            placeholder="Where did you purchase this?"
            className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:ring-opacity-20"
          />
        </div>
      </div>

      {/* Payment Method & Reference */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
            Payment Method
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:ring-opacity-20"
          >
            {paymentMethods.map((method) => (
              <option key={method.id} value={method.id}>
                {method.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
            Reference Number
          </label>
          <input
            type="text"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            placeholder="Check #, Transaction ID, etc."
            className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:ring-opacity-20"
          />
        </div>
      </div>

      {/* Reimbursable */}
      <div className="mb-8">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isReimbursable}
            onChange={(e) => setIsReimbursable(e.target.checked)}
            className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-primary)]"
          />
          <span className="text-sm font-medium text-[var(--color-text)]">
            This expense should be reimbursed to an employee
          </span>
        </label>
      </div>

      {/* Info Box */}
      {selectedCategory && (
        <div className="mb-8 flex gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <AlertCircle size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            This expense will be categorized as{' '}
            <span className="font-semibold">{selectedCategory.name}</span> and
            will appear in your expense reports.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 justify-end">
        <button
          type="button"
          className="px-6 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text)] font-medium hover:bg-[var(--color-bg-secondary)] transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-light)] transition-colors flex items-center gap-2"
        >
          <Save size={16} />
          Save Expense
        </button>
      </div>
    </form>
  );
}
