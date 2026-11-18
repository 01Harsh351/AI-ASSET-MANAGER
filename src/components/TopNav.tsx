import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Menu, 
  Building, 
  ChevronDown, 
  Check, 
  User, 
  LogOut, 
  HelpCircle, 
  Sparkles,
  AlertTriangle,
  Clock,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Organization, ActivityItem } from '../types';

interface TopNavProps {
  organizations: Organization[];
  activeOrg: Organization;
  onSelectOrg: (org: Organization) => void;
  activeSite: string;
  onSelectSite: (site: string) => void;
  onToggleMobileMenu: () => void;
  onOpenQuickAction: (actionType: 'register-asset' | 'add-inventory' | 'create-po' | 'schedule-maintenance') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activities: ActivityItem[];
  onNavigateTo: (page: any) => void;
  userEmail?: string;
  onSignOut?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  organizations,
  activeOrg,
  onSelectOrg,
  activeSite,
  onSelectSite,
  onToggleMobileMenu,
  onOpenQuickAction,
  searchQuery,
  onSearchChange,
  activities,
  onNavigateTo,
  userEmail,
  onSignOut
}) => {
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isSiteDropdownOpen, setIsSiteDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

  const orgRef = useRef<HTMLDivElement>(null);
  const siteRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const quickRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (orgRef.current && !orgRef.current.contains(event.target as Node)) setIsOrgDropdownOpen(false);
      if (siteRef.current && !siteRef.current.contains(event.target as Node)) setIsSiteDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setIsNotificationsOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setIsProfileOpen(false);
      if (quickRef.current && !quickRef.current.contains(event.target as Node)) setIsQuickActionsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const criticalNotifications = activities.filter(a => a.severity === 'critical' || a.severity === 'warning');

  return (
    <header 
      id="top-navigation" 
      className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-xs"
    >
      <div className="flex items-center gap-3 lg:gap-4 flex-1 max-w-2xl">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 lg:hidden"
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search assets, SKUs, serials, locations..."
            className="w-full pl-9 pr-14 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
          <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded shadow-2xs">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Organization Selector Dropdown */}
        <div className="relative hidden md:block" ref={orgRef}>
          <button
            id="org-selector-button"
            onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors max-w-[220px]"
          >
            <Building size={14} className="text-slate-500 shrink-0" />
            <span className="truncate">{activeOrg.name}</span>
            <ChevronDown size={14} className="text-slate-400 shrink-0 ml-auto" />
          </button>

          {isOrgDropdownOpen && (
            <div className="absolute right-0 mt-1 w-72 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                Switch Organization
              </div>
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => {
                    onSelectOrg(org);
                    setIsOrgDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 text-slate-700 hover:text-slate-900"
                >
                  <div className="truncate pr-2">
                    <p className="font-medium truncate">{org.name}</p>
                    <p className="text-[11px] text-slate-400">{org.type} • {org.sites.length} sites</p>
                  </div>
                  {activeOrg.id === org.id && <Check size={14} className="text-blue-600 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Facility Site Selector */}
        <div className="relative hidden xl:block" ref={siteRef}>
          <button
            id="site-selector-button"
            onClick={() => setIsSiteDropdownOpen(!isSiteDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors max-w-[200px]"
          >
            <span className="text-slate-400 font-normal">Site:</span>
            <span className="truncate text-slate-700">{activeSite || 'All Sites'}</span>
            <ChevronDown size={13} className="text-slate-400 shrink-0" />
          </button>

          {isSiteDropdownOpen && (
            <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 z-50">
              <button
                onClick={() => {
                  onSelectSite('All Sites');
                  setIsSiteDropdownOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 text-slate-700"
              >
                <span>All Sites ({activeOrg.sites.length})</span>
                {activeSite === 'All Sites' && <Check size={14} className="text-blue-600" />}
              </button>
              {activeOrg.sites.map((site) => (
                <button
                  key={site}
                  onClick={() => {
                    onSelectSite(site);
                    setIsSiteDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 text-slate-700"
                >
                  <span className="truncate pr-2">{site}</span>
                  {activeSite === site && <Check size={14} className="text-blue-600 shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Action Button Dropdown */}
        <div className="relative" ref={quickRef}>
          <button
            id="quick-actions-trigger"
            onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <span>+ Quick Action</span>
            <ChevronDown size={14} />
          </button>

          {isQuickActionsOpen && (
            <div className="absolute right-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-1">
              <button
                onClick={() => {
                  setIsQuickActionsOpen(false);
                  onOpenQuickAction('register-asset');
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 font-medium"
              >
                <div className="w-6 h-6 rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">+</div>
                Register New Asset
              </button>
              <button
                onClick={() => {
                  setIsQuickActionsOpen(false);
                  onOpenQuickAction('add-inventory');
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 font-medium"
              >
                <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">+</div>
                Add Inventory Item
              </button>
              <button
                onClick={() => {
                  setIsQuickActionsOpen(false);
                  onOpenQuickAction('create-po');
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 font-medium"
              >
                <div className="w-6 h-6 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">+</div>
                Create Purchase Order
              </button>
              <button
                onClick={() => {
                  setIsQuickActionsOpen(false);
                  onOpenQuickAction('schedule-maintenance');
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 font-medium"
              >
                <div className="w-6 h-6 rounded bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">+</div>
                Schedule Maintenance
              </button>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            id="notifications-bell-button"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 relative transition-colors"
            aria-label="View notifications"
          >
            <Bell size={18} />
            {criticalNotifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50">
              <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">System Alerts</h4>
                  <span className="text-[10px] bg-red-100 text-red-700 font-semibold px-1.5 py-0.5 rounded-full">
                    {criticalNotifications.length} Critical
                  </span>
                </div>
                <button 
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    onNavigateTo('ai-insights');
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  View AI Log
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {activities.slice(0, 4).map((item) => (
                  <div key={item.id} className="p-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-2.5">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        item.severity === 'critical' ? 'bg-red-500' :
                        item.severity === 'warning' ? 'bg-amber-500' :
                        item.severity === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-xs font-medium text-slate-800 truncate">{item.title}</p>
                          <span className="text-[10px] text-slate-400 shrink-0">{item.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-3 pt-2 border-t border-slate-100 text-center">
                <button 
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    onNavigateTo('dashboard');
                  }}
                  className="w-full py-1 text-xs text-slate-600 hover:text-slate-900 font-medium rounded hover:bg-slate-50 flex items-center justify-center gap-1"
                >
                  <span>Activity Feed History</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative pl-1 border-l border-slate-200" ref={profileRef}>
          <button
            id="user-profile-menu-button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-semibold text-xs ring-2 ring-blue-600/20">
              MS
            </div>
            <div className="hidden lg:block">
              <p className="text-xs font-semibold text-slate-800 leading-tight">Marcus Sterling</p>
              <p className="text-[11px] text-slate-500 leading-tight">Director of Enterprise Assets</p>
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden lg:block" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">Marcus Sterling</p>
                <p className="text-[11px] text-slate-500">{userEmail || 'm.sterling@metrohealth.org'}</p>
                <span className="inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                  Global Administrator
                </span>
              </div>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  onNavigateTo('settings');
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <User size={14} className="text-slate-400" />
                Account Settings
              </button>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  onNavigateTo('reports');
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <HelpCircle size={14} className="text-slate-400" />
                Audit Logs & Compliance
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  onSignOut?.();
                }}
                className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
