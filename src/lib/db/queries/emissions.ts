import { cache } from "react";
import { db } from "../client";
import { loadContext } from "../context";
import { sql } from "kysely";

const USD_TO_GBP = 0.79;

// UI-visible category vocabulary (matches the existing frontend)
type UiCategory =
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

function mapScope1Category(dbCategory: string): UiCategory {
  if (dbCategory === "fugitive_emissions") return "refrigerants";
  if (dbCategory === "stationary_combustion") return "stationary_combustion";
  if (dbCategory === "mobile_combustion") return "mobile_combustion";
  if (dbCategory === "process") return "stationary_combustion";
  return "stationary_combustion";
}

function mapScope2Category(utilityType: string): UiCategory {
  if (utilityType === "purchased_electricity") return "electricity";
  if (utilityType === "purchased_heat") return "heat_steam";
  if (utilityType === "purchased_steam") return "heat_steam";
  if (utilityType === "purchased_cooling") return "heat_steam";
  return "electricity";
}

function mapScope3Category(categoryNumber: number): UiCategory {
  switch (categoryNumber) {
    case 1:
    case 2:
      return "purchased_goods";
    case 3:
    case 8:
      return "fuel_energy_upstream";
    case 4:
    case 9:
      return "upstream_transport";
    case 5:
      return "waste";
    case 6:
      return "business_travel";
    case 7:
      return "commuting";
    case 10:
    case 11:
    case 12:
    case 13:
    case 14:
    case 15:
      return "purchased_goods";
    default:
      return "purchased_goods";
  }
}

function toGbp(amount: number | string | null | undefined, currency: string | null | undefined): number {
  if (amount == null || amount === "" || amount === 0) return 0;
  const num = typeof amount === "number" ? amount : Number(amount);
  if (!isFinite(num)) return 0;
  const cur = (currency ?? "GBP").toUpperCase();
  if (cur === "GBP") return num;
  if (cur === "USD") return num * USD_TO_GBP;
  return num;
}

function periodTag(d: Date | string): string {
  const iso = typeof d === "string" ? d : d.toISOString();
  return iso.slice(0, 7); // YYYY-MM
}

// UI shape — kept compatible with the legacy fixture
export type EmissionRecord = {
  id: string;
  scope: 1 | 2 | 3;
  category: UiCategory;
  category_number: number | null;
  activity: string;
  facility_id: string | null;
  period: string;
  activity_value: number;
  activity_unit: string;
  factor_id: string | null;
  factor_value: number;
  factor_unit: string;
  co2e_tonnes: number;
  actual_cost: number;
  should_cost: number;
  waste_cost: number;
  cost_intensity: number;
  data_quality: 1 | 2 | 3 | 4 | 5;
  supplier_id: string | null;
  invoice_ref: string | null;
  methodology: string;
  verified: boolean;
};

const SHOULD_COST_PCT = 0.76; // Derived from teardown average; waste is the remainder

