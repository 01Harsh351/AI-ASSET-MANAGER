import React, { useState } from 'react';
import { X, Package, Plus } from 'lucide-react';
import { InventoryItem } from '../../types';

interface AddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newItem: Omit<InventoryItem, 'id' | 'status'>) => void;
}

export const AddInventoryModal: React.FC<AddInventoryModalProps> = ({
  isOpen,
  onClose,
  onAdd
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [sku, setSku] = useState('SKU-' + Math.floor(1000 + Math.random() * 9000));
  const [category, setCategory] = useState<InventoryItem['category']>('Consumables');
  const [availableStock, setAvailableStock] = useState<number>(100);
  const [minimumStock, setMinimumStock] = useState<number>(25);
  const [optimalStock, setOptimalStock] = useState<number>(150);
  const [warehouse, setWarehouse] = useState('Central Supply Warehouse A');
  const [aisleBin, setAisleBin] = useState('Aisle 03, Shelf B-2');
  const [unitCost, setUnitCost] = useState<number>(45);
  const [supplier, setSupplier] = useState('Fisher Scientific');
  const [leadTimeDays, setLeadTimeDays] = useState<number>(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      name,
      sku,
      category,
      availableStock: Number(availableStock) || 0,
      minimumStock: Number(minimumStock) || 0,
      optimalStock: Number(optimalStock) || 0,
      warehouse,
      aisleBin,
      unitCost: Number(unitCost) || 0,
      lastRestocked: new Date().toISOString().split('T')[0],
      leadTimeDays: Number(leadTimeDays) || 5,
      supplier,
      reorderQuantity: Math.max(10, optimalStock - minimumStock),
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Package size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Add Inventory Catalog Item</h3>
              <p className="text-[11px] text-slate-500">Configure SKU identifiers, reorder limits, and bin locations</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Item Title *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sterile Bio-Hazard Sampling Vials 50mL (Pack of 100)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">SKU Code *</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="Consumables">Consumables</option>
                <option value="Electronics">Electronics</option>
                <option value="Laboratory Equipment">Laboratory Equipment</option>
                <option value="Furniture">Furniture</option>
                <option value="MRO Spare Parts">MRO Spare Parts</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Warehouse Facility</label>
              <select
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="Central Supply Warehouse A">Central Supply Warehouse A</option>
                <option value="IT Operations Staging Bay">IT Operations Staging Bay</option>
                <option value="BioTech Tower Storage C">BioTech Tower Storage C</option>
                <option value="Facilities Storage East">Facilities Storage East</option>
                <option value="Central Plant Maintenance Depot">Central Plant Maintenance Depot</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bin / Shelf Coordinate</label>
              <input
                type="text"
                required
                value={aisleBin}
                onChange={(e) => setAisleBin(e.target.value)}
                placeholder="e.g. Aisle 04, Shelf C-1"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Initial In-Stock Units *</label>
              <input
                type="number"
                min="0"
                required
                value={availableStock}
                onChange={(e) => setAvailableStock(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Minimum Safety Stock Threshold *</label>
              <input
                type="number"
                min="1"
                required
                value={minimumStock}
                onChange={(e) => setMinimumStock(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Optimal Stock Level</label>
              <input
                type="number"
                min="1"
                required
                value={optimalStock}
                onChange={(e) => setOptimalStock(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Unit Cost ($ USD) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={unitCost}
                onChange={(e) => setUnitCost(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Primary Supplier</label>
              <input
                type="text"
                required
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Lead Time (Days)</label>
              <input
                type="number"
                min="1"
                required
                value={leadTimeDays}
                onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs transition-colors"
            >
              Add Item to Catalog
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
