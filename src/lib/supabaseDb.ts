import { supabase } from './supabase';
import {
  Organization,
  Asset,
  MaintenanceRecord,
  InventoryItem,
  PurchaseOrder,
  Vendor,
  ActivityItem,
  AiInsight,
} from '../types';
import {
  mockOrganizations,
  initialAssets,
  initialInventory,
  mockPurchaseOrders,
  mockVendors,
  initialActivities,
  mockAiInsights,
} from '../data/mockData';

function requireClient() {
  if (!supabase) {
    throw new Error('Supabase client is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
  }
  return supabase;
}

// ----------------------------------------------------------------------------
// Row <-> App Model Mappers
// ----------------------------------------------------------------------------

function mapOrgFromRow(row: any): Organization {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    sites: row.sites ?? [],
    totalLocations: row.total_locations ?? 0,
  };
}

function mapMaintenanceFromRow(row: any): MaintenanceRecord {
  return {
    id: row.id,
    date: row.date,
    type: row.type,
    description: row.description,
    technician: row.technician,
    cost: Number(row.cost ?? 0),
    status: row.status,
    partsReplaced: row.parts_replaced ?? [],
    nextDueDate: row.next_due_date ?? undefined,
  };
}

function mapAssetFromRow(row: any): Asset {
  const maintenanceRows = Array.isArray(row.maintenance_records) ? row.maintenance_records : [];
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    location: row.location,
    facility: row.facility,
    assignedTo: row.assigned_to ?? { name: '', email: '', department: '' },
    purchaseDate: row.purchase_date,
    purchaseValue: Number(row.purchase_value ?? 0),
    currentValue: Number(row.current_value ?? 0),
    depreciationRate: Number(row.depreciation_rate ?? 15),
    condition: row.condition,
    status: row.status,
    serialNumber: row.serial_number,
    model: row.model,
    manufacturer: row.manufacturer,
    warrantyExpiry: row.warranty_expiry ?? '',
    imageUrl: row.image_url ?? undefined,
    maintenanceHistory: maintenanceRows.map(mapMaintenanceFromRow),
    lifecycleTimeline: row.lifecycle_timeline ?? [],
    aiNote: row.ai_note ?? undefined,
    utilizationScore: Number(row.utilization_score ?? 0),
  };
}

function mapInventoryFromRow(row: any): InventoryItem {
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    category: row.category,
    availableStock: Number(row.available_stock ?? 0),
    minimumStock: Number(row.minimum_stock ?? 0),
    optimalStock: Number(row.optimal_stock ?? 0),
    warehouse: row.warehouse,
    aisleBin: row.aisle_bin,
    unitCost: Number(row.unit_cost ?? 0),
    status: row.status,
    lastRestocked: row.last_restocked,
    leadTimeDays: Number(row.lead_time_days ?? 5),
    supplier: row.supplier,
    reorderQuantity: Number(row.reorder_quantity ?? 10),
  };
}

function mapPoFromRow(row: any): PurchaseOrder {
  return {
    id: row.id,
    vendorName: row.vendor_name,
    itemsCount: Number(row.items_count ?? 1),
    totalAmount: Number(row.total_amount ?? 0),
    status: row.status,
    createdAt: row.created_at_date,
    estimatedDelivery: row.estimated_delivery,
    requestedBy: row.requested_by,
    department: row.department,
  };
}

function mapVendorFromRow(row: any): Vendor {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    contactPerson: row.contact_person,
    email: row.email,
    phone: row.phone,
    rating: Number(row.rating ?? 4.5),
    activeOrders: Number(row.active_orders ?? 0),
    totalSpendYTD: Number(row.total_spend_ytd ?? 0),
    status: row.status,
  };
}

function mapActivityFromRow(row: any): ActivityItem {
  return {
    id: row.id,
    timestamp: row.timestamp_label,
    title: row.title,
    description: row.description,
    type: row.type,
    user: row.user_info ?? { name: 'System', avatar: 'AF', role: 'Operator' },
    severity: row.severity ?? 'normal',
  };
}

function mapAiInsightFromRow(row: any): AiInsight {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    impactLevel: row.impact_level,
    estimatedSavings: Number(row.estimated_savings ?? 0),
    description: row.description,
    recommendedAction: row.recommended_action,
    targetAssetOrSku: row.target_asset_or_sku,
    confidenceScore: Number(row.confidence_score ?? 90),
    dateDetected: row.date_detected,
    isResolved: Boolean(row.is_resolved),
  };
}

