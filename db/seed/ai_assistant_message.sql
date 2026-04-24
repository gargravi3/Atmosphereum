-- Synthetic data for Brentford FC | Generated 2026-04-22T11:17:07.907060
-- Table: ai.assistant_message

INSERT INTO ai.assistant_message (message_id, conversation_id, role, content, model_used, tokens_used, cost_usd, latency_ms, created_at) VALUES
('1734d81a-148f-5694-9796-14d380f04ad8', 'daf215a4-8e4d-5f98-afb4-4e397bd213c0', 'user', 'What emission factor should I use for natural gas consumption in the UK for stationary combustion?', NULL, NULL, NULL, NULL, '2026-04-15 10:00:00+00'),
('0a2a613a-7420-5832-a123-744276fc63af', 'daf215a4-8e4d-5f98-afb4-4e397bd213c0', 'assistant', 'For natural gas stationary combustion in the UK, the recommended emission factor is 2.02 kgCO2e per m3 (DEFRA 2025, Table 1c). This includes CO2 (1.89), CH4 (0.04), and N2O (0.09) components.', 'claude-sonnet-4-20250514', 850, 0.02, 3200, '2026-04-15 10:00:00+00'),
('f592b080-c8fb-53e6-91f5-0fea9f4e9d22', 'daf215a4-8e4d-5f98-afb4-4e397bd213c0', 'user', 'How do our Scope 1 emissions compare to Premier League average?', NULL, NULL, NULL, NULL, '2026-04-15 10:00:00+00'),
('d7062a4e-3fe5-5932-a88d-5faeddfb5f7e', 'daf215a4-8e4d-5f98-afb4-4e397bd213c0', 'assistant', 'Your Scope 1 emissions of 1,487 mtCO2e (annualized from Jan-Feb data) are approximately 23% below the estimated Premier League average of ~1,930 mtCO2e per club. Your main advantage is lower mobile combustion - your fleet is 40% smaller than average.', 'claude-sonnet-4-20250514', 920, 0.02, 4100, '2026-04-15 10:00:00+00');
