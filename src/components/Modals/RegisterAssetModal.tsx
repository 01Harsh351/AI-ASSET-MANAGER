import React, { useState } from 'react';
import { X, Layers, Plus, Upload, Check } from 'lucide-react';
import { Asset, AssetCondition, AssetStatus } from '../../types';

interface RegisterAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (newAsset: Omit<Asset, 'id' | 'currentValue' | 'maintenanceHistory' | 'lifecycleTimeline'>) => void;
}

export const RegisterAssetModal: React.FC<RegisterAssetModalProps> = ({
  isOpen,
  onClose,
  onRegister
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [category, setCategory] = useState<Asset['category']>('Medical Devices');
  const [location, setLocation] = useState('Bldg A - Radiology Imaging Suite 1');
  const [facility, setFacility] = useState('Central Hospital Main Campus');
  const [assignedName, setAssignedName] = useState('Dr. Marcus Sterling');
  const [assignedEmail, setAssignedEmail] = useState('m.sterling@metrohealth.org');
  const [assignedDept, setAssignedDept] = useState('Clinical Engineering');
  const [purchaseDate, setPurchaseDate] = useState('2026-09-14');
  const [purchaseValue, setPurchaseValue] = useState<number>(45000);
  const [depreciationRate, setDepreciationRate] = useState<number>(15);
  const [condition, setCondition] = useState<AssetCondition>('Excellent');
  const [status, setStatus] = useState<AssetStatus>('Active');
  const [serialNumber, setSerialNumber] = useState('SN-' + Math.floor(10000 + Math.random() * 90000));
  const [model, setModel] = useState('Series 7000 Pro Enterprise');
  const [manufacturer, setManufacturer] = useState('Precision BioTech Instruments');
  const [warrantyExpiry, setWarrantyExpiry] = useState('2029-09-14');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister({
      name,
      category,
      location,
      facility,
      assignedTo: {
        name: assignedName,
        email: assignedEmail,
        department: assignedDept,
      },
      purchaseDate,
      purchaseValue: Number(purchaseValue) || 0,
      depreciationRate: Number(depreciationRate) || 15,
      condition,
      status,
      serialNumber,
      model,
      manufacturer,
      warrantyExpiry,
      imageUrl,
      utilizationScore: 92,
      aiNote: 'Newly commissioned asset. Initial baseline vibration telemetry and warranty record indexed in enterprise registry.',
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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <Layers size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Register New Capital Asset</h3>
              <p className="text-[11px] text-slate-500">Record equipment details, procurement value, and custodian</p>
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Asset Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Siemens Artis Q.zen Angiography System"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Equipment Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="Medical Devices">Medical Devices</option>
                <option value="IT & Servers">IT & Servers</option>
                <option value="Laboratory Equipment">Laboratory Equipment</option>
                <option value="Facilities & HVAC">Facilities & HVAC</option>
                <option value="Heavy Machinery">Heavy Machinery</option>
                <option value="Fleet Vehicles">Fleet Vehicles</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Manufacturer / Make</label>
              <input
                type="text"
                required
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="e.g. Siemens Healthineers"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Model Specification</label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. Pro-Edition BT22"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Serial Number *</label>
              <input
                type="text"
                required
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="e.g. SN-89412-MED"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Facility Campus</label>
              <input
                type="text"
                required
                value={facility}
                onChange={(e) => setFacility(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Room / Specific Location *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bldg B - Suite 204"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Custodian Name *</label>
              <input
                type="text"
                required
                value={assignedName}
                onChange={(e) => setAssignedName(e.target.value)}
                placeholder="e.g. Dr. Eleanor Vance"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Custodian Email</label>
              <input
                type="email"
                required
                value={assignedEmail}
                onChange={(e) => setAssignedEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Purchase Cost (USD) *</label>
              <input
                type="number"
                min="0"
                required
                value={purchaseValue}
                onChange={(e) => setPurchaseValue(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Annual Depreciation Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={depreciationRate}
                onChange={(e) => setDepreciationRate(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Physical Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="Excellent">Excellent (New / Unblemished)</option>
                <option value="Good">Good (Operational standard)</option>
                <option value="Fair">Fair (Wear evident)</option>
                <option value="Poor">Poor (Requires overhaul)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="Active">Active (In Production)</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Inactive">Inactive / Storeroom</option>
              </select>
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
              Register Asset
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
