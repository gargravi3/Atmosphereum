import { cache } from "react";
import { db } from "./client";

const TENANT_SLUG = "brentford-fc";

export type AtmContext = {
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  billingCurrency: string;
  orgId: string;
  orgName: string;
  orgCode: string;
  employees: number;
  revenueUsd: number;
  reportingCurrency: string;
  userId: string;
  userName: string;
  userTitle: string;
  userEmail: string;
  fiscalYear: string;
  annualPeriodId: string;
  annualPeriodStart: Date;
  annualPeriodEnd: Date;
};

/**
 * Loads the "current session" context for Brentford FC.
 * Uses Sarah Chen (Sustainability Manager) as the default user until real auth lands.
 * Cached per React render tree via `cache()`.
 */
export const loadContext = cache(async (): Promise<AtmContext> => {
  const tenant = await db
    .selectFrom("core.tenant")
    .selectAll()
    .where("tenant_slug", "=", TENANT_SLUG)
    .executeTakeFirstOrThrow();

  const org = await db
    .selectFrom("core.organization")
    .selectAll()
    .where("tenant_id", "=", tenant.tenant_id)
    .where("org_type", "=", "group")
    .executeTakeFirstOrThrow();

  const user = await db
    .selectFrom("core.user_account")
    .selectAll()
    .where("tenant_id", "=", tenant.tenant_id)
    .where("email", "=", "sarah.chen@brentfordfc.com")
    .executeTakeFirstOrThrow();

  const period = await db
    .selectFrom("record.reporting_period")
    .selectAll()
    .where("tenant_id", "=", tenant.tenant_id)
    .where("org_id", "=", org.org_id)
    .where("period_type", "=", "annual")
    .orderBy("period_start", "desc")
    .executeTakeFirstOrThrow();

  return {
    tenantId: tenant.tenant_id,
    tenantName: tenant.tenant_name,
    tenantSlug: tenant.tenant_slug,
    billingCurrency: tenant.billing_currency,
    orgId: org.org_id,
    orgName: org.org_name,
    orgCode: org.org_code,
    employees: org.employee_count ?? 0,
    revenueUsd: Number(org.annual_revenue_usd ?? 0),
    reportingCurrency: org.reporting_currency,
    userId: user.user_id,
    userName: user.display_name ?? `${user.first_name} ${user.last_name}`,
    userTitle: user.job_title ?? "",
    userEmail: user.email,
    fiscalYear: period.fiscal_year,
    annualPeriodId: period.period_id,
    annualPeriodStart: new Date(period.period_start as unknown as string),
    annualPeriodEnd: new Date(period.period_end as unknown as string),
  };
});
