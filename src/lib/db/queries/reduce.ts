import { cache } from "react";
import { db } from "../client";
import { loadContext } from "../context";

const USD_TO_GBP = 0.79;

function opportunityScopeFromCategory(category: string): 1 | 2 | 3 {
  if (category === "energy") return 2; // electricity/HVAC dominated
  if (category === "manufacturing") return 1;
  if (category === "logistics") return 3;
  if (category === "procurement") return 3;
  if (category === "products") return 3;
  return 3;
}

function opportunityStatusLabel(dbStatus: string): "proposed" | "approved" | "in_progress" | "completed" {
  switch (dbStatus) {
    case "approved":
    case "evaluated":
      return "approved";
    case "converted_to_initiative":
      return "in_progress";
    case "dismissed":
      return "completed";
    case "identified":
    case "ai_proposed":
    default:
      return "proposed";
  }
}

function initiativeStatus(stage: string): "proposed" | "approved" | "in_progress" | "completed" {
  switch (stage) {
    case "proposed":
      return "proposed";
    case "approved":
      return "approved";
    case "in_implementation":
    case "initiative_approved":
    case "monitoring":
      return "in_progress";
    case "closure":
    case "completed":
      return "completed";
    default:
      return "proposed";
  }
}

export type OpportunityRow = {
  id: string;
  code: string;
  title: string;
  description: string;
  scope: 1 | 2 | 3;
  category: string;
  facility_id: string | null;
  facility_name: string | null;
  abatement_tco2e: number;
  annual_savings_gbp: number;
  capex_gbp: number;
  payback_years: number;
  mac_cost: number;
  confidence: "high" | "medium" | "low";
  status: "proposed" | "approved" | "in_progress" | "completed";
  owner?: string;
  target_date?: string;
  actual_savings_gbp?: number;
  actual_abatement?: number;
  source_type: string;
  phase: string;
  complexity: number;
  dependencies: string[];
};

export const loadOpportunities = cache(async (): Promise<OpportunityRow[]> => {
  const ctx = await loadContext();

  // Pull opportunities and any converted initiatives for status/actuals
  const opps = await db
    .selectFrom("reduce.opportunity as o")
    .leftJoin("core.facility as f", "f.facility_id", "o.facility_id")
    .leftJoin("core.user_account as u", "u.user_id", "o.created_by")
    .select([
      "o.opportunity_id",
      "o.opportunity_name",
      "o.description",
      "o.category",
      "o.subcategory",
      "o.facility_id",
      "f.facility_name",
      "o.source_type",
      "o.carbon_reduction_co2e",
      "o.carbon_reduction_pct",
      "o.annual_saving_usd",
      "o.implementation_cost_usd",
      "o.payback_months",
      "o.abatement_cost_per_tonne",
      "o.complexity_score",
      "o.phase",
      "o.status",
      "o.dependencies",
      "u.display_name as owner",
    ])
    .where("o.tenant_id", "=", ctx.tenantId)
    .where("o.org_id", "=", ctx.orgId)
    .orderBy("o.carbon_reduction_co2e", "desc")
    .execute();

  // For initiatives-linked opportunities, pull actuals
  const linked = await db
    .selectFrom("reduce.initiative")
    .select([
      "opportunity_id",
      "workflow_stage",
      "actual_carbon_reduction_co2e",
      "actual_saving_usd",
      "planned_end_date",
      "owner_name",
    ])
    .where("tenant_id", "=", ctx.tenantId)
    .where("opportunity_id", "is not", null)
    .execute();
  const initiativeByOpp = new Map(linked.map((r) => [r.opportunity_id as string, r]));

  const mkConfidence = (score: number): "high" | "medium" | "low" => {
    if (score <= 2) return "high";
    if (score <= 3) return "medium";
    return "low";
  };

  return opps.map((o, i) => {
    const init = initiativeByOpp.get(o.opportunity_id);
    const payMonths = o.payback_months ?? 0;
    const mac = Number(o.abatement_cost_per_tonne ?? 0);
    const cat = o.category;
    const sv = Number(o.annual_saving_usd ?? 0) * USD_TO_GBP;
    const cx = Number(o.implementation_cost_usd ?? 0) * USD_TO_GBP;
    const status = init
      ? initiativeStatus(init.workflow_stage)
      : opportunityStatusLabel(o.status);
    return {
      id: o.opportunity_id,
      code: `OPP-${String(i + 1).padStart(3, "0")}`,
      title: o.opportunity_name,
      description: o.description ?? "",
      scope: opportunityScopeFromCategory(cat),
      category: cat,
      facility_id: o.facility_id,
      facility_name: o.facility_name,
      abatement_tco2e: Math.round(Number(o.carbon_reduction_co2e)),
      annual_savings_gbp: Math.round(sv),
      capex_gbp: Math.round(cx),
      payback_years: Math.round((payMonths / 12) * 10) / 10,
      mac_cost: Math.round(mac * USD_TO_GBP),
      confidence: mkConfidence(o.complexity_score),
      status,
      owner: init?.owner_name ?? o.owner ?? undefined,
      target_date: init?.planned_end_date
        ? (init.planned_end_date as unknown as string)
        : undefined,
      actual_savings_gbp: init?.actual_saving_usd
        ? Math.round(Number(init.actual_saving_usd) * USD_TO_GBP)
        : undefined,
      actual_abatement: init?.actual_carbon_reduction_co2e
        ? Math.round(Number(init.actual_carbon_reduction_co2e))
        : undefined,
      source_type: o.source_type,
      phase: o.phase,
      complexity: o.complexity_score,
      dependencies: (o.dependencies as string[] | null) ?? [],
    };
  });
});

