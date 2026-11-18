import React from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  Package, 
  Boxes, 
  Wrench, 
  Building2, 
  ShoppingCart, 
  Sparkles, 
  FileText, 
  Settings, 
  ShieldCheck,
  ChevronRight,
  X
} from 'lucide-react';
import { PageType, Organization } from '../types';

interface SidebarProps {
  currentPage: PageType;
  onSelectPage: (page: PageType) => void;
  activeOrg: Organization;
  pendingPoCount: number;
  activeMaintenanceCount: number;
  aiOpportunitiesCount: number;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  activeOrg,
  pendingPoCount,
  activeMaintenanceCount,
  aiOpportunitiesCount,
  isMobileOpen,
  onCloseMobile
}) => {
  const navItems: {
    id: PageType;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'assets', label: 'Assets', icon: Layers },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'stock-management', label: 'Stock Management', icon: Boxes },
    { 
      id: 'maintenance', 
      label: 'Maintenance', 
      icon: Wrench, 
      badge: activeMaintenanceCount,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
    },
    { id: 'vendors', label: 'Vendors', icon: Building2 },
    { 
      id: 'procurement', 
      label: 'Procurement', 
      icon: ShoppingCart, 
      badge: pendingPoCount,
      badgeColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
    },
    { 
      id: 'ai-insights', 
      label: 'AI Insights', 
      icon: Sparkles, 
      badge: aiOpportunitiesCount,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
    },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0f172a] text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo & Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-900/30">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-white tracking-tight text-base">AssetFlow</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-400/20">AI</span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal leading-none mt-0.5">Enterprise Asset Cloud</p>
            </div>
          </div>
          <button 
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-md hover:bg-slate-800"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Platform Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => {
                  onSelectPage(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Organization / Node Status Info */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/50">
          <div className="px-3 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider">Active Instance</span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>
            <p className="font-semibold text-slate-200 truncate">{activeOrg.name}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{activeOrg.totalLocations} facilities registered</p>
          </div>

          <div className="mt-2.5 px-3 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-emerald-400" />
              <span>SOC2 & HIPAA Compliant</span>
            </div>
            <span className="text-slate-400 font-mono">v3.4.1</span>
          </div>
        </div>
      </aside>
    </>
  );
};
