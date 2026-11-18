import React, { useState } from 'react';
import { Boxes, Warehouse, ArrowRightLeft, CheckCircle2, AlertTriangle, ShieldCheck, MapPin, Package } from 'lucide-react';
import { InventoryItem } from '../types';
import { formatNumber, formatCurrency } from '../utils/formatters';

interface StockManagementViewProps {
  inventory: InventoryItem[];
  onTransferStock: (sku: string, fromWarehouse: string, toWarehouse: string, amount: number) => void;
}

export const StockManagementView: React.FC<StockManagementViewProps> = ({
  inventory,
  onTransferStock
}) => {
  const warehouses = [
    { name: 'Central Supply Warehouse A', capacity: 85, manager: 'Elena Ramos', location: 'Campus East Zone', type: 'Primary Medical Depot' },
    { name: 'IT Operations Staging Bay', capacity: 62, manager: 'Sarah Lin', location: 'Data Center Building', type: 'Secure Electronics' },
    { name: 'BioTech Tower Storage C', capacity: 78, manager: 'Dr. Mei Wang', location: 'Research Quad', type: 'Cold Storage / Lab Consumables' },
    { name: 'Facilities Storage East', capacity: 44, manager: 'David Kowalski', location: 'Central Plant Aux', type: 'MRO & Heavy Hardware' },
    { name: 'Central Plant Maintenance Depot', capacity: 91, manager: 'Brian O’Connor', location: 'Sub-Level Utility Complex', type: 'HazMat & HVAC' },
  ];

  const [selectedSku, setSelectedSku] = useState(inventory[0]?.sku || '');
  const [fromWh, setFromWh] = useState(warehouses[0].name);
  const [toWh, setToWh] = useState(warehouses[1].name);
  const [transferUnits, setTransferUnits] = useState(15);
  const [transferSuccess, setTransferSuccess] = useState(false);

  const currentItem = inventory.find(i => i.sku === selectedSku);

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem || fromWh === toWh) return;
    onTransferStock(selectedSku, fromWh, toWh, transferUnits);
    setTransferSuccess(true);
    setTimeout(() => setTransferSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Multi-Warehouse Stock Management</h1>
        <p className="text-sm text-slate-500 mt-1">
          Inter-facility inventory balancing, warehouse bay utilization, and logistics custody transfer.
        </p>
      </div>

      {/* Warehouses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {warehouses.map((wh) => {
          const whItems = inventory.filter(i => i.warehouse === wh.name);
          const totalStockUnits = whItems.reduce((acc, i) => acc + i.availableStock, 0);
          const totalStockValue = whItems.reduce((acc, i) => acc + (i.availableStock * i.unitCost), 0);

          return (
            <div key={wh.name} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Warehouse size={18} />
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {wh.type}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mt-3">{wh.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                <MapPin size={12} className="text-slate-400" />
                {wh.location} • Mgr: {wh.manager}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px]">Catalog SKUs</span>
                  <p className="font-semibold text-slate-800">{whItems.length} active</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Total Units</span>
                  <p className="font-semibold text-slate-800">{formatNumber(totalStockUnits)}</p>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-500">Bay Utilization:</span>
                  <span className="font-bold text-slate-800">{wh.capacity}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      wh.capacity > 90 ? 'bg-red-500' :
                      wh.capacity > 75 ? 'bg-amber-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${wh.capacity}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stock Transfer Routing Wizard */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <ArrowRightLeft size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Inter-Warehouse Transfer Routing</h3>
            <p className="text-xs text-slate-500">Rebalance inventory stocks to prevent localized depletion</p>
          </div>
        </div>

        {transferSuccess && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800 font-semibold animate-in fade-in">
            <CheckCircle2 size={16} className="text-emerald-600" />
            Transfer dispatch manifest executed successfully. Stock counts updated.
          </div>
        )}

        <form onSubmit={handleExecuteTransfer} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Item / SKU</label>
              <select
                value={selectedSku}
                onChange={(e) => setSelectedSku(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              >
                {inventory.map(item => (
                  <option key={item.sku} value={item.sku}>
                    {item.sku} - {item.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Source Warehouse (From)</label>
              <select
                value={fromWh}
                onChange={(e) => setFromWh(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              >
                {warehouses.map(w => (
                  <option key={w.name} value={w.name}>{w.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Destination Facility (To)</label>
              <select
                value={toWh}
                onChange={(e) => setToWh(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              >
                {warehouses.map(w => (
                  <option key={w.name} value={w.name} disabled={w.name === fromWh}>
                    {w.name} {w.name === fromWh ? '(Source)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Quantity Units</label>
              <input
                type="number"
                min="1"
                required
                value={transferUnits}
                onChange={(e) => setTransferUnits(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-slate-500 text-[11px]">
              Custody Transfer Authorization: Internal Logistics Manifest #TRF-{Math.floor(1000 + Math.random() * 9000)}
            </span>
            <button
              type="submit"
              disabled={fromWh === toWh}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs transition-colors disabled:opacity-50"
            >
              Execute Stock Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
