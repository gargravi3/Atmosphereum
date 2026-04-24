import { cache } from "react";
import { db } from "../client";
import { loadContext } from "../context";

export const loadQualityRules = cache(async () => {
  const rows = await db
    .selectFrom("dq.quality_rule")
    .selectAll()
    .orderBy("rule_code", "asc")
    .execute();
  return rows.map((r) => ({
    id: r.rule_id,
    code: r.rule_code,
    name: r.rule_name,
    description: r.description,
    type: r.rule_type,
    target_table: r.target_table,
    target_field: r.target_field,
    severity: r.severity,
    is_active: r.is_active,
    logic: r.rule_logic,
  }));
});

export const loadQualityExceptions = cache(async () => {
  const ctx = await loadContext();
  const rows = await db
    .selectFrom("dq.quality_exception as e")
    .leftJoin("dq.quality_rule as r", "r.rule_id", "e.rule_id")
    .leftJoin("core.user_account as assignee", "assignee.user_id", "e.assigned_to")
    .leftJoin("core.user_account as resolver", "resolver.user_id", "e.resolved_by")
    .select([
      "e.exception_id",
      "e.source_table",
      "e.source_record_id",
      "e.source_field",
      "e.severity",
      "e.expected_value",
      "e.actual_value",
      "e.error_message",
      "e.ai_explanation",
      "e.suggested_action",
      "e.status",
      "e.resolved_at",
      "e.resolution_notes",
      "e.resolution_type",
      "e.created_at",
      "r.rule_code",
      "r.rule_name",
      "assignee.display_name as assignee_name",
      "resolver.display_name as resolver_name",
    ])
    .where("e.tenant_id", "=", ctx.tenantId)
    .orderBy("e.created_at", "desc")
    .execute();
  return rows.map((r) => ({
    id: r.exception_id,
    rule_code: r.rule_code,
    rule_name: r.rule_name,
    severity: r.severity,
    source_table: r.source_table,
    source_record_id: r.source_record_id,
    source_field: r.source_field,
    expected: r.expected_value,
    actual: r.actual_value,
    message: r.error_message,
    ai_explanation: r.ai_explanation,
    suggested_action: r.suggested_action,
    status: r.status,
    assignee: r.assignee_name,
    resolver: r.resolver_name,
    resolved_at: r.resolved_at,
    resolution_notes: r.resolution_notes,
    resolution_type: r.resolution_type,
    created_at: r.created_at,
  }));
});

export const loadQualityCheckRuns = cache(async () => {
  const ctx = await loadContext();
  const rows = await db
    .selectFrom("dq.quality_check_run")
    .selectAll()
    .where("tenant_id", "=", ctx.tenantId)
    .orderBy("run_timestamp", "desc")
    .execute();
  return rows.map((r) => ({
    id: r.run_id,
    timestamp: r.run_timestamp,
    trigger_type: r.trigger_type,
    total_rules: r.total_rules_checked,
    passed: r.rules_passed,
    failed: r.rules_failed,
    critical: r.critical_failures,
    warnings: r.warning_failures,
    info: r.info_failures,
    duration_ms: r.duration_ms,
    status: r.status,
  }));
});
