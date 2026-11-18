import React, { useState } from 'react';
import { Wrench, Plus, CheckCircle2, Clock, AlertTriangle, Calendar, User, Search, Filter, ArrowRight } from 'lucide-react';
import { Asset, MaintenanceRecord } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface MaintenanceViewProps {
  assets: Asset[];
  onScheduleNew: () => void;
  onCompleteMaintenance: (assetId: string, maintenanceId: string) => void;
  onViewAsset: (asset: Asset) => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  assets,
  onScheduleNew,
  onCompleteMaintenance,
  onViewAsset
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Collect all maintenance records paired with their asset
  const allRecords = assets.flatMap(asset => 
    asset.maintenanceHistory.map(rec => ({
      ...rec,
      asset
    }))
  );

  const filteredRecords = allRecords.filter(item => {
    const matchesFilter = 
      filterType === 'all' || 
      (filterType === 'active' && (item.status === 'In Progress' || item.status === 'Scheduled')) ||
      (filterType === 'completed' && item.status === 'Completed');

    const matchesSearch = 
      item.asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.technician.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const activeCount = allRecords.filter(r => r.status === 'In Progress' || r.status === 'Scheduled').length;
  const completedCount = allRecords.filter(r => r.status === 'Completed').length;
  const totalCost = allRecords.reduce((sum, r) => sum + r.cost, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Maintenance & Work Orders</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
              {activeCount} Active Orders
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Preventive service schedules, emergency corrective repairs, ISO compliance, and field technician dispatches.
          </p>
        </div>

        <button
          onClick={onScheduleNew}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
        >
          <Plus size={15} />
          <span>+ Schedule Maintenance</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Work Orders</span>
          <p className="text-2xl font-bold text-amber-700 mt-1">{activeCount} Orders</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Assigned to certified engineering vendors</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Completed Service Tickets</span>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{completedCount} Resolved</p>
          <p className="text-[11px] text-slate-400 mt-0.5">99.2% First-time fix compliance</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Maintenance Spend YTD</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalCost)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Includes parts and specialized field labor</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={14} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search technician, order ID, asset name..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {(['all', 'active', 'completed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilterType(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                filterType === tab
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab} ({
                tab === 'all' ? allRecords.length :
                tab === 'active' ? activeCount : completedCount
              })
            </button>
          ))}
        </div>
      </div>

      {/* Work Orders List */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
            <Wrench size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium">No work orders match the current criteria</p>
          </div>
        ) : (
          filteredRecords.map((item) => (
            <div 
              key={item.id}
              className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {item.id}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{item.type} Service</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      item.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                      item.status === 'In Progress' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Asset name */}
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700">Target Asset:</span>
                    <button
                      onClick={() => onViewAsset(item.asset)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                    >
                      <span>{item.asset.name}</span>
                      <span className="text-slate-400 font-normal">({item.asset.id})</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-3xl">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 mt-2.5 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <User size={13} className="text-slate-400" />
                      Tech: <strong className="text-slate-700">{item.technician}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-slate-400" />
                      Date: <strong className="text-slate-700">{formatDate(item.date)}</strong>
                    </span>
                    {item.partsReplaced && item.partsReplaced.length > 0 && (
                      <span>
                        Parts: {item.partsReplaced.join(', ')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 shrink-0 gap-2">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400">Recorded Cost</span>
                    <p className="text-sm font-bold text-slate-900">{formatCurrency(item.cost)}</p>
                  </div>

                  {item.status !== 'Completed' && (
                    <button
                      onClick={() => onCompleteMaintenance(item.asset.id, item.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 size={13} />
                      <span>Mark Completed</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
