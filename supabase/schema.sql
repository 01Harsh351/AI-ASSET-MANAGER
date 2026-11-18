-- ============================================================================
-- AssetFlow AI - Supabase PostgreSQL Schema & Row-Level Security (RLS)
-- Paste this entire script into your Supabase Dashboard -> SQL Editor -> Run
-- ============================================================================

-- 1. Automatic updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- 2. TABLES
-- ============================================================================

-- Organizations (Tenants & Facility Sites)
create table if not exists public.organizations (
  id text not null,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  type text not null,
  sites jsonb not null default '[]'::jsonb,
  total_locations integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- Capital Assets
create table if not exists public.assets (
  id text not null,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  location text not null,
  facility text not null,
  assigned_to jsonb not null default '{}'::jsonb,
  purchase_date date not null,
  purchase_value numeric(12, 2) not null default 0,
  current_value numeric(12, 2) not null default 0,
  depreciation_rate numeric(5, 2) not null default 15,
  condition text not null,
  status text not null,
  serial_number text not null,
  model text not null,
  manufacturer text not null,
  warranty_expiry date,
  image_url text,
  lifecycle_timeline jsonb not null default '[]'::jsonb,
  ai_note text,
  utilization_score integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- Asset Maintenance Work Orders
create table if not exists public.maintenance_records (
  id text not null,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  asset_id text not null,
  date date not null,
  type text not null,
  description text not null,
  technician text not null,
  cost numeric(12, 2) not null default 0,
  status text not null,
  parts_replaced jsonb not null default '[]'::jsonb,
  next_due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id),
  foreign key (user_id, asset_id) references public.assets(user_id, id) on delete cascade
);

-- Inventory SKUs & Stock Levels
create table if not exists public.inventory_items (
  id text not null,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  sku text not null,
  category text not null,
  available_stock integer not null default 0,
  minimum_stock integer not null default 0,
  optimal_stock integer not null default 0,
  warehouse text not null,
  aisle_bin text not null,
  unit_cost numeric(12, 2) not null default 0,
  status text not null,
  last_restocked date not null,
  lead_time_days integer not null default 5,
  supplier text not null,
  reorder_quantity integer not null default 10,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- Procurement Purchase Orders
create table if not exists public.purchase_orders (
  id text not null,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  vendor_name text not null,
  items_count integer not null default 1,
  total_amount numeric(12, 2) not null default 0,
  status text not null,
  created_at_date date not null,
  estimated_delivery date not null,
  requested_by text not null,
  department text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- Approved Vendors
create table if not exists public.vendors (
  id text not null,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  contact_person text not null,
  email text not null,
  phone text not null,
  rating numeric(3, 2) not null default 4.5,
  active_orders integer not null default 0,
  total_spend_ytd numeric(14, 2) not null default 0,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- System Activity & Audit Log
create table if not exists public.activities (
  id text not null,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  timestamp_label text not null,
  title text not null,
  description text not null,
  type text not null,
  user_info jsonb not null default '{}'::jsonb,
  severity text not null default 'normal',
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- AI Predictive Insights
create table if not exists public.ai_insights (
  id text not null,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null,
  category text not null,
  impact_level text not null,
  estimated_savings numeric(12, 2) not null default 0,
  description text not null,
  recommended_action text not null,
  target_asset_or_sku text not null,
  confidence_score integer not null default 90,
  date_detected date not null,
  is_resolved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- ============================================================================
-- 3. UPDATED_AT TRIGGERS
-- ============================================================================

create trigger set_organizations_updated_at
  before update on public.organizations
  for each row execute function public.handle_updated_at();

create trigger set_assets_updated_at
  before update on public.assets
  for each row execute function public.handle_updated_at();

create trigger set_maintenance_records_updated_at
  before update on public.maintenance_records
  for each row execute function public.handle_updated_at();

create trigger set_inventory_items_updated_at
  before update on public.inventory_items
  for each row execute function public.handle_updated_at();

create trigger set_purchase_orders_updated_at
  before update on public.purchase_orders
  for each row execute function public.handle_updated_at();

create trigger set_vendors_updated_at
  before update on public.vendors
  for each row execute function public.handle_updated_at();

create trigger set_ai_insights_updated_at
  before update on public.ai_insights
  for each row execute function public.handle_updated_at();

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) & POLICIES (auth.uid() = user_id)
-- ============================================================================

alter table public.organizations enable row level security;
alter table public.assets enable row level security;
alter table public.maintenance_records enable row level security;
alter table public.inventory_items enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.vendors enable row level security;
alter table public.activities enable row level security;
alter table public.ai_insights enable row level security;

-- Organizations Policies
create policy "Users manage own organizations"
  on public.organizations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Assets Policies
create policy "Users manage own assets"
  on public.assets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Maintenance Records Policies
create policy "Users manage own maintenance records"
  on public.maintenance_records for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Inventory Items Policies
create policy "Users manage own inventory items"
  on public.inventory_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Purchase Orders Policies
create policy "Users manage own purchase orders"
  on public.purchase_orders for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Vendors Policies
create policy "Users manage own vendors"
  on public.vendors for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Activities Policies
create policy "Users manage own activities"
  on public.activities for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- AI Insights Policies
create policy "Users manage own ai insights"
  on public.ai_insights for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
