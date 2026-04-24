-- Synthetic data for Brentford FC | Generated 2026-04-22T11:17:07.910483
-- Table: dq.quality_rule

INSERT INTO dq.quality_rule (rule_id, rule_code, rule_name, description, rule_type, target_table, target_field, rule_logic, severity, is_active, created_at) VALUES
('8488901d-338f-514a-a578-30061447a218', 'DQ-001', 'Non-negative emissions', 'Emission values must be >= 0', 'range', 'record.scope1_emission', 'emissions_co2e_kg', '{"type": "range", "min": 0}', 'critical', TRUE, '2026-04-15 10:00:00+00'),
('4a075a99-3ff6-5274-aa61-ba944a24cded', 'DQ-002', 'Reasonable energy consumption', 'kWh values should be within 3x historical average', 'range', 'record.scope2_emission', 'energy_quantity', '{"type": "range", "min": 0, "max_multiplier": 3}', 'warning', TRUE, '2026-04-15 10:00:00+00'),
('99f2fc8f-3ed2-5a4c-893a-bcb3833a0658', 'DQ-003', 'Required emission factor', 'Every emission record must reference a valid emission factor', 'completeness', 'record.scope1_emission', 'emission_factor_id', '{"type": "not_null"}', 'critical', TRUE, '2026-04-15 10:00:00+00'),
('6ba3d951-c7e8-57bb-a863-6e37137b7fed', 'DQ-004', 'Cost-emission directional consistency', 'Cost and emission quantity should be directionally consistent', 'consistency', 'record.scope1_emission', NULL, '{"type": "correlation", "fields": ["activity_quantity", "total_cost"], "direction": "positive"}', 'warning', TRUE, '2026-04-15 10:00:00+00'),
('e70d7a29-4040-5b30-8ba0-3ee46782178a', 'DQ-005', 'YoY variance check', 'Flag if emissions change >50% vs prior period', 'range', 'record.emission_consolidated', 'yoy_change_pct', '{"type": "range", "min": -50, "max": 50}', 'info', TRUE, '2026-04-15 10:00:00+00');