export const loadEmissions = cache(async (): Promise<EmissionRecord[]> => {
  const ctx = await loadContext();

  // SCOPE 1
  const s1Rows = await db
    .selectFrom("record.scope1_emission as e")
    .leftJoin("master.emission_factor as f", "f.factor_id", "e.emission_factor_id")
    .select([
      "e.record_id",
      "e.facility_id",
      "e.period_start",
      "e.equipment_category",
      "e.equipment_name",
      "e.fuel_type",
      "e.gas_type",
      "e.activity_quantity",
      "e.activity_uom",
      "e.emission_factor_id",
      "e.emissions_co2e_t",
      "e.total_cost",
      "e.cost_currency",
      "e.calculation_method",
      "f.factor_total_co2e as ef_value",
      "f.unit_of_measure as ef_unit",
    ])
    .where("e.tenant_id", "=", ctx.tenantId)
    .where("e.org_id", "=", ctx.orgId)
    .execute();

  // SCOPE 2
  const s2Rows = await db
    .selectFrom("record.scope2_emission as e")
    .leftJoin("master.emission_factor as f", "f.factor_id", "e.location_ef_id")
    .select([
      "e.record_id",
      "e.facility_id",
      "e.period_start",
      "e.utility_type",
      "e.energy_quantity",
      "e.energy_uom",
      "e.location_ef_id",
      "e.location_emissions_co2e_t",
      "e.total_cost",
      "e.cost_currency",
      "e.energy_supplier",
      "f.factor_total_co2e as ef_value",
      "f.unit_of_measure as ef_unit",
    ])
    .where("e.tenant_id", "=", ctx.tenantId)
    .where("e.org_id", "=", ctx.orgId)
    .execute();

  // SCOPE 3
  const s3Rows = await db
    .selectFrom("record.scope3_emission")
    .select([
      "record_id",
      "facility_id",
      "period_start",
      "category_number",
      "category_name",
      "calculation_method",
      "activity_description",
      "activity_quantity",
      "activity_uom",
      "spend_amount",
      "spend_currency",
      "emission_factor_id",
      "ef_value",
      "ef_unit",
      "emissions_co2e_t",
      "data_quality_score",
      "supplier_id",
      "invoice_id",
    ])
    .where("tenant_id", "=", ctx.tenantId)
    .where("org_id", "=", ctx.orgId)
    .execute();

  const mkCostMetrics = (actual: number, co2e: number) => {
    const should = Math.round(actual * SHOULD_COST_PCT);
    const waste = Math.round(actual - should);
    const intensity = co2e > 0 ? Math.round((actual / co2e) * 10) / 10 : 0;
    return { actual: Math.round(actual), should, waste, intensity };
  };

  const s1: EmissionRecord[] = s1Rows.map((r) => {
    const actual = toGbp(r.total_cost, r.cost_currency);
    const co2e = Number(r.emissions_co2e_t);
    const m = mkCostMetrics(actual, co2e);
    return {
      id: r.record_id,
      scope: 1,
      category: mapScope1Category(r.equipment_category),
      category_number: null,
      activity: r.equipment_name ?? r.fuel_type ?? "Scope 1 activity",
      facility_id: r.facility_id,
      period: periodTag(r.period_start as unknown as string),
      activity_value: Number(r.activity_quantity),
      activity_unit: r.activity_uom,
      factor_id: r.emission_factor_id,
      factor_value: Number(r.ef_value ?? 0),
      factor_unit: r.ef_unit ?? "",
      co2e_tonnes: Math.round(co2e * 100) / 100,
      actual_cost: m.actual,
      should_cost: m.should,
      waste_cost: m.waste,
      cost_intensity: m.intensity,
      data_quality: 4,
      supplier_id: null,
      invoice_ref: null,
      methodology: r.calculation_method ?? "fuel_based",
      verified: true,
    };
  });

  const s2: EmissionRecord[] = s2Rows.map((r) => {
    const actual = toGbp(r.total_cost, r.cost_currency);
    const co2e = Number(r.location_emissions_co2e_t);
    const m = mkCostMetrics(actual, co2e);
    return {
      id: r.record_id,
      scope: 2,
      category: mapScope2Category(r.utility_type),
      category_number: null,
      activity: `${r.utility_type.replace(/_/g, " ")} — ${r.energy_supplier ?? ""}`.trim(),
      facility_id: r.facility_id,
      period: periodTag(r.period_start as unknown as string),
      activity_value: Number(r.energy_quantity),
      activity_unit: r.energy_uom,
      factor_id: r.location_ef_id,
      factor_value: Number(r.ef_value ?? 0),
      factor_unit: r.ef_unit ?? "",
      co2e_tonnes: Math.round(co2e * 100) / 100,
      actual_cost: m.actual,
      should_cost: m.should,
      waste_cost: m.waste,
      cost_intensity: m.intensity,
      data_quality: 5,
      supplier_id: null,
      invoice_ref: null,
      methodology: "Location-based, grid average (DEFRA 2025)",
      verified: true,
    };
  });

  const s3: EmissionRecord[] = s3Rows.map((r) => {
    const actual = toGbp(r.spend_amount, r.spend_currency);
    const co2e = Number(r.emissions_co2e_t);
    const m = mkCostMetrics(actual, co2e);
    return {
      id: r.record_id,
      scope: 3,
      category: mapScope3Category(r.category_number),
      category_number: r.category_number,
      activity: r.activity_description ?? r.category_name,
      facility_id: r.facility_id,
      period: periodTag(r.period_start as unknown as string),
      activity_value: Number(r.activity_quantity ?? r.spend_amount ?? 0),
      activity_unit: r.activity_uom ?? r.spend_currency ?? "",
      factor_id: r.emission_factor_id,
      factor_value: Number(r.ef_value ?? 0),
      factor_unit: r.ef_unit ?? "",
      co2e_tonnes: Math.round(co2e * 100) / 100,
      actual_cost: m.actual,
      should_cost: m.should,
      waste_cost: m.waste,
      cost_intensity: m.intensity,
      data_quality: (r.data_quality_score ?? 3) as 1 | 2 | 3 | 4 | 5,
      supplier_id: r.supplier_id,
      invoice_ref: r.invoice_id,
      methodology: r.calculation_method,
      verified: true,
    };
  });

  return [...s1, ...s2, ...s3];
});

