import { cache } from "react";
import { db } from "../client";
import { loadContext } from "../context";

export type ReportRow = {
  id: string;
  title: string;
  framework: string;
  framework_code: string;
  period: string;
  status: "draft" | "in_review" | "approved" | "submitted";
  version: string;
  created_at: string;
  created_by: string;
  completion_pct: number;
  confidence: number | null;
  sections_auto_approved: number;
  sections_human_edited: number;
  ai_model: string | null;
  generation_cost_usd: number | null;
  published_at: string | null;
};

function reportStatusLabel(db: string): "draft" | "in_review" | "approved" | "submitted" {
  if (db === "approved") return "approved";
  if (db === "published") return "submitted";
  if (db === "human_review" || db === "under_approval") return "in_review";
  return "draft";
}

export const loadReports = cache(async (): Promise<ReportRow[]> => {
  const ctx = await loadContext();
  const rows = await db
    .selectFrom("report.report as r")
    .innerJoin("master.regulatory_framework as fw", "fw.framework_id", "r.framework_id")
    .leftJoin("record.reporting_period as p", "p.period_id", "r.period_id")
    .leftJoin("core.user_account as u", "u.user_id", "r.created_by")
    .select([
      "r.report_id",
      "r.report_name",
      "r.report_type",
      "r.status",
      "r.overall_completion_pct",
      "r.overall_confidence",
      "r.ai_model_used",
      "r.generation_cost_usd",
      "r.sections_auto_approved",
      "r.sections_human_edited",
      "r.published_at",
      "r.created_at",
      "fw.framework_name",
      "fw.framework_code",
      "p.fiscal_year",
      "u.display_name as creator",
    ])
    .where("r.tenant_id", "=", ctx.tenantId)
    .where("r.org_id", "=", ctx.orgId)
    .orderBy("r.created_at", "desc")
    .execute();
  return rows.map((r) => ({
    id: r.report_id,
    title: r.report_name,
    framework: r.framework_name,
    framework_code: r.framework_code,
    period: r.fiscal_year ?? "",
    status: reportStatusLabel(r.status),
    version: r.report_type ?? "annual",
    created_at: (r.created_at as unknown as string).slice(0, 10),
    created_by: r.creator ?? "System",
    completion_pct: Number(r.overall_completion_pct ?? 0),
    confidence: r.overall_confidence == null ? null : Number(r.overall_confidence),
    sections_auto_approved: r.sections_auto_approved,
    sections_human_edited: r.sections_human_edited,
    ai_model: r.ai_model_used,
    generation_cost_usd: r.generation_cost_usd == null ? null : Number(r.generation_cost_usd),
    published_at: r.published_at as unknown as string | null,
  }));
});

export const loadReportSections = cache(async (reportId: string) => {
  const rows = await db
    .selectFrom("report.report_section as s")
    .leftJoin("core.user_account as u", "u.user_id", "s.reviewed_by")
    .select([
      "s.section_id",
      "s.section_code",
      "s.section_name",
      "s.section_order",
      "s.parent_section_id",
      "s.content_type",
      "s.ai_generated_content",
      "s.human_edited_content",
      "s.final_content",
      "s.generation_status",
      "s.confidence_score",
      "s.reviewed_at",
      "s.review_comments",
      "s.edit_distance_pct",
      "u.display_name as reviewer",
    ])
    .where("s.report_id", "=", reportId)
    .orderBy("s.section_order", "asc")
    .execute();
  return rows.map((r) => ({
    id: r.section_id,
    code: r.section_code,
    name: r.section_name,
    order: r.section_order,
    parent_id: r.parent_section_id,
    content_type: r.content_type,
    content: r.final_content ?? r.human_edited_content ?? r.ai_generated_content ?? "",
    ai_content: r.ai_generated_content,
    status: r.generation_status,
    confidence: r.confidence_score == null ? null : Number(r.confidence_score),
    reviewer: r.reviewer,
    reviewed_at: r.reviewed_at,
    comments: r.review_comments,
    edit_distance: r.edit_distance_pct == null ? null : Number(r.edit_distance_pct),
  }));
});

