-- Synthetic data for Brentford FC | Generated 2026-04-22T11:17:07.911452
-- Table: master.carbon_price

INSERT INTO master.carbon_price (price_id, scheme_name, scheme_code, jurisdiction, price_per_tonne_usd, currency, price_per_tonne_local, price_date, price_type, source) VALUES
('c6f8e4f9-b029-5e43-addd-4e0e957134e9', 'UK Emissions Trading Scheme', 'UK-ETS', 'United Kingdom', 58.50, 'GBP', 46.25, '2026-01-15', 'market', 'ICE Futures Europe'),
('4ee4e1c4-9b1f-5739-b267-4e456e7d40df', 'EU Emissions Trading System', 'EU-ETS', 'European Union', 72.30, 'EUR', 66.82, '2026-01-15', 'market', 'ICE Futures Europe'),
('04c13ea6-2937-52ef-9f99-1b438b40113c', 'BFC Internal Carbon Price', 'BFC-ICP', 'Internal', 100.00, 'USD', 100.00, '2026-01-01', 'internal', 'Board approved'),
('4fa47804-0166-561a-91b3-c83b8cd578ab', 'UK Carbon Floor Price', 'UK-CFP', 'United Kingdom', 23.50, 'GBP', 18.58, '2026-01-01', 'regulatory', 'HMRC');
