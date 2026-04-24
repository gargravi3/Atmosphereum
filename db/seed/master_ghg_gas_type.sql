-- Synthetic data for Brentford FC | Generated 2026-04-22T11:17:07.912141
-- Table: master.ghg_gas_type

INSERT INTO master.ghg_gas_type (gas_id, gas_code, gas_name, chemical_formula, gwp_ar5, gwp_ar6, gas_category, is_kyoto_gas) VALUES
('2e689bc7-e260-5033-98f5-d1e0e9627ad4', 'CO2', 'Carbon Dioxide', 'CO2', 1, 1, 'co2', TRUE),
('276ac608-44ed-50a2-9cdf-100fe5d7a60a', 'CH4', 'Methane', 'CH4', 28, 27.9, 'ch4', TRUE),
('8273559d-3bde-5519-bbcd-1bd6720d308f', 'N2O', 'Nitrous Oxide', 'N2O', 265, 273, 'n2o', TRUE),
('171e5538-cf95-5f12-9767-64606e28cfe9', 'R-410A', 'R-410A (Difluoromethane blend)', 'CH2F2/CHF2CF3', 2088, 2088, 'hfc', TRUE),
('5166bb61-e160-5d2f-b8cc-fb3d7d3cfe07', 'R-134A', 'R-134a (1,1,1,2-Tetrafluoroethane)', 'CH2FCF3', 1430, 1526, 'hfc', TRUE),
('0c9ea1d5-64cd-56a6-8982-688653333bc9', 'R-404A', 'R-404A (HFC blend)', NULL, 3922, 3922, 'hfc', TRUE),
('96cd7e8a-5d04-5016-9f9c-886d858f7f1a', 'SF6', 'Sulphur Hexafluoride', 'SF6', 23500, 25200, 'sf6', TRUE),
('d4e722cb-e9bc-5ed3-a98c-2d6e57705517', 'R-22', 'R-22 (Chlorodifluoromethane)', 'CHClF2', 1810, 1960, 'hfc', FALSE);
