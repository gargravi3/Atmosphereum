import { cache } from "react";
import { db } from "../client";
import { loadContext } from "../context";

export const loadPlans = cache(async () => {
  const ctx = await loadContext();
  const rows = await db
    .selectFrom("task.plan")
    .selectAll()
    .where("tenant_id", "=", ctx.tenantId)
    .orderBy("priority", "asc")
    .execute();
  return rows.map((r) => ({
    id: r.plan_id,
    name: r.plan_name,
    description: r.description,
    schedule: r.schedule_cron,
    due_date_rule: r.due_date_rule,
    timezone: r.timezone,
    priority: r.priority,
    status: r.status,
  }));
});

export const loadTasks = cache(async () => {
  const ctx = await loadContext();
  const rows = await db
    .selectFrom("task.task as t")
    .leftJoin("task.plan as p", "p.plan_id", "t.plan_id")
    .leftJoin("core.user_account as assignee", "assignee.user_id", "t.assigned_to")
    .leftJoin("core.user_account as completer", "completer.user_id", "t.completed_by")
    .select([
      "t.task_id",
      "t.task_name",
      "t.description",
      "t.sequence_order",
      "t.priority",
      "t.status",
      "t.due_date",
      "t.completed_at",
      "t.linked_module",
      "t.linked_entity_type",
      "t.linked_entity_id",
      "t.parent_task_id",
      "p.plan_name",
      "assignee.display_name as assignee_name",
      "completer.display_name as completer_name",
    ])
    .where("t.tenant_id", "=", ctx.tenantId)
    .orderBy("t.sequence_order", "asc")
    .execute();
  return rows.map((r) => ({
    id: r.task_id,
    name: r.task_name,
    description: r.description,
    order: r.sequence_order,
    priority: r.priority,
    status: r.status,
    due_date: r.due_date,
    completed_at: r.completed_at,
    module: r.linked_module,
    entity_type: r.linked_entity_type,
    entity_id: r.linked_entity_id,
    parent_task_id: r.parent_task_id,
    plan_name: r.plan_name,
    assignee: r.assignee_name,
    completer: r.completer_name,
  }));
});
