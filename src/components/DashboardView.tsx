import React, { useState } from 'react';
import { 
  Layers, 
  Package, 
  AlertTriangle, 
  Wrench, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  ArrowUpRight, 
  ArrowRight,
  Plus, 
  CheckCircle2, 
  Clock, 
  FileText, 
  DollarSign,
  Filter,
  BarChart2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  Asset, 
  InventoryItem, 
  ActivityItem, 
  AiInsight,
  PageType 
} from '../types';
import { 
  assetDistributionData, 
  inventoryStockTrendData, 
  inventoryCategoryDistribution, 
  assetStatusData 
} from '../data/mockData';
import { formatCurrency, formatNumber } from '../utils/formatters';

interface DashboardViewProps {
  assets: Asset[];
  inventory: InventoryItem[];
  activities: ActivityItem[];
  aiInsights: AiInsight[];
  onOpenQuickAction: (actionType: 'register-asset' | 'add-inventory' | 'create-po' | 'schedule-maintenance') => void;
  onNavigateTo: (page: PageType) => void;
  onViewAssetDetail: (asset: Asset) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  assets,
  inventory,
  activities,
  aiInsights,
  onOpenQuickAction,
  onNavigateTo,
  onViewAssetDetail
}) => {
  // Computed KPI Metrics from active state
  const totalAssetsCount = assets.length * 489; // scaled for organizational display
  const totalInventoryUnits = inventory.reduce((acc, item) => acc + item.availableStock, 0) + 26500;
  const lowStockCount = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Critical' || i.status === 'Out of Stock').length;
  const underMaintenanceCount = assets.filter(a => a.status === 'Under Maintenance').length;
  const totalAiSavings = aiInsights.reduce((sum, item) => sum + item.estimatedSavings, 0);

  // Filter state for charts
  const [trendTimeframe, setTrendTimeframe] = useState<'6M' | '1Y'>('6M');
  const [activityFilter, setActivityFilter] = useState<'all' | 'anomalies' | 'maintenance' | 'inventory'>('all');

  const filteredActivities = activities.filter(act => {
    if (activityFilter === 'anomalies') return act.type === 'ai_anomaly';
    if (activityFilter === 'maintenance') return act.type === 'maintenance_completed';
    if (activityFilter === 'inventory') return act.type === 'stock_updated' || act.type === 'po_created';
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header & Executive Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Operations Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time telemetry, capital equipment valuation, predictive maintenance, and supply chain health.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="qa-register-asset"
            onClick={() => onOpenQuickAction('register-asset')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus size={15} />
            <span>Register Asset</span>
          </button>
          <button
            id="qa-add-inventory"
            onClick={() => onOpenQuickAction('add-inventory')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors"
          >
            <Plus size={15} />
            <span>Add Inventory</span>
          </button>
          <button
            id="qa-create-po"
            onClick={() => onOpenQuickAction('create-po')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors"
          >
            <Plus size={15} />
            <span>Create Purchase Order</span>
          </button>
          <button
            id="qa-schedule-maintenance"
            onClick={() => onOpenQuickAction('schedule-maintenance')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors"
          >
            <Wrench size={15} />
            <span>Schedule Maintenance</span>
          </button>
        </div>
      </div>

      {/* TOP SECTION: 5 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Card 1: Total Assets */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Assets</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers size={17} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{formatNumber(totalAssetsCount)}</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <TrendingUp size={13} className="mr-0.5" />
              +4.2%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Valuation: $24.8M capital fleet</p>
        </div>

        {/* Card 2: Total Inventory Items */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Inventory Items</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package size={17} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{formatNumber(totalInventoryUnits)}</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <TrendingUp size={13} className="mr-0.5" />
              +1.8%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across 6 primary logistics depots</p>
        </div>

        {/* Card 3: Low Stock Items */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Low Stock Items</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle size={17} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-700">{lowStockCount} items</span>
            <span className="text-xs font-semibold text-amber-600 flex items-center">
              <TrendingDown size={13} className="mr-0.5" />
              -2 this week
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">2 critical, 1 out of stock</p>
        </div>

        {/* Card 4: Assets Under Maintenance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Under Maintenance</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Wrench size={17} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{underMaintenanceCount} units</span>
            <span className="text-xs font-semibold text-slate-500 flex items-center">
              5% fleet ratio
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">1 active work order in progress</p>
        </div>

        {/* Card 5: AI Savings Opportunity */}
        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs bg-gradient-to-b from-blue-50/40 to-white hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={13} className="text-blue-600" />
              AI Savings Opportunity
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              $
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700">{formatCurrency(totalAiSavings)}</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <TrendingUp size={13} className="mr-0.5" />
              +18.4%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">4 proactive optimization vectors</p>
        </div>
      </div>

      {/* ANALYTICS SECTION: 4 PROFESSIONAL CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Asset Distribution by Category */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">1. Asset Distribution by Category</h3>
              <p className="text-xs text-slate-500 mt-0.5">Total capital unit count across organizational categories</p>
            </div>
            <button 
              onClick={() => onNavigateTo('assets')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <span>View Table</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assetDistributionData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  formatter={(value: any) => [formatNumber(Number(value)) + ' units', 'Quantity']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#93c5fd' }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-2 pt-3 border-t border-slate-100 text-center">
            {assetDistributionData.map(item => (
              <div key={item.name} className="px-1">
                <p className="text-[10px] text-slate-400 truncate">{item.name}</p>
                <p className="text-xs font-semibold text-slate-700 mt-0.5">{formatNumber(item.count)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Inventory Stock Trend */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">2. Inventory Stock Movement & Inbound/Outbound</h3>
              <p className="text-xs text-slate-500 mt-0.5">Stock replenishment vs consumption over time</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
              <button 
                onClick={() => setTrendTimeframe('6M')}
                className={`px-2 py-1 rounded-md transition-colors ${trendTimeframe === '6M' ? 'bg-white shadow-2xs text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
              >
                6M
              </button>
              <button 
                onClick={() => setTrendTimeframe('1Y')}
                className={`px-2 py-1 rounded-md transition-colors ${trendTimeframe === '1Y' ? 'bg-white shadow-2xs text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
              >
                1Y
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={inventoryStockTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="inboundGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="consumedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  formatter={(val: any, name: any) => [formatNumber(Number(val)) + ' units', name === 'inbound' ? 'Inbound Received' : 'Outbound Consumed']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="inbound" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#inboundGrad)" />
                <Area type="monotone" dataKey="consumed" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#consumedGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 mt-3 pt-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs bg-blue-600 inline-block" />
              <span>Inbound Procurement</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block" />
              <span>Operating Consumption</span>
            </div>
          </div>
        </div>

        {/* 3. Inventory Category Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">3. Inventory Category Distribution</h3>
              <p className="text-xs text-slate-500 mt-0.5">Share of SKUs and supplies by operational classification</p>
            </div>
            <button 
              onClick={() => onNavigateTo('inventory')}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <span>Manage SKUs</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventoryCategoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {inventoryCategoryDistribution.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: any) => [`${val}% of inventory`, 'Ratio']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2.5">
              {inventoryCategoryDistribution.map(cat => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-slate-700 font-medium">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">{formatNumber(cat.count)} items</span>
                    <span className="font-semibold text-slate-900 w-8 text-right">{cat.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Asset Status */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">4. Asset Operational Status</h3>
              <p className="text-xs text-slate-500 mt-0.5">Active, maintenance, inactive, and retired equipment health</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              95.2% System Availability
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {assetStatusData.map(stat => (
              <div key={stat.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stat.color }} />
                    <span className="font-medium text-slate-800">{stat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{formatNumber(stat.count)} units</span>
                    <span className="font-semibold text-slate-900">{stat.percentage}%</span>
                  </div>
                </div>
                {/* Visual bar meter */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ width: `${stat.percentage}%`, backgroundColor: stat.color }} 
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 p-3 rounded-lg bg-blue-50/60 border border-blue-100 flex items-start gap-2.5 text-xs text-blue-900">
            <Sparkles size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-950">AI Maintenance Advisory</p>
              <p className="text-blue-800 mt-0.5 leading-relaxed">
                Preventive servicing rate is at 94%. 1 chiller unit scheduled for mechanical descaling to prevent summer peak failure.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* RECENT ACTIVITY & AI INSIGHTS HIGHLIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Activity Timeline & Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Recent Enterprise Activity</h3>
              <p className="text-xs text-slate-500 mt-0.5">Live audit trail of asset registrations, stock logs, and POs</p>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(['all', 'anomalies', 'maintenance', 'inventory'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setActivityFilter(filter)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg capitalize transition-colors ${
                    activityFilter === filter
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Activity list */}
          <div className="divide-y divide-slate-100">
            {filteredActivities.map((act) => {
              const getBadge = () => {
                if (act.type === 'ai_anomaly') return { bg: 'bg-red-50 text-red-700 border-red-200', label: 'AI Anomaly' };
                if (act.type === 'stock_updated') return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Stock Update' };
                if (act.type === 'maintenance_completed') return { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Maintenance' };
                if (act.type === 'po_created') return { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Purchase Order' };
                return { bg: 'bg-slate-100 text-slate-700 border-slate-200', label: 'Asset Registration' };
              };
              const badge = getBadge();

              return (
                <div key={act.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-semibold flex items-center justify-center text-xs shrink-0 mt-0.5">
                        {act.user.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-slate-900">{act.title}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {act.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                          <span className="font-medium text-slate-600">{act.user.name}</span>
                          <span>•</span>
                          <span>{act.user.role}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap shrink-0">
                      {act.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI High Priority Sentinel Alerts (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Sparkles size={15} />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">AI Sentinel Insights</h3>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {aiInsights.length} Recommendations
            </span>
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[380px]">
            {aiInsights.map((insight) => (
              <div 
                key={insight.id} 
                className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-blue-50/40 hover:border-blue-200 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    insight.impactLevel === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {insight.impactLevel} Impact
                  </span>
                  <span className="text-xs font-bold text-emerald-700">
                    +{formatCurrency(insight.estimatedSavings)}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-900 leading-snug">{insight.title}</h4>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {insight.description}
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between">
                  <span className="text-[10px] font-medium text-blue-700">
                    Confidence: {insight.confidenceScore}%
                  </span>
                  <button
                    onClick={() => onNavigateTo('ai-insights')}
                    className="text-[11px] font-semibold text-slate-700 hover:text-blue-700 flex items-center gap-0.5"
                  >
                    Action <ArrowRight size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 rounded-b-xl text-center">
            <button
              onClick={() => onNavigateTo('ai-insights')}
              className="w-full py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1.5"
            >
              <span>Explore All Optimization Vector Models</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>

      </div>

      {/* Featured High-Value Assets Quick Reel */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Critical Infrastructure Equipment</h3>
            <p className="text-xs text-slate-500 mt-0.5">High-capital assets requiring constant monitoring</p>
          </div>
          <button
            onClick={() => onNavigateTo('assets')}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
          >
            <span>Full Asset Registry</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.slice(0, 3).map((asset) => (
            <div 
              key={asset.id}
              onClick={() => onViewAssetDetail(asset)}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer bg-white group"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                  <img 
                    src={asset.imageUrl} 
                    alt={asset.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-medium text-slate-500">{asset.id}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      asset.status === 'Active' ? 'bg-emerald-50 text-emerald-700' :
                      asset.status === 'Under Maintenance' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {asset.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate mt-1 group-hover:text-blue-600 transition-colors">
                    {asset.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{asset.location}</p>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">Current Book Value:</span>
                <span className="font-semibold text-slate-900">{formatCurrency(asset.currentValue)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
