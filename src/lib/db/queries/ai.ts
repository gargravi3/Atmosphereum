import { cache } from "react";
import { db } from "../client";
import { loadContext } from "../context";

export const loadGenerationLog = cache(async (limit = 50) => {
  const ctx = await loadContext();
  const rows = await db
    .selectFrom("ai.generation_log")
    .selectAll()
    .where("tenant_id", "=", ctx.tenantId)
    .orderBy("created_at", "desc")
    .limit(limit)
    .execute();
  return rows.map((r) => ({
    id: r.generation_id,
    type: r.generation_type,
    provider: r.model_provider,
    model: r.model_name,
    input_tokens: r.input_tokens,
    output_tokens: r.output_tokens,
    confidence: r.confidence_score == null ? null : Number(r.confidence_score),
    cost_usd: r.cost_usd == null ? 0 : Number(r.cost_usd),
    latency_ms: r.latency_ms,
    human_rating: r.human_rating,
    was_accepted: r.was_accepted,
    was_edited: r.was_edited,
    edit_distance: r.edit_distance_pct == null ? null : Number(r.edit_distance_pct),
    linked_entity_type: r.linked_entity_type,
    linked_entity_id: r.linked_entity_id,
    created_at: r.created_at,
  }));
});

export const loadConversations = cache(async () => {
  const ctx = await loadContext();
  const rows = await db
    .selectFrom("ai.assistant_conversation as c")
    .leftJoin("core.user_account as u", "u.user_id", "c.user_id")
    .select([
      "c.conversation_id",
      "c.context_module",
      "c.context_entity_type",
      "c.context_entity_id",
      "c.started_at",
      "c.last_message_at",
      "c.message_count",
      "c.is_active",
      "u.display_name as user_name",
    ])
    .where("c.tenant_id", "=", ctx.tenantId)
    .orderBy("c.last_message_at", "desc")
    .execute();
  return rows.map((r) => ({
    id: r.conversation_id,
    module: r.context_module,
    entity_type: r.context_entity_type,
    entity_id: r.context_entity_id,
    started_at: r.started_at,
    last_message_at: r.last_message_at,
    message_count: r.message_count,
    is_active: r.is_active,
    user: r.user_name,
  }));
});

export const loadMessages = cache(async (conversationId: string) => {
  const rows = await db
    .selectFrom("ai.assistant_message")
    .selectAll()
    .where("conversation_id", "=", conversationId)
    .orderBy("created_at", "asc")
    .execute();
  return rows;
});

export const loadModelPerformance = cache(async () => {
  const rows = await db
    .selectFrom("ai.model_performance")
    .selectAll()
    .orderBy("evaluation_date", "desc")
    .execute();
  return rows.map((r) => ({
    id: r.performance_id,
    model: r.model_name,
    evaluation_type: r.evaluation_type,
    evaluation_date: r.evaluation_date,
    accuracy: r.accuracy_score == null ? null : Number(r.accuracy_score),
    precision: r.precision_score == null ? null : Number(r.precision_score),
    recall: r.recall_score == null ? null : Number(r.recall_score),
    f1: r.f1_score == null ? null : Number(r.f1_score),
    hallucination_rate: r.hallucination_rate == null ? null : Number(r.hallucination_rate),
    human_approval_rate: r.human_approval_rate == null ? null : Number(r.human_approval_rate),
    avg_edit_distance: r.avg_edit_distance == null ? null : Number(r.avg_edit_distance),
    sample_size: r.sample_size,
    is_drift_detected: r.is_drift_detected,
  }));
});