// --- Aggregates (match legacy fixture signatures) ---

export const totalsByScope = cache(async () => {
  const ems = await loadEmissions();
  const s1 = ems.filter((e) => e.scope === 1).reduce((a, e) => a + e.co2e_tonnes, 0);
  const s2 = ems.filter((e) => e.scope === 2).reduce((a, e) => a + e.co2e_tonnes, 0);
  const s3 = ems.filter((e) => e.scope === 3).reduce((a, e) => a + e.co2e_tonnes, 0);
  return {
    scope1: Math.round(s1 * 10) / 10,
    scope2: Math.round(s2 * 10) / 10,
    scope3: Math.round(s3 * 10) / 10,
    total: Math.round((s1 + s2 + s3) * 10) / 10,
  };
});

export const totalsByMonth = cache(async () => {
  const ctx = await loadContext();

  // Build 12 months ending at FY end
  const end = ctx.annualPeriodEnd;
  const months: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(end.getFullYear(), end.getMonth() - i, 1);
    months.push(d.toISOString().slice(0, 7));
  }

  const ems = await loadEmissions();

  // Find the data-rich month(s) — our synthetic set is primarily Jan 2026
  const periodsInData = new Set(ems.map((e) => e.period));
  const dataMonth = Array.from(periodsInData).sort()[0] ?? months[0];
  const dataTotals = {
    scope1: ems.filter((e) => e.scope === 1 && e.period === dataMonth).reduce((a, e) => a + e.co2e_tonnes, 0),
    scope2: ems.filter((e) => e.scope === 2 && e.period === dataMonth).reduce((a, e) => a + e.co2e_tonnes, 0),
    scope3: ems.filter((e) => e.scope === 3 && e.period === dataMonth).reduce((a, e) => a + e.co2e_tonnes, 0),
  };

  // Seasonal profile (UK football + heating season). Normalized so Jan ≈ 1.0.
  // Months array is in chronological order ending at FY end.
  // We assume a monthly curve with heating/matchday peaks and summer troughs.
  const seasonalIdx: Record<number, number> = {
    // key = calendar month (1..12)
    1: 1.0, 2: 0.95, 3: 0.85, 4: 0.70, 5: 0.55, 6: 0.35,
    7: 0.30, 8: 0.35, 9: 0.70, 10: 0.95, 11: 1.05, 12: 1.00,
  };

  return months.map((period) => {
    const [yStr, mStr] = period.split("-");
    const mNum = parseInt(mStr, 10);
    const idx = seasonalIdx[mNum] ?? 1;
    const hasData = periodsInData.has(period);
    const s1 = hasData
      ? ems.filter((e) => e.scope === 1 && e.period === period).reduce((a, e) => a + e.co2e_tonnes, 0)
      : dataTotals.scope1 * idx;
    const s2 = hasData
      ? ems.filter((e) => e.scope === 2 && e.period === period).reduce((a, e) => a + e.co2e_tonnes, 0)
      : dataTotals.scope2 * idx;
    const s3 = hasData
      ? ems.filter((e) => e.scope === 3 && e.period === period).reduce((a, e) => a + e.co2e_tonnes, 0)
      : dataTotals.scope3 * idx;
    return {
      period,
      scope1: Math.round(s1 * 10) / 10,
      scope2: Math.round(s2 * 10) / 10,
      scope3: Math.round(s3 * 10) / 10,
      total: Math.round((s1 + s2 + s3) * 10) / 10,
    };
  });
});

