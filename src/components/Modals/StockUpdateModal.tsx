import React, { useState } from 'react';
import { X, Package, ArrowUpRight, ArrowDownRight, RefreshCw, AlertCircle } from 'lucide-react';
import { InventoryItem } from '../../types';

interface StockUpdateModalProps {
  item: InventoryItem | null;
  onClose: () => void;
  onSave: (itemId: string, newAvailableStock: number, reason: string) => void;
}

export const StockUpdateModal: React.FC<StockUpdateModalProps> = ({
  item,
  onClose,
  onSave
}) => {
  if (!item) return null;

  const [adjustmentType, setAdjustmentType] = useState<'add' | 'subtract' | 'set'>('add');
  const [quantity, setQuantity] = useState<number>(10);
  const [reason, setReason] = useState<string>('Routine Procurement Intake');

  const calculatedNewStock = () => {
    if (adjustmentType === 'add') return item.availableStock + quantity;
    if (adjustmentType === 'subtract') return Math.max(0, item.availableStock - quantity);
    return Math.max(0, quantity);
  };

  const newStock = calculatedNewStock();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(item.id, newStock, reason);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Package size={17} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Adjust Inventory Stock</h3>
              <p className="text-[11px] font-mono text-slate-500">{item.sku}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <span className="text-slate-500 font-medium">Item Name:</span>
            <p className="text-slate-900 font-semibold mt-0.5">{item.name}</p>
            <p className="text-slate-500 mt-0.5">Location: {item.warehouse} ({item.aisleBin})</p>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div>
              <span className="text-slate-500">Current Stock</span>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{item.availableStock}</p>
            </div>
            <div>
              <span className="text-slate-500">New Resulting Stock</span>
              <p className={`text-lg font-bold mt-0.5 ${
                newStock <= item.minimumStock ? 'text-amber-700' : 'text-emerald-700'
              }`}>
                {newStock}
              </p>
            </div>
          </div>

          {/* Action type buttons */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Adjustment Mode</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setAdjustmentType('add')}
                className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1 border transition-colors ${
                  adjustmentType === 'add'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ArrowUpRight size={13} />
                <span>+ Stock In</span>
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType('subtract')}
                className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1 border transition-colors ${
                  adjustmentType === 'subtract'
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ArrowDownRight size={13} />
                <span>- Stock Out</span>
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType('set')}
                className={`py-2 rounded-lg font-semibold flex items-center justify-center gap-1 border transition-colors ${
                  adjustmentType === 'set'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <RefreshCw size={13} />
                <span>Manual Set</span>
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Quantity Units</label>
            <input
              type="number"
              min="0"
              required
              value={quantity}
              onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reason / Reference</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="Routine Procurement Intake">PO Delivery Receipt</option>
              <option value="Operating Dept Consumption">Operational Department Consumption</option>
              <option value="Physical Audit Discrepancy Correction">Cycle Count Audit Adjustment</option>
              <option value="Damaged / Expired Disposal">Damaged / Expired Write-Off</option>
              <option value="Inter-Warehouse Transfer">Warehouse Transfer</option>
            </select>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs transition-colors"
            >
              Commit Stock Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
