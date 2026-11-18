import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import {
  PageType,
  Asset,
  InventoryItem,
  PurchaseOrder,
  Vendor,
  ActivityItem,
  AiInsight,
  Organization,
  MaintenanceRecord
} from './types';
import {
  mockOrganizations,
  initialAssets,
  initialInventory,
  mockPurchaseOrders,
  mockVendors,
  initialActivities,
  mockAiInsights
} from './data/mockData';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import {
  loadUserWorkspaceData,
  seedStarterWorkspaceForUser,
  createAssetInDb,
  createMaintenanceInDb,
  createInventoryItemInDb,
  createPurchaseOrderInDb,
  createActivityInDb,
  updateAssetInDb,
  updateMaintenanceStatusInDb,
  updateInventoryItemInDb,
  updatePurchaseOrderStatusInDb,
  updateOrganizationNameInDb,
  deleteAiInsightInDb,
} from './lib/supabaseDb';

// Layout components
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { AuthGate } from './components/AuthGate';

// View components
import { DashboardView } from './components/DashboardView';
import { AssetsView } from './components/AssetsView';
import { InventoryView } from './components/InventoryView';
import { StockManagementView } from './components/StockManagementView';
import { MaintenanceView } from './components/MaintenanceView';
import { ProcurementView } from './components/ProcurementView';
import { VendorsView } from './components/VendorsView';
import { AiInsightsView } from './components/AiInsightsView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';

// Modals
import { AssetDetailModal } from './components/AssetDetailModal';
import { RegisterAssetModal } from './components/Modals/RegisterAssetModal';
import { AddInventoryModal } from './components/Modals/AddInventoryModal';
import { StockUpdateModal } from './components/Modals/StockUpdateModal';
import { ScheduleMaintenanceModal } from './components/Modals/ScheduleMaintenanceModal';
import { CreatePoModal } from './components/Modals/CreatePoModal';
import { CheckCircle2, X } from 'lucide-react';

