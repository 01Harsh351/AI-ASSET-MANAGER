import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  Search, 
  Filter, 
  Download, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Wrench, 
  ArrowUpDown, 
  MoreVertical,
  CheckSquare,
  Square,
  Sparkles
} from 'lucide-react';
import { Asset, AssetCondition, AssetStatus } from '../types';
import { formatCurrency, formatDate, exportToCSV } from '../utils/formatters';

interface AssetsViewProps {
  assets: Asset[];
  onViewAssetDetail: (asset: Asset) => void;
  onOpenRegisterModal: () => void;
  onScheduleMaintenance: (asset: Asset) => void;
}

export const AssetsView: React.FC<AssetsViewProps> = ({
  assets,
  onViewAssetDetail,
  onOpenRegisterModal,
  onScheduleMaintenance
}) => {
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCondition, setSelectedCondition] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Sorting State
  const [sortField, setSortField] = useState<keyof Asset>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  // Selection for bulk actions
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);

  // Unique categories
  const categories = useMemo(() => {
    const set = new Set<string>(assets.map(a => a.category));
    return ['All', ...Array.from(set)];
  }, [assets]);

  // Filtered & Sorted Assets
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch = 
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.assignedTo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || asset.category === selectedCategory;
      const matchesCondition = selectedCondition === 'All' || asset.condition === selectedCondition;
      const matchesStatus = selectedStatus === 'All' || asset.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesCondition && matchesStatus;
    }).sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'assignedTo') {
        aVal = a.assignedTo.name;
        bVal = b.assignedTo.name;
      }

      if (typeof aVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
    });
  }, [assets, searchTerm, selectedCategory, selectedCondition, selectedStatus, sortField, sortOrder]);

  // Paginated assets
  const totalPages = Math.max(1, Math.ceil(filteredAssets.length / itemsPerPage));
  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAssets.slice(start, start + itemsPerPage);
  }, [filteredAssets, currentPage, itemsPerPage]);

  const handleSort = (field: keyof Asset) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = () => {
    if (selectedAssetIds.length === paginatedAssets.length) {
      setSelectedAssetIds([]);
    } else {
      setSelectedAssetIds(paginatedAssets.map(a => a.id));
    }
  };

  const toggleSelectAsset = (id: string) => {
    setSelectedAssetIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    const exportData = filteredAssets.map(a => ({
      'Asset ID': a.id,
      'Name': a.name,
      'Category': a.category,
      'Manufacturer': a.manufacturer,
      'Model': a.model,
      'Serial Number': a.serialNumber,
      'Location': a.location,
      'Assigned To': a.assignedTo.name,
      'Purchase Date': a.purchaseDate,
      'Purchase Value': a.purchaseValue,
      'Current Value': a.currentValue,
      'Condition': a.condition,
      'Status': a.status,
    }));
    exportToCSV(`AssetFlow_Assets_${new Date().toISOString().split('T')[0]}`, exportData);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enterprise Asset Registry</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              {filteredAssets.length} Assets
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Complete capital equipment lifecycle inventory, calibration history, and custodian assignment.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button
            id="add-asset-primary-btn"
            onClick={onOpenRegisterModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus size={15} />
            <span>+ Register Asset</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search */}
          <div className="relative sm:col-span-2">
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
              placeholder="Search by ID, name, location, assignee..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
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
              {categories.filter(c => c !== 'All').map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Condition Filter */}
          <div>
            <select
              value={selectedCondition}
              onChange={(e) => {
                setSelectedCondition(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="All">All Conditions</option>
              <option value="Excellent">Condition: Excellent</option>
              <option value="Good">Condition: Good</option>
              <option value="Fair">Condition: Fair</option>
              <option value="Poor">Condition: Poor</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Inactive">Inactive</option>
              <option value="Retired">Retired</option>
            </select>
          </div>

        </div>

        {/* Active Filter Chips / Reset */}
        {(searchTerm || selectedCategory !== 'All' || selectedCondition !== 'All' || selectedStatus !== 'All') && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-400">Active Filters:</span>
            {searchTerm && (
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                Keyword: "{searchTerm}"
              </span>
            )}
            {selectedCategory !== 'All' && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                Category: {selectedCategory}
              </span>
            )}
            {selectedStatus !== 'All' && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                Status: {selectedStatus}
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
                setSelectedCondition('All');
                setSelectedStatus('All');
              }}
              className="text-blue-600 hover:text-blue-800 text-xs font-semibold underline ml-auto"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Professional Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold select-none">
              <tr>
                <th className="px-4 py-3 w-10 text-center">
                  <button onClick={handleSelectAll} className="text-slate-400 hover:text-slate-600">
                    {selectedAssetIds.length === paginatedAssets.length && paginatedAssets.length > 0 ? (
                      <CheckSquare size={16} className="text-blue-600" />
                    ) : (
                      <Square size={16} />
                    )}
                  </button>
                </th>
                
                {/* Asset ID */}
                <th 
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100/70"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Asset ID</span>
                    <ArrowUpDown size={12} className="text-slate-400" />
                  </div>
                </th>

                {/* Asset Name */}
                <th 
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100/70"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Asset Name</span>
                    <ArrowUpDown size={12} className="text-slate-400" />
                  </div>
                </th>

                {/* Category */}
                <th className="px-4 py-3">Category</th>

                {/* Location */}
                <th className="px-4 py-3">Location</th>

                {/* Assigned To */}
                <th className="px-4 py-3">Assigned Custodian</th>

                {/* Purchase Date */}
                <th 
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100/70"
                  onClick={() => handleSort('purchaseDate')}
                >
                  <div className="flex items-center gap-1.5">
                    <span>Acquisition</span>
                    <ArrowUpDown size={12} className="text-slate-400" />
                  </div>
                </th>

                {/* Condition */}
                <th className="px-4 py-3">Condition</th>

                {/* Status */}
                <th className="px-4 py-3">Status</th>

                {/* Actions */}
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedAssets.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    <Layers size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-medium">No matching assets found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or register a new asset.</p>
                  </td>
                </tr>
              ) : (
                paginatedAssets.map((asset) => {
                  const isSelected = selectedAssetIds.includes(asset.id);
                  return (
                    <tr 
                      key={asset.id} 
                      className={`hover:bg-blue-50/30 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}
                    >
                      <td className="px-4 py-3.5 text-center">
                        <button 
                          onClick={() => toggleSelectAsset(asset.id)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          {isSelected ? (
                            <CheckSquare size={16} className="text-blue-600" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>

                      {/* Asset ID */}
                      <td className="px-4 py-3.5 font-mono font-semibold text-blue-700 whitespace-nowrap">
                        <button 
                          onClick={() => onViewAssetDetail(asset)}
                          className="hover:underline flex items-center gap-1"
                        >
                          <span>{asset.id}</span>
                        </button>
                      </td>

                      {/* Name with subtle preview thumbnail */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                            {asset.imageUrl ? (
                              <img 
                                src={asset.imageUrl} 
                                alt={asset.name} 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <Layers size={14} />
                              </div>
                            )}
                          </div>
                          <div>
                            <button
                              onClick={() => onViewAssetDetail(asset)}
                              className="font-semibold text-slate-900 hover:text-blue-600 text-left line-clamp-1"
                            >
                              {asset.name}
                            </button>
                            <span className="text-[11px] text-slate-400 block">{asset.model}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5 text-slate-700 whitespace-nowrap">
                        {asset.category}
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3.5 text-slate-600">
                        <div className="max-w-[160px] truncate" title={asset.location}>
                          {asset.location}
                        </div>
                      </td>

                      {/* Assigned To */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <p className="font-medium text-slate-800">{asset.assignedTo.name}</p>
                        <p className="text-[10px] text-slate-400">{asset.assignedTo.department}</p>
                      </td>

                      {/* Purchase Date & Price */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-slate-600">
                        <p>{formatDate(asset.purchaseDate)}</p>
                        <p className="text-[11px] font-semibold text-slate-800">{formatCurrency(asset.currentValue)}</p>
                      </td>

                      {/* Condition */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          asset.condition === 'Excellent' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          asset.condition === 'Good' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          asset.condition === 'Fair' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {asset.condition}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          asset.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                          asset.status === 'Under Maintenance' ? 'bg-amber-100 text-amber-800' :
                          asset.status === 'Inactive' ? 'bg-slate-200 text-slate-700' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {asset.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewAssetDetail(asset)}
                            title="View Asset Profile"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => onScheduleMaintenance(asset)}
                            title="Schedule Service"
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                          >
                            <Wrench size={15} />
                          </button>
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
            <span>of {filteredAssets.length} total records</span>
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
