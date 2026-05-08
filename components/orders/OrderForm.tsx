'use client';

import { useState } from 'react';
import { Trash2, Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderLineItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface OrderFormProps {
  customerId?: string;
  customerName?: string;
  onSubmit?: (data: any) => void;
}

const mockProducts = [
  { id: '1', name: 'Fresh Tomatoes', price: 2.99 },
  { id: '2', name: 'Yellow Onions', price: 1.99 },
  { id: '3', name: 'Romaine Lettuce', price: 3.49 },
  { id: '4', name: 'Carrots (bulk)', price: 1.49 },
  { id: '5', name: 'Bell Peppers', price: 2.49 },
];

export function OrderForm({
  customerId,
  customerName = 'Walk-in Customer',
  onSubmit,
}: OrderFormProps) {
  const [items, setItems] = useState<OrderLineItem[]>([
    {
      id: '1',
      productId: '1',
      productName: 'Fresh Tomatoes',
      quantity: 2,
      unitPrice: 2.99,
      total: 5.98,
    },
  ]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [discount, setDiscount] = useState(0);

  const addItem = () => {
    const newItem: OrderLineItem = {
      id: Math.random().toString(36).substr(2, 9),
      productId: '',
      productName: '',
      quantity: 1,
      unitPrice: 0,
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
          if (field === 'quantity' || field === 'unitPrice') {
            updated.total = updated.quantity * updated.unitPrice;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = (subtotal * discount) / 100;
  const subtotalAfterDiscount = subtotal - discountAmount;
  const tax = subtotalAfterDiscount * 0.08;
  const total = subtotalAfterDiscount + tax;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.({
          items,
          paymentMethod,
          notes,
          discount,
          subtotal,
          discountAmount,
          tax,
          total,
        });
      }}
      className="bg-white rounded-xl border border-[var(--color-border)] p-8"
    >
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
          New Sales Order
        </h2>
        <p className="text-[var(--color-text-muted)]">
          Selling to{' '}
          <span className="font-semibold text-[var(--color-primary)]">
            {customerName}
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
                Qty
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-text-muted)]">
                Price
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
                        updateItem(item.id, 'unitPrice', product.price);
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
                    value={item.unitPrice}
                    onChange={(e) =>
                      updateItem(item.id, 'unitPrice', parseFloat(e.target.value))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:ring-opacity-20 text-right"
                  />
                </td>
                <td className="px-4 py-4 text-right font-semibold text-[var(--color-secondary)]">
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

      {/* Payment & Discount */}
      <div className="mb-8 grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
            Payment Method
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:ring-opacity-20"
          >
            <option value="cash">Cash</option>
            <option value="card">Credit/Debit Card</option>
            <option value="check">Check</option>
            <option value="paypal">PayPal</option>
            <option value="zelle">Zelle</option>
            <option value="wire">Wire Transfer</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
            Discount (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={discount}
            onChange={(e) => setDiscount(parseFloat(e.target.value))}
            className="w-full px-4 py-2 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:ring-opacity-20"
          />
        </div>
      </div>

      {/* Totals */}
      <div className="mb-8 flex justify-end">
        <div className="w-80 space-y-3">
          <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
            <span className="text-[var(--color-text-muted)]">Subtotal</span>
            <span className="font-semibold text-[var(--color-text)]">
              ${subtotal.toFixed(2)}
            </span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
              <span className="text-[var(--color-text-muted)]">
                Discount ({discount}%)
              </span>
              <span className="font-semibold text-red-600">
                -${discountAmount.toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
            <span className="text-[var(--color-text-muted)]">Tax (8%)</span>
            <span className="font-semibold text-[var(--color-text)]">
              ${tax.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between py-3 px-4 bg-[var(--color-secondary)] rounded-lg">
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
          placeholder="Add delivery instructions, special requests, etc..."
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
          className="px-6 py-2 rounded-lg bg-[var(--color-secondary)] text-white font-medium hover:bg-[var(--color-secondary-light)] transition-colors flex items-center gap-2"
        >
          <Check size={16} />
          Create Order
        </button>
      </div>
    </form>
  );
}