export const loadInitiatives = cache(async () => {
  const ctx = await loadContext();
  const rows = await db
    .selectFrom("reduce.initiative as i")
    .leftJoin("core.facility as f", "f.facility_id", "i.facility_id")
    .leftJoin("core.user_account as u", "u.user_id", "i.owner_user_id")
    .select([
      "i.initiative_id",
      "i.initiative_code",
      "i.initiative_name",
      "i.description",
      "i.category",
      "i.initiative_type",
      "i.target_carbon_reduction_co2e",
      "i.target_annual_saving_usd",
      "i.approved_budget_usd",
      "i.actual_carbon_reduction_co2e",
      "i.actual_saving_usd",
      "i.actual_spend_usd",
      "i.planned_start_date",
      "i.planned_end_date",
      "i.actual_start_date",
      "i.actual_end_date",
      "i.owner_name",
      "i.workflow_stage",
      "i.schedule_status",
      "i.budget_status",
      "i.carbon_status",
      "i.health_indicator",
      "i.notes",
      "f.facility_name",
      "u.display_name as owner_display",
    ])
    .where("i.tenant_id", "=", ctx.tenantId)
    .where("i.org_id", "=", ctx.orgId)
    .orderBy("i.target_carbon_reduction_co2e", "desc")
    .execute();
  return rows.map((r) => ({
    id: r.initiative_id,
    code: r.initiative_code,
    name: r.initiative_name,
    description: r.description,
    category: r.category,
    facility_name: r.facility_name,
    owner: r.owner_display ?? r.owner_name,
    workflow_stage: r.workflow_stage,
    target_carbon_t: Number(r.target_carbon_reduction_co2e),
    target_savings_gbp: Number(r.target_annual_saving_usd ?? 0) * USD_TO_GBP,
    budget_gbp: r.approved_budget_usd ? Number(r.approved_budget_usd) * USD_TO_GBP : 0,
    actual_carbon_t: Number(r.actual_carbon_reduction_co2e ?? 0),
    actual_savings_gbp: Number(r.actual_saving_usd ?? 0) * USD_TO_GBP,
    actual_spend_gbp: Number(r.actual_spend_usd ?? 0) * USD_TO_GBP,
    planned_start: r.planned_start_date,
    planned_end: r.planned_end_date,
    actual_start: r.actual_start_date,
    actual_end: r.actual_end_date,
    schedule_status: r.schedule_status,
    budget_status: r.budget_status,
    carbon_status: r.carbon_status,
    health: r.health_indicator,
    notes: r.notes,
  }));
});

