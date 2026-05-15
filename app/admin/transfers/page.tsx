'use client';

import { useState, useEffect } from 'react';
import { Loader, Download } from 'lucide-react';

interface SummaryMetrics {
  totalTransfers: number;
  totalQuantity: number;
  totalMargin: number;
  marginPercent: number;
}

interface BusinessPairAnalysis {
  fromBusiness: string;
  toBusiness: string;
  transferCount: number;
  quantity: number;
  totalMargin: number;
  avgMarginPercent: number;
}

interface ProductAnalysis {
  productName: string;
  sku: string;
  transferCount: number;
  quantity: number;
  totalMargin: number;
  avgMarkupPercent: number;
}

interface TransferDetail {
  id: string;
  fromBusiness: string;
  toBusiness: string;
  productName: string;
  quantity: number;
  costPerUnit: number;
  transferPrice: number;
  markup: number;
  markupType: string;
  margin: number;
  status: string;
  transferedAt: string;
}

interface ReportData {
  summary: SummaryMetrics;
  businessPairs: BusinessPairAnalysis[];
  products: ProductAnalysis[];
  transfers: TransferDetail[];
}

export default function TransfersReportPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateFrom) params.append('from', dateFrom);
      if (dateTo) params.append('to', dateTo);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/admin/transfers/report?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch report');
      const data = await response.json();
      setReportData(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    fetchReport();
  };

  const downloadCSV = () => {
    if (!reportData) return;

    const csvContent = [
      ['Transfer Report', new Date().toLocaleDateString()],
      [],
      ['Summary Metrics'],
      ['Total Transfers', reportData.summary.totalTransfers.toString()],
      ['Total Quantity', reportData.summary.totalQuantity.toString()],
      ['Total Margin', `$${reportData.summary.totalMargin.toFixed(2)}`],
      ['Margin Percent', `${reportData.summary.marginPercent.toFixed(2)}%`],
      [],
      ['Business Pair Analysis'],
      ['From', 'To', 'Count', 'Quantity', 'Total Margin', 'Avg Margin %'],
      ...reportData.businessPairs.map((pair) => [
        pair.fromBusiness,
        pair.toBusiness,
        pair.transferCount.toString(),
        pair.quantity.toString(),
        pair.totalMargin.toFixed(2),
        pair.avgMarginPercent.toFixed(2),
      ]),
      [],
      ['Product Analysis'],
      ['Product', 'SKU', 'Count', 'Quantity', 'Total Margin', 'Avg Markup %'],
      ...reportData.products.map((prod) => [
        prod.productName,
        prod.sku,
        prod.transferCount.toString(),
        prod.quantity.toString(),
        prod.totalMargin.toFixed(2),
        prod.avgMarkupPercent.toFixed(2),
      ]),
      [],
      ['Transfer Details'],
      ['From', 'To', 'Product', 'Quantity', 'Cost/Unit', 'Transfer Price', 'Markup', 'Margin', 'Status', 'Date'],
      ...reportData.transfers.map((t) => [
        t.fromBusiness,
        t.toBusiness,
        t.productName,
        t.quantity.toString(),
        t.costPerUnit.toFixed(2),
        t.transferPrice.toFixed(2),
        `${t.markup}${t.markupType === 'PERCENTAGE' ? '%' : '$'}`,
        t.margin.toFixed(2),
        t.status,
        new Date(t.transferedAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => (Array.isArray(row) ? row.join(',') : ''))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transfer-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Transfer Reports</h2>
          <p className="text-gray-600 mt-1">Analyze inter-organization transfer performance</p>
        </div>
        {reportData && (
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="returned">Returned</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleApplyFilters}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Apply Filters
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      ) : reportData ? (
        <>
          {/* Summary Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600 text-sm font-medium">Total Transfers</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{reportData.summary.totalTransfers}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600 text-sm font-medium">Total Quantity</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{reportData.summary.totalQuantity}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600 text-sm font-medium">Total Margin</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                ${reportData.summary.totalMargin.toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600 text-sm font-medium">Avg Margin %</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {reportData.summary.marginPercent.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Business Pair Analysis */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Business Pair Analysis</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      From Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      To Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Transfers
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Total Margin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Avg Margin %
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.businessPairs.map((pair, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-900">{pair.fromBusiness}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{pair.toBusiness}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{pair.transferCount}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{pair.quantity}</td>
                      <td className="px-6 py-4 text-sm font-medium text-green-600">
                        ${pair.totalMargin.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {pair.avgMarginPercent.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Product Analysis */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Product Analysis</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Transfers
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Total Margin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Avg Markup %
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.products.map((product, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.productName}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.sku}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.transferCount}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.quantity}</td>
                      <td className="px-6 py-4 text-sm font-medium text-green-600">
                        ${product.totalMargin.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.avgMarkupPercent.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transfer Details */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Transfer Details</h3>
            </div>
            <div className="overflow-x-auto">
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
                      Qty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Cost/Unit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Transfer Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Markup
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Margin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.transfers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-4 text-center text-gray-500">
                        No transfers found
                      </td>
                    </tr>
                  ) : (
                    reportData.transfers.map((transfer) => (
                      <tr key={transfer.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {transfer.fromBusiness} → {transfer.toBusiness}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{transfer.productName}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{transfer.quantity}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          ${transfer.costPerUnit.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          ${transfer.transferPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-blue-600">
                          {transfer.markup}
                          {transfer.markupType === 'PERCENTAGE' ? '%' : '$'}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-green-600">
                          ${transfer.margin.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              transfer.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : transfer.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {transfer.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(transfer.transferedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
