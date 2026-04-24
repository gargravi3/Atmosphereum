-- Synthetic data for Brentford FC | Generated 2026-04-22T11:17:07.912020
-- Table: master.framework_metric

INSERT INTO master.framework_metric (metric_id, framework_id, metric_code, metric_name, section, subsection, description, data_type, unit_of_measure, is_mandatory, reporting_frequency, assurance_level, platform_field_path) VALUES
('b6892ee4-a39a-5e93-827d-bfadf41af230', '236de482-b691-589c-8e8d-1611cc1ee617', 'SECR-E01', 'UK GHG Scope 1 Emissions', 'Energy & Carbon', 'GHG Emissions', NULL, 'numeric', 'tCO2e', TRUE, 'annual', NULL, NULL),
('dd7f5585-63b9-5666-afc7-40f327454a0d', '236de482-b691-589c-8e8d-1611cc1ee617', 'SECR-E02', 'UK GHG Scope 2 Emissions', 'Energy & Carbon', 'GHG Emissions', NULL, 'numeric', 'tCO2e', TRUE, 'annual', NULL, NULL),
('428a66ee-5ff6-5747-a51f-571bbf50ec25', '236de482-b691-589c-8e8d-1611cc1ee617', 'SECR-E03', 'UK GHG Scope 3 Emissions', 'Energy & Carbon', 'GHG Emissions', NULL, 'numeric', 'tCO2e', FALSE, 'annual', NULL, NULL),
('82093c34-33f3-5785-a10b-81eca7412f00', '236de482-b691-589c-8e8d-1611cc1ee617', 'SECR-E04', 'Total Energy Consumption (UK)', 'Energy & Carbon', 'Energy', NULL, 'numeric', 'kWh', TRUE, 'annual', NULL, NULL),
('4b12cff2-ff90-5728-b270-969266b1af4d', '236de482-b691-589c-8e8d-1611cc1ee617', 'SECR-E05', 'GHG Emissions Intensity Ratio', 'Energy & Carbon', 'Intensity', NULL, 'numeric', 'tCO2e/revenue', TRUE, 'annual', NULL, NULL),
('ea4ba7e2-6b1f-5eea-ba46-7b45a7724f20', '236de482-b691-589c-8e8d-1611cc1ee617', 'SECR-E06', 'Energy Efficiency Narrative', 'Energy & Carbon', 'Narrative', NULL, 'text', NULL, TRUE, 'annual', NULL, NULL),
('05b2c628-481e-5149-ad3e-a5a225b98136', '236de482-b691-589c-8e8d-1611cc1ee617', 'SECR-E07', 'Methodology Statement', 'Energy & Carbon', 'Methodology', NULL, 'text', NULL, TRUE, 'annual', NULL, NULL);
