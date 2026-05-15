'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Business {
  id: string;
  name: string;
  displayName: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
}

interface CreatePricingModalProps {
  onClose: () => void;
  onCreate: () => Promise<void>;
}

export default function CreatePricingModal({ onClose, onCreate }: CreatePricingModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    fromBusinessId: '',
    toBusinessId: '',
    productId: '',
    markupType: 'PERCENTAGE',
    markupValue: '',
    minMargin: '',
    notes: '',
    active: true,
  });

  useEffect(() => {
    fetchBusinessesAndProducts();
  }, []);

  const fetchBusinessesAndProducts = async () => {
    try {
      setLoadingData(true);
      const [businessRes, productsRes] = await Promise.all([
        fetch('/api/admin/organizations', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }),
        fetch('/api/products', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }),
      ]);

      if (businessRes.ok) {
        const businessData = await businessRes.json();
        setBusinesses(businessData.organizations || []);
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData.products || []);
      }
    } catch (err) {
      setError('Failed to load businesses or products');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      if (!formData.fromBusinessId || !formData.toBusinessId || !formData.markupValue) {
        setError('Please fill in required fields');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/admin/transfer-pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          fromBusinessId: formData.fromBusinessId,
          toBusinessId: formData.toBusinessId,
          productId: formData.productId || null,
          markupType: formData.markupType,
          markupValue: parseFloat(formData.markupValue),
          minMargin: formData.minMargin ? parseFloat(formData.minMargin) : null,
          notes: formData.notes,
          active: formData.active,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create pricing rule');
      }

      await onCreate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create pricing rule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h3 className="text-lg font-semibold text-gray-900">Create Pricing Rule</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          {loadingData ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : (
            <>
              {/* From Business */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  From Organization <span className="text-red-500">*</span>
                </label>
                <select
                  name="fromBusinessId"
                  value={formData.fromBusinessId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select organization</option>
                  {businesses.map((biz) => (
                    <option key={biz.id} value={biz.id}>
                      {biz.displayName}
                    </option>
                  ))}
                </select>
              </div>

              {/* To Business */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  To Organization <span className="text-red-500">*</span>
                </label>
                <select
                  name="toBusinessId"
                  value={formData.toBusinessId}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select organization</option>
                  {businesses.map((biz) => (
                    <option key={biz.id} value={biz.id}>
                      {biz.displayName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Product (Optional)
                </label>
                <select
                  name="productId"
                  value={formData.productId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All products</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Leave blank to apply rule to all products</p>
              </div>

              {/* Markup Type and Value */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Markup Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="markupType"
                    value={formData.markupType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount ($)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Markup Value <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="markupValue"
                    value={formData.markupValue}
                    onChange={handleChange}
                    placeholder={formData.markupType === 'PERCENTAGE' ? '20' : '50'}
                    step="0.01"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Min Margin */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Minimum Margin (Optional)
                </label>
                <input
                  type="number"
                  name="minMargin"
                  value={formData.minMargin}
                  onChange={handleChange}
                  placeholder="e.g., 10.50"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum profit per unit required</p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="e.g., Special pricing for seasonal products"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Active */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleChange}
                    className="w-4 h-4 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-900">Active</span>
                </label>
              </div>

              {/* Footer */}
              <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
