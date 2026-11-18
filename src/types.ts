export type PageType = 
  | 'dashboard'
  | 'assets'
  | 'inventory'
  | 'stock-management'
  | 'maintenance'
  | 'vendors'
  | 'procurement'
  | 'ai-insights'
  | 'reports'
  | 'settings';

export type AssetCondition = 'Excellent' | 'Good' | 'Fair' | 'Poor';
export type AssetStatus = 'Active' | 'Under Maintenance' | 'Inactive' | 'Retired';

export interface MaintenanceRecord {
  id: string;
  date: string;
  type: 'Preventive' | 'Corrective' | 'Calibration' | 'Inspection';
  description: string;
  technician: string;
  cost: number;
  status: 'Completed' | 'In Progress' | 'Scheduled';
  partsReplaced?: string[];
  nextDueDate?: string;
}

export interface LifecycleMilestone {
  date: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface Asset {
  id: string; // e.g. AST-8021
  name: string;
  category: 'Medical Devices' | 'IT & Servers' | 'Laboratory Equipment' | 'Heavy Machinery' | 'Facilities & HVAC' | 'Fleet Vehicles';
  location: string;
  facility: string;
  assignedTo: {
    name: string;
    email: string;
    department: string;
    avatar?: string;
  };
  purchaseDate: string;
  purchaseValue: number;
  currentValue: number;
  depreciationRate: number; // e.g. 15% per annum
  condition: AssetCondition;
  status: AssetStatus;
  serialNumber: string;
  model: string;
  manufacturer: string;
  warrantyExpiry: string;
  imageUrl?: string;
  maintenanceHistory: MaintenanceRecord[];
  lifecycleTimeline: LifecycleMilestone[];
  aiNote?: string;
  utilizationScore: number; // 0-100%
}

export type InventoryStatus = 'Healthy' | 'Low Stock' | 'Critical' | 'Out of Stock';

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: 'Electronics' | 'Furniture' | 'Laboratory Equipment' | 'Consumables' | 'MRO Spare Parts';
  availableStock: number;
  minimumStock: number;
  optimalStock: number;
  warehouse: string;
  aisleBin: string;
  unitCost: number;
  status: InventoryStatus;
  lastRestocked: string;
  leadTimeDays: number;
  supplier: string;
  reorderQuantity: number;
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  type: 'asset_registered' | 'stock_updated' | 'po_created' | 'maintenance_completed' | 'ai_anomaly';
  user: {
    name: string;
    avatar: string;
    role: string;
  };
  severity?: 'normal' | 'warning' | 'critical' | 'success';
}

export interface PurchaseOrder {
  id: string; // e.g. PO-2026-089
  vendorName: string;
  itemsCount: number;
  totalAmount: number;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'In Transit' | 'Received';
  createdAt: string;
  estimatedDelivery: string;
  requestedBy: string;
  department: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  contactPerson: string;
  email: string;
  phone: string;
  rating: number; // 1 to 5
  activeOrders: number;
  totalSpendYTD: number;
  status: 'Preferred' | 'Active' | 'Under Review' | 'Suspended';
}

export interface AiInsight {
  id: string;
  title: string;
  category: 'Predictive Failure' | 'Cost Optimization' | 'Overstock Prevention' | 'Asset Reallocation' | 'Compliance';
  impactLevel: 'High' | 'Medium' | 'Low';
  estimatedSavings: number;
  description: string;
  recommendedAction: string;
  targetAssetOrSku: string;
  confidenceScore: number; // e.g. 94%
  dateDetected: string;
  isResolved?: boolean;
}

export interface Organization {
  id: string;
  name: string;
  type: 'Health System' | 'University & Research' | 'Industrial Enterprise' | 'Global Logistics';
  sites: string[];
  totalLocations: number;
}
