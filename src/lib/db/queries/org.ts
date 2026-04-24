import { cache } from "react";
import { db } from "../client";
import { loadContext } from "../context";

export type OrgInfo = {
  id: string;
  name: string;
  legal_name: string | null;
  sector: string;
  revenue_gbp: number;
  employees: number;
  fiscal_year: string;
  fy_start: string;
  fy_end: string;
  parent: string | null;
  currency: string;
  tenant_name: string;
};

export type FacilityInfo = {
  id: string;
  code: string;
  name: string;
  type: string;
  geography: string;
  city: string;
  country: string;
  area_sqm: number;
  ownership_type: string | null;
  climate_zone: string | null;
  grid_region: string | null;
  capacity?: number;
  is_active: boolean;
};

const USD_TO_GBP = 0.79;

export const loadOrg = cache(async (): Promise<OrgInfo> => {
  const ctx = await loadContext();
  const group = await db
    .selectFrom("core.organization")
    .selectAll()
    .where("org_id", "=", ctx.orgId)
    .executeTakeFirstOrThrow();
  const revenueGbp =
    group.reporting_currency === "GBP"
      ? Number(group.annual_revenue_usd ?? 0)
      : Number(group.annual_revenue_usd ?? 0) * USD_TO_GBP;
  return {
    id: ctx.orgId,
    name: group.org_name,
    legal_name: group.legal_name,
    sector: group.industry_name ?? "Sports & Entertainment",
    revenue_gbp: Math.round(revenueGbp),
    employees: group.employee_count ?? 0,
    fiscal_year: ctx.fiscalYear,
    fy_start: ctx.annualPeriodStart.toISOString().slice(0, 10),
    fy_end: ctx.annualPeriodEnd.toISOString().slice(0, 10),
    parent: group.parent_org_id,
    currency: group.reporting_currency,
    tenant_name: ctx.tenantName,
  };
});

export const loadFacilities = cache(async (): Promise<FacilityInfo[]> => {
  const ctx = await loadContext();
  const rows = await db
    .selectFrom("core.facility")
    .selectAll()
    .where("tenant_id", "=", ctx.tenantId)
    .orderBy("facility_code", "asc")
    .execute();
  return rows.map((r) => ({
    id: r.facility_id,
    code: r.facility_code,
    name: r.facility_name,
    type: r.facility_type,
    geography: `${r.country_code}-${r.state_code ?? ""}`.replace(/-$/, ""),
    city: r.city,
    country: r.country_name,
    area_sqm: Number(r.floor_area_sqm ?? 0),
    ownership_type: r.ownership_type,
    climate_zone: r.climate_zone,
    grid_region: r.grid_region,
    is_active: r.is_active,
  }));
});

export const loadSubOrgs = cache(async () => {
  const ctx = await loadContext();
  const rows = await db
    .selectFrom("core.organization")
    .selectAll()
    .where("tenant_id", "=", ctx.tenantId)
    .where("parent_org_id", "=", ctx.orgId)
    .orderBy("org_name", "asc")
    .execute();
  return rows.map((r) => ({
    id: r.org_id,
    code: r.org_code,
    name: r.org_name,
    type: r.org_type,
    employees: r.employee_count ?? 0,
  }));
});

export const loadUsers = cache(async () => {
  const ctx = await loadContext();
  const users = await db
    .selectFrom("core.user_account as u")
    .leftJoin("core.user_role as ur", "ur.user_id", "u.user_id")
    .leftJoin("core.role as r", "r.role_id", "ur.role_id")
    .select([
      "u.user_id",
      "u.email",
      "u.display_name",
      "u.first_name",
      "u.last_name",
      "u.job_title",
      "u.department",
      "u.status",
      "u.login_count",
      "r.role_name",
      "r.role_code",
    ])
    .where("u.tenant_id", "=", ctx.tenantId)
    .execute();
  const byUser = new Map<string, any>();
  for (const u of users) {
    const key = u.user_id;
    if (!byUser.has(key)) {
      byUser.set(key, {
        id: u.user_id,
        email: u.email,
        name: u.display_name ?? `${u.first_name} ${u.last_name}`,
        job_title: u.job_title,
        department: u.department,
        status: u.status,
        login_count: u.login_count,
        roles: [] as { code: string; name: string }[],
      });
    }
    if (u.role_code) {
      byUser.get(key).roles.push({ code: u.role_code, name: u.role_name });
    }
  }
  return Array.from(byUser.values());
});

export const loadRoles = cache(async () => {
  const ctx = await loadContext();
  const rows = await db
    .selectFrom("core.role as r")
    .leftJoin("core.role_permission as rp", "rp.role_id", "r.role_id")
    .leftJoin("core.permission as p", "p.permission_id", "rp.permission_id")
    .select([
      "r.role_id",
      "r.role_code",
      "r.role_name",
      "r.description",
      "r.is_system_role",
      "p.permission_code",
      "p.action",
      "p.resource",
      "p.module",
    ])
    .where("r.tenant_id", "=", ctx.tenantId)
    .execute();
  const byRole = new Map<
    string,
    {
      id: string;
      code: string;
      name: string;
      description: string | null;
      is_system: boolean;
      permissions: { code: string; module: string; action: string; resource: string }[];
    }
  >();
  for (const row of rows) {
    const existing = byRole.get(row.role_id);
    if (!existing) {
      byRole.set(row.role_id, {
        id: row.role_id,
        code: row.role_code,
        name: row.role_name,
        description: row.description,
        is_system: row.is_system_role,
        permissions: [],
      });
    }
    if (row.permission_code && row.action && row.resource && row.module) {
      byRole.get(row.role_id)!.permissions.push({
        code: row.permission_code,
        action: row.action,
        resource: row.resource,
        module: row.module,
      });
    }
  }
  return Array.from(byRole.values());
});
