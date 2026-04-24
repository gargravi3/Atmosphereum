import { cache } from "react";
import { db } from "../client";
import { loadContext } from "../context";

export type ApprovalRow = {
  id: string;
  approval_type: string;
  entity_type: string;
  entity_id: string;
  entity_description: string;
  requested_by: string;
  requested_by_id: string;
  requested_at: string;
  priority: string;
  due_date: string | null;
  status: string;
  current_approver: string | null;
  current_approver_id: string | null;
  approval_level: number;
  max_level: number;
  resolved_by: string | null;
  resolved_at: string | null;
  comments: string | null;
  is_overdue: boolean;
  steps: {
    id: string;
    level: number;
    approver: string;
    approver_id: string;
    status: string;
    action_at: string | null;
    comments: string | null;
  }[];
};

export const loadApprovals = cache(async (): Promise<ApprovalRow[]> => {
  const ctx = await loadContext();
  const rows = await db
    .selectFrom("govern.approval_request as a")
    .leftJoin("core.user_account as requester", "requester.user_id", "a.requested_by")
    .leftJoin("core.user_account as approver", "approver.user_id", "a.current_approver_id")
    .leftJoin("core.user_account as resolver", "resolver.user_id", "a.resolved_by")
    .select([
      "a.approval_id",
      "a.approval_type",
      "a.entity_type",
      "a.entity_id",
      "a.entity_description",
      "a.requested_by",
      "a.requested_at",
      "a.priority",
      "a.due_date",
      "a.status",
      "a.current_approver_id",
      "a.approval_level",
      "a.max_approval_level",
      "a.resolved_at",
      "a.resolution_comments",
      "a.is_overdue",
      "requester.display_name as requester_name",
      "approver.display_name as approver_name",
      "resolver.display_name as resolver_name",
    ])
    .where("a.tenant_id", "=", ctx.tenantId)
    .orderBy("a.requested_at", "desc")
    .execute();

  if (rows.length === 0) return [];

  const approvalIds = rows.map((r) => r.approval_id);
  const stepRows = await db
    .selectFrom("govern.approval_step as s")
    .innerJoin("core.user_account as u", "u.user_id", "s.approver_id")
    .select([
      "s.step_id",
      "s.approval_id",
      "s.step_level",
      "s.approver_id",
      "s.status",
      "s.action_at",
      "s.comments",
      "u.display_name as approver_name",
    ])
    .where("s.approval_id", "in", approvalIds)
    .orderBy("s.approval_id", "asc")
    .orderBy("s.step_level", "asc")
    .execute();

  const stepsByApproval = new Map<string, ApprovalRow["steps"]>();
  for (const s of stepRows) {
    if (!stepsByApproval.has(s.approval_id)) stepsByApproval.set(s.approval_id, []);
    stepsByApproval.get(s.approval_id)!.push({
      id: s.step_id,
      level: s.step_level,
      approver: s.approver_name ?? "Unknown",
      approver_id: s.approver_id,
      status: s.status,
      action_at: s.action_at as unknown as string | null,
      comments: s.comments,
    });
  }

  return rows.map((r) => ({
    id: r.approval_id,
    approval_type: r.approval_type,
    entity_type: r.entity_type,
    entity_id: r.entity_id,
    entity_description: r.entity_description ?? "",
    requested_by: r.requester_name ?? "",
    requested_by_id: r.requested_by,
    requested_at: r.requested_at as unknown as string,
    priority: r.priority,
    due_date: r.due_date as unknown as string | null,
    status: r.status,
    current_approver: r.approver_name,
    current_approver_id: r.current_approver_id,
    approval_level: r.approval_level,
    max_level: r.max_approval_level,
    resolved_by: r.resolver_name,
    resolved_at: r.resolved_at as unknown as string | null,
    comments: r.resolution_comments,
    is_overdue: r.is_overdue,
    steps: stepsByApproval.get(r.approval_id) ?? [],
  }));
});

export const loadAuditEvents = cache(async (limit = 200) => {
  const ctx = await loadContext();
  const rows = await db
    .selectFrom("govern.audit_event as e")
    .leftJoin("core.user_account as u", "u.user_id", "e.user_id")
    .select([
      "e.event_id",
      "e.event_timestamp",
      "e.event_type",
      "e.module",
      "e.entity_type",
      "e.entity_id",
      "e.action",
      "e.change_summary",
      "e.metadata",
      "e.user_email",
      "u.display_name as user_name",
    ])
    .where("e.tenant_id", "=", ctx.tenantId)
    .orderBy("e.event_timestamp", "desc")
    .limit(limit)
    .execute();
  return rows.map((r) => ({
    id: r.event_id,
    timestamp: r.event_timestamp as unknown as string,
    type: r.event_type,
    module: r.module,
    actor: r.user_name ?? r.user_email ?? "System",
    entity_type: r.entity_type,
    entity_id: r.entity_id,
    action: r.action,
    detail: r.change_summary,
    metadata: r.metadata,
  }));
});

export const loadMaterialityTopics = cache(async () => {
  const ctx = await loadContext();
  const rows = await db
    .selectFrom("govern.materiality_topic")
    .selectAll()
    .where("tenant_id", "=", ctx.tenantId)
    .orderBy("overall_materiality_score", "desc")
    .execute();
  return rows.map((r) => ({
    id: r.topic_id,
    code: r.topic_code,
    name: r.topic_name,
    pillar: r.esg_pillar,
    description: r.description,
    financial_score: r.financial_materiality_score == null ? 0 : Number(r.financial_materiality_score),
    impact_score: r.impact_materiality_score == null ? 0 : Number(r.impact_materiality_score),
    overall_score: r.overall_materiality_score == null ? 0 : Number(r.overall_materiality_score),
    is_material: r.is_material,
    threshold: Number(r.materiality_threshold),
    stakeholder_input: r.stakeholder_input,
    assessment_year: r.assessment_year,
    notes: r.notes,
  }));
});

export const loadComplianceDeadlines = cache(async () => {
  const ctx = await loadContext();
  const rows = await db
    .selectFrom("govern.compliance_deadline as d")
    .leftJoin("master.regulatory_framework as fw", "fw.framework_id", "d.framework_id")
    .leftJoin("core.user_account as u", "u.user_id", "d.responsible_user_id")
    .select([
      "d.deadline_id",
      "d.deadline_name",
      "d.deadline_type",
      "d.due_date",
      "d.status",
      "d.completion_pct",
      "d.notes",
      "fw.framework_code",
      "fw.framework_name",
      "u.display_name as owner",
    ])
    .where("d.tenant_id", "=", ctx.tenantId)
    .orderBy("d.due_date", "asc")
    .execute();
  return rows.map((r) => ({
    id: r.deadline_id,
    name: r.deadline_name,
    type: r.deadline_type,
    due_date: r.due_date as unknown as string,
    framework: r.framework_code,
    framework_name: r.framework_name,
    owner: r.owner,
    status: r.status,
    completion_pct: Number(r.completion_pct),
    notes: r.notes,
  }));
});