export default function App() {
  // Supabase Auth Session
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(isSupabaseConfigured);
  const [dataLoading, setDataLoading] = useState<boolean>(false);

  // Navigation & Organization State
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [organizations, setOrganizations] = useState<Organization[]>(mockOrganizations);
  const [activeOrg, setActiveOrg] = useState<Organization>(mockOrganizations[0]);
  const [activeSite, setActiveSite] = useState<string>('All Sites');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Primary Data State
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(mockPurchaseOrders);
  const [vendors, setVendors] = useState<Vendor[]>(mockVendors);
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);
  const [aiInsights, setAiInsights] = useState<AiInsight[]>(mockAiInsights);

  // Modal State
  const [selectedAssetDetail, setSelectedAssetDetail] = useState<Asset | null>(null);
  const [isRegisterAssetOpen, setIsRegisterAssetOpen] = useState(false);
  const [isAddInventoryOpen, setIsAddInventoryOpen] = useState(false);
  const [stockUpdateItem, setStockUpdateItem] = useState<InventoryItem | null>(null);
  const [isScheduleMaintenanceOpen, setIsScheduleMaintenanceOpen] = useState(false);
  const [scheduleMaintenanceAsset, setScheduleMaintenanceAsset] = useState<Asset | null>(null);
  const [isCreatePoOpen, setIsCreatePoOpen] = useState(false);
  const [createPoInitialVendor, setCreatePoInitialVendor] = useState<string>('');
  const [createPoInitialUnits, setCreatePoInitialUnits] = useState<number>(50);
  const [createPoInitialAmount, setCreatePoInitialAmount] = useState<number>(4500);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // -------------------------------------------------------------
  // Supabase Auth & Workspace Data Loading
  // -------------------------------------------------------------
  const fetchWorkspace = useCallback(async (userId: string) => {
    setDataLoading(true);
    try {
      let data = await loadUserWorkspaceData(userId);

      // Seed initial enterprise dataset once on a new user's first login
      if (
        data.organizations.length === 0 &&
        data.assets.length === 0 &&
        data.inventory.length === 0
      ) {
        data = await seedStarterWorkspaceForUser(userId);
      }

      if (data.organizations.length > 0) {
        setOrganizations(data.organizations);
        setActiveOrg(data.organizations[0]);
      }
      setAssets(data.assets);
      setInventory(data.inventory);
      setPurchaseOrders(data.purchaseOrders);
      setVendors(data.vendors);
      setActivities(data.activities);
      setAiInsights(data.aiInsights);
    } catch (error: any) {
      console.error('Failed to load Supabase workspace:', error);
      showToast('Failed to load workspace data from Supabase.', 'warning');
    } finally {
      setDataLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data: { session: activeSession } }) => {
      if (!mounted) return;
      setSession(activeSession);
      setAuthLoading(false);
      if (activeSession?.user) {
        fetchWorkspace(activeSession.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        fetchWorkspace(nextSession.user.id);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchWorkspace]);

  const handleSignOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setSession(null);
    }
  };

  const userId = session?.user?.id;

  const addActivity = async (
    title: string,
    description: string,
    severity: ActivityItem['severity'] = 'normal',
    type: ActivityItem['type'] = 'asset_registered'
  ) => {
    const newActivity: ActivityItem = {
      id: 'ACT-' + Date.now(),
      title,
      description,
      timestamp: 'Just now',
      severity,
      user: {
        name: session?.user?.email?.split('@')[0] || 'Marcus Sterling',
        avatar: (session?.user?.email?.slice(0, 2) || 'MS').toUpperCase(),
        role: 'Global Asset Director'
      },
      type
    };

    setActivities(prev => [newActivity, ...prev]);

    if (userId) {
      try {
        await createActivityInDb(userId, newActivity);
      } catch (err) {
        console.error('Failed to persist activity:', err);
      }
    }
  };

  // -------------------------------------------------------------
  // Asset Handlers
  // -------------------------------------------------------------
  const handleRegisterAsset = async (
    newAssetData: Omit<Asset, 'id' | 'currentValue' | 'maintenanceHistory' | 'lifecycleTimeline'>
  ) => {
    const newId = `AST-${1000 + assets.length + 1}-${Date.now().toString().slice(-3)}`;
    const newAsset: Asset = {
      ...newAssetData,
      id: newId,
      currentValue: newAssetData.purchaseValue,
      maintenanceHistory: [],
      lifecycleTimeline: [
        {
          date: new Date().toISOString().split('T')[0],
          title: 'Asset Commissioned & Certified',
          description: 'Asset procured, tagged, and registered in enterprise inventory system.',
          completed: true
        }
      ]
    };

    setAssets(prev => [newAsset, ...prev]);

    if (userId) {
      try {
        await createAssetInDb(userId, newAsset);
      } catch (err) {
        console.error('Failed to save asset:', err);
        showToast('Could not save asset to database.', 'warning');
        return;
      }
    }

    await addActivity(
      `New Asset Registered: ${newAsset.name}`,
      `Asset ${newId} commissioned under custodian ${newAsset.assignedTo.name}.`,
      'success',
      'asset_registered'
    );
    showToast(`Asset ${newId} successfully registered in registry.`);
  };

  const handleUpdateAssetStatus = async (assetId: string, newStatus: Asset['status']) => {
    setAssets(prev =>
      prev.map(asset => (asset.id === assetId ? { ...asset, status: newStatus } : asset))
    );
    setSelectedAssetDetail(prev => (prev && prev.id === assetId ? { ...prev, status: newStatus } : prev));

    if (userId) {
      try {
        await updateAssetInDb(userId, assetId, { status: newStatus });
      } catch (err) {
        console.error('Failed to update asset status:', err);
        showToast('Failed to update asset status.', 'warning');
        return;
      }
    }
    showToast(`Asset ${assetId} status updated to ${newStatus}.`);
  };

  const handleOpenScheduleMaintenance = (asset?: Asset) => {
    setScheduleMaintenanceAsset(asset || null);
    setIsScheduleMaintenanceOpen(true);
  };

  const handleScheduleMaintenance = async (assetId: string, record: MaintenanceRecord) => {
    const targetAsset = assets.find(a => a.id === assetId);
    const updatedTimeline = [
      {
        date: record.date,
        title: `${record.type} Work Order Scheduled`,
        description: record.description,
        completed: false
      },
      ...(targetAsset?.lifecycleTimeline ?? [])
    ];

    setAssets(prev => prev.map(asset => {
      if (asset.id === assetId) {
        return {
          ...asset,
          status: 'Under Maintenance',
          maintenanceHistory: [record, ...asset.maintenanceHistory],
          lifecycleTimeline: updatedTimeline
        };
      }
      return asset;
    }));

    if (userId) {
      try {
        await Promise.all([
          createMaintenanceInDb(userId, assetId, record),
          updateAssetInDb(userId, assetId, {
            status: 'Under Maintenance',
            lifecycleTimeline: updatedTimeline,
          }),
        ]);
      } catch (err) {
        console.error('Failed to schedule maintenance:', err);
        showToast('Failed to save maintenance schedule.', 'warning');
        return;
      }
    }

    await addActivity(
      `Maintenance Scheduled: ${record.id}`,
      `Work order created for Asset ${assetId}. Technician dispatched: ${record.technician}.`,
      'warning',
      'maintenance_completed'
    );
    showToast(`Work order ${record.id} dispatched for Asset ${assetId}.`);
  };

  const handleCompleteMaintenance = async (assetId: string, maintenanceId: string) => {
    const targetAsset = assets.find(a => a.id === assetId);
    const updatedHistory = (targetAsset?.maintenanceHistory ?? []).map(m =>
      m.id === maintenanceId ? { ...m, status: 'Completed' as const } : m
    );
    const hasOtherActive = updatedHistory.some(m => m.status === 'In Progress' || m.status === 'Scheduled');
    const nextAssetStatus: Asset['status'] = hasOtherActive ? 'Under Maintenance' : 'Active';
    const updatedTimeline = [
      {
        date: new Date().toISOString().split('T')[0],
        title: `Work Order ${maintenanceId} Completed`,
        description: 'Equipment tested, certified, and cleared for clinical production.',
        completed: true
      },
      ...(targetAsset?.lifecycleTimeline ?? [])
    ];

    setAssets(prev => prev.map(asset => {
      if (asset.id === assetId) {
        return {
          ...asset,
          status: nextAssetStatus,
          maintenanceHistory: updatedHistory,
          lifecycleTimeline: updatedTimeline
        };
      }
      return asset;
    }));

    if (userId) {
      try {
        await Promise.all([
          updateMaintenanceStatusInDb(userId, maintenanceId, 'Completed'),
          updateAssetInDb(userId, assetId, {
            status: nextAssetStatus,
            lifecycleTimeline: updatedTimeline,
          }),
        ]);
      } catch (err) {
        console.error('Failed to complete maintenance:', err);
        showToast('Failed to update work order status.', 'warning');
        return;
      }
    }

    await addActivity(
      `Maintenance Completed: ${maintenanceId}`,
      `Asset ${assetId} maintenance completed and return-to-service protocol certified.`,
      'success',
      'maintenance_completed'
    );
    showToast(`Work order ${maintenanceId} closed successfully.`);
  };

  // -------------------------------------------------------------
  // Inventory Handlers
  // -------------------------------------------------------------
  const calculateStockStatus = (available: number, minimum: number): InventoryItem['status'] => {
    if (available === 0) return 'Out of Stock';
    if (available <= minimum * 0.4) return 'Critical';
    if (available <= minimum) return 'Low Stock';
    return 'Healthy';
  };

  const handleAddInventoryItem = async (newItemData: Omit<InventoryItem, 'id' | 'status'>) => {
    const newId = `INV-${500 + inventory.length + 1}-${Date.now().toString().slice(-3)}`;
    const status = calculateStockStatus(newItemData.availableStock, newItemData.minimumStock);
    const newItem: InventoryItem = {
      ...newItemData,
      id: newId,
      status
    };

    setInventory(prev => [newItem, ...prev]);

    if (userId) {
      try {
        await createInventoryItemInDb(userId, newItem);
      } catch (err) {
        console.error('Failed to create inventory item:', err);
        showToast('Failed to save inventory item.', 'warning');
        return;
      }
    }

    await addActivity(
      `New Inventory SKU Added: ${newItem.sku}`,
      `Cataloged "${newItem.name}" at ${newItem.warehouse} with ${newItem.availableStock} initial units.`,
      'normal',
      'stock_updated'
    );
    showToast(`Item ${newItem.sku} added to catalog.`);
  };

  const handleSaveStockUpdate = async (itemId: string, newStock: number, reason: string) => {
    const targetItem = inventory.find(i => i.id === itemId);
    if (!targetItem) return;

    const newStatus = calculateStockStatus(newStock, targetItem.minimumStock);
    const nextLastRestocked =
      newStock > targetItem.availableStock
        ? new Date().toISOString().split('T')[0]
        : targetItem.lastRestocked;

    setInventory(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          availableStock: newStock,
          status: newStatus,
          lastRestocked: nextLastRestocked
        };
      }
      return item;
    }));

    if (userId) {
      try {
        await updateInventoryItemInDb(userId, itemId, {
          availableStock: newStock,
          status: newStatus,
          lastRestocked: nextLastRestocked,
        });
      } catch (err) {
        console.error('Failed to update stock:', err);
        showToast('Failed to save stock adjustment.', 'warning');
        return;
      }
    }

    await addActivity(
      `Stock Adjusted: ${targetItem.sku}`,
      `Stock updated to ${newStock} units. Reason: ${reason}`,
      newStock <= targetItem.minimumStock ? 'warning' : 'normal',
      'stock_updated'
    );
    showToast(`Stock updated for SKU ${targetItem.sku} (${newStock} units available).`);
  };

  const handleTransferStock = async (sku: string, fromWarehouse: string, toWarehouse: string, amount: number) => {
    const targetItem = inventory.find(i => i.sku === sku);

    setInventory(prev => prev.map(item => {
      if (item.sku === sku) {
        return {
          ...item,
          warehouse: toWarehouse,
          aisleBin: 'Transferred Bay B-1'
        };
      }
      return item;
    }));

    if (userId && targetItem) {
      try {
        await updateInventoryItemInDb(userId, targetItem.id, {
          warehouse: toWarehouse,
          aisleBin: 'Transferred Bay B-1',
        });
      } catch (err) {
        console.error('Failed to transfer stock:', err);
        showToast('Failed to save warehouse transfer.', 'warning');
        return;
      }
    }

    await addActivity(
      `Inter-Warehouse Transfer Executed: ${sku}`,
      `Transferred ${amount} units of ${sku} from ${fromWarehouse} to ${toWarehouse}.`,
      'normal',
      'stock_updated'
    );
    showToast(`Transfer completed: ${amount} units sent to ${toWarehouse}.`);
  };

  const handleQuickReorder = (item: InventoryItem) => {
    setCreatePoInitialVendor(item.supplier);
    setCreatePoInitialUnits(item.optimalStock - item.availableStock);
    setCreatePoInitialAmount(Math.round((item.optimalStock - item.availableStock) * item.unitCost));
    setIsCreatePoOpen(true);
  };

  // -------------------------------------------------------------
  // Procurement Handlers
  // -------------------------------------------------------------
  const handleCreatePo = async (newPoData: Omit<PurchaseOrder, 'id'>) => {
    const newId = `PO-2026-${100 + purchaseOrders.length + 1}-${Date.now().toString().slice(-2)}`;
    const newPo: PurchaseOrder = {
      ...newPoData,
      id: newId,
    };

    setPurchaseOrders(prev => [newPo, ...prev]);

    if (userId) {
      try {
        await createPurchaseOrderInDb(userId, newPo);
      } catch (err) {
        console.error('Failed to create PO:', err);
        showToast('Failed to save purchase order.', 'warning');
        return;
      }
    }

    await addActivity(
      `Purchase Order Submitted: ${newId}`,
      `Order placed with ${newPo.vendorName} for $${newPo.totalAmount.toLocaleString()} (${newPo.itemsCount} units).`,
      'normal',
      'po_created'
    );
    showToast(`Purchase order ${newId} created and submitted for approval.`);
  };

  const handleUpdatePoStatus = async (poId: string, newStatus: PurchaseOrder['status']) => {
    setPurchaseOrders(prev => prev.map(po => {
      if (po.id === poId) {
        return { ...po, status: newStatus };
      }
      return po;
    }));

    if (userId) {
      try {
        await updatePurchaseOrderStatusInDb(userId, poId, newStatus);
      } catch (err) {
        console.error('Failed to update PO status:', err);
        showToast('Failed to update PO status.', 'warning');
        return;
      }
    }

    const po = purchaseOrders.find(p => p.id === poId);
    if (po) {
      await addActivity(
        `PO ${poId} Status Changed: ${newStatus}`,
        `Purchase order with ${po.vendorName} marked as ${newStatus}.`,
        newStatus === 'Received' ? 'success' : 'normal',
        'po_created'
      );
      showToast(`PO ${poId} status updated to ${newStatus}.`);

      if (newStatus === 'Received') {
        const matchedItems = inventory.filter(item =>
          item.supplier.toLowerCase().includes(po.vendorName.toLowerCase().split(' ')[0])
        );
        const today = new Date().toISOString().split('T')[0];

        setInventory(prev => prev.map(item => {
          if (item.supplier.toLowerCase().includes(po.vendorName.toLowerCase().split(' ')[0])) {
            const added = Math.round(po.itemsCount / 2);
            const newStock = item.availableStock + added;
            return {
              ...item,
              availableStock: newStock,
              status: calculateStockStatus(newStock, item.minimumStock),
              lastRestocked: today
            };
          }
          return item;
        }));

        if (userId) {
          await Promise.all(
            matchedItems.map(item => {
              const added = Math.round(po.itemsCount / 2);
              const newStock = item.availableStock + added;
              return updateInventoryItemInDb(userId, item.id, {
                availableStock: newStock,
                status: calculateStockStatus(newStock, item.minimumStock),
                lastRestocked: today,
              });
            })
          );
        }
      }
    }
  };

  // -------------------------------------------------------------
  // AI Insights Handlers
  // -------------------------------------------------------------
  const handleApplyAiInsight = async (insight: AiInsight) => {
    if (insight.category === 'Predictive Failure') {
      const match = insight.targetAssetOrSku.match(/AST-\d+/);
      const targetId = match ? match[0] : '';
      const relatedAsset = assets.find(a => a.id === targetId);
      if (relatedAsset) {
        handleOpenScheduleMaintenance(relatedAsset);
      } else {
        setIsScheduleMaintenanceOpen(true);
      }
    } else if (insight.category === 'Overstock Prevention') {
      const match = insight.targetAssetOrSku.match(/SKU-[A-Z]+-\d+/);
      const targetSku = match ? match[0] : '';
      const relatedItem = inventory.find(i => i.sku === targetSku);
      if (relatedItem) {
        setStockUpdateItem(relatedItem);
      } else {
        setIsAddInventoryOpen(true);
      }
    } else if (insight.category === 'Asset Reallocation') {
      await addActivity(
        `Asset Reallocation Initiated: ${insight.targetAssetOrSku}`,
        'Autonomous reallocation workflow initiated. Department custodians notified via email.',
        'normal',
        'ai_anomaly'
      );
      showToast('Reallocation workflow initiated for idle assets.');
    } else {
      await addActivity(
        `Procurement Optimization Approved: ${insight.title}`,
        'Purchase orders marked for consolidation to realize volume rebate.',
        'success',
        'po_created'
      );
      showToast('Supplier contract volume consolidation approved.');
    }
  };

  const handleDismissAiInsight = async (insightId: string) => {
    setAiInsights(prev => prev.filter(i => i.id !== insightId));

    if (userId) {
      try {
        await deleteAiInsightInDb(userId, insightId);
      } catch (err) {
        console.error('Failed to dismiss insight:', err);
        showToast('Failed to remove insight from database.', 'warning');
        return;
      }
    }

    showToast('Insight dismissed from telemetry center.', 'info');
  };

  // Top Nav quick actions
  const handleQuickAction = (actionType: 'register-asset' | 'add-inventory' | 'create-po' | 'schedule-maintenance') => {
    if (actionType === 'register-asset') setIsRegisterAssetOpen(true);
    if (actionType === 'add-inventory') setIsAddInventoryOpen(true);
    if (actionType === 'create-po') {
      setCreatePoInitialVendor('');
      setCreatePoInitialUnits(50);
      setCreatePoInitialAmount(4500);
      setIsCreatePoOpen(true);
    }
    if (actionType === 'schedule-maintenance') handleOpenScheduleMaintenance();
  };

  // Sidebar badge counts
  const pendingPoCount = useMemo(() =>
    purchaseOrders.filter(p => p.status === 'Pending Approval').length,
    [purchaseOrders]
  );

  const activeMaintenanceCount = useMemo(() =>
    assets.reduce((count, a) =>
      count + a.maintenanceHistory.filter(m => m.status === 'In Progress' || m.status === 'Scheduled').length, 0
    ),
    [assets]
  );

  const aiOpportunitiesCount = useMemo(() =>
    aiInsights.filter(i => i.impactLevel === 'High').length,
    [aiInsights]
  );

  // If Supabase is configured and session is still resolving
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600 text-sm">
        Initializing AssetFlow AI workspace...
      </div>
    );
  }

  // If Supabase is configured and user is not authenticated yet
  if (isSupabaseConfigured && !session) {
    return <AuthGate />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans antialiased selection:bg-blue-600 selection:text-white">

      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Left Navigation Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onSelectPage={(page) => {
          setCurrentPage(page);
          setIsMobileMenuOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        activeOrg={activeOrg}
        pendingPoCount={pendingPoCount}
        activeMaintenanceCount={activeMaintenanceCount}
        aiOpportunitiesCount={aiOpportunitiesCount}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">

        {/* Sticky Top Navigation */}
        <TopNav
          organizations={organizations}
          activeOrg={activeOrg}
          onSelectOrg={setActiveOrg}
          activeSite={activeSite}
          onSelectSite={setActiveSite}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onOpenQuickAction={handleQuickAction}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activities={activities}
          userEmail={session?.user?.email}
          onSignOut={handleSignOut}
          onNavigateTo={(page) => {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        {/* Dynamic Workspace Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">

          {dataLoading && (
            <div className="mb-4 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-500">
              Synchronizing workspace records...
            </div>
          )}

          {currentPage === 'dashboard' && (
            <DashboardView
              assets={assets}
              inventory={inventory}
              activities={activities}
              aiInsights={aiInsights}
              onOpenQuickAction={handleQuickAction}
              onNavigateTo={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onViewAssetDetail={(asset) => setSelectedAssetDetail(asset)}
            />
          )}

          {currentPage === 'assets' && (
            <AssetsView
              assets={assets}
              onViewAssetDetail={(asset) => setSelectedAssetDetail(asset)}
              onOpenRegisterModal={() => setIsRegisterAssetOpen(true)}
              onScheduleMaintenance={(asset) => handleOpenScheduleMaintenance(asset)}
            />
          )}

          {currentPage === 'inventory' && (
            <InventoryView
              inventory={inventory}
              onOpenAddModal={() => setIsAddInventoryOpen(true)}
              onOpenStockUpdateModal={(item) => setStockUpdateItem(item)}
              onQuickReorder={handleQuickReorder}
            />
          )}

          {currentPage === 'stock-management' && (
            <StockManagementView
              inventory={inventory}
              onTransferStock={handleTransferStock}
            />
          )}

          {currentPage === 'maintenance' && (
            <MaintenanceView
              assets={assets}
              onScheduleNew={() => handleOpenScheduleMaintenance()}
              onCompleteMaintenance={handleCompleteMaintenance}
              onViewAsset={(asset) => setSelectedAssetDetail(asset)}
            />
          )}

          {currentPage === 'procurement' && (
            <ProcurementView
              purchaseOrders={purchaseOrders}
              onOpenCreatePo={() => {
                setCreatePoInitialVendor('');
                setCreatePoInitialUnits(50);
                setCreatePoInitialAmount(4500);
                setIsCreatePoOpen(true);
              }}
              onUpdatePoStatus={handleUpdatePoStatus}
            />
          )}

          {currentPage === 'vendors' && (
            <VendorsView
              vendors={vendors}
              onOpenCreatePoWithVendor={(vendorName) => {
                setCreatePoInitialVendor(vendorName);
                setCreatePoInitialUnits(50);
                setCreatePoInitialAmount(5200);
                setIsCreatePoOpen(true);
              }}
            />
          )}

          {currentPage === 'ai-insights' && (
            <AiInsightsView
              insights={aiInsights}
              onApplyInsight={handleApplyAiInsight}
              onDismissInsight={handleDismissAiInsight}
            />
          )}

          {currentPage === 'reports' && (
            <ReportsView
              assets={assets}
              inventory={inventory}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsView
              currentOrg={activeOrg.name}
              onUpdateOrg={async (newName) => {
                setActiveOrg(prev => ({ ...prev, name: newName }));
                setOrganizations(prev => prev.map(o => o.id === activeOrg.id ? { ...o, name: newName } : o));
                if (userId) {
                  try {
                    await updateOrganizationNameInDb(userId, activeOrg.id, newName);
                  } catch (err) {
                    console.error('Failed to update organization:', err);
                    showToast('Failed to save organization settings.', 'warning');
                  }
                }
              }}
            />
          )}

        </main>

        {/* Enterprise System Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 px-6 text-slate-400 text-xs flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">AssetFlow AI Enterprise</span>
            <span>•</span>
            <span>v4.2.0-LTS (Build 2026.09.14)</span>
            <span>•</span>
            <span className="text-emerald-600 font-medium">● All Nodes Connected</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>ISO 55001 Asset Standard</span>
            <span>SOC2 Type II Certified</span>
            <span>FDA 21 CFR Part 11 Audit Trail</span>
          </div>
        </footer>

      </div>

      {/* Modals */}
      {selectedAssetDetail && (
        <AssetDetailModal
          asset={selectedAssetDetail}
          onClose={() => setSelectedAssetDetail(null)}
          onScheduleMaintenance={(asset) => {
            setSelectedAssetDetail(null);
            handleOpenScheduleMaintenance(asset);
          }}
          onUpdateStatus={handleUpdateAssetStatus}
        />
      )}

      {isRegisterAssetOpen && (
        <RegisterAssetModal
          isOpen={isRegisterAssetOpen}
          onClose={() => setIsRegisterAssetOpen(false)}
          onRegister={handleRegisterAsset}
        />
      )}

      {isAddInventoryOpen && (
        <AddInventoryModal
          isOpen={isAddInventoryOpen}
          onClose={() => setIsAddInventoryOpen(false)}
          onAdd={handleAddInventoryItem}
        />
      )}

      {stockUpdateItem && (
        <StockUpdateModal
          item={stockUpdateItem}
          onClose={() => setStockUpdateItem(null)}
          onSave={handleSaveStockUpdate}
        />
      )}

      {isScheduleMaintenanceOpen && (
        <ScheduleMaintenanceModal
          isOpen={isScheduleMaintenanceOpen}
          onClose={() => setIsScheduleMaintenanceOpen(false)}
          assets={assets}
          initialAsset={scheduleMaintenanceAsset}
          onSchedule={handleScheduleMaintenance}
        />
      )}

      {isCreatePoOpen && (
        <CreatePoModal
          isOpen={isCreatePoOpen}
          onClose={() => setIsCreatePoOpen(false)}
          vendors={vendors}
          initialVendor={createPoInitialVendor}
          initialItemsCount={createPoInitialUnits}
          initialAmount={createPoInitialAmount}
          onCreatePo={handleCreatePo}
        />
      )}

    </div>
  );
}
