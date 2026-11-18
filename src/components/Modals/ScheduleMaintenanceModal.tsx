import React, { useState } from 'react';
import { X, Wrench, Calendar, DollarSign, User } from 'lucide-react';
import { Asset, MaintenanceRecord } from '../../types';

interface ScheduleMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: Asset[];
  initialAsset?: Asset | null;
  onSchedule: (assetId: string, record: MaintenanceRecord) => void;
}

export const ScheduleMaintenanceModal: React.FC<ScheduleMaintenanceModalProps> = ({
  isOpen,
  onClose,
  assets,
  initialAsset,
  onSchedule
}) => {
  if (!isOpen) return null;

  const [selectedAssetId, setSelectedAssetId] = useState(initialAsset ? initialAsset.id : (assets[0]?.id || ''));
  const [serviceType, setServiceType] = useState<MaintenanceRecord['type']>('Preventive');
  const [scheduledDate, setScheduledDate] = useState('2026-09-20');
  const [technician, setTechnician] = useState('Certified Biomedical Specialist (Siemens / GE)');
  const [estimatedCost, setEstimatedCost] = useState<number>(1200);
  const [description, setDescription] = useState('Quarterly preventive servicing, safety interlock verification, and calibration check.');
  const [parts, setParts] = useState('Filter Pack, Seal Gasket');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: MaintenanceRecord = {
      id: 'MNT-' + Math.floor(100 + Math.random() * 900),
      date: scheduledDate,
      type: serviceType,
      description,
      technician,
      cost: Number(estimatedCost) || 0,
      status: 'Scheduled',
      partsReplaced: parts ? parts.split(',').map(p => p.trim()) : [],
      nextDueDate: '2027-03-20',
    };

    onSchedule(selectedAssetId, newRecord);
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
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
              <Wrench size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Schedule Equipment Maintenance</h3>
              <p className="text-[11px] text-slate-500">Dispatch field technician & generate work order ticket</p>
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
            <label className="block font-semibold text-slate-700 mb-1">Target Asset *</label>
            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              {assets.map(a => (
                <option key={a.id} value={a.id}>
                  {a.id} - {a.name} ({a.location})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Service Type</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="Preventive">Preventive Maintenance (PM)</option>
                <option value="Corrective">Corrective Repair</option>
                <option value="Calibration">NIST / ISO Calibration</option>
                <option value="Inspection">Compliance Inspection</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Scheduled Date</label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Technician / Engineering Service Provider</label>
            <input
              type="text"
              required
              value={technician}
              onChange={(e) => setTechnician(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Estimated Cost ($ USD)</label>
            <input
              type="number"
              min="0"
              required
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Scope of Work & Protocol</label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Required Replacement Parts (Comma separated)</label>
            <input
              type="text"
              value={parts}
              onChange={(e) => setParts(e.target.value)}
              placeholder="e.g. Filter cartridge, O-ring kit, Thermocouple"
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
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shadow-xs transition-colors"
            >
              Create Service Work Order
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
