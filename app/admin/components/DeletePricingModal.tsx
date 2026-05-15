'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface TransferRule {
  id: string;
  fromBusinessId: string;
  toBusinessId: string;
  productId: string | null;
  markupType: string;
  markupValue: string;
  fromBusiness: { id: string; displayName: string };
  toBusiness: { id: string; displayName: string };
  product: { id: string; name: string; sku: string } | null;
}

interface DeletePricingModalProps {
  rule: TransferRule;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function DeletePricingModal({
  rule,
  onClose,
  onConfirm,
}: DeletePricingModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError('');
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete rule');
    } finally {
      setLoading(false);
    }
  };

  const ruleDescription = rule.product
    ? `${rule.markupType === 'PERCENTAGE' ? rule.markupValue + '%' : '$' + rule.markupValue} markup on ${rule.product.name}`
    : `${rule.markupType === 'PERCENTAGE' ? rule.markupValue + '%' : '$' + rule.markupValue} markup on all products`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 rounded-full p-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Delete Pricing Rule</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <p className="text-gray-700 font-medium mb-3">
              Are you sure you want to delete this rule?
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded p-3 space-y-2">
              <div>
                <p className="text-xs text-gray-600 font-medium">From Organization</p>
                <p className="text-sm text-gray-900">{rule.fromBusiness.displayName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">To Organization</p>
                <p className="text-sm text-gray-900">{rule.toBusiness.displayName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Product</p>
                <p className="text-sm text-gray-900">
                  {rule.product ? `${rule.product.name} (${rule.product.sku})` : 'All products'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-medium">Markup</p>
                <p className="text-sm text-gray-900">
                  {rule.markupType === 'PERCENTAGE'
                    ? `${rule.markupValue}%`
                    : `$${rule.markupValue}`}
                </p>
              </div>
            </div>
            <p className="text-gray-600 text-sm mt-4">
              This action cannot be undone. New transfers will not use this rule.
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