// ----------------------------------------------------------------------------
// 1. LOAD USER DATA
// ----------------------------------------------------------------------------

export interface WorkspaceData {
  organizations: Organization[];
  assets: Asset[];
  inventory: InventoryItem[];
  purchaseOrders: PurchaseOrder[];
  vendors: Vendor[];
  activities: ActivityItem[];
  aiInsights: AiInsight[];
}

export async function loadUserWorkspaceData(userId: string): Promise<WorkspaceData> {
  const db = requireClient();

  const [
    orgRes,
    assetRes,
    invRes,
    poRes,
    vendorRes,
    activityRes,
    insightRes,
  ] = await Promise.all([
    db.from('organizations').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
    db.from('assets').select('*, maintenance_records(*)').eq('user_id', userId).order('created_at', { ascending: false }),
    db.from('inventory_items').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    db.from('purchase_orders').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    db.from('vendors').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
    db.from('activities').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
    db.from('ai_insights').select('*').eq('user_id', userId).order('date_detected', { ascending: false }),
  ]);

  const firstError =
    orgRes.error ||
    assetRes.error ||
    invRes.error ||
    poRes.error ||
    vendorRes.error ||
    activityRes.error ||
    insightRes.error;

  if (firstError) throw firstError;

  return {
    organizations: (orgRes.data ?? []).map(mapOrgFromRow),
    assets: (assetRes.data ?? []).map(mapAssetFromRow),
    inventory: (invRes.data ?? []).map(mapInventoryFromRow),
    purchaseOrders: (poRes.data ?? []).map(mapPoFromRow),
    vendors: (vendorRes.data ?? []).map(mapVendorFromRow),
    activities: (activityRes.data ?? []).map(mapActivityFromRow),
    aiInsights: (insightRes.data ?? []).map(mapAiInsightFromRow),
  };
}

// Seed starter enterprise data once for a brand-new authenticated user
export async function seedStarterWorkspaceForUser(userId: string): Promise<WorkspaceData> {
  const db = requireClient();

  await db.from('organizations').insert(
    mockOrganizations.map((o) => ({
      id: o.id,
      user_id: userId,
      name: o.name,
      type: o.type,
      sites: o.sites,
      total_locations: o.totalLocations,
    }))
  );

  await db.from('assets').insert(
    initialAssets.map((a) => ({
      id: a.id,
      user_id: userId,
      name: a.name,
      category: a.category,
      location: a.location,
      facility: a.facility,
      assigned_to: a.assignedTo,
      purchase_date: a.purchaseDate,
      purchase_value: a.purchaseValue,
      current_value: a.currentValue,
      depreciation_rate: a.depreciationRate,
      condition: a.condition,
      status: a.status,
      serial_number: a.serialNumber,
      model: a.model,
      manufacturer: a.manufacturer,
      warranty_expiry: a.warrantyExpiry || null,
      image_url: a.imageUrl || null,
      lifecycle_timeline: a.lifecycleTimeline,
      ai_note: a.aiNote || null,
      utilization_score: a.utilizationScore,
    }))
  );

  const maintenanceRows = initialAssets.flatMap((asset) =>
    asset.maintenanceHistory.map((m) => ({
      id: m.id,
      user_id: userId,
      asset_id: asset.id,
      date: m.date,
      type: m.type,
      description: m.description,
      technician: m.technician,
      cost: m.cost,
      status: m.status,
      parts_replaced: m.partsReplaced ?? [],
      next_due_date: m.nextDueDate || null,
    }))
  );

  if (maintenanceRows.length > 0) {
    await db.from('maintenance_records').insert(maintenanceRows);
  }

  await db.from('inventory_items').insert(
    initialInventory.map((i) => ({
      id: i.id,
      user_id: userId,
      name: i.name,
      sku: i.sku,
      category: i.category,
      available_stock: i.availableStock,
      minimum_stock: i.minimumStock,
      optimal_stock: i.optimalStock,
      warehouse: i.warehouse,
      aisle_bin: i.aisleBin,
      unit_cost: i.unitCost,
      status: i.status,
      last_restocked: i.lastRestocked,
      lead_time_days: i.leadTimeDays,
      supplier: i.supplier,
      reorder_quantity: i.reorderQuantity,
    }))
  );

  await db.from('purchase_orders').insert(
    mockPurchaseOrders.map((po) => ({
      id: po.id,
      user_id: userId,
      vendor_name: po.vendorName,
      items_count: po.itemsCount,
      total_amount: po.totalAmount,
      status: po.status,
      created_at_date: po.createdAt,
      estimated_delivery: po.estimatedDelivery,
      requested_by: po.requestedBy,
      department: po.department,
    }))
  );

  await db.from('vendors').insert(
    mockVendors.map((v) => ({
      id: v.id,
      user_id: userId,
      name: v.name,
      category: v.category,
      contact_person: v.contactPerson,
      email: v.email,
      phone: v.phone,
      rating: v.rating,
      active_orders: v.activeOrders,
      total_spend_ytd: v.totalSpendYTD,
      status: v.status,
    }))
  );

  await db.from('activities').insert(
    initialActivities.map((act) => ({
      id: act.id,
      user_id: userId,
      timestamp_label: act.timestamp,
      title: act.title,
      description: act.description,
      type: act.type,
      user_info: act.user,
      severity: act.severity ?? 'normal',
    }))
  );

  await db.from('ai_insights').insert(
    mockAiInsights.map((ins) => ({
      id: ins.id,
      user_id: userId,
      title: ins.title,
      category: ins.category,
      impact_level: ins.impactLevel,
      estimated_savings: ins.estimatedSavings,
      description: ins.description,
      recommended_action: ins.recommendedAction,
      target_asset_or_sku: ins.targetAssetOrSku,
      confidence_score: ins.confidenceScore,
      date_detected: ins.dateDetected,
      is_resolved: Boolean(ins.isResolved),
    }))
  );

  return loadUserWorkspaceData(userId);
}

