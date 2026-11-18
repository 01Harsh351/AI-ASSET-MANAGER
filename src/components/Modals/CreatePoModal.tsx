import React, { useState } from 'react';
import { X, ShoppingCart, DollarSign, Calendar, Building2 } from 'lucide-react';
import { PurchaseOrder, Vendor } from '../../types';

interface CreatePoModalProps {
  isOpen: boolean;
  onClose: () => void;
  vendors: Vendor[];
  initialVendor?: string;
  initialItemsCount?: number;
  initialAmount?: number;
  onCreatePo: (newPo: Omit<PurchaseOrder, 'id'>) => void;
}

export const CreatePoModal: React.FC<CreatePoModalProps> = ({
  isOpen,
  onClose,
  vendors,
  initialVendor,
  initialItemsCount,
  initialAmount,
  onCreatePo
}) => {
  if (!isOpen) return null;

  const [vendorName, setVendorName] = useState(initialVendor || vendors[0]?.name || 'Fisher Scientific');
  const [itemsCount, setItemsCount] = useState<number>(initialItemsCount || 50);
  const [totalAmount, setTotalAmount] = useState<number>(initialAmount || 4500);
  const [department, setDepartment] = useState('Central Logistics & Supply');
  const [requestedBy, setRequestedBy] = useState('Marcus Sterling');
  const [deliveryDays, setDeliveryDays] = useState<number>(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const d = new Date();
    const createdAt = d.toISOString().split('T')[0];
    d.setDate(d.getDate() + deliveryDays);
    const estimatedDelivery = d.toISOString().split('T')[0];

    onCreatePo({
      vendorName,
      itemsCount: Number(itemsCount) || 1,
      totalAmount: Number(totalAmount) || 0,
      status: 'Pending Approval',
      createdAt,
      estimatedDelivery,
      requestedBy,
      department,
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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              <ShoppingCart size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Create Purchase Order (PO)</h3>
              <p className="text-[11px] text-slate-500">Replenish low inventory stock or order capital components</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Approved Vendor *</label>
            <select
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {vendors.map(v => (
                <option key={v.id} value={v.name}>
                  {v.name} ({v.category} - {v.status})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Items Quantity Units</label>
              <input
                type="number"
                min="1"
                required
                value={itemsCount}
                onChange={(e) => setItemsCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Total PO Amount ($ USD) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={totalAmount}
                onChange={(e) => setTotalAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cost Center / Department</label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Requested Lead Time (Days)</label>
              <input
                type="number"
                min="1"
                required
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Authorized Requisitioner</label>
            <input
              type="text"
              required
              value={requestedBy}
              onChange={(e) => setRequestedBy(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
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
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs transition-colors"
            >
              Submit Purchase Order
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