export const loadFrameworks = cache(async () => {
  const rows = await db
    .selectFrom("master.regulatory_framework as fw")
    .leftJoin("master.framework_metric as m", "m.framework_id", "fw.framework_id")
    .select([
      "fw.framework_id",
      "fw.framework_code",
      "fw.framework_name",
      "fw.description",
      "fw.jurisdiction",
      "fw.framework_type",
      "fw.effective_date",
      "fw.first_reporting_year",
      "m.metric_id",
      "m.metric_code",
      "m.metric_name",
      "m.description as metric_description",
      "m.section",
      "m.subsection",
      "m.is_mandatory",
    ])
    .execute();
  const byFw = new Map<string, any>();
  for (const r of rows) {
    if (!byFw.has(r.framework_id)) {
      byFw.set(r.framework_id, {
        id: r.framework_id,
        code: r.framework_code,
        name: r.framework_name,
        description: r.description,
        jurisdiction: r.jurisdiction,
        framework_type: r.framework_type,
        effective_date: r.effective_date,
        first_reporting_year: r.first_reporting_year,
        disclosures: [] as any[],
      });
    }
    if (r.metric_id) {
      byFw.get(r.framework_id).disclosures.push({
        id: r.metric_code ?? r.metric_id,
        title: r.metric_name,
        description: r.metric_description,
        section: r.section,
        subsection: r.subsection,
        is_mandatory: r.is_mandatory,
        metric_refs: [r.metric_code ?? ""],
      });
    }
  }
  return Array.from(byFw.values());
});

export const loadFrameworkMappings = cache(async () => {
  const ctx = await loadContext();
  const rows = await db
    .selectFrom("report.framework_data_mapping as m")
    .innerJoin("master.framework_metric as fm", "fm.metric_id", "m.framework_metric_id")
    .innerJoin(
      "master.regulatory_framework as fw",
      "fw.framework_id",
      "fm.framework_id",
    )
    .select([
      "m.mapping_id",
      "m.platform_table",
      "m.platform_field",
      "m.transformation",
      "m.is_auto_mapped",
      "m.confidence_score",
      "fm.metric_code",
      "fm.metric_name",
      "fw.framework_code",
    ])
    .where("m.tenant_id", "=", ctx.tenantId)
    .execute();
  return rows.map((r) => ({
    id: r.mapping_id,
    framework: r.framework_code,
    metric_code: r.metric_code,
    metric_name: r.metric_name,
    platform_table: r.platform_table,
    platform_field: r.platform_field,
    transformation: r.transformation,
    auto_mapped: r.is_auto_mapped,
    confidence: r.confidence_score == null ? null : Number(r.confidence_score),
  }));
});

export const loadConsistencyChecks = cache(async () => {
  const ctx = await loadContext();
  const rows = await db
    .selectFrom("report.consistency_check as c")
    .leftJoin("master.regulatory_framework as fa", "fa.framework_id", "c.framework_a_id")
    .leftJoin("master.regulatory_framework as fb", "fb.framework_id", "c.framework_b_id")
    .select([
      "c.check_id",
      "c.check_name",
      "c.check_type",
      "c.metric_description",
      "c.value_a",
      "c.value_b",
      "c.variance",
      "c.status",
      "c.resolution_notes",
      "fa.framework_code as fa_code",
      "fb.framework_code as fb_code",
    ])
    .where("c.tenant_id", "=", ctx.tenantId)
    .execute();
  return rows.map((r) => ({
    id: r.check_id,
    name: r.check_name,
    type: r.check_type,
    description: r.metric_description,
    framework_a: r.fa_code,
    framework_b: r.fb_code,
    value_a: r.value_a == null ? null : Number(r.value_a),
    value_b: r.value_b == null ? null : Number(r.value_b),
    variance: r.variance == null ? null : Number(r.variance),
    status: r.status,
    notes: r.resolution_notes,
  }));
});

export const loadExports = cache(async () => {
  const ctx = await loadContext();
  const rows = await db
    .selectFrom("report.export as x")
    .innerJoin("report.report as r", "r.report_id", "x.report_id")
    .innerJoin(
      "master.regulatory_framework as fw",
      "fw.framework_id",
      "r.framework_id",
    )
    .leftJoin("core.user_account as u", "u.user_id", "x.downloaded_by")
    .select([
      "x.export_id",
      "x.export_format",
      "x.export_purpose",
      "x.file_name",
      "x.file_size_bytes",
      "x.generation_status",
      "x.generated_at",
      "x.downloaded_at",
      "r.report_id",
      "r.report_name",
      "fw.framework_code",
      "fw.framework_name",
      "u.display_name as downloader",
    ])
    .where("x.tenant_id", "=", ctx.tenantId)
    .orderBy("x.generated_at", "desc")
    .execute();
  return rows.map((r) => ({
    id: r.export_id,
    format: r.export_format,
    purpose: r.export_purpose,
    filename: r.file_name,
    size_bytes: r.file_size_bytes == null ? 0 : Number(r.file_size_bytes),
    status: r.generation_status,
    generated_at: r.generated_at,
    downloaded_at: r.downloaded_at,
    report_id: r.report_id,
    report_name: r.report_name,
    framework_code: r.framework_code,
    framework_name: r.framework_name,
    downloader: r.downloader,
  }));
});
