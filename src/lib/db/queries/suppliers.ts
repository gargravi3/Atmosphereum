import { cache } from "react";
import { db } from "../client";
import { loadContext } from "../context";

const USD_TO_GBP = 0.79;

export type SupplierRow = {
  id: string;
  code: string;
  name: string;
  country: string;
  industry: string | null;
  category: string;
  annual_spend_usd: number;
  annual_spend_gbp: number;
  co2e_tonnes: number;
  esg_score: number | null;
  risk_category: string | null;
  cdp_score: string | null;
  has_sbti_target: boolean;
  onboarding_status: string;
  engagement_tier: string | null;
  spend_rank: number | null;
  last_data_received: string | null;
  tier: 1 | 2 | 3;
  status: string;
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
  supplier_ef_source: string | null;
};

export const loadSuppliers = cache(async (): Promise<SupplierRow[]> => {
  const ctx = await loadContext();

  // Aggregate Scope 3 emissions per supplier
  const emissionsBySupplier = await db
    .selectFrom("record.scope3_emission")
    .select((eb) => [
      "supplier_id",
      eb.fn.sum("emissions_co2e_t").as("total_t"),
    ])
    .where("tenant_id", "=", ctx.tenantId)
    .where("supplier_id", "is not", null)
    .groupBy("supplier_id")
    .execute();
  const emissionsMap = new Map<string, number>();
  for (const r of emissionsBySupplier) {
    emissionsMap.set(r.supplier_id as string, Number(r.total_t));
  }

  const rows = await db
    .selectFrom("supplier.supplier")
    .selectAll()
    .where("tenant_id", "=", ctx.tenantId)
    .orderBy("spend_rank", "asc")
    .execute();

  return rows.map((r, i) => {
    const spendUsd = Number(r.annual_spend_usd ?? 0);
    const co2e = emissionsMap.get(r.supplier_id) ?? 0;
    return {
      id: r.supplier_id,
      code: r.supplier_code,
      name: r.supplier_name,
      country: r.country_code,
      industry: r.industry_name,
      category: r.industry_name ?? "Uncategorised",
      annual_spend_usd: spendUsd,
      annual_spend_gbp: Math.round(spendUsd * USD_TO_GBP),
      co2e_tonnes: Math.round(co2e * 10) / 10,
      esg_score: r.esg_risk_score,
      risk_category: r.risk_category,
      cdp_score: r.cdp_score,
      has_sbti_target: r.has_sbti_target,
      onboarding_status: r.onboarding_status,
      engagement_tier: r.engagement_tier,
      spend_rank: r.spend_rank,
      last_data_received: r.last_data_received as unknown as string | null,
      tier: (i % 3 === 0 ? 1 : i % 3 === 1 ? 2 : 3) as 1 | 2 | 3,
      status: r.status,
      contact_email: r.contact_email,
      contact_phone: r.contact_phone,
      website: r.website,
      supplier_ef_source: r.supplier_ef_source,
    };
  });
});

export const loadInvoicesForSupplier = cache(async (supplierId: string) => {
  const ctx = await loadContext();
  const rows = await db
    .selectFrom("supplier.invoice as i")
    .leftJoin("core.facility as f", "f.facility_id", "i.facility_id")
    .select([
      "i.invoice_id",
      "i.invoice_number",
      "i.invoice_date",
      "i.invoice_value",
      "i.invoice_currency",
      "i.invoice_value_usd",
      "i.scope3_category",
      "i.calculation_method",
      "i.spend_based_emissions_co2e",
      "i.supplier_emissions_co2e",
      "i.final_emissions_co2e",
      "i.carbon_liability_usd",
      "i.approval_status",
      "i.line_item_count",
      "i.accounting_data",
      "f.facility_name",
    ])
    .where("i.tenant_id", "=", ctx.tenantId)
    .where("i.supplier_id", "=", supplierId)
    .orderBy("i.invoice_date", "desc")
    .execute();
  return rows.map((r) => ({
    id: r.invoice_id,
    number: r.invoice_number,
    date: r.invoice_date,
    value: Number(r.invoice_value),
    currency: r.invoice_currency,
    value_usd: r.invoice_value_usd == null ? null : Number(r.invoice_value_usd),
    scope3_category: r.scope3_category,
    method: r.calculation_method,
    co2e_spend_based: r.spend_based_emissions_co2e == null ? null : Number(r.spend_based_emissions_co2e),
    co2e_supplier_specific: r.supplier_emissions_co2e == null ? null : Number(r.supplier_emissions_co2e),
    co2e_final: r.final_emissions_co2e == null ? null : Number(r.final_emissions_co2e),
    carbon_liability_usd: r.carbon_liability_usd == null ? null : Number(r.carbon_liability_usd),
    status: r.approval_status,
    line_count: r.line_item_count,
    accounting: r.accounting_data,
    facility_name: r.facility_name,
  }));
});

export const loadAllInvoices = cache(async () => {
  const ctx = await loadContext();
  const rows = await db
    .selectFrom("supplier.invoice as i")
    .innerJoin("supplier.supplier as s", "s.supplier_id", "i.supplier_id")
    .leftJoin("core.facility as f", "f.facility_id", "i.facility_id")
    .select([
      "i.invoice_id",
      "i.invoice_number",
      "i.invoice_date",
      "i.invoice_value",
      "i.invoice_currency",
      "i.invoice_value_usd",
      "i.scope3_category",
      "i.approval_status",
      "i.final_emissions_co2e",
      "i.carbon_liability_usd",
      "s.supplier_name",
      "s.supplier_id",
      "s.country_code",
      "f.facility_name",
    ])
    .where("i.tenant_id", "=", ctx.tenantId)
    .orderBy("i.invoice_date", "desc")
    .execute();
  return rows.map((r) => ({
    id: r.invoice_id,
    number: r.invoice_number,
    date: r.invoice_date,
    value: Number(r.invoice_value),
    currency: r.invoice_currency,
    value_usd: r.invoice_value_usd == null ? null : Number(r.invoice_value_usd),
    scope3_category: r.scope3_category,
    status: r.approval_status,
    co2e_tonnes: r.final_emissions_co2e == null ? null : Number(r.final_emissions_co2e),
    carbon_liability_usd: r.carbon_liability_usd == null ? null : Number(r.carbon_liability_usd),
    supplier_id: r.supplier_id,
    supplier_name: r.supplier_name,
    country: r.country_code,
    facility_name: r.facility_name,
  }));
});

export const loadSupplierOnboarding = cache(async () => {
  const ctx = await loadContext();
  const rows = await db
    .selectFrom("supplier.supplier_onboarding as o")
    .innerJoin("supplier.supplier as s", "s.supplier_id", "o.supplier_id")
    .select([
      "o.onboarding_id",
      "o.supplier_id",
      "o.invited_at",
      "o.questionnaire_sent",
      "o.questionnaire_completed",
      "o.data_submitted_at",
      "o.data_validated_at",
      "o.current_stage",
      "o.notes",
      "s.supplier_name",
      "s.engagement_tier",
    ])
    .where("o.tenant_id", "=", ctx.tenantId)
    .execute();
  return rows.map((r) => ({
    id: r.onboarding_id,
    supplier_id: r.supplier_id,
    supplier_name: r.supplier_name,
    tier: r.engagement_tier,
    invited_at: r.invited_at,
    questionnaire_sent: r.questionnaire_sent,
    questionnaire_completed: r.questionnaire_completed,
    data_submitted_at: r.data_submitted_at,
    data_validated_at: r.data_validated_at,
    stage: r.current_stage,
    notes: r.notes,
  }));
});
