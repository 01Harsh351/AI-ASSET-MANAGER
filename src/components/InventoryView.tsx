import React, { useState, useMemo } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Warehouse,
  FileSpreadsheet
} from 'lucide-react';
import { InventoryItem, InventoryStatus } from '../types';
import { formatCurrency, formatNumber, formatDate, exportToCSV } from '../utils/formatters';

interface InventoryViewProps {
  inventory: InventoryItem[];
  onOpenAddModal: () => void;
  onOpenStockUpdateModal: (item: InventoryItem) => void;
  onQuickReorder: (item: InventoryItem) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  onOpenAddModal,
  onOpenStockUpdateModal,
  onQuickReorder
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Sorting
  const [sortField, setSortField] = useState<keyof InventoryItem>('availableStock');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const categories = useMemo(() => {
    const set = new Set<string>(inventory.map(i => i.category));
    return ['All', ...Array.from(set)];
  }, [inventory]);

  const warehouses = useMemo(() => {
    const set = new Set<string>(inventory.map(i => i.warehouse));
    return ['All', ...Array.from(set)];
  }, [inventory]);

  // Filtering & Sorting
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.aisleBin.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesWarehouse = selectedWarehouse === 'All' || item.warehouse === selectedWarehouse;
      const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesWarehouse && matchesStatus;
    }).sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === 'string') {
        return sortOrder === 'asc' 
          ? (aVal as string).localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal as string);
      } else {
        return sortOrder === 'asc' 
          ? (aVal as number) - (bVal as number) 
          : (bVal as number) - (aVal as number);
      }
    });
  }, [inventory, searchTerm, selectedCategory, selectedWarehouse, selectedStatus, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredInventory.length / itemsPerPage));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInventory.slice(start, start + itemsPerPage);
  }, [filteredInventory, currentPage, itemsPerPage]);

  const handleSort = (field: keyof InventoryItem) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleExport = () => {
    const data = filteredInventory.map(item => ({
      'Item Name': item.name,
      'SKU': item.sku,
      'Category': item.category,
      'Available Stock': item.availableStock,
      'Minimum Stock': item.minimumStock,
      'Optimal Stock': item.optimalStock,
      'Warehouse': item.warehouse,
      'Bin Location': item.aisleBin,
      'Unit Cost': item.unitCost,
      'Total Value': item.availableStock * item.unitCost,
      'Status': item.status,
      'Supplier': item.supplier,
      'Last Restocked': item.lastRestocked,
    }));
    exportToCSV(`AssetFlow_Inventory_${new Date().toISOString().split('T')[0]}`, data);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Stock & Inventory Management</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              {filteredInventory.length} SKUs Monitored
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time stock ledger, automated threshold status, bin locations, and replenishment pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors"
          >
            <Download size={15} />
            <span>Export Inventory CSV</span>
          </button>
          <button
            id="add-inventory-primary-btn"
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus size={15} />
            <span>+ Add Inventory Item</span>
          </button>
        </div>
      </div>

      {/* Stock Health Badges Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 size={16} />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium">Healthy Stock</span>
            <p className="text-base font-bold text-slate-900">
              {inventory.filter(i => i.status === 'Healthy').length} SKUs
            </p>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <AlertTriangle size={16} />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium">Low Stock</span>
            <p className="text-base font-bold text-amber-700">
              {inventory.filter(i => i.status === 'Low Stock').length} SKUs
            </p>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
            <AlertTriangle size={16} />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium">Critical Threshold</span>
            <p className="text-base font-bold text-orange-700">
              {inventory.filter(i => i.status === 'Critical').length} SKUs
            </p>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
            <XCircle size={16} />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 font-medium">Out of Stock</span>
            <p className="text-base font-bold text-red-700">
              {inventory.filter(i => i.status === 'Out of Stock').length} SKUs
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={15} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search SKU, name, supplier, bin..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Category */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="All">All Categories</option>
              {categories.filter(c => c !== 'All').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Warehouse */}
          <div>
            <select
              value={selectedWarehouse}
              onChange={(e) => {
                setSelectedWarehouse(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="All">All Warehouses</option>
              {warehouses.filter(w => w !== 'All').map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="All">All Stock Statuses</option>
              <option value="Healthy">Healthy Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Critical">Critical</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>

        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold select-none">
              <tr>
                {/* Item Name */}
                <th 
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Item Name</span>
                    <ArrowUpDown size={12} className="text-slate-400" />
                  </div>
                </th>

                {/* SKU */}
                <th 
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('sku')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>SKU</span>
                    <ArrowUpDown size={12} className="text-slate-400" />
                  </div>
                </th>

                {/* Category */}
                <th className="px-4 py-3">Category</th>

                {/* Available Stock */}
                <th 
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('availableStock')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Available Stock</span>
                    <ArrowUpDown size={12} className="text-slate-400" />
                  </div>
                </th>

                {/* Minimum Stock */}
                <th className="px-4 py-3">Minimum Stock</th>

                {/* Warehouse */}
                <th className="px-4 py-3">Warehouse & Bin</th>

                {/* Status */}
                <th className="px-4 py-3">Stock Status</th>

                {/* Actions */}
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <Package size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-medium">No inventory items matched your criteria</p>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  const stockPercentage = Math.min(100, Math.round((item.availableStock / Math.max(1, item.optimalStock)) * 100));

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Item Name */}
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-slate-900 leading-snug">{item.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Supplier: {item.supplier}</p>
                      </td>

                      {/* SKU */}
                      <td className="px-4 py-3.5 font-mono font-semibold text-slate-700 whitespace-nowrap">
                        {item.sku}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5 text-slate-700 whitespace-nowrap">
                        {item.category}
                      </td>

                      {/* Available Stock with gauge */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm ${
                            item.status === 'Out of Stock' ? 'text-red-700' :
                            item.status === 'Critical' ? 'text-orange-700' :
                            item.status === 'Low Stock' ? 'text-amber-700' : 'text-slate-900'
                          }`}>
                            {formatNumber(item.availableStock)}
                          </span>
                          <span className="text-[10px] text-slate-400">units</span>
                        </div>
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              item.status === 'Healthy' ? 'bg-emerald-500' :
                              item.status === 'Low Stock' ? 'bg-amber-500' :
                              item.status === 'Critical' ? 'bg-orange-500' : 'bg-red-500'
                            }`} 
                            style={{ width: `${item.availableStock === 0 ? 0 : Math.max(5, stockPercentage)}%` }}
                          />
                        </div>
                      </td>

                      {/* Minimum Stock */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-600">
                        <span className="font-medium text-slate-700">{item.minimumStock}</span> units
                        <span className="text-[10px] text-slate-400 block">Optimal: {item.optimalStock}</span>
                      </td>

                      {/* Warehouse & Bin */}
                      <td className="px-4 py-3.5 text-slate-600">
                        <p className="font-medium text-slate-800 leading-tight">{item.warehouse}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{item.aisleBin}</p>
                      </td>

                      {/* Stock Status Badge */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          item.status === 'Healthy' ? 'bg-emerald-100 text-emerald-800' :
                          item.status === 'Low Stock' ? 'bg-amber-100 text-amber-800' :
                          item.status === 'Critical' ? 'bg-orange-100 text-orange-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenStockUpdateModal(item)}
                            className="px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
                          >
                            Update Stock
                          </button>
                          {(item.status === 'Low Stock' || item.status === 'Critical' || item.status === 'Out of Stock') && (
                            <button
                              onClick={() => onQuickReorder(item)}
                              title="Draft Reorder PO"
                              className="p-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md transition-colors text-[11px] font-semibold px-2"
                            >
                              Reorder
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>Showing</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 rounded px-2 py-1 text-xs"
            >
              <option value={8}>8</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
            </select>
            <span>of {filteredInventory.length} total SKUs</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-2 font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
