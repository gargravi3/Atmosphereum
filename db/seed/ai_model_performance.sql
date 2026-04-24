-- Synthetic data for Brentford FC | Generated 2026-04-22T11:17:07.907919
-- Table: ai.model_performance

INSERT INTO ai.model_performance (performance_id, model_name, evaluation_type, evaluation_date, dataset_id, accuracy_score, hallucination_rate, human_approval_rate, avg_edit_distance, sample_size, is_drift_detected, created_at) VALUES
('778ba6b0-483d-551f-8183-945577c22ffa', 'claude-sonnet-4-20250514', 'report_quality', '2026-04-01', '474de34c-cd0e-5206-b995-0fe515e8516b', 0.94, 0.02, 0.91, 8.5, 25, FALSE, '2026-04-15 10:00:00+00'),
('b6bfa0af-052a-5e07-be65-771ca795fbc0', 'claude-sonnet-4-20250514', 'extraction_accuracy', '2026-04-01', 'eefb0fba-a10a-54e6-8f70-9d4d05896b4d', 0.97, 0.01, 0.96, 2.1, 50, FALSE, '2026-04-15 10:00:00+00');
