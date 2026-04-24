-- Synthetic data for Brentford FC | Generated 2026-04-22T11:17:07.911890
-- Table: master.emission_factor_source

INSERT INTO master.emission_factor_source (source_id, source_code, source_name, publisher, country_code, url, description, is_active) VALUES
('c31089a4-a9e5-5144-85fd-f74d9b9db7e5', 'DEFRA-2025', 'UK Government GHG Conversion Factors 2025', 'Department for Energy Security and Net Zero', 'GB', 'https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2025', 'Official UK emission factors for company reporting', TRUE),
('05f76202-cfaf-5207-bfea-11d03d84636a', 'GHG-PROTOCOL', 'GHG Protocol Emission Factors', 'World Resources Institute', NULL, 'https://ghgprotocol.org', 'Global emission factors from the GHG Protocol', TRUE),
('434cb4ee-4b14-5f7b-aac9-a44dae85046c', 'UK-GRID-2025', 'UK Electricity Grid Average 2025', 'National Grid ESO', 'GB', 'https://www.nationalgrideso.com', 'UK national grid average carbon intensity', TRUE);
