import React, { useState } from 'react';
import { ShoppingCart, Plus, CheckCircle2, Clock, Truck, FileText, Search, ArrowRight, Download } from 'lucide-react';
import { PurchaseOrder } from '../types';
import { formatCurrency, formatDate, exportToCSV } from '../utils/formatters';

interface ProcurementViewProps {
  purchaseOrders: PurchaseOrder[];
  onOpenCreatePo: () => void;
  onUpdatePoStatus: (poId: string, newStatus: PurchaseOrder['status']) => void;
}

export const ProcurementView: React.FC<ProcurementViewProps> = ({
  purchaseOrders,
  onOpenCreatePo,
  onUpdatePoStatus
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredOrders = purchaseOrders.filter(po => {
    const matchesSearch = 
      po.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCommittedSpend = purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0);
  const pendingApprovalCount = purchaseOrders.filter(po => po.status === 'Pending Approval').length;
  const inTransitCount = purchaseOrders.filter(po => po.status === 'In Transit').length;

  const handleExport = () => {
    exportToCSV(`AssetFlow_POs_${new Date().toISOString().split('T')[0]}`, filteredOrders);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Procurement & Purchase Orders</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
              {purchaseOrders.length} Total POs
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Supplier requisitions, approval workflow authorization, invoice audit trail, and dock receiving.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors"
          >
            <Download size={15} />
            <span>Export POs</span>
          </button>
          <button
            onClick={onOpenCreatePo}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus size={15} />
            <span>+ Create Purchase Order</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Committed Spend</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(totalCommittedSpend)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Approved and in-flight supply orders</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Awaiting Approval</span>
          <p className="text-2xl font-bold text-amber-700 mt-1">{pendingApprovalCount} Orders</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Requires manager or director sign-off</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">In Transit to Docks</span>
          <p className="text-2xl font-bold text-indigo-700 mt-1">{inTransitCount} Shipments</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Carrier tracking active</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={14} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search PO ID, vendor, department..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {['All', 'Pending Approval', 'Approved', 'In Transit', 'Received'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === status
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* PO Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold select-none">
              <tr>
                <th className="px-4 py-3">PO Number</th>
                <th className="px-4 py-3">Vendor / Supplier</th>
                <th className="px-4 py-3">Items Count</th>
                <th className="px-4 py-3">Total Value</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Issue Date</th>
                <th className="px-4 py-3">Est. Delivery</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    No purchase orders match the selected criteria
                  </td>
                </tr>
              ) : (
                filteredOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-blue-700">
                      {po.id}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">
                      {po.vendorName}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">
                      {po.itemsCount} units
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      {formatCurrency(po.totalAmount)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {po.department}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {formatDate(po.createdAt)}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-medium">
                      {formatDate(po.estimatedDelivery)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        po.status === 'Received' ? 'bg-emerald-100 text-emerald-800' :
                        po.status === 'In Transit' ? 'bg-indigo-100 text-indigo-800' :
                        po.status === 'Approved' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      {po.status === 'Pending Approval' && (
                        <button
                          onClick={() => onUpdatePoStatus(po.id, 'Approved')}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-md font-semibold text-xs transition-colors"
                        >
                          Approve PO
                        </button>
                      )}
                      {po.status === 'Approved' && (
                        <button
                          onClick={() => onUpdatePoStatus(po.id, 'In Transit')}
                          className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-md font-semibold text-xs transition-colors"
                        >
                          Mark Shipped
                        </button>
                      )}
                      {po.status === 'In Transit' && (
                        <button
                          onClick={() => onUpdatePoStatus(po.id, 'Received')}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-md font-semibold text-xs transition-colors"
                        >
                          Confirm Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
