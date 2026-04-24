-- Synthetic data for Brentford FC | Generated 2026-04-22T11:17:07.946393
-- Table: report.consistency_check

INSERT INTO report.consistency_check (check_id, tenant_id, period_id, check_name, check_type, framework_a_id, framework_b_id, metric_description, value_a, value_b, variance, status, created_at) VALUES
('b1f6f3d9-a04b-586b-beb9-8a3c8fbdf4ec', 'cd4ea9a2-9b2b-5b5c-8a1f-16812572de1d', '7924310f-3ed6-5e1d-864a-fb678991ddd5', 'Scope 1 cross-check SECR vs CDP', 'cross_framework', '236de482-b691-589c-8e8d-1611cc1ee617', '09d6b9b1-7132-5412-a6ba-313b76a75f28', 'Total Scope 1 GHG Emissions (tCO2e)', 386.60, 386.60, 0, 'pass', '2026-04-15 10:00:00+00'),
('80054043-5fdb-504d-b74f-80973901b66d', 'cd4ea9a2-9b2b-5b5c-8a1f-16812572de1d', '7924310f-3ed6-5e1d-864a-fb678991ddd5', 'Scope 1+2 internal consistency', 'internal_consistency', '236de482-b691-589c-8e8d-1611cc1ee617', NULL, 'Scope 1 + Scope 2 = Total Scope 1&2', 492.51, 492.51, 0, 'pass', '2026-04-15 10:00:00+00');
