-- Synthetic data for Brentford FC | Generated 2026-04-22T11:17:07.907374
-- Table: ai.evaluation_dataset

INSERT INTO ai.evaluation_dataset (dataset_id, dataset_name, evaluation_type, input_data, expected_output, source, difficulty_level, tags, created_at) VALUES
('474de34c-cd0e-5206-b995-0fe515e8516b', 'SECR Section A — Gold Standard', 'report_quality', '{"scope1": 386.6, "scope2_loc": 105.91, "scope3": 99.7, "org": "Brentford FC"}', '{"min_word_count": 200, "must_include": ["GHG Protocol", "DEFRA factors", "operational control"], "tone": "formal_corporate"}', 'human_authored', 3, ARRAY['secr','section_a','uk'], '2026-04-15 10:00:00+00'),
('eefb0fba-a10a-54e6-8f70-9d4d05896b4d', 'Utility Bill Extraction — UK Format', 'extraction_accuracy', '{"bill_type": "electricity", "supplier": "Scottish Power", "format": "uk_standard"}', '{"fields": ["account_number", "period_start", "period_end", "kwh_consumed", "total_cost", "unit_rate"], "accuracy_target": 0.95}', 'historical', 2, ARRAY['extraction','utility_bill','uk'], '2026-04-15 10:00:00+00');
