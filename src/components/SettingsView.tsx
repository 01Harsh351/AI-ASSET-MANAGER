import React, { useState } from 'react';
import { Settings, ShieldCheck, Bell, Building2, Sliders, CheckCircle2, UserCheck, Key } from 'lucide-react';

interface SettingsViewProps {
  currentOrg: string;
  onUpdateOrg: (newOrg: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentOrg,
  onUpdateOrg
}) => {
  const [orgName, setOrgName] = useState(currentOrg);
  const [orgType, setOrgType] = useState('Hospital & Healthcare Network');
  const [depreciationMethod, setDepreciationMethod] = useState('MACRS Straight-Line');
  const [telemetrySensitivity, setTelemetrySensitivity] = useState('Balanced (95% Confidence)');
  const [autoReorderApproval, setAutoReorderApproval] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [emailDigest, setEmailDigest] = useState('Daily Morning Brief');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateOrg(orgName);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Configuration & Security</h1>
        <p className="text-sm text-slate-500 mt-1">
          Enterprise operational thresholds, telemetry sensitivity, role-based permissions, and audit parameters.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600" />
          Settings updated and synchronized across all enterprise nodes.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Organization Identity */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 size={18} className="text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Organization & Sector Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Organization Title</label>
              <input
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sector Architecture</label>
              <select
                value={orgType}
                onChange={(e) => setOrgType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Hospital & Healthcare Network">Hospital & Healthcare Network</option>
                <option value="Research University & Campus">Research University & Campus</option>
                <option value="Enterprise Tech & Data Centers">Enterprise Tech & Data Centers</option>
                <option value="Industrial Manufacturing & Defense">Industrial Manufacturing & Defense</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI & Automation Engine */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders size={18} className="text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">AI Telemetry & Predictive Thresholds</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Predictive Telemetry Sensitivity</label>
              <select
                value={telemetrySensitivity}
                onChange={(e) => setTelemetrySensitivity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="Conservative (99% Confidence)">Conservative (Fewer alerts, highest precision)</option>
                <option value="Balanced (95% Confidence)">Balanced (Enterprise operational standard)</option>
                <option value="Aggressive (90% Confidence)">Aggressive (Early preventative trigger)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Asset Depreciation Model</label>
              <select
                value={depreciationMethod}
                onChange={(e) => setDepreciationMethod(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="MACRS Straight-Line">MACRS Straight-Line Standard</option>
                <option value="Double Declining Balance">Double Declining Balance (DDB)</option>
                <option value="Sum-of-the-Years-Digits">Sum-of-the-Years-Digits (SYD)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 space-y-2.5 text-xs">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={autoReorderApproval}
                onChange={(e) => setAutoReorderApproval(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="text-slate-700 font-medium">
                Auto-generate draft Purchase Orders when inventory breaches critical minimum safety thresholds
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={lowStockAlerts}
                onChange={(e) => setLowStockAlerts(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span className="text-slate-700 font-medium">
                Broadcast instant SMS / Email priority dispatch for vibration anomalies exceeding 2.5G
              </span>
            </label>
          </div>
        </div>

        {/* User Roles & Permissions Matrix */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <ShieldCheck size={18} className="text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Role-Based Access Control (RBAC)</h3>
          </div>

          <p className="text-xs text-slate-500">
            Current active enterprise security matrix:
          </p>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Role Profile</th>
                  <th className="p-2.5">Asset Registry</th>
                  <th className="p-2.5">Stock Adjustment</th>
                  <th className="p-2.5">PO Authorize</th>
                  <th className="p-2.5">Audit Logs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="p-2.5 font-semibold text-slate-900">System Administrator</td>
                  <td className="p-2.5 text-emerald-600 font-medium">Full Access</td>
                  <td className="p-2.5 text-emerald-600 font-medium">Full Access</td>
                  <td className="p-2.5 text-emerald-600 font-medium">Full Access</td>
                  <td className="p-2.5 text-emerald-600 font-medium">Full Access</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold text-slate-900">Clinical / Dept Custodian</td>
                  <td className="p-2.5 text-emerald-600 font-medium">View / Edit</td>
                  <td className="p-2.5 text-slate-400">Read Only</td>
                  <td className="p-2.5 text-slate-400">Requisition Only</td>
                  <td className="p-2.5 text-slate-400">Department View</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold text-slate-900">Procurement Officer</td>
                  <td className="p-2.5 text-slate-400">Read Only</td>
                  <td className="p-2.5 text-emerald-600 font-medium">Full Access</td>
                  <td className="p-2.5 text-emerald-600 font-medium">Sign-off ($100k)</td>
                  <td className="p-2.5 text-slate-400">Read Only</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold text-slate-900">Field Maintenance Tech</td>
                  <td className="p-2.5 text-blue-600 font-medium">Work Orders Only</td>
                  <td className="p-2.5 text-blue-600 font-medium">Parts Consumption</td>
                  <td className="p-2.5 text-slate-400">No Access</td>
                  <td className="p-2.5 text-slate-400">Service Logs Only</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            Save Configuration Changes
          </button>
        </div>

      </form>
    </div>
  );
};
