import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  Calendar, 
  MapPin, 
  User, 
  DollarSign, 
  TrendingDown, 
  Wrench, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  QrCode, 
  FileText, 
  Sparkles,
  ExternalLink,
  Shield,
  Tag,
  ArrowUpRight
} from 'lucide-react';
import { Asset, MaintenanceRecord } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface AssetDetailModalProps {
  asset: Asset | null;
  onClose: () => void;
  onScheduleMaintenance: (asset: Asset) => void;
  onUpdateStatus: (assetId: string, newStatus: Asset['status']) => void;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  asset,
  onClose,
  onScheduleMaintenance,
  onUpdateStatus
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'maintenance' | 'timeline'>('overview');

  if (!asset) return null;

  // Calculate straight-line annual depreciation amount
  const annualDepreciationAmount = (asset.purchaseValue * asset.depreciationRate) / 100;
  const totalDepreciated = Math.max(0, asset.purchaseValue - asset.currentValue);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50/50">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 overflow-hidden shadow-xs shrink-0">
              {asset.imageUrl ? (
                <img 
                  src={asset.imageUrl} 
                  alt={asset.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                  <Layers size={24} />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                  {asset.id}
                </span>
                <span className="text-xs font-medium text-slate-500">{asset.category}</span>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  asset.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                  asset.status === 'Under Maintenance' ? 'bg-amber-100 text-amber-800' :
                  asset.status === 'Inactive' ? 'bg-slate-200 text-slate-700' : 'bg-red-100 text-red-800'
                }`}>
                  {asset.status}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">{asset.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {asset.manufacturer} • Model: {asset.model} • S/N: {asset.serialNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onScheduleMaintenance(asset)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Wrench size={13} />
              <span>Service Asset</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 flex items-center gap-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Asset Overview
          </button>
          <button
            onClick={() => setActiveTab('financials')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'financials'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Valuation & Depreciation
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'maintenance'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Maintenance Logs</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 text-[10px]">
              {asset.maintenanceHistory.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'timeline'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Lifecycle Timeline
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* AI Diagnostic Alert Banner */}
              {asset.aiNote && (
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles size={16} />
                  </div>
                  <div className="text-xs">
                    <h4 className="font-semibold text-blue-950">AI Telemetry & Predictive Diagnostic</h4>
                    <p className="text-blue-900 mt-1 leading-relaxed">{asset.aiNote}</p>
                    <div className="flex items-center gap-4 mt-2 text-[11px] font-medium text-blue-700">
                      <span>Operational Health: <strong className="text-blue-950">{asset.utilizationScore}%</strong></span>
                      <span>Warranty Valid Thru: <strong className="text-blue-950">{formatDate(asset.warrantyExpiry)}</strong></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* Physical Location */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                    <MapPin size={14} className="text-blue-600" />
                    <span className="font-medium">Physical Location</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{asset.location}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{asset.facility}</p>
                </div>

                {/* Assigned Employee */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                    <User size={14} className="text-indigo-600" />
                    <span className="font-medium">Assigned Custodian</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{asset.assignedTo.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{asset.assignedTo.department}</p>
                  <p className="text-[11px] text-blue-600 mt-0.5">{asset.assignedTo.email}</p>
                </div>

                {/* Condition & Health */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                    <Shield size={14} className="text-emerald-600" />
                    <span className="font-medium">Current Condition</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-sm font-bold ${
                      asset.condition === 'Excellent' ? 'text-emerald-700' :
                      asset.condition === 'Good' ? 'text-blue-700' :
                      asset.condition === 'Fair' ? 'text-amber-700' : 'text-red-700'
                    }`}>
                      {asset.condition}
                    </span>
                    <span className="text-xs text-slate-400">({asset.utilizationScore}% health index)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        asset.utilizationScore > 80 ? 'bg-emerald-500' :
                        asset.utilizationScore > 50 ? 'bg-amber-500' : 'bg-red-500'
                      }`} 
                      style={{ width: `${asset.utilizationScore}%` }}
                    />
                  </div>
                </div>

                {/* Purchase Value */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                    <DollarSign size={14} className="text-slate-600" />
                    <span className="font-medium">Purchase Value</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{formatCurrency(asset.purchaseValue)}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Acquired {formatDate(asset.purchaseDate)}</p>
                </div>

                {/* Current Depreciated Value */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                    <TrendingDown size={14} className="text-amber-600" />
                    <span className="font-medium">Current Net Book Value</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{formatCurrency(asset.currentValue)}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Depreciation: {asset.depreciationRate}% / yr</p>
                </div>

                {/* Barcode & Tagging */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                      <Tag size={14} className="text-blue-600" />
                      <span className="font-medium">Asset RFID Tag</span>
                    </div>
                    <p className="text-xs font-mono font-medium text-slate-800">{asset.id}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">NFC Tag Active</p>
                  </div>
                  <div className="p-1.5 bg-white rounded-lg border border-slate-300">
                    <QrCode size={36} className="text-slate-800" />
                  </div>
                </div>

              </div>

              {/* Status Update Quick Bar */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs">
                  <p className="font-semibold text-slate-800">Operational Lifecycle Status</p>
                  <p className="text-slate-500">Change status to reflect field changes or maintenance dispatches</p>
                </div>
                <div className="flex items-center gap-2">
                  {(['Active', 'Under Maintenance', 'Inactive', 'Retired'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => onUpdateStatus(asset.id, st)}
                      className={`px-3 py-1 text-xs font-medium rounded-lg border transition-all ${
                        asset.status === st
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: FINANCIALS & DEPRECIATION */}
          {activeTab === 'financials' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500">Original Acquisition Cost</span>
                  <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(asset.purchaseValue)}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Capital expenditure capitalized</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-500">Accumulated Depreciation</span>
                  <p className="text-xl font-bold text-amber-700 mt-1">{formatCurrency(totalDepreciated)}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{asset.depreciationRate}% Straight Line per Year</p>
                </div>
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200">
                  <span className="text-xs text-emerald-800 font-medium">Net Present Book Value</span>
                  <p className="text-xl font-bold text-emerald-800 mt-1">{formatCurrency(asset.currentValue)}</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">Audited for FY 2026 balance sheet</p>
                </div>
              </div>

              {/* Depreciation Schedule Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-semibold text-xs text-slate-700">
                  Calculated Straight-Line Depreciation Schedule
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/75 text-slate-500">
                    <tr>
                      <th className="px-4 py-2.5">Year</th>
                      <th className="px-4 py-2.5">Beginning Value</th>
                      <th className="px-4 py-2.5">Depreciation Expense</th>
                      <th className="px-4 py-2.5">Ending Book Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {[1, 2, 3, 4, 5].map(year => {
                      const beg = Math.max(0, asset.purchaseValue - annualDepreciationAmount * (year - 1));
                      const dep = Math.min(beg, annualDepreciationAmount);
                      const end = Math.max(0, beg - dep);
                      return (
                        <tr key={year} className="hover:bg-slate-50">
                          <td className="px-4 py-2.5 font-medium text-slate-800">FY Year {year}</td>
                          <td className="px-4 py-2.5 text-slate-600">{formatCurrency(beg)}</td>
                          <td className="px-4 py-2.5 text-amber-700">-{formatCurrency(dep)}</td>
                          <td className="px-4 py-2.5 font-semibold text-slate-900">{formatCurrency(end)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: MAINTENANCE HISTORY */}
          {activeTab === 'maintenance' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">Work Orders & Service Records</h4>
                  <p className="text-[11px] text-slate-500">Historical calibration, preventative maintenance, and repair logs</p>
                </div>
                <button
                  onClick={() => onScheduleMaintenance(asset)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Wrench size={13} />
                  <span>+ Schedule Service</span>
                </button>
              </div>

              {asset.maintenanceHistory.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                  <Wrench size={32} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-sm font-medium">No recorded maintenance tickets</p>
                  <p className="text-xs text-slate-400 mt-1">This asset has not yet required scheduled overhaul or repair.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {asset.maintenanceHistory.map((record) => (
                    <div key={record.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-semibold text-blue-700">{record.id}</span>
                            <span className="text-xs font-semibold text-slate-900">{record.type} Service</span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              record.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                              record.status === 'In Progress' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {record.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">{record.description}</p>
                          
                          {record.partsReplaced && record.partsReplaced.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px]">
                              <span className="text-slate-500 font-medium">Parts replaced:</span>
                              {record.partsReplaced.map((part, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] border border-slate-200">
                                  {part}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-slate-900">{formatCurrency(record.cost)}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(record.date)}</p>
                          <p className="text-[10px] text-slate-500 mt-1">Tech: {record.technician}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LIFECYCLE TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-semibold text-slate-900">Capital Asset Lifecycle Progression</h4>
                <p className="text-[11px] text-slate-500">From procurement to decommissioning and salvage</p>
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {asset.lifecycleTimeline.map((item, index) => (
                  <div key={index} className="relative group">
                    {/* Bullet marker */}
                    <div className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      item.completed 
                        ? 'bg-emerald-500 border-white ring-2 ring-emerald-200 text-white' 
                        : 'bg-white border-slate-400 ring-2 ring-slate-100 text-slate-400'
                    }`}>
                      {item.completed && <CheckCircle2 size={10} />}
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-slate-900">{item.title}</h5>
                        <span className="text-[11px] font-mono text-slate-500">{formatDate(item.date)}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">Asset Record Last Verified: Sept 14, 2026</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
          >
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
};
