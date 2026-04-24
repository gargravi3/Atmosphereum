import { cache } from "react";
import { db } from "../client";
import { loadContext } from "../context";

export type DataSourceRow = {
  id: string;
  name: string;
  source_type: string;
  connector_type: string | null;
  sync_schedule: string;
  last_sync_at: string | null;
  last_sync_status: string | null;
  last_sync_records: number | null;
  is_active: boolean;
};

export const loadDataSources = cache(async (): Promise<DataSourceRow[]> => {
  const ctx = await loadContext();
  const rows = await db
    .selectFrom("record.data_source")
    .selectAll()
    .where("tenant_id", "=", ctx.tenantId)
    .orderBy("source_name", "asc")
    .execute();
  return rows.map((r) => ({
    id: r.source_id,
    name: r.source_name,
    source_type: r.source_type,
    connector_type: r.connector_type,
    sync_schedule: r.sync_schedule ?? "on_demand",
    last_sync_at: r.last_sync_at as unknown as string | null,
    last_sync_status: r.last_sync_status,
    last_sync_records: r.last_sync_records,
    is_active: r.is_active,
  }));
});

export const loadDocumentUploads = cache(async () => {
  const ctx = await loadContext();
  const rows = await db
    .selectFrom("record.document_upload as d")
    .leftJoin("core.facility as f", "f.facility_id", "d.facility_id")
    .leftJoin("core.user_account as u", "u.user_id", "d.uploaded_by")
    .select([
      "d.document_id",
      "d.file_name",
      "d.file_type",
      "d.file_size_bytes",
      "d.document_type",
      "d.processing_status",
      "d.confidence_score",
      "d.extraction_result",
      "d.linked_record_id",
      "d.linked_record_type",
      "d.created_at",
      "f.facility_name",
      "u.display_name as uploader",
    ])
    .where("d.tenant_id", "=", ctx.tenantId)
    .orderBy("d.created_at", "desc")
    .execute();
  return rows.map((r) => ({
    id: r.document_id,
    filename: r.file_name,
    file_type: r.file_type,
    size_bytes: r.file_size_bytes == null ? 0 : Number(r.file_size_bytes),
    document_type: r.document_type,
    status: r.processing_status,
    confidence: r.confidence_score == null ? null : Number(r.confidence_score),
    extraction: r.extraction_result,
    linked_record_id: r.linked_record_id,
    linked_record_type: r.linked_record_type,
    created_at: r.created_at as unknown as string,
    facility_name: r.facility_name,
    uploader: r.uploader,
  }));
});

export const loadIotReadings = cache(async (sensorId?: string) => {
  const ctx = await loadContext();
  let query = db
    .selectFrom("record.iot_reading as r")
    .leftJoin("core.facility as f", "f.facility_id", "r.facility_id")
    .select([
      "r.reading_id",
      "r.facility_id",
      "r.sensor_id",
      "r.sensor_type",
      "r.reading_timestamp",
      "r.reading_value",
      "r.reading_unit",
      "r.is_anomaly",
      "r.anomaly_type",
      "f.facility_name",
    ])
    .where("r.tenant_id", "=", ctx.tenantId);
  if (sensorId) query = query.where("r.sensor_id", "=", sensorId);
  const rows = await query.orderBy("r.reading_timestamp", "asc").execute();
  return rows.map((r) => ({
    id: r.reading_id,
    facility_id: r.facility_id,
    facility_name: r.facility_name,
    sensor_id: r.sensor_id,
    sensor_type: r.sensor_type,
    timestamp: r.reading_timestamp as unknown as string,
    value: Number(r.reading_value),
    unit: r.reading_unit,
    is_anomaly: r.is_anomaly,
    anomaly_type: r.anomaly_type,
  }));
});
