-- ============================================================================
-- ATMOSPHEREUM ESG PLATFORM — COMPLETE DATABASE SCHEMA
-- Version 1.0 | April 2026
-- 
-- Multi-tenant SaaS platform for ESG Record, Reduce & Report
-- PostgreSQL 16+ compatible
--
-- SCHEMA ORGANIZATION:
--   core.*        — Tenant, organization, users, roles
--   master.*      — Reference data (emission factors, currencies, carbon pricing)
--   record.*      — Scope 1/2/3 emission calculations, data sources, IoT
--   supplier.*    — Supplier profiles, invoices, scoring, onboarding
--   reduce.*      — Should-cost models, waste pools, opportunities, initiatives
--   report.*      — Report generation, framework mappings, exports
--   govern.*      — Approvals, audit trail, materiality, compliance
--   ai.*          — AI generations, evaluations, assistant conversations
--   dq.*          — Data quality checks, exceptions, resolutions
-- ============================================================================

-- ============================================================================
-- SCHEMA: core (Tenant, Organization, Users, Access Control)
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS core;

-- TABLE 1: core.tenant
-- The root entity for multi-tenancy. Every row in every other table
-- references a tenant_id. Schema-per-tenant isolation is enforced at the
-- application layer; this table is the registry.
CREATE TABLE core.tenant (
    tenant_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_name         VARCHAR(255) NOT NULL,
    tenant_slug         VARCHAR(100) NOT NULL UNIQUE,
    subscription_tier   VARCHAR(50) NOT NULL DEFAULT 'standard',  -- standard, professional, enterprise
    max_users           INT NOT NULL DEFAULT 25,
    max_entities        INT NOT NULL DEFAULT 10,
    data_residency      VARCHAR(10) NOT NULL DEFAULT 'IN',  -- IN, AE, EU, US, AU
    keycloak_realm_id   VARCHAR(255),
    status              VARCHAR(20) NOT NULL DEFAULT 'active',  -- active, suspended, trial, churned
    trial_expires_at    TIMESTAMPTZ,
    contract_start      DATE,
    contract_end        DATE,
    billing_currency    CHAR(3) NOT NULL DEFAULT 'USD',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE 2: core.organization
-- Hierarchical organization structure. Supports group → subsidiary →
-- business_unit → department. The consolidation structure for group-level
-- reporting is derived from this hierarchy.
CREATE TABLE core.organization (
    org_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    parent_org_id       UUID REFERENCES core.organization(org_id),
    org_code            VARCHAR(50) NOT NULL,
    org_name            VARCHAR(255) NOT NULL,
    org_type            VARCHAR(50) NOT NULL,  -- group, subsidiary, business_unit, department
    legal_name          VARCHAR(255),
    registration_number VARCHAR(100),
    tax_id              VARCHAR(100),
    industry_code       VARCHAR(20),  -- ISIC / NACE code
    industry_name       VARCHAR(255),
    country_code        CHAR(2) NOT NULL,
    state_code          VARCHAR(10),
    city                VARCHAR(100),
    address             TEXT,
    postal_code         VARCHAR(20),
    reporting_currency  CHAR(3) NOT NULL DEFAULT 'USD',
    fiscal_year_start   INT NOT NULL DEFAULT 4,  -- month (1-12)
    is_listed           BOOLEAN NOT NULL DEFAULT FALSE,
    stock_exchange      VARCHAR(50),
    market_cap_usd      DECIMAL(18,2),
    annual_revenue_usd  DECIMAL(18,2),
    employee_count      INT,
    status              VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, org_code)
);

-- TABLE 3: core.facility
-- Physical locations (factories, offices, warehouses, stadiums, stores).
-- Each facility has geographic, operational, and energy attributes that feed
-- the should-cost models in the Reduce module.
CREATE TABLE core.facility (
    facility_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    org_id              UUID NOT NULL REFERENCES core.organization(org_id),
    facility_code       VARCHAR(50) NOT NULL,
    facility_name       VARCHAR(255) NOT NULL,
    facility_type       VARCHAR(50) NOT NULL,  -- office, factory, warehouse, retail_store, stadium, data_center
    branch_id           VARCHAR(50),
    branch_name         VARCHAR(255),
    address_line1       VARCHAR(255),
    address_line2       VARCHAR(255),
    city                VARCHAR(100) NOT NULL,
    city_code           VARCHAR(20),
    state_name          VARCHAR(100),
    state_code          VARCHAR(20),
    country_name        VARCHAR(100) NOT NULL,
    country_code        CHAR(2) NOT NULL,
    postal_code         VARCHAR(20),
    latitude            DECIMAL(10,7),
    longitude           DECIMAL(10,7),
    timezone            VARCHAR(50),
    floor_area_sqm      DECIMAL(12,2),
    production_capacity DECIMAL(12,2),
    capacity_unit       VARCHAR(50),
    operating_hours_day DECIMAL(4,1),
    operating_days_year INT,
    climate_zone        VARCHAR(50),  -- tropical, subtropical, temperate, continental, polar
    grid_region         VARCHAR(100),  -- for location-based Scope 2
    ownership_type      VARCHAR(30),  -- owned, leased, franchised
    lease_start_date    DATE,
    lease_end_date      DATE,
    commissioning_date  DATE,
    decommissioning_date DATE,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, facility_code)
);

-- TABLE 4: core.user_account
-- Platform users. Authentication is handled by Keycloak; this table stores
-- platform-specific profile data and preferences.
CREATE TABLE core.user_account (
    user_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    keycloak_user_id    VARCHAR(255) NOT NULL,
    email               VARCHAR(255) NOT NULL,
    first_name          VARCHAR(100),
    last_name           VARCHAR(100),
    display_name        VARCHAR(255),
    job_title           VARCHAR(100),
    department          VARCHAR(100),
    phone               VARCHAR(30),
    preferred_language  CHAR(2) NOT NULL DEFAULT 'en',
    preferred_timezone  VARCHAR(50) NOT NULL DEFAULT 'UTC',
    avatar_url          VARCHAR(500),
    last_login_at       TIMESTAMPTZ,
    login_count         INT NOT NULL DEFAULT 0,
    status              VARCHAR(20) NOT NULL DEFAULT 'active',  -- active, disabled, invited, locked
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);

-- TABLE 5: core.role
-- RBAC roles. Pre-seeded with standard roles; tenants can create custom roles.
CREATE TABLE core.role (
    role_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    role_name           VARCHAR(100) NOT NULL,
    role_code           VARCHAR(50) NOT NULL,
    description         TEXT,
    is_system_role      BOOLEAN NOT NULL DEFAULT FALSE,  -- true for pre-seeded roles
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, role_code)
);

-- TABLE 6: core.permission
-- Granular permissions per module, per action type.
CREATE TABLE core.permission (
    permission_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    permission_code     VARCHAR(100) NOT NULL UNIQUE,
    module              VARCHAR(50) NOT NULL,  -- command_center, record, reduce, report, govern, settings
    resource            VARCHAR(100) NOT NULL,  -- scope1, scope2, scope3, initiative, report, approval
    action              VARCHAR(30) NOT NULL,  -- read, write, delete, approve, export, admin
    description         TEXT
);

-- TABLE 7: core.role_permission
-- Maps roles to permissions. A role can have many permissions.
CREATE TABLE core.role_permission (
    role_id             UUID NOT NULL REFERENCES core.role(role_id),
    permission_id       UUID NOT NULL REFERENCES core.permission(permission_id),
    PRIMARY KEY (role_id, permission_id)
);

-- TABLE 8: core.user_role
-- Assigns roles to users, scoped to specific organizations/facilities.
-- A user may have different roles for different entities (e.g., Analyst for
-- India entities, read-only for GCC entities).
CREATE TABLE core.user_role (
    user_role_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES core.user_account(user_id),
    role_id             UUID NOT NULL REFERENCES core.role(role_id),
    org_id              UUID REFERENCES core.organization(org_id),  -- NULL = all orgs
    facility_id         UUID REFERENCES core.facility(facility_id),  -- NULL = all facilities in org
    granted_by          UUID REFERENCES core.user_account(user_id),
    granted_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at          TIMESTAMPTZ
);