export const loadInitiativeProgress = cache(async (initiativeId: string) => {
  const rows = await db
    .selectFrom("reduce.initiative_progress")
    .selectAll()
    .where("initiative_id", "=", initiativeId)
    .orderBy("reporting_date", "asc")
    .execute();
  return rows.map((r) => ({
    id: r.progress_id,
    date: r.reporting_date,
    title: r.title,
    summary: r.action_summary,
    carbon_period_t: r.carbon_reduced_period == null ? 0 : Number(r.carbon_reduced_period),
    carbon_cumulative_t: r.carbon_reduced_cumulative == null ? 0 : Number(r.carbon_reduced_cumulative),
    savings_period_gbp: r.saving_period_usd == null ? 0 : Number(r.saving_period_usd) * USD_TO_GBP,
    savings_cumulative_gbp: r.saving_cumulative_usd == null ? 0 : Number(r.saving_cumulative_usd) * USD_TO_GBP,
    spend_period_gbp: r.spend_period_usd == null ? 0 : Number(r.spend_period_usd) * USD_TO_GBP,
    spend_cumulative_gbp: r.spend_cumulative_usd == null ? 0 : Number(r.spend_cumulative_usd) * USD_TO_GBP,
    milestones_completed: (r.milestones_completed as string[] | null) ?? [],
    milestones_upcoming: (r.milestones_upcoming as string[] | null) ?? [],
    blockers: (r.blockers as string[] | null) ?? [],
  }));
});

export const loadMonitoringReadings = cache(async (initiativeId: string) => {
  const rows = await db
    .selectFrom("reduce.monitoring_reading")
    .selectAll()
    .where("initiative_id", "=", initiativeId)
    .orderBy("reading_date", "asc")
    .execute();
  return rows.map((r) => ({
    id: r.reading_id,
    date: r.reading_date,
    metric: r.metric_name,
    projected: Number(r.projected_value),
    actual: Number(r.actual_value),
    variance: r.variance == null ? 0 : Number(r.variance),
    variance_pct: r.variance_pct == null ? 0 : Number(r.variance_pct),
    is_alert: r.is_alert,
    source: r.data_source,
    sensor_id: r.sensor_id,
  }));
});

export type TeardownRow = {
  id: string;
  facility_id: string;
  facility_name: string;
  period: string;
  category: string;
  analysis_name: string;
  actual_cost_gbp: number;
  should_cost_gbp: number;
  waste_cost_gbp: number;
  actual_emissions_t: number;
  should_emissions_t: number;
  waste_emissions_t: number;
  waste_pct: number;
  status: string;
  waste_drivers: { driver: string; cost: number; co2e: number; description: string }[];
  input_values: Record<string, unknown>;
  // Derived for the legacy UI
  base_load_kwh: number;
  production_load_kwh: number;
  waste_load_kwh: number;
  base_load_cost: number;
  production_load_cost: number;
  waste_load_cost: number;
  benchmark_kwh_per_sqm: number;
  actual_kwh_per_sqm: number;
};

