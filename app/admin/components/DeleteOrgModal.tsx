'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  displayName: string;
}

interface DeleteOrgModalProps {
  organization: Organization;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function DeleteOrgModal({
  organization,
  onClose,
  onConfirm,
}: DeleteOrgModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmText, setConfirmText] = useState('');

  const handleConfirm = async () => {
    if (confirmText !== organization.displayName) {
      setError('Organization name does not match');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 rounded-full p-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Delete Organization</h3>
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
            <p className="text-gray-700 font-medium mb-2">
              Are you sure you want to delete{' '}
              <span className="text-red-600">"{organization.displayName}"</span>?
            </p>
            <p className="text-gray-600 text-sm">
              This action cannot be undone. The organization and all its data will be
              permanently deleted.
            </p>
          </div>

          {/* Confirmation Input */}
          <div className="bg-gray-50 border border-gray-200 rounded p-3">
            <p className="text-sm text-gray-600 mb-2">
              To confirm, type the organization name:
            </p>
            <p className="text-sm font-mono bg-white border border-gray-300 rounded px-2 py-1 mb-2 text-gray-900">
              {organization.displayName}
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value);
                setError('');
              }}
              placeholder="Enter organization name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            />
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
              disabled={loading || confirmText !== organization.displayName}
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
