'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Loader, ToggleRight, ToggleLeft } from 'lucide-react';
import CreatePricingModal from '../components/CreatePricingModal';
import EditPricingModal from '../components/EditPricingModal';
import DeletePricingModal from '../components/DeletePricingModal';

interface TransferRule {
  id: string;
  fromBusinessId: string;
  toBusinessId: string;
  productId: string | null;
  markupType: string;
  markupValue: string;
  minMargin: string | null;
  notes: string;
  active: boolean;
  createdAt: string;
  fromBusiness: { id: string; displayName: string };
  toBusiness: { id: string; displayName: string };
  product: { id: string; name: string; sku: string } | null;
}

export default function TransferPricingPage() {
  const [rules, setRules] = useState<TransferRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState<TransferRule | null>(null);

  // Fetch rules
  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/transfer-pricing', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch transfer pricing rules');
      const data = await response.json();
      setRules(data.rules || []);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch rules');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    await fetchRules();
    setShowCreateModal(false);
  };

  const handleEdit = (rule: TransferRule) => {
    setSelectedRule(rule);
    setShowEditModal(true);
  };

  const handleDelete = (rule: TransferRule) => {
    setSelectedRule(rule);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRule) return;

    try {
      const response = await fetch(`/api/admin/transfer-pricing/${selectedRule.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete rule');
      await fetchRules();
      setShowDeleteModal(false);
      setSelectedRule(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete rule');
    }
  };

  const handleToggleActive = async (rule: TransferRule) => {
    try {
      const response = await fetch(`/api/admin/transfer-pricing/${rule.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ active: !rule.active }),
      });

      if (!response.ok) throw new Error('Failed to update rule');
      await fetchRules();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update rule');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Transfer Pricing Rules</h2>
          <p className="text-gray-600 mt-1">Manage B2B pricing rules between organizations</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          New Rule
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Rules Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : rules.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No transfer pricing rules yet. Create one to get started.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  From → To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Markup
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Min Margin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">
                        {rule.fromBusiness.displayName} → {rule.toBusiness.displayName}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {rule.product ? (
                      <div>
                        <p className="font-medium">{rule.product.name}</p>
                        <p className="text-xs text-gray-500">{rule.product.sku}</p>
                      </div>
                    ) : (
                      <span className="text-gray-500">All products</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {rule.markupType === 'PERCENTAGE'
                        ? `${rule.markupValue}%`
                        : `$${rule.markupValue}`}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {rule.minMargin ? `$${rule.minMargin}` : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(rule)}
                      className="text-gray-600 hover:text-gray-900 transition"
                    >
                      {rule.active ? (
                        <ToggleRight className="w-5 h-5 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(rule)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded transition"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rule)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreatePricingModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}

      {showEditModal && selectedRule && (
        <EditPricingModal
          rule={selectedRule}
          onClose={() => {
            setShowEditModal(false);
            setSelectedRule(null);
          }}
          onSave={async () => {
            await fetchRules();
            setShowEditModal(false);
            setSelectedRule(null);
          }}
        />
      )}

      {showDeleteModal && selectedRule && (
        <DeletePricingModal
          rule={selectedRule}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedRule(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