-- TABLE 9: core.notification
-- Platform notifications for all event types (approvals, deadlines, alerts).
CREATE TABLE core.notification (
    notification_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    user_id             UUID NOT NULL REFERENCES core.user_account(user_id),
    notification_type   VARCHAR(50) NOT NULL,  -- approval_request, deadline_reminder, anomaly_alert, system
    title               VARCHAR(255) NOT NULL,
    body                TEXT,
    link_module         VARCHAR(50),
    link_entity_type    VARCHAR(50),
    link_entity_id      UUID,
    is_read             BOOLEAN NOT NULL DEFAULT FALSE,
    read_at             TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SCHEMA: master (Reference Data, Emission Factors, Currencies, Carbon Pricing)
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS master;

-- TABLE 10: master.emission_factor_source
-- Registry of emission factor databases (DEFRA, EPA, GHG Protocol, India CEA, etc.)
CREATE TABLE master.emission_factor_source (
    source_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_code         VARCHAR(50) NOT NULL UNIQUE,
    source_name         VARCHAR(255) NOT NULL,
    publisher           VARCHAR(255),
    country_code        CHAR(2),  -- NULL = global
    url                 VARCHAR(500),
    description         TEXT,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE
);

-- TABLE 11: master.emission_factor
-- The core emission factor database. Versioned by year with full lineage.
-- This is the most frequently referenced lookup table in the platform.
CREATE TABLE master.emission_factor (
    factor_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id           UUID NOT NULL REFERENCES master.emission_factor_source(source_id),
    factor_code         VARCHAR(100),
    scope               VARCHAR(10) NOT NULL,  -- scope1, scope2, scope3
    category            VARCHAR(100) NOT NULL,  -- stationary_combustion, mobile_combustion, purchased_electricity, etc.
    subcategory         VARCHAR(100),
    fuel_type           VARCHAR(100),
    gas_type            VARCHAR(100),
    activity_type       VARCHAR(100),
    unit_of_measure     VARCHAR(50) NOT NULL,  -- kgCO2e/kWh, kgCO2e/litre, kgCO2e/m3, kgCO2e/USD
    factor_co2          DECIMAL(18,10) NOT NULL DEFAULT 0,
    factor_ch4          DECIMAL(18,10) NOT NULL DEFAULT 0,
    factor_n2o          DECIMAL(18,10) NOT NULL DEFAULT 0,
    factor_total_co2e   DECIMAL(18,10) NOT NULL,  -- total CO2-equivalent
    gwp_co2             DECIMAL(10,2) NOT NULL DEFAULT 1,
    gwp_ch4             DECIMAL(10,2) NOT NULL DEFAULT 28,
    gwp_n2o             DECIMAL(10,2) NOT NULL DEFAULT 265,
    country_code        CHAR(2),  -- NULL = global
    region              VARCHAR(100),
    applicable_year     INT NOT NULL,
    effective_from      DATE NOT NULL,
    effective_to        DATE,
    version             INT NOT NULL DEFAULT 1,
    is_current          BOOLEAN NOT NULL DEFAULT TRUE,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_ef_lookup ON master.emission_factor(scope, category, fuel_type, country_code, applicable_year, is_current);

-- TABLE 12: master.currency_rate
-- Daily FX rates for multi-currency consolidation.
CREATE TABLE master.currency_rate (
    rate_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_currency       CHAR(3) NOT NULL,
    to_currency         CHAR(3) NOT NULL,
    rate_date           DATE NOT NULL,
    exchange_rate       DECIMAL(18,8) NOT NULL,
    source              VARCHAR(100),  -- ECB, RBI, fed_reserve
    UNIQUE(from_currency, to_currency, rate_date)
);

-- TABLE 13: master.carbon_price
-- Carbon pricing data by jurisdiction (EU ETS, UK ETS, internal carbon prices).
CREATE TABLE master.carbon_price (
    price_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_name         VARCHAR(255) NOT NULL,
    scheme_code         VARCHAR(50) NOT NULL,
    jurisdiction        VARCHAR(100) NOT NULL,
    price_per_tonne_usd DECIMAL(10,2) NOT NULL,
    currency            CHAR(3) NOT NULL,
    price_per_tonne_local DECIMAL(10,2) NOT NULL,
    price_date          DATE NOT NULL,
    price_type          VARCHAR(30) NOT NULL,  -- market, internal, shadow, regulatory
    source              VARCHAR(255),
    UNIQUE(scheme_code, price_date)
);

-- TABLE 14: master.industry_benchmark
-- Industry-level benchmarks for carbon and cost intensity.
-- Used by should-cost models and for peer comparison.
CREATE TABLE master.industry_benchmark (
    benchmark_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    industry_code       VARCHAR(20) NOT NULL,
    industry_name       VARCHAR(255) NOT NULL,
    metric_name         VARCHAR(100) NOT NULL,  -- energy_intensity_kwh_per_sqm, carbon_intensity_tco2e_per_revenue
    metric_unit         VARCHAR(50) NOT NULL,
    benchmark_value     DECIMAL(18,6) NOT NULL,
    percentile_25       DECIMAL(18,6),
    percentile_50       DECIMAL(18,6),
    percentile_75       DECIMAL(18,6),
    geography           VARCHAR(100),
    source              VARCHAR(255),
    reference_year      INT NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE 15: master.regulatory_framework
-- Registry of all supported ESG reporting frameworks.
CREATE TABLE master.regulatory_framework (
    framework_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    framework_code      VARCHAR(50) NOT NULL UNIQUE,
    framework_name      VARCHAR(255) NOT NULL,
    issuing_body        VARCHAR(255),
    jurisdiction        VARCHAR(100) NOT NULL,  -- EU, India, US-California, Australia, Global
    framework_type      VARCHAR(50) NOT NULL,  -- mandatory, voluntary
    effective_date      DATE,
    first_reporting_year INT,
    description         TEXT,
    url                 VARCHAR(500),
    is_active           BOOLEAN NOT NULL DEFAULT TRUE
);

-- TABLE 16: master.framework_metric
-- Individual disclosure metrics required by each framework.
-- This is the backbone of the Framework Mapper in the Report module.
CREATE TABLE master.framework_metric (
    metric_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    framework_id        UUID NOT NULL REFERENCES master.regulatory_framework(framework_id),
    metric_code         VARCHAR(100) NOT NULL,
    metric_name         VARCHAR(255) NOT NULL,
    section             VARCHAR(100),
    subsection          VARCHAR(100),
    description         TEXT,
    data_type           VARCHAR(30) NOT NULL,  -- numeric, text, boolean, date, enum
    unit_of_measure     VARCHAR(50),
    is_mandatory        BOOLEAN NOT NULL DEFAULT TRUE,
    reporting_frequency VARCHAR(20) NOT NULL DEFAULT 'annual',  -- annual, biennial, quarterly
    assurance_level     VARCHAR(20),  -- none, limited, reasonable
    platform_field_path VARCHAR(500),  -- JSON path to the platform data field that maps to this metric
    UNIQUE(framework_id, metric_code)
);

-- TABLE 17: master.ghg_gas_type
-- Reference table for greenhouse gases and their properties.
CREATE TABLE master.ghg_gas_type (
    gas_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gas_code            VARCHAR(20) NOT NULL UNIQUE,
    gas_name            VARCHAR(100) NOT NULL,
    chemical_formula    VARCHAR(50),
    gwp_ar5             DECIMAL(10,2),  -- IPCC AR5 100-year GWP
    gwp_ar6             DECIMAL(10,2),  -- IPCC AR6 100-year GWP
    gas_category        VARCHAR(50),  -- co2, ch4, n2o, hfc, pfc, sf6, nf3
    is_kyoto_gas        BOOLEAN NOT NULL DEFAULT TRUE
);

-- TABLE 18: master.incentive_program
-- Government incentives, subsidies, and green financing programs by jurisdiction.
-- Used by the AI ideation engine in the Reduce module.
CREATE TABLE master.incentive_program (
    incentive_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_name        VARCHAR(255) NOT NULL,
    program_code        VARCHAR(50),
    jurisdiction        VARCHAR(100) NOT NULL,
    agency              VARCHAR(255),
    incentive_type      VARCHAR(50) NOT NULL,  -- tax_credit, grant, rebate, loan, feed_in_tariff
    applicable_sectors  TEXT[],
    applicable_activities TEXT[],  -- energy_efficiency, renewable_energy, fleet_electrification
    max_amount_usd      DECIMAL(18,2),
    percentage_coverage DECIMAL(5,2),
    application_deadline DATE,
    program_start_date  DATE,
    program_end_date    DATE,
    url                 VARCHAR(500),
    description         TEXT,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SCHEMA: record (Scope 1/2/3 Emission Records, Data Sources, IoT)
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS record;

-- TABLE 19: record.data_source
-- Registry of all configured data connections (ERP, IoT, file upload, API).
CREATE TABLE record.data_source (
    source_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    source_name         VARCHAR(255) NOT NULL,
    source_type         VARCHAR(50) NOT NULL,  -- erp_api, iot_mqtt, file_upload, agentic_extraction, rest_api, manual
    connector_type      VARCHAR(50),  -- airbyte_sap, airbyte_oracle, airbyte_netsuite, mqtt_broker, custom
    connection_config   JSONB,  -- encrypted connection parameters
    sync_schedule       VARCHAR(50),  -- hourly, daily, weekly, monthly, real_time, on_demand
    last_sync_at        TIMESTAMPTZ,
    last_sync_status    VARCHAR(20),  -- success, warning, error, running
    last_sync_records   INT,
    error_message       TEXT,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE 20: record.reporting_period
-- Defines reporting periods for emission calculations. A period is the unit
-- of data collection (monthly, quarterly, or annual).
CREATE TABLE record.reporting_period (
    period_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    org_id              UUID NOT NULL REFERENCES core.organization(org_id),
    period_start        DATE NOT NULL,
    period_end          DATE NOT NULL,
    period_type         VARCHAR(20) NOT NULL,  -- monthly, quarterly, annual
    fiscal_year         VARCHAR(10) NOT NULL,  -- e.g., 'FY2025-26'
    status              VARCHAR(20) NOT NULL DEFAULT 'open',  -- open, under_review, closed, locked
    locked_by           UUID REFERENCES core.user_account(user_id),
    locked_at           TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, org_id, period_start, period_end)
);

-- TABLE 21: record.emission_batch
-- A batch represents a single data submission/calculation run for a facility
-- and period. Batches go through a workflow: draft → submitted → reviewed → approved.
CREATE TABLE record.emission_batch (
    batch_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    org_id              UUID NOT NULL REFERENCES core.organization(org_id),
    facility_id         UUID NOT NULL REFERENCES core.facility(facility_id),
    period_id           UUID NOT NULL REFERENCES record.reporting_period(period_id),
    scope               VARCHAR(10) NOT NULL,  -- scope1, scope2, scope3
    data_source_id      UUID REFERENCES record.data_source(source_id),
    workflow_stage       VARCHAR(30) NOT NULL DEFAULT 'draft',
    -- draft, submitted, data_review, emissions_approved, process_cancelled
    submitted_by        UUID REFERENCES core.user_account(user_id),
    submitted_at        TIMESTAMPTZ,
    reviewed_by         UUID REFERENCES core.user_account(user_id),
    reviewed_at         TIMESTAMPTZ,
    approved_by         UUID REFERENCES core.user_account(user_id),
    approved_at         TIMESTAMPTZ,
    total_emissions_co2e DECIMAL(18,6),  -- aggregated from records
    total_cost          DECIMAL(18,2),
    record_count        INT NOT NULL DEFAULT 0,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE 22: record.scope1_emission
-- Individual Scope 1 emission calculation records. Each row represents one
-- emission source (one piece of equipment, one fuel type, one period).
-- This is the core transactional table for Scope 1.
CREATE TABLE record.scope1_emission (
    record_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    batch_id            UUID NOT NULL REFERENCES record.emission_batch(batch_id),
    org_id              UUID NOT NULL REFERENCES core.organization(org_id),
    facility_id         UUID NOT NULL REFERENCES core.facility(facility_id),
    period_start        DATE NOT NULL,
    period_end          DATE NOT NULL,
    -- Source classification
    equipment_category  VARCHAR(50) NOT NULL,  -- stationary_combustion, mobile_combustion, process, fugitive, agricultural
    equipment_name      VARCHAR(255),
    equipment_id        VARCHAR(100),
    -- Activity data
    fuel_type           VARCHAR(100),
    gas_type            VARCHAR(100),  -- for fugitive: R-410A, R-134a, CO2, etc.
    activity_quantity   DECIMAL(18,6) NOT NULL,
    activity_uom        VARCHAR(30) NOT NULL,  -- litres, m3, kg, kWh, km
    -- Emission factors applied
    emission_factor_id  UUID REFERENCES master.emission_factor(factor_id),
    ef_co2              DECIMAL(18,10) NOT NULL DEFAULT 0,
    ef_ch4              DECIMAL(18,10) NOT NULL DEFAULT 0,
    ef_n2o              DECIMAL(18,10) NOT NULL DEFAULT 0,
    gwp_co2             DECIMAL(10,2) NOT NULL DEFAULT 1,
    gwp_ch4             DECIMAL(10,2) NOT NULL DEFAULT 28,
    gwp_n2o             DECIMAL(10,2) NOT NULL DEFAULT 265,
    -- Calculated emissions
    emissions_co2_kg    DECIMAL(18,6) NOT NULL DEFAULT 0,
    emissions_ch4_kg    DECIMAL(18,6) NOT NULL DEFAULT 0,
    emissions_n2o_kg    DECIMAL(18,6) NOT NULL DEFAULT 0,
    emissions_co2e_kg   DECIMAL(18,6) NOT NULL,  -- total in kg CO2-equivalent
    emissions_co2e_t    DECIMAL(18,6) NOT NULL,  -- total in tonnes CO2-equivalent
    -- Cost data (dual-metric)
    total_cost          DECIMAL(18,2),
    cost_currency       CHAR(3),
    cost_usd            DECIMAL(18,2),
    unit_cost           DECIMAL(18,6),
    emission_intensity  DECIMAL(18,10),  -- tCO2e per unit of output
    -- Metadata
    data_source_type    VARCHAR(30),  -- sensor, invoice, manual, api, ai_extracted
    source_document_id  UUID,
    calculation_method  VARCHAR(50),  -- direct_measurement, fuel_based, distance_based
    uncertainty_pct     DECIMAL(5,2),
    notes               TEXT,
    created_by          UUID REFERENCES core.user_account(user_id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_s1_lookup ON record.scope1_emission(tenant_id, facility_id, period_start, equipment_category);

-- TABLE 23: record.scope2_emission
-- Individual Scope 2 emission calculation records. Stores both location-based
-- and market-based calculations simultaneously.
CREATE TABLE record.scope2_emission (
    record_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    batch_id            UUID NOT NULL REFERENCES record.emission_batch(batch_id),
    org_id              UUID NOT NULL REFERENCES core.organization(org_id),
    facility_id         UUID NOT NULL REFERENCES core.facility(facility_id),
    period_start        DATE NOT NULL,
    period_end          DATE NOT NULL,
    -- Source classification
    utility_type        VARCHAR(50) NOT NULL,  -- purchased_electricity, purchased_steam, purchased_heat, purchased_cooling
    -- Activity data
    energy_quantity     DECIMAL(18,6) NOT NULL,
    energy_uom          VARCHAR(30) NOT NULL,  -- kWh, MWh, GJ, therms
    -- Supplier / grid info
    energy_supplier     VARCHAR(255),
    supplier_account_id VARCHAR(100),
    grid_region         VARCHAR(100),
    is_renewable        BOOLEAN NOT NULL DEFAULT FALSE,
    renewable_pct       DECIMAL(5,2) NOT NULL DEFAULT 0,
    rec_certificate_id  VARCHAR(100),
    -- Location-based emission factors
    location_ef_id      UUID REFERENCES master.emission_factor(factor_id),
    location_ef_co2     DECIMAL(18,10) NOT NULL DEFAULT 0,
    location_ef_ch4     DECIMAL(18,10) NOT NULL DEFAULT 0,
    location_ef_n2o     DECIMAL(18,10) NOT NULL DEFAULT 0,
    -- Market-based emission factors
    market_ef_id        UUID REFERENCES master.emission_factor(factor_id),
    supplier_ef_co2     DECIMAL(18,10) NOT NULL DEFAULT 0,
    supplier_ef_ch4     DECIMAL(18,10) NOT NULL DEFAULT 0,
    supplier_ef_n2o     DECIMAL(18,10) NOT NULL DEFAULT 0,
    -- Calculated emissions (both methods)
    location_emissions_co2e_kg  DECIMAL(18,6) NOT NULL,
    location_emissions_co2e_t   DECIMAL(18,6) NOT NULL,
    market_emissions_co2e_kg    DECIMAL(18,6) NOT NULL DEFAULT 0,
    market_emissions_co2e_t     DECIMAL(18,6) NOT NULL DEFAULT 0,
    -- Cost data (dual-metric)
    total_cost          DECIMAL(18,2),
    cost_currency       CHAR(3),
    cost_usd            DECIMAL(18,2),
    tariff_rate         DECIMAL(10,4),
    tariff_uom          VARCHAR(30),
    -- Metadata
    data_source_type    VARCHAR(30),
    source_document_id  UUID,
    notes               TEXT,
    created_by          UUID REFERENCES core.user_account(user_id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_s2_lookup ON record.scope2_emission(tenant_id, facility_id, period_start, utility_type);

-- TABLE 24: record.scope3_emission
-- Individual Scope 3 emission records across all 15 GHG Protocol categories.
-- Uses a flexible structure with category-specific fields in JSONB.
CREATE TABLE record.scope3_emission (
    record_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    batch_id            UUID NOT NULL REFERENCES record.emission_batch(batch_id),
    org_id              UUID NOT NULL REFERENCES core.organization(org_id),
    facility_id         UUID REFERENCES core.facility(facility_id),
    period_start        DATE NOT NULL,
    period_end          DATE NOT NULL,
    -- Scope 3 category (1-15)
    category_number     INT NOT NULL CHECK (category_number BETWEEN 1 AND 15),
    category_name       VARCHAR(100) NOT NULL,
    -- Calculation method
    calculation_method  VARCHAR(50) NOT NULL,  -- spend_based, average_data, supplier_specific, hybrid
    -- Activity data
    activity_description VARCHAR(255),
    activity_quantity   DECIMAL(18,6),
    activity_uom        VARCHAR(50),
    spend_amount        DECIMAL(18,2),
    spend_currency      CHAR(3),
    spend_usd           DECIMAL(18,2),
    -- Emission factors
    emission_factor_id  UUID REFERENCES master.emission_factor(factor_id),
    ef_value            DECIMAL(18,10),
    ef_unit             VARCHAR(50),
    -- Calculated emissions
    emissions_co2e_kg   DECIMAL(18,6) NOT NULL,
    emissions_co2e_t    DECIMAL(18,6) NOT NULL,
    -- Supplier link (for categories 1, 2, 4, 9, 12)
    supplier_id         UUID,  -- FK to supplier.supplier
    invoice_id          UUID,  -- FK to supplier.invoice
    -- Category-specific data (flexible schema)
    category_data       JSONB,
    -- e.g., for cat 6 (business travel): { "travel_type": "air", "distance_km": 5200, "class": "economy" }
    -- e.g., for cat 5 (waste): { "waste_type": "general", "disposal_method": "landfill", "weight_kg": 1500 }
    -- Metadata
    data_source_type    VARCHAR(30),
    source_document_id  UUID,
    data_quality_score  INT CHECK (data_quality_score BETWEEN 1 AND 5),
    notes               TEXT,
    created_by          UUID REFERENCES core.user_account(user_id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_s3_lookup ON record.scope3_emission(tenant_id, category_number, period_start);

-- TABLE 25: record.scope3_category_summary
-- Aggregated view per Scope 3 category per period. Materialized for dashboard performance.
CREATE TABLE record.scope3_category_summary (
    summary_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    org_id              UUID NOT NULL REFERENCES core.organization(org_id),
    period_id           UUID NOT NULL REFERENCES record.reporting_period(period_id),
    category_number     INT NOT NULL,
    category_name       VARCHAR(100) NOT NULL,
    total_emissions_co2e_t DECIMAL(18,6) NOT NULL,
    total_spend_usd     DECIMAL(18,2),
    record_count        INT NOT NULL,
    primary_method      VARCHAR(50),
    data_quality_avg    DECIMAL(3,1),
    calculated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, org_id, period_id, category_number)
);

-- TABLE 26: record.emission_consolidated
-- Organization-level emission rollups. Pre-calculated for dashboard and
-- reporting performance. Refreshed after every batch approval.
CREATE TABLE record.emission_consolidated (
    consolidation_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    org_id              UUID NOT NULL REFERENCES core.organization(org_id),
    facility_id         UUID REFERENCES core.facility(facility_id),  -- NULL = org-level total
    period_id           UUID NOT NULL REFERENCES record.reporting_period(period_id),
    -- Scope totals (tonnes CO2e)
    scope1_total        DECIMAL(18,6) NOT NULL DEFAULT 0,
    scope2_location     DECIMAL(18,6) NOT NULL DEFAULT 0,
    scope2_market       DECIMAL(18,6) NOT NULL DEFAULT 0,
    scope3_total        DECIMAL(18,6),  -- nullable: Scope 3 typically aggregates at org level only
    total_all_scopes    DECIMAL(18,6) NOT NULL DEFAULT 0,
    -- Cost totals (USD)
    scope1_cost_usd     DECIMAL(18,2) NOT NULL DEFAULT 0,
    scope2_cost_usd     DECIMAL(18,2) NOT NULL DEFAULT 0,
    scope3_cost_usd     DECIMAL(18,2),  -- nullable: matches scope3_total semantics
    -- Carbon liability
    carbon_price_used   DECIMAL(10,2),
    carbon_liability_usd DECIMAL(18,2),
    -- Intensity metrics
    emission_intensity_revenue DECIMAL(18,10),  -- tCO2e per $M revenue
    emission_intensity_employee DECIMAL(18,10),  -- tCO2e per employee
    energy_intensity_sqm DECIMAL(18,10),  -- kWh per sqm
    -- Comparison
    prior_period_total  DECIMAL(18,6),
    yoy_change_pct      DECIMAL(8,4),
    target_total        DECIMAL(18,6),
    variance_to_target  DECIMAL(18,6),
    calculated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, org_id, facility_id, period_id)
);

-- TABLE 27: record.document_upload
-- Tracks all uploaded documents (utility bills, invoices, certificates)
-- processed by the AI extraction agent.
CREATE TABLE record.document_upload (
    document_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    org_id              UUID NOT NULL REFERENCES core.organization(org_id),
    facility_id         UUID REFERENCES core.facility(facility_id),
    file_name           VARCHAR(255) NOT NULL,
    file_type           VARCHAR(10) NOT NULL,  -- pdf, jpg, png, xlsx, csv
    file_size_bytes     BIGINT,
    storage_path        VARCHAR(500) NOT NULL,
    document_type       VARCHAR(50) NOT NULL,  -- utility_bill, freight_invoice, supplier_certificate, waste_manifest
    processing_status   VARCHAR(30) NOT NULL DEFAULT 'pending',  -- pending, processing, extracted, validated, error
    extraction_result   JSONB,  -- structured extracted data
    confidence_score    DECIMAL(5,2),
    reviewed_by         UUID REFERENCES core.user_account(user_id),
    reviewed_at         TIMESTAMPTZ,
    linked_record_id    UUID,
    linked_record_type  VARCHAR(30),  -- scope1, scope2, scope3
    uploaded_by         UUID REFERENCES core.user_account(user_id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE 28: record.iot_reading
-- Real-time IoT sensor data (energy meters, water flow, refrigerant monitors).
-- High-volume table — partitioned by month.
CREATE TABLE record.iot_reading (
    reading_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    facility_id         UUID NOT NULL REFERENCES core.facility(facility_id),
    sensor_id           VARCHAR(100) NOT NULL,
    sensor_type         VARCHAR(50) NOT NULL,  -- energy_meter, water_meter, gas_meter, refrigerant_sensor, temperature
    reading_timestamp   TIMESTAMPTZ NOT NULL,
    reading_value       DECIMAL(18,6) NOT NULL,
    reading_unit        VARCHAR(30) NOT NULL,
    is_anomaly          BOOLEAN NOT NULL DEFAULT FALSE,
    anomaly_type        VARCHAR(50),
    raw_payload         JSONB
);
-- NOTE: Original schema had `PARTITION BY RANGE (reading_timestamp)` but that
-- requires the primary key to include the partition column and explicit partition
-- creation before inserts. For the synthetic demo this adds no value at ~10 rows;
-- converted to a plain heap table. Re-enable partitioning in prod with a composite
-- PK (reading_id, reading_timestamp) plus monthly RANGE partitions.

-- ============================================================================
-- SCHEMA: supplier (Supplier Profiles, Invoices, Scoring, Onboarding)
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS supplier;

-- TABLE 29: supplier.supplier
-- Supplier 360 profile with ESG scoring and engagement status.
CREATE TABLE supplier.supplier (
    supplier_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    supplier_code       VARCHAR(50) NOT NULL,
    supplier_name       VARCHAR(255) NOT NULL,
    legal_registration  VARCHAR(100),
    country_code        CHAR(2) NOT NULL,
    industry_code       VARCHAR(20),
    industry_name       VARCHAR(255),
    contact_email       VARCHAR(255),
    contact_phone       VARCHAR(30),
    website             VARCHAR(500),
    -- ESG scoring
    esg_risk_score      INT CHECK (esg_risk_score BETWEEN 0 AND 100),
    risk_category       VARCHAR(20),  -- high, elevated, moderate, low
    has_sbti_target     BOOLEAN NOT NULL DEFAULT FALSE,
    sbti_commitment_type VARCHAR(50),
    has_cdp_disclosure  BOOLEAN NOT NULL DEFAULT FALSE,
    cdp_score           CHAR(2),
    -- Emission factors (supplier-specific)
    supplier_ef_co2     DECIMAL(18,10),
    supplier_ef_ch4     DECIMAL(18,10),
    supplier_ef_n2o     DECIMAL(18,10),
    supplier_ef_source  VARCHAR(255),
    supplier_ef_year    INT,
    -- Engagement
    onboarding_status   VARCHAR(30) NOT NULL DEFAULT 'not_started',
    -- not_started, invited, in_progress, data_received, validated, active
    last_data_received  DATE,
    engagement_tier     VARCHAR(20),  -- strategic, preferred, standard, transactional
    -- Financials
    annual_spend_usd    DECIMAL(18,2),
    spend_rank          INT,
    status              VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, supplier_code)
);

-- TABLE 30: supplier.invoice
-- Procurement invoices linked to suppliers. Each invoice generates
-- Scope 3 emission calculations (spend-based or supplier-specific).
CREATE TABLE supplier.invoice (
    invoice_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    org_id              UUID NOT NULL REFERENCES core.organization(org_id),
    facility_id         UUID REFERENCES core.facility(facility_id),
    supplier_id         UUID NOT NULL REFERENCES supplier.supplier(supplier_id),
    invoice_number      VARCHAR(100) NOT NULL,
    invoice_date        DATE NOT NULL,
    -- Financial
    invoice_value       DECIMAL(18,2) NOT NULL,
    invoice_currency    CHAR(3) NOT NULL,
    invoice_value_usd   DECIMAL(18,2),
    -- Line items (summary)
    line_item_count     INT,
    -- Emission calculation
    scope3_category     INT,  -- GHG Protocol category number
    calculation_method  VARCHAR(50),  -- spend_based, supplier_specific, hybrid
    spend_based_emissions_co2e DECIMAL(18,6),
    supplier_emissions_co2e    DECIMAL(18,6),
    final_emissions_co2e       DECIMAL(18,6),
    -- Carbon cost impact
    carbon_liability_usd DECIMAL(18,2),
    carbon_adjusted_cost_usd DECIMAL(18,2),
    carbon_cost_impact_pct DECIMAL(5,4),
    -- Workflow
    approval_status     VARCHAR(30) NOT NULL DEFAULT 'pending',
    -- pending, carbon_calculated, approved, rejected
    approved_by         UUID REFERENCES core.user_account(user_id),
    approved_at         TIMESTAMPTZ,
    -- Source document
    document_id         UUID REFERENCES record.document_upload(document_id),
    accounting_data     JSONB,  -- GL code, cost center, PO number
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, supplier_id, invoice_number)
);

-- TABLE 31: supplier.invoice_line_item
-- Individual line items within an invoice, each with its own emission calculation.
CREATE TABLE supplier.invoice_line_item (
    line_item_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id          UUID NOT NULL REFERENCES supplier.invoice(invoice_id),
    line_number         INT NOT NULL,
    description         VARCHAR(500),
    product_code        VARCHAR(100),
    product_category    VARCHAR(100),
    quantity            DECIMAL(18,6),
    uom                 VARCHAR(30),
    unit_price          DECIMAL(18,6),
    line_total          DECIMAL(18,2) NOT NULL,
    line_currency       CHAR(3),
    -- Emission calculation per line
    emission_factor_id  UUID REFERENCES master.emission_factor(factor_id),
    emissions_co2e_kg   DECIMAL(18,6),
    scope3_category     INT,
    UNIQUE(invoice_id, line_number)
);

-- TABLE 32: supplier.supplier_onboarding
-- Tracks the supplier engagement / data collection workflow.
CREATE TABLE supplier.supplier_onboarding (
    onboarding_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    supplier_id         UUID NOT NULL REFERENCES supplier.supplier(supplier_id),
    invited_at          TIMESTAMPTZ,
    invited_by          UUID REFERENCES core.user_account(user_id),
    questionnaire_sent  BOOLEAN NOT NULL DEFAULT FALSE,
    questionnaire_completed BOOLEAN NOT NULL DEFAULT FALSE,
    data_submitted_at   TIMESTAMPTZ,
    data_validated_at   TIMESTAMPTZ,
    validated_by        UUID REFERENCES core.user_account(user_id),
    current_stage       VARCHAR(30) NOT NULL DEFAULT 'not_started',
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SCHEMA: reduce (Should-Cost Models, Waste Pools, Opportunities, Initiatives)
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS reduce;

-- TABLE 33: reduce.should_cost_model
-- Parameterized should-cost model definitions. Each model defines the
-- theoretical minimum cost/emissions for a category of operational activity.
CREATE TABLE reduce.should_cost_model (
    model_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    model_name          VARCHAR(255) NOT NULL,
    model_code          VARCHAR(50) NOT NULL,
    category            VARCHAR(50) NOT NULL,  -- energy, logistics, manufacturing, procurement, products
    subcategory         VARCHAR(100),
    description         TEXT,
    methodology         TEXT,  -- detailed description of the should-cost calculation approach
    input_parameters    JSONB NOT NULL,  -- { "facility_type": "required", "floor_area_sqm": "required", "climate_zone": "required" }
    benchmark_sources   TEXT[],
    calculation_logic   TEXT,  -- pseudocode or formula description
    version             INT NOT NULL DEFAULT 1,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_by          UUID REFERENCES core.user_account(user_id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, model_code, version)
);

-- TABLE 34: reduce.teardown_analysis
-- Results of running a should-cost model against a specific facility/activity.
-- This is where actual vs. should-cost gaps are quantified.
CREATE TABLE reduce.teardown_analysis (
    analysis_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    model_id            UUID NOT NULL REFERENCES reduce.should_cost_model(model_id),
    org_id              UUID NOT NULL REFERENCES core.organization(org_id),
    facility_id         UUID NOT NULL REFERENCES core.facility(facility_id),
    period_id           UUID NOT NULL REFERENCES record.reporting_period(period_id),
    analysis_name       VARCHAR(255),
    -- Input parameters used
    input_values        JSONB NOT NULL,
    -- Results
    actual_cost_usd     DECIMAL(18,2) NOT NULL,
    should_cost_usd     DECIMAL(18,2) NOT NULL,
    waste_cost_usd      DECIMAL(18,2) NOT NULL,  -- actual - should
    actual_emissions_co2e DECIMAL(18,6) NOT NULL,
    should_emissions_co2e DECIMAL(18,6) NOT NULL,
    waste_emissions_co2e DECIMAL(18,6) NOT NULL,
    waste_pct           DECIMAL(8,4),  -- waste as % of actual
    -- Decomposition
    waste_decomposition JSONB,
    -- e.g., { "hvac_efficiency": { "cost": 45000, "co2e": 120 }, "lighting": { "cost": 12000, "co2e": 35 } }
    -- Status
    status              VARCHAR(20) NOT NULL DEFAULT 'draft',  -- draft, reviewed, approved
    approved_by         UUID REFERENCES core.user_account(user_id),
    approved_at         TIMESTAMPTZ,
    notes               TEXT,
    created_by          UUID REFERENCES core.user_account(user_id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE 35: reduce.waste_pool
-- Aggregated waste pool by category and facility. Fed by teardown analyses.
CREATE TABLE reduce.waste_pool (
    pool_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    org_id              UUID NOT NULL REFERENCES core.organization(org_id),
    facility_id         UUID REFERENCES core.facility(facility_id),  -- NULL = org-level
    period_id           UUID NOT NULL REFERENCES record.reporting_period(period_id),
    category            VARCHAR(50) NOT NULL,  -- energy, logistics, manufacturing, procurement, products
    subcategory         VARCHAR(100),
    waste_cost_usd      DECIMAL(18,2) NOT NULL,
    waste_emissions_co2e DECIMAL(18,6) NOT NULL,
    actual_cost_usd     DECIMAL(18,2),
    should_cost_usd     DECIMAL(18,2),
    waste_pct           DECIMAL(8,4),
    analysis_id         UUID REFERENCES reduce.teardown_analysis(analysis_id),
    calculated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, org_id, facility_id, period_id, category, subcategory)
);

-- TABLE 36: reduce.opportunity
-- Individual carbon/cost reduction opportunities identified from waste pool analysis.
-- Each opportunity is scored on four dimensions and classified into a phase.
CREATE TABLE reduce.opportunity (
    opportunity_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    org_id              UUID NOT NULL REFERENCES core.organization(org_id),
    facility_id         UUID REFERENCES core.facility(facility_id),
    opportunity_name    VARCHAR(255) NOT NULL,
    description         TEXT,
    category            VARCHAR(50) NOT NULL,  -- energy, logistics, manufacturing, procurement, products
    subcategory         VARCHAR(100),
    -- Source
    source_type         VARCHAR(30) NOT NULL,  -- teardown, ai_ideation, manual, benchmark
    source_analysis_id  UUID REFERENCES reduce.teardown_analysis(analysis_id),
    -- Four-dimension scoring
    carbon_reduction_co2e DECIMAL(18,6) NOT NULL,  -- annual tCO2e reduction
    carbon_reduction_pct  DECIMAL(8,4),  -- as % of relevant scope
    annual_saving_usd   DECIMAL(18,2) NOT NULL,
    implementation_cost_usd DECIMAL(18,2) NOT NULL DEFAULT 0,
    payback_months      INT,
    npv_usd             DECIMAL(18,2),
    irr_pct             DECIMAL(8,4),
    abatement_cost_per_tonne DECIMAL(10,2),  -- $/tCO2e (negative = cash-positive)
    complexity_score    INT NOT NULL CHECK (complexity_score BETWEEN 1 AND 5),
    -- Phase classification
    phase               VARCHAR(30) NOT NULL,  -- cash_positive, short_payback, strategic_investment
    -- Dependencies
    dependencies        TEXT[],
    external_factors    TEXT[],  -- technology_maturity, supplier_cooperation, regulatory_approval
    -- Applicable incentives
    applicable_incentives UUID[],
    estimated_incentive_usd DECIMAL(18,2),
    -- Status
    status              VARCHAR(20) NOT NULL DEFAULT 'identified',
    -- identified, ai_proposed, evaluated, approved, converted_to_initiative, dismissed
    approved_by         UUID REFERENCES core.user_account(user_id),
    approved_at         TIMESTAMPTZ,
    dismissed_reason    TEXT,
    notes               TEXT,
    created_by          UUID REFERENCES core.user_account(user_id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE 37: reduce.initiative
-- Active reduction initiatives converted from opportunities. Tracks the full
-- lifecycle: approved → in_implementation → monitoring → completed.
CREATE TABLE reduce.initiative (
    initiative_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    org_id              UUID NOT NULL REFERENCES core.organization(org_id),
    facility_id         UUID REFERENCES core.facility(facility_id),
    opportunity_id      UUID REFERENCES reduce.opportunity(opportunity_id),
    initiative_code     VARCHAR(50) NOT NULL,
    initiative_name     VARCHAR(255) NOT NULL,
    description         TEXT,
    category            VARCHAR(50) NOT NULL,
    initiative_type     VARCHAR(30),  -- open, closed, cancelled
    -- Targets
    target_carbon_reduction_co2e DECIMAL(18,6) NOT NULL,
    target_annual_saving_usd DECIMAL(18,2) NOT NULL,
    approved_budget_usd DECIMAL(18,2),
    -- Actuals
    actual_carbon_reduction_co2e DECIMAL(18,6) NOT NULL DEFAULT 0,
    actual_saving_usd   DECIMAL(18,2) NOT NULL DEFAULT 0,
    actual_spend_usd    DECIMAL(18,2) NOT NULL DEFAULT 0,
    -- Timeline
    planned_start_date  DATE,
    planned_end_date    DATE,
    actual_start_date   DATE,
    actual_end_date     DATE,
    -- Ownership
    owner_user_id       UUID REFERENCES core.user_account(user_id),
    owner_name          VARCHAR(255),
    sponsor_user_id     UUID REFERENCES core.user_account(user_id),
    -- Workflow
    workflow_stage      VARCHAR(30) NOT NULL DEFAULT 'proposed',
    -- proposed, approved, in_implementation, initiative_approved, monitoring, closure, completed, cancelled
    -- Performance
    schedule_status     VARCHAR(20),  -- on_time, delayed, ahead
    budget_status       VARCHAR(20),  -- within_budget, over_budget, under_budget
    carbon_status       VARCHAR(20),  -- achieved, over_achieved, under_achieved
    health_indicator    VARCHAR(20),  -- on_track, at_risk, critical
    notes               TEXT,
    created_by          UUID REFERENCES core.user_account(user_id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, initiative_code)
);

-- TABLE 38: reduce.initiative_progress
-- Monthly/periodic progress updates on active initiatives.
CREATE TABLE reduce.initiative_progress (
    progress_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    initiative_id       UUID NOT NULL REFERENCES reduce.initiative(initiative_id),
    progress_code       VARCHAR(50),
    reporting_date      DATE NOT NULL,
    title               VARCHAR(255),
    action_summary      TEXT,
    -- Metrics at this point
    carbon_reduced_period DECIMAL(18,6),  -- tCO2e reduced this period
    carbon_reduced_cumulative DECIMAL(18,6),
    saving_period_usd   DECIMAL(18,2),
    saving_cumulative_usd DECIMAL(18,2),
    spend_period_usd    DECIMAL(18,2),
    spend_cumulative_usd DECIMAL(18,2),
    -- Milestone tracking
    milestones_completed TEXT[],
    milestones_upcoming TEXT[],
    blockers            TEXT[],
    reported_by         UUID REFERENCES core.user_account(user_id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE 39: reduce.initiative_closure
-- Closure details when an initiative is completed or cancelled.
CREATE TABLE reduce.initiative_closure (
    closure_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    initiative_id       UUID NOT NULL REFERENCES reduce.initiative(initiative_id) UNIQUE,
    closure_date        DATE NOT NULL,
    closure_type        VARCHAR(20) NOT NULL,  -- completed, cancelled, suspended
    -- Final outcomes
    total_carbon_reduced DECIMAL(18,6),
    total_saving_usd    DECIMAL(18,2),
    total_spend_usd     DECIMAL(18,2),
    budget_variance_usd DECIMAL(18,2),
    carbon_variance_co2e DECIMAL(18,6),
    -- Assessment
    success_rating      INT CHECK (success_rating BETWEEN 1 AND 5),
    lessons_learned     TEXT,
    replicability_score INT CHECK (replicability_score BETWEEN 1 AND 5),
    recommended_replications TEXT[],  -- facility IDs where this should be replicated
    closed_by           UUID REFERENCES core.user_account(user_id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE 40: reduce.monitoring_reading
-- Post-implementation monitoring data tracking actual savings against projections.
CREATE TABLE reduce.monitoring_reading (
    reading_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    initiative_id       UUID NOT NULL REFERENCES reduce.initiative(initiative_id),
    reading_date        DATE NOT NULL,
    metric_name         VARCHAR(100) NOT NULL,  -- energy_kwh, emissions_co2e, cost_usd
    projected_value     DECIMAL(18,6) NOT NULL,
    actual_value        DECIMAL(18,6) NOT NULL,
    variance            DECIMAL(18,6),
    variance_pct        DECIMAL(8,4),
    is_alert            BOOLEAN NOT NULL DEFAULT FALSE,
    alert_threshold_pct DECIMAL(5,2),
    data_source         VARCHAR(50),  -- iot_sensor, utility_bill, manual
    sensor_id           VARCHAR(100),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SCHEMA: report (Report Generation, Framework Mapping, Exports)
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS report;

-- TABLE 41: report.report
-- A generated ESG report for a specific framework, organization, and period.
CREATE TABLE report.report (
    report_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    org_id              UUID NOT NULL REFERENCES core.organization(org_id),
    framework_id        UUID NOT NULL REFERENCES master.regulatory_framework(framework_id),
    period_id           UUID NOT NULL REFERENCES record.reporting_period(period_id),
    report_name         VARCHAR(255) NOT NULL,
    report_type         VARCHAR(30) NOT NULL,  -- annual, interim, supplementary
    -- Status
    status              VARCHAR(30) NOT NULL DEFAULT 'draft',
    -- draft, ai_generating, ai_complete, human_review, under_approval, approved, published, archived
    overall_completion_pct DECIMAL(5,2) NOT NULL DEFAULT 0,
    overall_confidence  DECIMAL(5,2),
    -- AI generation metadata
    ai_generation_started_at TIMESTAMPTZ,
    ai_generation_completed_at TIMESTAMPTZ,
    ai_model_used       VARCHAR(100),
    total_tokens_used   INT,
    generation_cost_usd DECIMAL(10,4),
    -- Human edit metrics
    human_edit_distance DECIMAL(5,2),  -- % of AI text changed by reviewers
    sections_auto_approved INT NOT NULL DEFAULT 0,
    sections_human_edited INT NOT NULL DEFAULT 0,
    -- Approval
    approved_by         UUID REFERENCES core.user_account(user_id),
    approved_at         TIMESTAMPTZ,
    published_at        TIMESTAMPTZ,
    created_by          UUID REFERENCES core.user_account(user_id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE 42: report.report_section
-- Individual sections within a report. Each section can be AI-generated,
-- human-authored, or a mix.
CREATE TABLE report.report_section (
    section_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id           UUID NOT NULL REFERENCES report.report(report_id),
    section_code        VARCHAR(50) NOT NULL,
    section_name        VARCHAR(255) NOT NULL,
    section_order       INT NOT NULL,
    parent_section_id   UUID REFERENCES report.report_section(section_id),
    -- Content
    content_type        VARCHAR(20) NOT NULL,  -- narrative, data_table, chart, mixed
    ai_generated_content TEXT,
    human_edited_content TEXT,
    final_content       TEXT,
    -- Data backing
    source_data_refs    JSONB,  -- array of { table, record_id, field } references
    metrics_included    JSONB,  -- array of framework_metric_ids mapped to values
    -- Status
    generation_status   VARCHAR(30) NOT NULL DEFAULT 'not_started',
    -- not_started, ai_generating, ai_complete, human_required, human_reviewing, approved, locked
    confidence_score    DECIMAL(5,2),
    -- Review
    reviewed_by         UUID REFERENCES core.user_account(user_id),
    reviewed_at         TIMESTAMPTZ,
    review_comments     TEXT,
    edit_distance_pct   DECIMAL(5,2),  -- % changed from AI draft
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(report_id, section_code)
);

-- TABLE 43: report.framework_data_mapping
-- Maps platform data fields to specific framework metric definitions.
-- This is the configuration that drives the Framework Mapper screen.
CREATE TABLE report.framework_data_mapping (
    mapping_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    framework_metric_id UUID NOT NULL REFERENCES master.framework_metric(metric_id),
    platform_table      VARCHAR(100) NOT NULL,  -- e.g., 'record.emission_consolidated'
    platform_field      VARCHAR(100) NOT NULL,  -- e.g., 'scope1_total'
    transformation      VARCHAR(255),  -- e.g., 'SUM', 'multiply_by_1000', 'convert_kg_to_t'
    filter_conditions   JSONB,  -- e.g., { "scope": "scope1", "category": "stationary_combustion" }
    is_auto_mapped      BOOLEAN NOT NULL DEFAULT FALSE,
    confidence_score    DECIMAL(5,2),
    validated_by        UUID REFERENCES core.user_account(user_id),
    validated_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE 44: report.consistency_check
-- Cross-framework consistency validation results.
CREATE TABLE report.consistency_check (
    check_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    period_id           UUID NOT NULL REFERENCES record.reporting_period(period_id),
    check_name          VARCHAR(255) NOT NULL,
    check_type          VARCHAR(50) NOT NULL,  -- cross_framework, internal_consistency, completeness
    framework_a_id      UUID REFERENCES master.regulatory_framework(framework_id),
    framework_b_id      UUID REFERENCES master.regulatory_framework(framework_id),
    metric_description  VARCHAR(255),
    value_a             DECIMAL(18,6),
    value_b             DECIMAL(18,6),
    variance            DECIMAL(18,6),
    status              VARCHAR(10) NOT NULL,  -- pass, fail, warning
    resolution_notes    TEXT,
    resolved_by         UUID REFERENCES core.user_account(user_id),
    resolved_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE 45: report.export
-- Track all report exports (PDF, XBRL, CDP, PPTX).
CREATE TABLE report.export (
    export_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    report_id           UUID NOT NULL REFERENCES report.report(report_id),
    export_format       VARCHAR(20) NOT NULL,  -- pdf, xbrl, ixbrl, cdp_api, pptx, xlsx, csv
    export_purpose      VARCHAR(50),  -- regulatory_filing, board_presentation, investor_pack, internal_review
    file_name           VARCHAR(255),
    file_size_bytes     BIGINT,
    storage_path        VARCHAR(500),
    generation_status   VARCHAR(20) NOT NULL DEFAULT 'queued',  -- queued, generating, ready, error, downloaded
    generated_at        TIMESTAMPTZ,
    downloaded_at       TIMESTAMPTZ,
    downloaded_by       UUID REFERENCES core.user_account(user_id),
    error_message       TEXT,
    created_by          UUID REFERENCES core.user_account(user_id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SCHEMA: govern (Approvals, Audit Trail, Materiality, Compliance)
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS govern;

-- TABLE 46: govern.approval_request
-- Unified approval workflow for all approval types across the platform.
CREATE TABLE govern.approval_request (
    approval_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    approval_type       VARCHAR(30) NOT NULL,  -- data, report, initiative, methodology, configuration
    entity_type         VARCHAR(50) NOT NULL,  -- emission_batch, report_section, initiative, emission_factor, etc.
    entity_id           UUID NOT NULL,
    entity_description  VARCHAR(500),
    -- Request details
    requested_by        UUID NOT NULL REFERENCES core.user_account(user_id),
    requested_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    priority            VARCHAR(10) NOT NULL DEFAULT 'normal',  -- low, normal, high, urgent
    due_date            DATE,
    sla_hours           INT,
    -- Current state
    status              VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- pending, in_review, approved, rejected, changes_requested, cancelled
    current_approver_id UUID REFERENCES core.user_account(user_id),
    approval_level      INT NOT NULL DEFAULT 1,
    max_approval_level  INT NOT NULL DEFAULT 1,
    -- Resolution
    resolved_by         UUID REFERENCES core.user_account(user_id),
    resolved_at         TIMESTAMPTZ,
    resolution_comments TEXT,
    is_overdue          BOOLEAN NOT NULL DEFAULT FALSE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE 47: govern.approval_step
-- Individual steps in a multi-level approval chain.
CREATE TABLE govern.approval_step (
    step_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    approval_id         UUID NOT NULL REFERENCES govern.approval_request(approval_id),
    step_level          INT NOT NULL,
    approver_id         UUID NOT NULL REFERENCES core.user_account(user_id),
    status              VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- pending, approved, rejected, changes_requested, skipped
    action_at           TIMESTAMPTZ,
    comments            TEXT,
    UNIQUE(approval_id, step_level)
);

-- TABLE 48: govern.audit_event
-- Immutable, append-only audit log. Every state transition in the platform.
-- This table is NEVER updated or deleted — only inserted.
CREATE TABLE govern.audit_event (
    event_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    event_timestamp     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    event_type          VARCHAR(50) NOT NULL,
    -- data_created, data_updated, data_deleted, data_approved, data_rejected,
    -- calculation_executed, report_generated, report_approved, report_exported,
    -- initiative_created, initiative_approved, initiative_completed,
    -- user_login, user_logout, config_changed, factor_updated
    module              VARCHAR(30) NOT NULL,
    entity_type         VARCHAR(50) NOT NULL,
    entity_id           UUID NOT NULL,
    -- Actor
    user_id             UUID REFERENCES core.user_account(user_id),
    user_email          VARCHAR(255),
    user_ip             INET,
    user_agent          TEXT,
    -- Change details
    action              VARCHAR(30) NOT NULL,  -- create, read, update, delete, approve, reject, export, generate
    before_state        JSONB,
    after_state         JSONB,
    change_summary      TEXT,
    -- Context
    session_id          VARCHAR(255),
    request_id          VARCHAR(255),
    metadata            JSONB
);
CREATE INDEX idx_audit_lookup ON govern.audit_event(tenant_id, event_timestamp, module, entity_type);

-- TABLE 49: govern.materiality_topic
-- Topics assessed in the double materiality matrix.
CREATE TABLE govern.materiality_topic (
    topic_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    topic_name          VARCHAR(255) NOT NULL,
    topic_code          VARCHAR(50) NOT NULL,
    esg_pillar          CHAR(1) NOT NULL,  -- E, S, G
    description         TEXT,
    -- Double materiality scores
    financial_materiality_score DECIMAL(5,2),  -- 0-100: impact of topic on company
    impact_materiality_score    DECIMAL(5,2),  -- 0-100: impact of company on topic
    overall_materiality_score   DECIMAL(5,2),  -- derived: MAX or weighted average
    is_material         BOOLEAN NOT NULL DEFAULT FALSE,
    materiality_threshold DECIMAL(5,2) NOT NULL DEFAULT 50,
    -- Assessment metadata
    assessment_year     INT NOT NULL,
    assessed_by         UUID REFERENCES core.user_account(user_id),
    assessed_at         TIMESTAMPTZ,
    stakeholder_input   JSONB,  -- { "investors": 85, "employees": 72, "regulators": 90 }
    -- Framework linkage
    linked_framework_metrics UUID[],  -- array of framework_metric IDs triggered by materiality
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, topic_code, assessment_year)
);

-- TABLE 50: govern.compliance_deadline
-- Regulatory filing deadlines and internal milestones.
CREATE TABLE govern.compliance_deadline (
    deadline_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    org_id              UUID REFERENCES core.organization(org_id),
    framework_id        UUID REFERENCES master.regulatory_framework(framework_id),
    deadline_name       VARCHAR(255) NOT NULL,
    deadline_type       VARCHAR(30) NOT NULL,  -- regulatory_filing, internal_review, assurance_review, board_approval
    due_date            DATE NOT NULL,
    responsible_user_id UUID REFERENCES core.user_account(user_id),
    status              VARCHAR(20) NOT NULL DEFAULT 'upcoming',
    -- upcoming, in_progress, completed, overdue, waived
    completion_pct      DECIMAL(5,2) NOT NULL DEFAULT 0,
    completed_at        TIMESTAMPTZ,
    reminder_days       INT[] NOT NULL DEFAULT '{90,60,30,14,7}',
    last_reminder_sent  DATE,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SCHEMA: ai (AI Generations, Evaluations, Assistant Conversations)
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS ai;

-- TABLE 51: ai.generation_log
-- Log of every AI generation (report narrative, initiative ideation, extraction).
CREATE TABLE ai.generation_log (
    generation_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    generation_type     VARCHAR(50) NOT NULL,
    -- report_narrative, initiative_ideation, document_extraction, anomaly_explanation, compliance_check
    model_provider      VARCHAR(30) NOT NULL,  -- anthropic, openai, google, meta
    model_name          VARCHAR(100) NOT NULL,  -- claude-sonnet-4-20250514, gpt-4o, etc.
    -- Input
    prompt_template     VARCHAR(255),
    input_tokens        INT,
    input_context       JSONB,  -- summary of what was sent (NOT the full prompt — for cost tracking)
    -- Output
    output_tokens       INT,
    output_content_hash VARCHAR(64),
    confidence_score    DECIMAL(5,2),
    -- Cost
    cost_usd            DECIMAL(10,6),
    latency_ms          INT,
    -- Evaluation
    human_rating        INT CHECK (human_rating BETWEEN 1 AND 5),
    was_accepted        BOOLEAN,
    was_edited          BOOLEAN,
    edit_distance_pct   DECIMAL(5,2),
    -- Linked entity
    linked_entity_type  VARCHAR(50),
    linked_entity_id    UUID,
    -- RAG context
    rag_chunks_retrieved INT,
    rag_retrieval_score DECIMAL(5,4),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_ai_gen_lookup ON ai.generation_log(tenant_id, generation_type, created_at);

-- TABLE 52: ai.evaluation_dataset
-- Ground truth datasets for evaluating AI output quality.
CREATE TABLE ai.evaluation_dataset (
    dataset_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_name        VARCHAR(255) NOT NULL,
    evaluation_type     VARCHAR(50) NOT NULL,
    -- report_quality, extraction_accuracy, ideation_relevance, compliance_coverage
    input_data          JSONB NOT NULL,
    expected_output     JSONB NOT NULL,
    source              VARCHAR(50),  -- human_authored, historical, synthetic
    difficulty_level    INT CHECK (difficulty_level BETWEEN 1 AND 5),
    tags                TEXT[],
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE 53: ai.model_performance
-- Tracks AI model performance over time for drift detection.
CREATE TABLE ai.model_performance (
    performance_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_name          VARCHAR(100) NOT NULL,
    evaluation_type     VARCHAR(50) NOT NULL,
    evaluation_date     DATE NOT NULL,
    dataset_id          UUID REFERENCES ai.evaluation_dataset(dataset_id),
    accuracy_score      DECIMAL(5,4),
    precision_score     DECIMAL(5,4),
    recall_score        DECIMAL(5,4),
    f1_score            DECIMAL(5,4),
    hallucination_rate  DECIMAL(5,4),
    human_approval_rate DECIMAL(5,4),
    avg_edit_distance   DECIMAL(5,2),
    sample_size         INT,
    is_drift_detected   BOOLEAN NOT NULL DEFAULT FALSE,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE 54: ai.assistant_conversation
-- Sustainpedia chat assistant conversation history.
CREATE TABLE ai.assistant_conversation (
    conversation_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    user_id             UUID NOT NULL REFERENCES core.user_account(user_id),
    started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_message_at     TIMESTAMPTZ,
    message_count       INT NOT NULL DEFAULT 0,
    context_module      VARCHAR(30),  -- which module the user was in when starting
    context_entity_type VARCHAR(50),
    context_entity_id   UUID,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE
);

-- TABLE 55: ai.assistant_message
-- Individual messages within a Sustainpedia conversation.
CREATE TABLE ai.assistant_message (
    message_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id     UUID NOT NULL REFERENCES ai.assistant_conversation(conversation_id),
    role                VARCHAR(10) NOT NULL,  -- user, assistant
    content             TEXT NOT NULL,
    -- AI metadata (for assistant messages only)
    model_used          VARCHAR(100),
    tokens_used         INT,
    rag_sources         JSONB,  -- array of { source, chunk_id, relevance_score }
    cost_usd            DECIMAL(10,6),
    latency_ms          INT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SCHEMA: dq (Data Quality Checks, Exceptions, Resolutions)
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS dq;

-- TABLE 56: dq.quality_rule
-- Data quality rule definitions (Great Expectations rules).
CREATE TABLE dq.quality_rule (
    rule_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_code           VARCHAR(50) NOT NULL UNIQUE,
    rule_name           VARCHAR(255) NOT NULL,
    description         TEXT,
    rule_type           VARCHAR(30) NOT NULL,  -- schema, range, consistency, completeness, uniqueness, freshness
    target_table        VARCHAR(100) NOT NULL,
    target_field        VARCHAR(100),
    rule_logic          JSONB NOT NULL,
    -- e.g., { "type": "range", "min": 0, "max": 999999 } or { "type": "not_null" }
    severity            VARCHAR(10) NOT NULL,  -- critical, warning, info
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE 57: dq.quality_check_run
-- Results of a data quality check execution (batch-level).
CREATE TABLE dq.quality_check_run (
    run_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    run_timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    trigger_type        VARCHAR(20) NOT NULL,  -- scheduled, manual, on_ingestion
    total_rules_checked INT NOT NULL,
    rules_passed        INT NOT NULL,
    rules_failed        INT NOT NULL,
    critical_failures   INT NOT NULL DEFAULT 0,
    warning_failures    INT NOT NULL DEFAULT 0,
    info_failures       INT NOT NULL DEFAULT 0,
    duration_ms         INT,
    status              VARCHAR(20) NOT NULL  -- completed, partial, error
);

-- TABLE 58: dq.quality_exception
-- Individual data quality exceptions detected by quality checks.
CREATE TABLE dq.quality_exception (
    exception_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    run_id              UUID NOT NULL REFERENCES dq.quality_check_run(run_id),
    rule_id             UUID NOT NULL REFERENCES dq.quality_rule(rule_id),
    -- Location of the issue
    source_table        VARCHAR(100) NOT NULL,
    source_record_id    UUID,
    source_field        VARCHAR(100),
    -- Details
    severity            VARCHAR(10) NOT NULL,
    expected_value      TEXT,
    actual_value        TEXT,
    error_message       TEXT NOT NULL,
    ai_explanation      TEXT,  -- natural language explanation generated by LLM
    suggested_action    TEXT,
    -- Resolution
    status              VARCHAR(20) NOT NULL DEFAULT 'open',  -- open, assigned, in_progress, resolved, dismissed
    assigned_to         UUID REFERENCES core.user_account(user_id),
    assigned_at         TIMESTAMPTZ,
    resolved_by         UUID REFERENCES core.user_account(user_id),
    resolved_at         TIMESTAMPTZ,
    resolution_notes    TEXT,
    resolution_type     VARCHAR(30),  -- corrected, accepted_as_is, source_corrected, dismissed
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_dq_open ON dq.quality_exception(tenant_id, status, severity);

-- ============================================================================
-- SCHEMA: netzero (Net Zero Targets, Performance Tracking)
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS netzero;

-- TABLE 59: netzero.target
-- Net zero targets set at organization or facility level.
CREATE TABLE netzero.target (
    target_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    org_id              UUID NOT NULL REFERENCES core.organization(org_id),
    facility_id         UUID REFERENCES core.facility(facility_id),  -- NULL = org-level
    target_name         VARCHAR(255) NOT NULL,
    target_code         VARCHAR(50) NOT NULL,
    ghg_scope_category  VARCHAR(30) NOT NULL,  -- scope1, scope2, scope3, scope1_2, all_scopes
    emission_source_category VARCHAR(100),  -- stationary_combustion, purchased_electricity, etc.
    target_type         VARCHAR(20) NOT NULL,  -- near_term, long_term
    sbti_method         VARCHAR(50),  -- cross_sector_absolute_reduction, sector_specific, portfolio_coverage
    -- Baseline
    base_year           INT NOT NULL,
    base_emissions_co2e DECIMAL(18,6) NOT NULL,
    -- Target
    target_year         INT NOT NULL,
    target_emissions_co2e DECIMAL(18,6) NOT NULL,
    reduction_pct       DECIMAL(8,4) NOT NULL,
    -- Projection method
    projection_method   VARCHAR(30) NOT NULL DEFAULT 'linear',  -- linear, exponential, custom
    interim_targets     JSONB,  -- array of { year, allowed_emissions }
    -- Validation
    is_sbti_validated   BOOLEAN NOT NULL DEFAULT FALSE,
    sbti_validation_date DATE,
    status              VARCHAR(20) NOT NULL DEFAULT 'draft',  -- draft, approved, active, achieved, missed
    approved_by         UUID REFERENCES core.user_account(user_id),
    approved_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, target_code)
);

-- TABLE 60: netzero.yearly_projection
-- Year-by-year allowed emissions for each target (auto-calculated from target).
CREATE TABLE netzero.yearly_projection (
    projection_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_id           UUID NOT NULL REFERENCES netzero.target(target_id),
    projection_year     INT NOT NULL,
    yearly_allowed_emissions DECIMAL(18,6) NOT NULL,
    actual_emissions    DECIMAL(18,6),
    variance            DECIMAL(18,6),
    status              VARCHAR(20),  -- on_track, at_risk, behind, achieved
    UNIQUE(target_id, projection_year)
);

-- TABLE 61: netzero.performance_summary
-- Consolidated net zero performance at organization level (target vs. actual).
CREATE TABLE netzero.performance_summary (
    summary_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    org_id              UUID NOT NULL REFERENCES core.organization(org_id),
    reporting_year      INT NOT NULL,
    -- Scope totals (actual YTD)
    scope1_actual       DECIMAL(18,6),
    scope2_actual       DECIMAL(18,6),
    scope3_actual       DECIMAL(18,6),
    total_actual        DECIMAL(18,6),
    -- Targets
    scope1_allowed      DECIMAL(18,6),
    scope2_allowed      DECIMAL(18,6),
    scope3_allowed      DECIMAL(18,6),
    total_allowed       DECIMAL(18,6),
    -- Gap
    scope1_gap          DECIMAL(18,6),
    scope2_gap          DECIMAL(18,6),
    scope3_gap          DECIMAL(18,6),
    total_gap           DECIMAL(18,6),
    -- Status
    overall_status      VARCHAR(20),  -- within_limit, at_limit, exceeded
    calculated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, org_id, reporting_year)
);

-- ============================================================================
-- SCHEMA: task (Task Management for ESG Reporting Workflows)
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS task;

-- TABLE 62: task.plan
-- A task plan groups related tasks for an ESG reporting cycle.
CREATE TABLE task.plan (
    plan_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    plan_name           VARCHAR(255) NOT NULL,
    description         TEXT,
    schedule_cron       VARCHAR(100),
    due_date_rule       VARCHAR(255),
    timezone            VARCHAR(50) NOT NULL DEFAULT 'UTC',
    priority            INT NOT NULL DEFAULT 1,
    status              VARCHAR(20) NOT NULL DEFAULT 'active',
    created_by          UUID REFERENCES core.user_account(user_id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- TABLE 63: task.task
-- Individual tasks within a plan.
CREATE TABLE task.task (
    task_id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id             UUID NOT NULL REFERENCES task.plan(plan_id),
    tenant_id           UUID NOT NULL REFERENCES core.tenant(tenant_id),
    task_name           VARCHAR(255) NOT NULL,
    description         TEXT,
    sequence_order      INT NOT NULL DEFAULT 0,
    priority            VARCHAR(10) NOT NULL DEFAULT 'medium',  -- low, medium, high, critical
    status              VARCHAR(20) NOT NULL DEFAULT 'not_started',
    -- not_started, in_progress, completed, blocked, cancelled
    assigned_to         UUID REFERENCES core.user_account(user_id),
    due_date            TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    completed_by        UUID REFERENCES core.user_account(user_id),
    -- Linked entity (optional — connect task to a specific module action)
    linked_module       VARCHAR(30),
    linked_entity_type  VARCHAR(50),
    linked_entity_id    UUID,
    parent_task_id      UUID REFERENCES task.task(task_id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- SUMMARY: 63 tables across 10 schemas
--
-- core (9 tables): tenant, organization, facility, user_account, role,
--   permission, role_permission, user_role, notification
--
-- master (9 tables): emission_factor_source, emission_factor, currency_rate,
--   carbon_price, industry_benchmark, regulatory_framework, framework_metric,
--   ghg_gas_type, incentive_program
--
-- record (10 tables): data_source, reporting_period, emission_batch,
--   scope1_emission, scope2_emission, scope3_emission, scope3_category_summary,
--   emission_consolidated, document_upload, iot_reading
--
-- supplier (4 tables): supplier, invoice, invoice_line_item, supplier_onboarding
--
-- reduce (8 tables): should_cost_model, teardown_analysis, waste_pool,
--   opportunity, initiative, initiative_progress, initiative_closure,
--   monitoring_reading
--
-- report (5 tables): report, report_section, framework_data_mapping,
--   consistency_check, export
--
-- govern (5 tables): approval_request, approval_step, audit_event,
--   materiality_topic, compliance_deadline
--
-- ai (5 tables): generation_log, evaluation_dataset, model_performance,
--   assistant_conversation, assistant_message
--
-- dq (3 tables): quality_rule, quality_check_run, quality_exception
--
-- netzero (3 tables): target, yearly_projection, performance_summary
--
-- task (2 tables): plan, task
-- ============================================================================