// ----------------------------------------------------------------------------
// 2. CREATE ITEMS
// ----------------------------------------------------------------------------

export async function createAssetInDb(userId: string, asset: Asset): Promise<Asset> {
  const db = requireClient();
  const { data, error } = await db
    .from('assets')
    .insert({
      id: asset.id,
      user_id: userId,
      name: asset.name,
      category: asset.category,
      location: asset.location,
      facility: asset.facility,
      assigned_to: asset.assignedTo,
      purchase_date: asset.purchaseDate,
      purchase_value: asset.purchaseValue,
      current_value: asset.currentValue,
      depreciation_rate: asset.depreciationRate,
      condition: asset.condition,
      status: asset.status,
      serial_number: asset.serialNumber,
      model: asset.model,
      manufacturer: asset.manufacturer,
      warranty_expiry: asset.warrantyExpiry || null,
      image_url: asset.imageUrl || null,
      lifecycle_timeline: asset.lifecycleTimeline,
      ai_note: asset.aiNote || null,
      utilization_score: asset.utilizationScore,
    })
    .select('*, maintenance_records(*)')
    .single();

  if (error) throw error;
  return mapAssetFromRow(data);
}

export async function createMaintenanceInDb(
  userId: string,
  assetId: string,
  record: MaintenanceRecord
): Promise<MaintenanceRecord> {
  const db = requireClient();
  const { data, error } = await db
    .from('maintenance_records')
    .insert({
      id: record.id,
      user_id: userId,
      asset_id: assetId,
      date: record.date,
      type: record.type,
      description: record.description,
      technician: record.technician,
      cost: record.cost,
      status: record.status,
      parts_replaced: record.partsReplaced ?? [],
      next_due_date: record.nextDueDate || null,
    })
    .select()
    .single();

  if (error) throw error;
  return mapMaintenanceFromRow(data);
}

export async function createInventoryItemInDb(
  userId: string,
  item: InventoryItem
): Promise<InventoryItem> {
  const db = requireClient();
  const { data, error } = await db
    .from('inventory_items')
    .insert({
      id: item.id,
      user_id: userId,
      name: item.name,
      sku: item.sku,
      category: item.category,
      available_stock: item.availableStock,
      minimum_stock: item.minimumStock,
      optimal_stock: item.optimalStock,
      warehouse: item.warehouse,
      aisle_bin: item.aisleBin,
      unit_cost: item.unitCost,
      status: item.status,
      last_restocked: item.lastRestocked,
      lead_time_days: item.leadTimeDays,
      supplier: item.supplier,
      reorder_quantity: item.reorderQuantity,
    })
    .select()
    .single();

  if (error) throw error;
  return mapInventoryFromRow(data);
}

export async function createPurchaseOrderInDb(
  userId: string,
  po: PurchaseOrder
): Promise<PurchaseOrder> {
  const db = requireClient();
  const { data, error } = await db
    .from('purchase_orders')
    .insert({
      id: po.id,
      user_id: userId,
      vendor_name: po.vendorName,
      items_count: po.itemsCount,
      total_amount: po.totalAmount,
      status: po.status,
      created_at_date: po.createdAt,
      estimated_delivery: po.estimatedDelivery,
      requested_by: po.requestedBy,
      department: po.department,
    })
    .select()
    .single();

  if (error) throw error;
  return mapPoFromRow(data);
}