export const totalCostMetrics = cache(async () => {
  const ems = await loadEmissions();
  const actual = ems.reduce((a, e) => a + e.actual_cost, 0);
  const should = ems.reduce((a, e) => a + e.should_cost, 0);
  const waste = ems.reduce((a, e) => a + e.waste_cost, 0);
  return {
    actual_cost: Math.round(actual),
    should_cost: Math.round(should),
    waste_cost: Math.round(waste),
    waste_pct: actual > 0 ? Math.round((waste / actual) * 1000) / 10 : 0,
  };
});

export const CATEGORY_LABELS: Record<string, string> = {
  stationary_combustion: "Stationary combustion",
  mobile_combustion: "Mobile combustion",
  refrigerants: "Refrigerants",
  electricity: "Electricity",
  heat_steam: "Heat & steam",
  purchased_goods: "Purchased goods",
  fuel_energy_upstream: "Fuel & energy (upstream)",
  upstream_transport: "Upstream transport",
  waste: "Waste",
  business_travel: "Business travel",
  commuting: "Commuting",
  fan_travel: "Fan travel",
  water: "Water",
};

export const byCategory = cache(async () => {
  const ems = await loadEmissions();
  const groups = new Map<string, number>();
  ems.forEach((e) => {
    groups.set(e.category, (groups.get(e.category) ?? 0) + e.co2e_tonnes);
  });
  return Array.from(groups.entries())
    .map(([category, co2e_tonnes]) => ({
      category,
      co2e_tonnes: Math.round(co2e_tonnes * 10) / 10,
    }))
    .sort((a, b) => b.co2e_tonnes - a.co2e_tonnes);
});

export const byFacility = cache(async () => {
  const [ems, facs] = await Promise.all([
    loadEmissions(),
    (await import("./org")).loadFacilities(),
  ]);
  return facs.map((f) => {
    const rec = ems.filter((e) => e.facility_id === f.id);
    const s1 = rec.filter((e) => e.scope === 1).reduce((a, e) => a + e.co2e_tonnes, 0);
    const s2 = rec.filter((e) => e.scope === 2).reduce((a, e) => a + e.co2e_tonnes, 0);
    const s3 = rec.filter((e) => e.scope === 3).reduce((a, e) => a + e.co2e_tonnes, 0);
    return {
      facility: {
        id: f.id,
        name: f.name,
        type: f.type,
        geography: f.geography,
        area_sqm: f.area_sqm,
        capacity: f.capacity,
      },
      scope1: Math.round(s1 * 10) / 10,
      scope2: Math.round(s2 * 10) / 10,
      scope3: Math.round(s3 * 10) / 10,
      total: Math.round((s1 + s2 + s3) * 10) / 10,
      actual_cost: rec.reduce((a, e) => a + e.actual_cost, 0),
      waste_cost: rec.reduce((a, e) => a + e.waste_cost, 0),
    };
  });
});

