import React, { useState } from 'react';
import { FileText, Download, Printer, BarChart3, TrendingDown, Layers, Package, Calendar } from 'lucide-react';
import { Asset, InventoryItem } from '../types';
import { formatCurrency, formatNumber, exportToCSV } from '../utils/formatters';

interface ReportsViewProps {
  assets: Asset[];
  inventory: InventoryItem[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  assets,
  inventory
}) => {
  const [activeReport, setActiveReport] = useState<'valuation' | 'depreciation' | 'inventoryAudit' | 'compliance'>('valuation');

  const totalAssetAcquisition = assets.reduce((sum, a) => sum + a.purchaseValue, 0);
  const totalAssetBookValue = assets.reduce((sum, a) => sum + a.currentValue, 0);
  const totalDepreciationAccumulated = totalAssetAcquisition - totalAssetBookValue;
  const totalInventoryHoldingValue = inventory.reduce((sum, i) => sum + (i.availableStock * i.unitCost), 0);

  const handleExportReport = () => {
    if (activeReport === 'valuation' || activeReport === 'depreciation') {
      const data = assets.map(a => ({
        'Asset ID': a.id,
        'Name': a.name,
        'Category': a.category,
        'Purchase Date': a.purchaseDate,
        'Acquisition Value': a.purchaseValue,
        'Current Net Book Value': a.currentValue,
        'Depreciation to Date': a.purchaseValue - a.currentValue,
        'Condition': a.condition,
        'Location': a.location,
      }));
      exportToCSV(`Asset_Valuation_Audit_${new Date().toISOString().split('T')[0]}`, data);
    } else {
      const data = inventory.map(i => ({
        'SKU': i.sku,
        'Item Name': i.name,
        'Warehouse': i.warehouse,
        'Available Units': i.availableStock,
        'Minimum Threshold': i.minimumStock,
        'Unit Cost': i.unitCost,
        'Total Valuation': i.availableStock * i.unitCost,
        'Status': i.status,
      }));
      exportToCSV(`Inventory_Stock_Audit_${new Date().toISOString().split('T')[0]}`, data);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Reports & Financial Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">
            GAAP asset depreciation schedules, capital balance valuation, inventory turnover, and regulatory compliance logs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors"
          >
            <Printer size={15} />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportReport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <Download size={15} />
            <span>Export Statement CSV</span>
          </button>
        </div>
      </div>

      {/* Report Nav Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold text-slate-500">
        <button
          onClick={() => setActiveReport('valuation')}
          className={`pb-3 border-b-2 transition-colors ${
            activeReport === 'valuation'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          Capital Equipment Valuation
        </button>
        <button
          onClick={() => setActiveReport('depreciation')}
          className={`pb-3 border-b-2 transition-colors ${
            activeReport === 'depreciation'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          Straight-Line Depreciation Ledger
        </button>
        <button
          onClick={() => setActiveReport('inventoryAudit')}
          className={`pb-3 border-b-2 transition-colors ${
            activeReport === 'inventoryAudit'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent hover:text-slate-900'
          }`}
        >
          Warehouse Stock Balance Audit
        </button>
      </div>

      {/* Financial Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Gross Capital Basis</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(totalAssetAcquisition)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Original purchase invoices</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Net Book Value</span>
          <p className="text-xl font-bold text-blue-700 mt-1">{formatCurrency(totalAssetBookValue)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Current carrying asset balance</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Accumulated Depreciation</span>
          <p className="text-xl font-bold text-amber-700 mt-1">{formatCurrency(totalDepreciationAccumulated)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Straight-line MACRS rate</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Inventory Holding Total</span>
          <p className="text-xl font-bold text-emerald-700 mt-1">{formatCurrency(totalInventoryHoldingValue)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">MRO & clinical consumable value</p>
        </div>
      </div>

      {/* Report Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-slate-600" />
            <span className="text-xs font-bold text-slate-900">
              {activeReport === 'valuation' ? 'Asset Valuation Schedule (FY 2026 Q3)' :
               activeReport === 'depreciation' ? 'MACRS / Straight-Line Depreciation Ledger' :
               'Warehouse Inventory Valuation & Safety Thresholds'}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">ISO 55001 Asset Management Compliant</span>
        </div>

        <div className="overflow-x-auto">
          {activeReport === 'inventoryAudit' ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Item Description</th>
                  <th className="px-4 py-3">Facility Warehouse</th>
                  <th className="px-4 py-3">In-Stock Units</th>
                  <th className="px-4 py-3">Unit Cost</th>
                  <th className="px-4 py-3">Carrying Value</th>
                  <th className="px-4 py-3">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventory.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-semibold text-slate-700">{item.sku}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{item.name}</td>
                    <td className="px-4 py-3 text-slate-600">{item.warehouse}</td>
                    <td className="px-4 py-3 font-bold text-slate-800">{item.availableStock}</td>
                    <td className="px-4 py-3 text-slate-600">{formatCurrency(item.unitCost)}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{formatCurrency(item.availableStock * item.unitCost)}</td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Reconciled
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="px-4 py-3">Asset ID</th>
                  <th className="px-4 py-3">Asset Nomenclature</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Original Purchase</th>
                  <th className="px-4 py-3">Current Book Value</th>
                  <th className="px-4 py-3">Depreciation Loss</th>
                  <th className="px-4 py-3">Condition Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assets.map(asset => {
                  const dep = asset.purchaseValue - asset.currentValue;
                  return (
                    <tr key={asset.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-mono font-semibold text-blue-700">{asset.id}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{asset.name}</td>
                      <td className="px-4 py-3 text-slate-600">{asset.category}</td>
                      <td className="px-4 py-3 text-slate-700 font-medium">{formatCurrency(asset.purchaseValue)}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{formatCurrency(asset.currentValue)}</td>
                      <td className="px-4 py-3 text-amber-700 font-medium">-{formatCurrency(dep)}</td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {asset.condition}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
