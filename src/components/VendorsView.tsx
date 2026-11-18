import React, { useState } from 'react';
import { Building2, Star, Mail, Phone, ExternalLink, Plus, Search, ShieldCheck } from 'lucide-react';
import { Vendor } from '../types';
import { formatCurrency } from '../utils/formatters';

interface VendorsViewProps {
  vendors: Vendor[];
  onOpenCreatePoWithVendor?: (vendorName: string) => void;
}

export const VendorsView: React.FC<VendorsViewProps> = ({
  vendors,
  onOpenCreatePoWithVendor
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Approved Vendor Directory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Certified manufacturers, clinical distributors, master service agreements, and SLA performance.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search vendor or category..."
            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVendors.map((vendor) => (
          <div key={vendor.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400">{vendor.id}</span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">{vendor.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{vendor.category}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                  vendor.status === 'Preferred' ? 'bg-emerald-100 text-emerald-800' :
                  vendor.status === 'Active' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {vendor.status}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Quality / SLA Rating:</span>
                  <div className="flex items-center gap-1 font-bold text-slate-800">
                    <Star size={13} className="text-amber-500 fill-amber-500" />
                    <span>{vendor.rating} / 5.0</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">YTD Procurement Spend:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(vendor.totalSpendYTD)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Contact Custodian:</span>
                  <span className="font-medium text-slate-800">{vendor.contactPerson}</span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5 truncate">
                  <Mail size={12} className="text-slate-400 shrink-0" />
                  <span className="truncate">{vendor.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone size={12} className="text-slate-400 shrink-0" />
                  <span>{vendor.phone}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">{vendor.activeOrders} active POs</span>
              {onOpenCreatePoWithVendor && (
                <button
                  onClick={() => onOpenCreatePoWithVendor(vendor.name)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Create PO →
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