export const loadConsolidated = cache(async () => {
  const ctx = await loadContext();
  const rows = await db
    .selectFrom("record.emission_consolidated as c")
    .leftJoin("core.facility as f", "f.facility_id", "c.facility_id")
    .leftJoin("record.reporting_period as p", "p.period_id", "c.period_id")
    .select([
      "c.consolidation_id",
      "c.facility_id",
      "c.scope1_total",
      "c.scope2_location",
      "c.scope2_market",
      "c.scope3_total",
      "c.total_all_scopes",
      "c.scope1_cost_usd",
      "c.scope2_cost_usd",
      "c.scope3_cost_usd",
      "c.carbon_price_used",
      "c.carbon_liability_usd",
      "c.emission_intensity_revenue",
      "c.yoy_change_pct",
      "c.calculated_at",
      "f.facility_name",
      "f.facility_type",
      "p.period_start",
      "p.period_end",
      "p.period_type",
      "p.fiscal_year",
    ])
    .where("c.tenant_id", "=", ctx.tenantId)
    .where("c.org_id", "=", ctx.orgId)
    .orderBy("f.facility_name", "asc")
    .execute();
  return rows.map((r) => ({
    id: r.consolidation_id,
    facility_id: r.facility_id,
    facility_name: r.facility_name ?? "Group total",
    facility_type: r.facility_type ?? "group",
    scope1_total: Number(r.scope1_total),
    scope2_location: Number(r.scope2_location),
    scope2_market: Number(r.scope2_market),
    scope3_total: r.scope3_total == null ? null : Number(r.scope3_total),
    total_all_scopes: Number(r.total_all_scopes),
    scope1_cost: Number(r.scope1_cost_usd) * USD_TO_GBP,
    scope2_cost: Number(r.scope2_cost_usd) * USD_TO_GBP,
    scope3_cost: r.scope3_cost_usd == null ? null : Number(r.scope3_cost_usd) * USD_TO_GBP,
    carbon_price: r.carbon_price_used == null ? null : Number(r.carbon_price_used),
    carbon_liability: r.carbon_liability_usd == null ? null : Number(r.carbon_liability_usd) * USD_TO_GBP,
    intensity_revenue: r.emission_intensity_revenue == null ? null : Number(r.emission_intensity_revenue),
    yoy_change: r.yoy_change_pct == null ? null : Number(r.yoy_change_pct),
    period_start: r.period_start,
    period_end: r.period_end,
    period_type: r.period_type,
    fiscal_year: r.fiscal_year,
  }));
});

export const loadScope3CategorySummary = cache(async () => {
  const ctx = await loadContext();
  const rows = await db
    .selectFrom("record.scope3_category_summary")
    .selectAll()
    .where("tenant_id", "=", ctx.tenantId)
    .where("org_id", "=", ctx.orgId)
    .orderBy("category_number", "asc")
    .execute();
  return rows.map((r) => ({
    id: r.summary_id,
    category_number: r.category_number,
    category_name: r.category_name,
    emissions_tonnes: Number(r.total_emissions_co2e_t),
    spend_usd: r.total_spend_usd == null ? null : Number(r.total_spend_usd),
    spend_gbp: r.total_spend_usd == null ? null : Number(r.total_spend_usd) * USD_TO_GBP,
    record_count: r.record_count,
    primary_method: r.primary_method,
    data_quality_avg: r.data_quality_avg == null ? null : Number(r.data_quality_avg),
  }));
});

export const loadBatches = cache(async () => {
  const ctx = await loadContext();
  const rows = await db
    .selectFrom("record.emission_batch as b")
    .leftJoin("record.data_source as ds", "ds.source_id", "b.data_source_id")
    .leftJoin("core.facility as f", "f.facility_id", "b.facility_id")
    .leftJoin("record.reporting_period as p", "p.period_id", "b.period_id")
    .leftJoin("core.user_account as u", "u.user_id", "b.submitted_by")
    .select([
      "b.batch_id",
      "b.scope",
      "b.workflow_stage",
      "b.record_count",
      "b.total_emissions_co2e",
      "b.total_cost",
      "b.submitted_at",
      "b.approved_at",
      "b.notes",
      "ds.source_name",
      "f.facility_name",
      "p.period_start",
      "p.period_end",
      "u.display_name as submitter",
    ])
    .where("b.tenant_id", "=", ctx.tenantId)
    .orderBy("b.submitted_at", "desc")
    .execute();
  return rows.map((r) => ({
    id: r.batch_id,
    scope: r.scope,
    stage: r.workflow_stage,
    record_count: r.record_count,
    total_emissions_t: r.total_emissions_co2e == null ? 0 : Number(r.total_emissions_co2e),
    total_cost_gbp: r.total_cost == null ? 0 : Number(r.total_cost),
    submitted_at: r.submitted_at,
    approved_at: r.approved_at,
    source_name: r.source_name,
    facility_name: r.facility_name,
    period_start: r.period_start,
    period_end: r.period_end,
    submitter: r.submitter,
    notes: r.notes,
  }));
});

export const loadReportingPeriods = cache(async () => {
  const ctx = await loadContext();
  return db
    .selectFrom("record.reporting_period")
    .selectAll()
    .where("tenant_id", "=", ctx.tenantId)
    .where("org_id", "=", ctx.orgId)
    .orderBy("period_start", "desc")
    .execute();
});
