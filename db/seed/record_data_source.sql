-- Synthetic data for Brentford FC | Generated 2026-04-22T11:17:07.913150
-- Table: record.data_source

INSERT INTO record.data_source (source_id, tenant_id, source_name, source_type, connector_type, sync_schedule, last_sync_at, last_sync_status, last_sync_records, is_active, created_at, updated_at) VALUES
('4db32e56-5f3e-58c0-ac4c-a43b57cccdca', 'cd4ea9a2-9b2b-5b5c-8a1f-16812572de1d', 'Manual Upload (Excel/CSV)', 'file_upload', NULL, 'on_demand', '2026-04-10 14:30:00+00', 'success', 24, TRUE, '2026-04-15 10:00:00+00', '2026-04-15 10:00:00+00'),
('fdf53f1c-2991-5de4-afbb-0ed1b9c23b74', 'cd4ea9a2-9b2b-5b5c-8a1f-16812572de1d', 'Utility Bill Extraction', 'agentic_extraction', 'langraph_multimodal', 'on_demand', '2026-04-08 09:15:00+00', 'success', 6, TRUE, '2026-04-15 10:00:00+00', '2026-04-15 10:00:00+00'),
('0833b14b-19e6-595d-9b05-9eea7bad71c8', 'cd4ea9a2-9b2b-5b5c-8a1f-16812572de1d', 'Stadium IoT Energy Meters', 'iot_mqtt', 'mqtt_broker', 'real_time', '2026-04-15 09:58:00+00', 'success', 48200, TRUE, '2026-04-15 10:00:00+00', '2026-04-15 10:00:00+00'),
('0eb040e0-61e9-55c5-9923-35dd411dccf2', 'cd4ea9a2-9b2b-5b5c-8a1f-16812572de1d', 'Xero Accounting System', 'erp_api', 'airbyte_xero', 'daily', '2026-04-15 02:00:00+00', 'success', 142, TRUE, '2026-04-15 10:00:00+00', '2026-04-15 10:00:00+00'),
('ec07dc41-2fdd-5d32-aced-70f80361f4f1', 'cd4ea9a2-9b2b-5b5c-8a1f-16812572de1d', 'AI Document Processor', 'agentic_extraction', 'langraph_multimodal', 'on_demand', '2026-04-12 11:20:00+00', 'success', 8, TRUE, '2026-04-15 10:00:00+00', '2026-04-15 10:00:00+00');