export const loadTeardowns = cache(async (): Promise<TeardownRow[]> => {
  const ctx = await loadContext();
  const rows = await db
    .selectFrom("reduce.teardown_analysis as a")
    .innerJoin("reduce.should_cost_model as m", "m.model_id", "a.model_id")
    .innerJoin("core.facility as f", "f.facility_id", "a.facility_id")
    .leftJoin("record.reporting_period as p", "p.period_id", "a.period_id")
    .select([
      "a.analysis_id",
      "a.analysis_name",
      "a.facility_id",
      "a.input_values",
      "a.actual_cost_usd",
      "a.should_cost_usd",
      "a.waste_cost_usd",
      "a.actual_emissions_co2e",
      "a.should_emissions_co2e",
      "a.waste_emissions_co2e",
      "a.waste_pct",
      "a.waste_decomposition",
      "a.status",
      "a.notes",
      "f.facility_name",
      "f.floor_area_sqm",
      "m.category",
      "p.fiscal_year",
    ])
    .where("a.tenant_id", "=", ctx.tenantId)
    .execute();

  return rows.map((r) => {
    const decomp = (r.waste_decomposition as any) ?? {};
    const drivers = Object.entries(decomp).map(([key, val]: [string, any]) => ({
      driver: key.replace(/_/g, " "),
      cost: Math.round((val.cost_usd ?? 0) * USD_TO_GBP),
      co2e: Number(val.co2e_t ?? 0),
      description: val.description ?? "",
    }));
    const actualGbp = Number(r.actual_cost_usd ?? 0) * USD_TO_GBP;
    const shouldGbp = Number(r.should_cost_usd ?? 0) * USD_TO_GBP;
    const wasteGbp = Number(r.waste_cost_usd ?? 0) * USD_TO_GBP;
    const area = Number(r.floor_area_sqm ?? 1);
    return {
      id: r.analysis_id,
      facility_id: r.facility_id,
      facility_name: r.facility_name,
      period: r.fiscal_year ?? "FY25-26",
      category: r.category,
      analysis_name: r.analysis_name ?? "",
      actual_cost_gbp: Math.round(actualGbp),
      should_cost_gbp: Math.round(shouldGbp),
      waste_cost_gbp: Math.round(wasteGbp),
      actual_emissions_t: Number(r.actual_emissions_co2e),
      should_emissions_t: Number(r.should_emissions_co2e),
      waste_emissions_t: Number(r.waste_emissions_co2e),
      waste_pct: r.waste_pct == null ? 0 : Number(r.waste_pct),
      status: r.status,
      waste_drivers: drivers,
      input_values: (r.input_values as Record<string, unknown>) ?? {},
      // Derived breakdown so the legacy "load" UI still works
      base_load_kwh: Math.round(Number(r.should_emissions_co2e) * 4500),
      production_load_kwh: Math.round(Number(r.actual_emissions_co2e) * 2200),
      waste_load_kwh: Math.round(Number(r.waste_emissions_co2e) * 4500),
      base_load_cost: Math.round(shouldGbp * 0.6),
      production_load_cost: Math.round(shouldGbp * 0.4),
      waste_load_cost: Math.round(wasteGbp),
      benchmark_kwh_per_sqm: area > 0 ? Math.round((Number(r.should_emissions_co2e) * 4500) / area) : 0,
      actual_kwh_per_sqm: area > 0 ? Math.round((Number(r.actual_emissions_co2e) * 4500) / area) : 0,
    };
  });
});

export const loadWastePool = cache(async () => {
  const ctx = await loadContext();
  const rows = await db
    .selectFrom("reduce.waste_pool as w")
    .leftJoin("core.facility as f", "f.facility_id", "w.facility_id")
    .select([
      "w.pool_id",
      "w.facility_id",
      "w.category",
      "w.subcategory",
      "w.waste_cost_usd",
      "w.waste_emissions_co2e",
      "w.actual_cost_usd",
      "w.should_cost_usd",
      "w.waste_pct",
      "f.facility_name",
    ])
    .where("w.tenant_id", "=", ctx.tenantId)
    .orderBy("w.waste_cost_usd", "desc")
    .execute();
  return rows.map((r) => ({
    id: r.pool_id,
    category: r.category,
    subcategory: r.subcategory,
    facility_name: r.facility_name,
    waste_cost_gbp: Math.round(Number(r.waste_cost_usd) * USD_TO_GBP),
    waste_emissions_t: Number(r.waste_emissions_co2e),
    actual_cost_gbp: r.actual_cost_usd == null ? 0 : Math.round(Number(r.actual_cost_usd) * USD_TO_GBP),
    should_cost_gbp: r.should_cost_usd == null ? 0 : Math.round(Number(r.should_cost_usd) * USD_TO_GBP),
    waste_pct: r.waste_pct == null ? 0 : Number(r.waste_pct),
  }));
});

export const loadShouldCostModels = cache(async () => {
  const ctx = await loadContext();
  const rows = await db
    .selectFrom("reduce.should_cost_model")
    .selectAll()
    .where("tenant_id", "=", ctx.tenantId)
    .orderBy("model_name", "asc")
    .execute();
  return rows;
});
