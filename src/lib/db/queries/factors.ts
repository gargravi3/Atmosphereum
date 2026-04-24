import { cache } from "react";
import { db } from "../client";

export type FactorRow = {
  id: string;
  code: string | null;
  name: string;
  scope: "scope1" | "scope2" | "scope3";
  category: string;
  subcategory: string | null;
  fuel_type: string | null;
  gas_type: string | null;
  geography: string;
  source: string;
  source_code: string;
  year: number;
  unit: string;
  value: number;
  gwp_co2: number;
  gwp_ch4: number;
  gwp_n2o: number;
  version: string;
  is_current: boolean;
};

export const loadFactors = cache(async (): Promise<FactorRow[]> => {
  const rows = await db
    .selectFrom("master.emission_factor as f")
    .innerJoin(
      "master.emission_factor_source as s",
      "s.source_id",
      "f.source_id",
    )
    .select([
      "f.factor_id",
      "f.factor_code",
      "f.scope",
      "f.category",
      "f.subcategory",
      "f.fuel_type",
      "f.gas_type",
      "f.country_code",
      "f.region",
      "f.applicable_year",
      "f.unit_of_measure",
      "f.factor_total_co2e",
      "f.gwp_co2",
      "f.gwp_ch4",
      "f.gwp_n2o",
      "f.version",
      "f.is_current",
      "s.source_name",
      "s.source_code",
    ])
    .orderBy("f.scope", "asc")
    .orderBy("f.category", "asc")
    .execute();
  return rows.map((r) => ({
    id: r.factor_id,
    code: r.factor_code,
    name: [r.source_name, r.category, r.subcategory, r.fuel_type ?? r.gas_type]
      .filter(Boolean)
      .join(" — "),
    scope: r.scope as "scope1" | "scope2" | "scope3",
    category: r.category,
    subcategory: r.subcategory,
    fuel_type: r.fuel_type,
    gas_type: r.gas_type,
    geography: r.country_code ?? r.region ?? "Global",
    source: r.source_name,
    source_code: r.source_code,
    year: r.applicable_year,
    unit: r.unit_of_measure,
    value: Number(r.factor_total_co2e),
    gwp_co2: Number(r.gwp_co2),
    gwp_ch4: Number(r.gwp_ch4),
    gwp_n2o: Number(r.gwp_n2o),
    version: String(r.version),
    is_current: r.is_current,
  }));
});

export const loadFactorSources = cache(async () => {
  const rows = await db
    .selectFrom("master.emission_factor_source")
    .selectAll()
    .orderBy("source_name", "asc")
    .execute();
  return rows.map((r) => ({
    id: r.source_id,
    code: r.source_code,
    name: r.source_name,
    publisher: r.publisher,
    country: r.country_code,
    url: r.url,
    description: r.description,
    is_active: r.is_active,
  }));
});

export const loadGhgGasTypes = cache(async () => {
  const rows = await db
    .selectFrom("master.ghg_gas_type")
    .selectAll()
    .orderBy("gas_name", "asc")
    .execute();
  return rows;
});

export const loadCarbonPrices = cache(async () => {
  const rows = await db
    .selectFrom("master.carbon_price")
    .selectAll()
    .orderBy("price_date", "desc")
    .execute();
  return rows;
});

export const loadIndustryBenchmarks = cache(async () => {
  const rows = await db
    .selectFrom("master.industry_benchmark")
    .selectAll()
    .orderBy("metric_name", "asc")
    .execute();
  return rows;
});

export const loadIncentivePrograms = cache(async () => {
  const rows = await db
    .selectFrom("master.incentive_program")
    .selectAll()
    .orderBy("program_name", "asc")
    .execute();
  return rows;
});
