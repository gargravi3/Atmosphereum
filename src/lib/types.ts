export type Scope = 1 | 2 | 3;

export type Facility = {
  id: string;
  name: string;
  type: "stadium" | "training_ground" | "office" | "warehouse";
  geography: string;
  area_sqm: number;
  capacity?: number;
};

export type EmissionCategory =
  | "stationary_combustion"
  | "mobile_combustion"
  | "refrigerants"
  | "electricity"
  | "heat_steam"
  | "purchased_goods"
  | "fuel_energy_upstream"
  | "upstream_transport"
  | "waste"
  | "business_travel"
  | "commuting"
  | "fan_travel"
  | "water";

export type EmissionFactor = {
  id: string;
  name: string;
  source: "DEFRA 2023" | "IGES" | "USEEIO" | "Climatiq" | "HIGG" | "Custom";
  category: EmissionCategory;
  geography: string;
  year: number;
  unit: string; // e.g., kgCO2e/kWh, kgCO2e/£
  value: number;
  version: string;
};

export type EmissionRecord = {
  id: string;
  scope: Scope;
  category: EmissionCategory;
  activity: string;
  facility_id: string;
  period: string; // YYYY-MM
  activity_value: number;
  activity_unit: string;
  factor_id: string;
  factor_value: number;
  factor_unit: string;
  co2e_tonnes: number;
  // Dual-metric extension (the core differentiator)
  actual_cost: number;
  should_cost: number;
  waste_cost: number;
  cost_intensity: number; // £/tCO2e
  data_quality: 1 | 2 | 3 | 4 | 5; // per GHG Protocol
  supplier_id?: string;
  invoice_ref?: string;
  methodology: string;
  verified: boolean;
};

export type Supplier = {
  id: string;
  name: string;
  category: string;
  annual_spend: number;
  esg_score: number; // 0-100
  co2e_tonnes: number;
  tier: 1 | 2 | 3;
};

export type Opportunity = {
  id: string;
  title: string;
  description: string;
  scope: Scope;
  category: EmissionCategory;
  facility_id: string;
  abatement_tco2e: number;
  annual_savings_gbp: number;
  capex_gbp: number;
  payback_years: number;
  mac_cost: number; // £/tCO2e (negative = net saving)
  confidence: "high" | "medium" | "low";
  status: "proposed" | "approved" | "in_progress" | "completed";
  owner?: string;
  target_date?: string;
  actual_savings_gbp?: number;
  actual_abatement?: number;
};

export type AuditEvent = {
  id: string;
  timestamp: string;
  actor: string;
  entity_type: string;
  entity_id: string;
  action: string;
  detail?: string;
};

export type Report = {
  id: string;
  title: string;
  framework: "BRSR" | "CDP" | "CSRD" | "TCFD";
  period: string;
  status: "draft" | "in_review" | "approved" | "submitted";
  version: string;
  created_at: string;
  created_by: string;
};

export type Framework = {
  id: "BRSR" | "CDP" | "CSRD" | "TCFD";
  name: string;
  description: string;
  disclosures: { id: string; title: string; metric_refs: string[] }[];
};

export type TeardownDecomposition = {
  facility_id: string;
  period: string;
  category: string;
  base_load_kwh: number;
  production_load_kwh: number;
  waste_load_kwh: number;
  base_load_cost: number;
  production_load_cost: number;
  waste_load_cost: number;
  benchmark_kwh_per_sqm: number;
  actual_kwh_per_sqm: number;
  waste_drivers: { driver: string; cost: number; co2e: number }[];
};