export async function createActivityInDb(
  userId: string,
  activity: ActivityItem
): Promise<ActivityItem> {
  const db = requireClient();
  const { data, error } = await db
    .from('activities')
    .insert({
      id: activity.id,
      user_id: userId,
      timestamp_label: activity.timestamp,
      title: activity.title,
      description: activity.description,
      type: activity.type,
      user_info: activity.user,
      severity: activity.severity ?? 'normal',
    })
    .select()
    .single();

  if (error) throw error;
  return mapActivityFromRow(data);
}

// ----------------------------------------------------------------------------
// 3. UPDATE ITEMS
// ----------------------------------------------------------------------------

export async function updateAssetInDb(
  userId: string,
  assetId: string,
  updates: Partial<Pick<Asset, 'status' | 'condition' | 'location' | 'lifecycleTimeline'>>
): Promise<void> {
  const db = requireClient();
  const payload: Record<string, any> = {};
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.condition !== undefined) payload.condition = updates.condition;
  if (updates.location !== undefined) payload.location = updates.location;
  if (updates.lifecycleTimeline !== undefined) payload.lifecycle_timeline = updates.lifecycleTimeline;

  const { error } = await db
    .from('assets')
    .update(payload)
    .eq('user_id', userId)
    .eq('id', assetId);

  if (error) throw error;
}

export async function updateMaintenanceStatusInDb(
  userId: string,
  maintenanceId: string,
  status: MaintenanceRecord['status']
): Promise<void> {
  const db = requireClient();
  const { error } = await db
    .from('maintenance_records')
    .update({ status })
    .eq('user_id', userId)
    .eq('id', maintenanceId);

  if (error) throw error;
}

export async function updateInventoryItemInDb(
  userId: string,
  itemId: string,
  updates: Partial<Pick<InventoryItem, 'availableStock' | 'status' | 'lastRestocked' | 'warehouse' | 'aisleBin'>>
): Promise<void> {
  const db = requireClient();
  const payload: Record<string, any> = {};
  if (updates.availableStock !== undefined) payload.available_stock = updates.availableStock;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.lastRestocked !== undefined) payload.last_restocked = updates.lastRestocked;
  if (updates.warehouse !== undefined) payload.warehouse = updates.warehouse;
  if (updates.aisleBin !== undefined) payload.aisle_bin = updates.aisleBin;

  const { error } = await db
    .from('inventory_items')
    .update(payload)
    .eq('user_id', userId)
    .eq('id', itemId);

  if (error) throw error;
}

export async function updatePurchaseOrderStatusInDb(
  userId: string,
  poId: string,
  status: PurchaseOrder['status']
): Promise<void> {
  const db = requireClient();
  const { error } = await db
    .from('purchase_orders')
    .update({ status })
    .eq('user_id', userId)
    .eq('id', poId);

  if (error) throw error;
}

export async function updateOrganizationNameInDb(
  userId: string,
  orgId: string,
  name: string
): Promise<void> {
  const db = requireClient();
  const { error } = await db
    .from('organizations')
    .update({ name })
    .eq('user_id', userId)
    .eq('id', orgId);

  if (error) throw error;
}

// ----------------------------------------------------------------------------
// 4. DELETE ITEMS
// ----------------------------------------------------------------------------

export async function deleteAssetInDb(userId: string, assetId: string): Promise<void> {
  const db = requireClient();
  const { error } = await db
    .from('assets')
    .delete()
    .eq('user_id', userId)
    .eq('id', assetId);

  if (error) throw error;
}

export async function deleteInventoryItemInDb(userId: string, itemId: string): Promise<void> {
  const db = requireClient();
  const { error } = await db
    .from('inventory_items')
    .delete()
    .eq('user_id', userId)
    .eq('id', itemId);

  if (error) throw error;
}

export async function deletePurchaseOrderInDb(userId: string, poId: string): Promise<void> {
  const db = requireClient();
  const { error } = await db
    .from('purchase_orders')
    .delete()
    .eq('user_id', userId)
    .eq('id', poId);

  if (error) throw error;
}

export async function deleteAiInsightInDb(userId: string, insightId: string): Promise<void> {
  const db = requireClient();
  const { error } = await db
    .from('ai_insights')
    .delete()
    .eq('user_id', userId)
    .eq('id', insightId);

  if (error) throw error;
}
