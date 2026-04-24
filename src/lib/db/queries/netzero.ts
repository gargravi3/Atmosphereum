import { cache } from "react";
import { db } from "../client";
import { loadContext } from "../context";

export const loadTargets = cache(async () => {
  const ctx = await loadContext();
  const rows = await db
    .selectFrom("netzero.target as t")
    .leftJoin("core.facility as f", "f.facility_id", "t.facility_id")
    .leftJoin("core.user_account as u", "u.user_id", "t.approved_by")
    .select([
      "t.target_id",
      "t.target_name",
      "t.target_code",
      "t.ghg_scope_category",
      "t.emission_source_category",
      "t.target_type",
      "t.sbti_method",
      "t.base_year",
      "t.base_emissions_co2e",
      "t.target_year",
      "t.target_emissions_co2e",
      "t.reduction_pct",
      "t.projection_method",
      "t.interim_targets",
      "t.is_sbti_validated",
      "t.sbti_validation_date",
      "t.status",
      "t.facility_id",
      "t.approved_at",
      "f.facility_name",
      "u.display_name as approver",
    ])
    .where("t.tenant_id", "=", ctx.tenantId)
    .where("t.org_id", "=", ctx.orgId)
    .orderBy("t.ghg_scope_category", "asc")
    .execute();
  return rows.map((r) => ({
    id: r.target_id,
    code: r.target_code,
    name: r.target_name,
    scope_category: r.ghg_scope_category,
    emission_source: r.emission_source_category,
    type: r.target_type,
    sbti_method: r.sbti_method,
    base_year: r.base_year,
    base_emissions_t: Number(r.base_emissions_co2e),
    target_year: r.target_year,
    target_emissions_t: Number(r.target_emissions_co2e),
    reduction_pct: Number(r.reduction_pct),
    projection_method: r.projection_method,
    interim: r.interim_targets,
    sbti_validated: r.is_sbti_validated,
    sbti_validation_date: r.sbti_validation_date,
    status: r.status,
    facility_id: r.facility_id,
    facility_name: r.facility_name,
    approver: r.approver,
    approved_at: r.approved_at,
  }));
});

export const loadYearlyProjections = cache(async (targetId?: string) => {
  const ctx = await loadContext();
  let query = db
    .selectFrom("netzero.yearly_projection as p")
    .innerJoin("netzero.target as t", "t.target_id", "p.target_id")
    .select([
      "p.projection_id",
      "p.target_id",
      "p.projection_year",
      "p.yearly_allowed_emissions",
      "p.actual_emissions",
      "p.variance",
      "p.status",
      "t.target_name",
      "t.target_code",
      "t.ghg_scope_category",
    ])
    .where("t.tenant_id", "=", ctx.tenantId)
    .where("t.org_id", "=", ctx.orgId);
  if (targetId) query = query.where("p.target_id", "=", targetId);
  const rows = await query.orderBy("p.projection_year", "asc").execute();
  return rows.map((r) => ({
    id: r.projection_id,
    target_id: r.target_id,
    target_name: r.target_name,
    target_code: r.target_code,
    scope_category: r.ghg_scope_category,
    year: r.projection_year,
    allowed_t: Number(r.yearly_allowed_emissions),
    actual_t: r.actual_emissions == null ? null : Number(r.actual_emissions),
    variance: r.variance == null ? null : Number(r.variance),
    status: r.status,
  }));
});

export const loadPerformanceSummary = cache(async () => {
  const ctx = await loadContext();
  const rows = await db
    .selectFrom("netzero.performance_summary")
    .selectAll()
    .where("tenant_id", "=", ctx.tenantId)
    .where("org_id", "=", ctx.orgId)
    .orderBy("reporting_year", "desc")
    .execute();
  return rows.map((r) => ({
    id: r.summary_id,
    year: r.reporting_year,
    scope1_actual: r.scope1_actual == null ? 0 : Number(r.scope1_actual),
    scope2_actual: r.scope2_actual == null ? 0 : Number(r.scope2_actual),
    scope3_actual: r.scope3_actual == null ? 0 : Number(r.scope3_actual),
    total_actual: r.total_actual == null ? 0 : Number(r.total_actual),
    scope1_allowed: r.scope1_allowed == null ? 0 : Number(r.scope1_allowed),
    scope2_allowed: r.scope2_allowed == null ? 0 : Number(r.scope2_allowed),
    scope3_allowed: r.scope3_allowed == null ? 0 : Number(r.scope3_allowed),
    total_allowed: r.total_allowed == null ? 0 : Number(r.total_allowed),
    total_gap: r.total_gap == null ? 0 : Number(r.total_gap),
    overall_status: r.overall_status,
  }));
});
