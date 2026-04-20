/**
 * Synthetic dataset for Northfield FC — a fictional Premier League-adjacent
 * sports organization. Numbers are realistic, modeled on Brentford FC-style
 * operations with DEFRA 2023 emission factors.
 *
 * Deterministically generated — same input seed produces the same dataset.
 */

import { seededRandom, range } from "@/lib/utils";
import type {
  Facility,
  EmissionFactor,
  EmissionRecord,
  Supplier,
  Opportunity,
  AuditEvent,
  Report,
  Framework,
  TeardownDecomposition,
} from "@/lib/types";

// -----------------------------------------------------------------------
// Organization
// -----------------------------------------------------------------------

export const org = {
  id: "northfield-fc",
  name: "Northfield FC",
  legal_name: "Northfield Football Club Ltd.",
  sector: "Sports & Entertainment",
  revenue_gbp: 168_000_000,
  employees: 420,
  fiscal_year: "FY25",
  fy_start: "2024-07-01",
  fy_end: "2025-06-30",
  parent: null,
};

// -----------------------------------------------------------------------
// Facilities
// -----------------------------------------------------------------------

export const facilities: Facility[] = [
  {
    id: "fac-stadium",
    name: "Riverside Stadium",
    type: "stadium",
    geography: "UK-LON",
    area_sqm: 48_500,
    capacity: 28_400,
  },
  {
    id: "fac-training",
    name: "Jealott's Hill Training Ground",
    type: "training_ground",
    geography: "UK-BER",
    area_sqm: 12_200,
  },
  {
    id: "fac-hq",
    name: "Northfield House (HQ)",
    type: "office",
    geography: "UK-LON",
    area_sqm: 3_400,
  },
];

// -----------------------------------------------------------------------
// Emission factors (DEFRA 2023 subset — real values)
// -----------------------------------------------------------------------

export const factors: EmissionFactor[] = [
  {
    id: "ef-elec-uk",
    name: "Electricity — UK grid (location-based)",
    source: "DEFRA 2023",
    category: "electricity",
    geography: "UK",
    year: 2023,
    unit: "kgCO2e/kWh",
    value: 0.20705,
    version: "2023.1",
  },
  {
    id: "ef-elec-uk-market",
    name: "Electricity — UK grid (market-based, residual mix)",
    source: "DEFRA 2023",
    category: "electricity",
    geography: "UK",
    year: 2023,
    unit: "kgCO2e/kWh",
    value: 0.30721,
    version: "2023.1",
  },
  {
    id: "ef-natgas",
    name: "Natural gas — stationary combustion",
    source: "DEFRA 2023",
    category: "stationary_combustion",
    geography: "UK",
    year: 2023,
    unit: "kgCO2e/kWh",
    value: 0.18293,
    version: "2023.1",
  },
  {
    id: "ef-diesel",
    name: "Diesel — average biofuel blend",
    source: "DEFRA 2023",
    category: "mobile_combustion",
    geography: "UK",
    year: 2023,
    unit: "kgCO2e/litre",
    value: 2.5562,
    version: "2023.1",
  },
  {
    id: "ef-petrol",
    name: "Petrol — average biofuel blend",
    source: "DEFRA 2023",
    category: "mobile_combustion",
    geography: "UK",
    year: 2023,
    unit: "kgCO2e/litre",
    value: 2.1657,
    version: "2023.1",
  },
  {
    id: "ef-r410a",
    name: "Refrigerant R-410A (GWP)",
    source: "DEFRA 2023",
    category: "refrigerants",
    geography: "Global",
    year: 2023,
    unit: "kgCO2e/kg",
    value: 2088,
    version: "2023.1",
  },
  {
    id: "ef-flight-sh",
    name: "Flight — economy short-haul",
    source: "DEFRA 2023",
    category: "business_travel",
    geography: "UK-EU",
    year: 2023,
    unit: "kgCO2e/passenger-km",
    value: 0.15102,
    version: "2023.1",
  },
  {
    id: "ef-flight-lh",
    name: "Flight — economy long-haul",
    source: "DEFRA 2023",
    category: "business_travel",
    geography: "Global",
    year: 2023,
    unit: "kgCO2e/passenger-km",
    value: 0.14981,
    version: "2023.1",
  },
  {
    id: "ef-rail-uk",
    name: "Rail — UK national",
    source: "DEFRA 2023",
    category: "business_travel",
    geography: "UK",
    year: 2023,
    unit: "kgCO2e/passenger-km",
    value: 0.03549,
    version: "2023.1",
  },
  {
    id: "ef-car-av",
    name: "Car — average",
    source: "DEFRA 2023",
    category: "commuting",
    geography: "UK",
    year: 2023,
    unit: "kgCO2e/km",
    value: 0.17067,
    version: "2023.1",
  },
  {
    id: "ef-waste-landfill",
    name: "General waste — landfilled",
    source: "DEFRA 2023",
    category: "waste",
    geography: "UK",
    year: 2023,
    unit: "kgCO2e/tonne",
    value: 458.9,
    version: "2023.1",
  },
  {
    id: "ef-waste-recycle",
    name: "Waste — recycled",
    source: "DEFRA 2023",
    category: "waste",
    geography: "UK",
    year: 2023,
    unit: "kgCO2e/tonne",
    value: 21.3,
    version: "2023.1",
  },
  {
    id: "ef-textiles",
    name: "Textiles — kit & apparel (spend-based)",
    source: "USEEIO",
    category: "purchased_goods",
    geography: "Global",
    year: 2023,
    unit: "kgCO2e/£",
    value: 0.784,
    version: "2.0",
  },
  {
    id: "ef-food",
    name: "Food & beverage (spend-based)",
    source: "USEEIO",
    category: "purchased_goods",
    geography: "UK",
    year: 2023,
    unit: "kgCO2e/£",
    value: 1.124,
    version: "2.0",
  },
  {
    id: "ef-merch",
    name: "Merchandise — plastics & mixed (spend-based)",
    source: "USEEIO",
    category: "purchased_goods",
    geography: "Global",
    year: 2023,
    unit: "kgCO2e/£",
    value: 0.612,
    version: "2.0",
  },
  {
    id: "ef-water",
    name: "Water supply — UK",
    source: "DEFRA 2023",
    category: "water",
    geography: "UK",
    year: 2023,
    unit: "kgCO2e/m³",
    value: 0.149,
    version: "2023.1",
  },
];

// -----------------------------------------------------------------------
// Suppliers
// -----------------------------------------------------------------------

const supplierTemplates = [
  ["Umbrae Sportswear", "Apparel & Kit", 0.38, 72],
  ["Field & Flock Catering", "Food Services", 0.22, 58],
  ["Compass Grounds Ltd", "Groundskeeping", 0.08, 81],
  ["Meridian Energy Supply", "Energy", 0.95, 44],
  ["Thames Water Utilities", "Water", 0.11, 67],
  ["Brakes Food Service", "Food Services", 0.25, 51],
  ["Allsports Merch Co.", "Merchandise", 0.28, 39],
  ["Greenway Travel", "Travel & Logistics", 0.41, 77],
  ["Bright Star Cleaning", "Facilities Services", 0.06, 63],
  ["SecureGuard UK", "Security", 0.05, 71],
  ["Coldstream Logistics", "Transport", 0.48, 41],
  ["Cedar Print & Signage", "Print", 0.18, 55],
  ["Vivid Tech Solutions", "Broadcasting Tech", 0.09, 68],
  ["Hexagon Build Ltd", "Construction", 0.31, 48],
  ["Prime Turf Supply", "Groundskeeping", 0.14, 59],
  ["Kingfisher Marketing", "Marketing", 0.03, 82],
  ["Sable Legal Services", "Professional Svc", 0.02, 88],
  ["Archer Accountants", "Professional Svc", 0.03, 91],
  ["BlueSky Cloud Services", "IT Services", 0.12, 74],
  ["Phoenix Insurance Group", "Insurance", 0.04, 69],
  ["Northern Petroleum", "Fuels", 0.92, 32],
  ["SustainBrew Beverages", "F&B", 0.19, 78],
  ["Carbon Audit Partners", "Consulting", 0.02, 94],
  ["Mercer Event Hire", "Event Services", 0.15, 56],
  ["Fleet First Leasing", "Vehicle Fleet", 0.44, 49],
] as const;

export const suppliers: Supplier[] = supplierTemplates.map((t, i) => {
  const rand = seededRandom(42 + i);
  const baseSpend = 80_000 + rand() * 1_500_000;
  const spend = Math.round(baseSpend / 1000) * 1000;
  return {
    id: `sup-${i + 1}`,
    name: t[0],
    category: t[1],
    annual_spend: spend,
    esg_score: t[3] as number,
    co2e_tonnes: Math.round((spend / 1000) * (t[2] as number) * 10) / 10,
    tier: (i % 3 === 0 ? 1 : i % 3 === 1 ? 2 : 3) as 1 | 2 | 3,
  };
});

// -----------------------------------------------------------------------
// Emission records — 12 months x facilities x categories
// Models realistic matchday/seasonal patterns
// -----------------------------------------------------------------------

const MONTHS = [
  "2024-07", "2024-08", "2024-09", "2024-10", "2024-11", "2024-12",
  "2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06",
];

// Matchday intensity index (0-1) per month — UK football season peaks Sep-May
const MATCHDAY_INDEX = [0.2, 0.4, 0.9, 1.0, 0.95, 0.85, 0.8, 0.9, 0.95, 0.9, 0.6, 0.15];

// Heating demand index — winter peaks
const HEATING_INDEX = [0.2, 0.2, 0.3, 0.55, 0.85, 1.0, 1.0, 0.95, 0.75, 0.5, 0.3, 0.2];

export function generateEmissions(): EmissionRecord[] {
  const records: EmissionRecord[] = [];
  const rand = seededRandom(100);
  let idx = 1;

  const mkId = () => `em-${String(idx++).padStart(5, "0")}`;

  MONTHS.forEach((period, mi) => {
    const matchday = MATCHDAY_INDEX[mi];
    const heating = HEATING_INDEX[mi];

    // --- STADIUM ---
    // Scope 2: electricity (floodlights peak on matchdays)
    const stadiumElec = 420_000 * (0.55 + 0.45 * matchday) + rand() * 18_000;
    records.push(mkRecord({
      id: mkId(), scope: 2, category: "electricity", activity: "Stadium electricity",
      facility_id: "fac-stadium", period, activity_value: Math.round(stadiumElec),
      activity_unit: "kWh", factor_id: "ef-elec-uk", factor_value: 0.20705,
      factor_unit: "kgCO2e/kWh", cost_per_unit: 0.34, quality: 4,
      methodology: "Location-based, grid average (DEFRA 2023)",
      supplier_id: "sup-4", rand,
    }));

    // Scope 1: natural gas (winter peak)
    const stadiumGas = 180_000 * (0.25 + 0.75 * heating) + rand() * 8_000;
    records.push(mkRecord({
      id: mkId(), scope: 1, category: "stationary_combustion", activity: "Stadium natural gas",
      facility_id: "fac-stadium", period, activity_value: Math.round(stadiumGas),
      activity_unit: "kWh", factor_id: "ef-natgas", factor_value: 0.18293,
      factor_unit: "kgCO2e/kWh", cost_per_unit: 0.07, quality: 5,
      methodology: "Metered consumption, HHV", supplier_id: "sup-4", rand,
    }));

    // Scope 3: fan travel (proxy via matchday)
    const fanTravel = 2_400_000 * matchday + rand() * 60_000;
    records.push(mkRecord({
      id: mkId(), scope: 3, category: "fan_travel",
      activity: "Fan travel — modal split survey",
      facility_id: "fac-stadium", period, activity_value: Math.round(fanTravel),
      activity_unit: "passenger-km", factor_id: "ef-car-av", factor_value: 0.12,
      factor_unit: "kgCO2e/passenger-km (weighted)", cost_per_unit: 0,
      quality: 2, methodology: "Survey + modal split blend", rand,
    }));

    // Scope 3: waste
    const stadiumWaste = 42 * (0.5 + 0.5 * matchday) + rand() * 4;
    records.push(mkRecord({
      id: mkId(), scope: 3, category: "waste", activity: "Stadium waste — landfill",
      facility_id: "fac-stadium", period, activity_value: Math.round(stadiumWaste * 10) / 10,
      activity_unit: "tonnes", factor_id: "ef-waste-landfill", factor_value: 458.9,
      factor_unit: "kgCO2e/tonne", cost_per_unit: 120, quality: 3,
      methodology: "Contractor weighbridge data", supplier_id: "sup-9", rand,
    }));

    // Scope 3: food & beverage procurement (matchday driven)
    const fbSpend = 120_000 * (0.4 + 0.6 * matchday) + rand() * 5_000;
    records.push(mkRecord({
      id: mkId(), scope: 3, category: "purchased_goods", activity: "Matchday F&B procurement",
      facility_id: "fac-stadium", period, activity_value: Math.round(fbSpend),
      activity_unit: "£", factor_id: "ef-food", factor_value: 1.124,
      factor_unit: "kgCO2e/£", cost_per_unit: 1, quality: 3,
      methodology: "Spend-based, USEEIO", supplier_id: "sup-2", rand,
    }));

    // --- TRAINING GROUND ---
    const trainElec = 68_000 + rand() * 4_000;
    records.push(mkRecord({
      id: mkId(), scope: 2, category: "electricity", activity: "Training ground electricity",
      facility_id: "fac-training", period, activity_value: Math.round(trainElec),
      activity_unit: "kWh", factor_id: "ef-elec-uk", factor_value: 0.20705,
      factor_unit: "kgCO2e/kWh", cost_per_unit: 0.32, quality: 4,
      methodology: "Location-based", supplier_id: "sup-4", rand,
    }));

    const trainDiesel = 2_400 * (0.6 + 0.4 * matchday) + rand() * 200;
    records.push(mkRecord({
      id: mkId(), scope: 1, category: "mobile_combustion", activity: "Pitch maintenance diesel",
      facility_id: "fac-training", period, activity_value: Math.round(trainDiesel),
      activity_unit: "litres", factor_id: "ef-diesel", factor_value: 2.5562,
      factor_unit: "kgCO2e/litre", cost_per_unit: 1.58, quality: 4,
      methodology: "Fuel card records", supplier_id: "sup-21", rand,
    }));

    // --- HQ OFFICE ---
    const hqElec = 19_400 + rand() * 1_500;
    records.push(mkRecord({
      id: mkId(), scope: 2, category: "electricity", activity: "HQ office electricity",
      facility_id: "fac-hq", period, activity_value: Math.round(hqElec),
      activity_unit: "kWh", factor_id: "ef-elec-uk", factor_value: 0.20705,
      factor_unit: "kgCO2e/kWh", cost_per_unit: 0.35, quality: 5,
      methodology: "Smart meter data", supplier_id: "sup-4", rand,
    }));

    // Scope 3: business travel (flights & rail, varies per month)
    const flights = 22_000 * (0.4 + 0.6 * matchday) + rand() * 1_500;
    records.push(mkRecord({
      id: mkId(), scope: 3, category: "business_travel",
      activity: "Business travel — short-haul flights",
      facility_id: "fac-hq", period, activity_value: Math.round(flights),
      activity_unit: "passenger-km", factor_id: "ef-flight-sh", factor_value: 0.15102,
      factor_unit: "kgCO2e/pkm", cost_per_unit: 0.14, quality: 3,
      methodology: "Travel agency booking data", supplier_id: "sup-8", rand,
    }));

    // Scope 3: kit & merch (quarterly-ish)
    if ([0, 3, 6, 9].includes(mi)) {
      const kitSpend = 240_000 + rand() * 40_000;
      records.push(mkRecord({
        id: mkId(), scope: 3, category: "purchased_goods",
        activity: "Kit & apparel purchases",
        facility_id: "fac-hq", period, activity_value: Math.round(kitSpend),
        activity_unit: "£", factor_id: "ef-textiles", factor_value: 0.784,
        factor_unit: "kgCO2e/£", cost_per_unit: 1, quality: 3,
        methodology: "Spend-based, USEEIO", supplier_id: "sup-1", rand,
      }));
    }

    // Scope 3: water
    const stadiumWater = 1_200 * (0.7 + 0.3 * matchday) + rand() * 80;
    records.push(mkRecord({
      id: mkId(), scope: 3, category: "water", activity: "Stadium water supply",
      facility_id: "fac-stadium", period, activity_value: Math.round(stadiumWater),
      activity_unit: "m³", factor_id: "ef-water", factor_value: 0.149,
      factor_unit: "kgCO2e/m³", cost_per_unit: 2.85, quality: 4,
      methodology: "Metered", supplier_id: "sup-5", rand,
    }));
  });

  return records;
}

function mkRecord(opts: {
  id: string;
  scope: 1 | 2 | 3;
  category: any;
  activity: string;
  facility_id: string;
  period: string;
  activity_value: number;
  activity_unit: string;
  factor_id: string;
  factor_value: number;
  factor_unit: string;
  cost_per_unit: number;
  quality: 1 | 2 | 3 | 4 | 5;
  methodology: string;
  supplier_id?: string;
  rand: () => number;
}): EmissionRecord {
  const co2e_tonnes =
    opts.activity_unit === "£"
      ? (opts.activity_value * opts.factor_value) / 1000
      : (opts.activity_value * opts.factor_value) / 1000;

  const actual_cost =
    opts.activity_unit === "£" ? opts.activity_value : opts.activity_value * opts.cost_per_unit;

  // Should-cost = 75-95% of actual cost depending on category
  const efficiencyFactor = 0.72 + opts.rand() * 0.18;
  const should_cost = Math.round(actual_cost * efficiencyFactor);
  const waste_cost = Math.round(actual_cost - should_cost);
  const cost_intensity = co2e_tonnes > 0 ? actual_cost / co2e_tonnes : 0;

  return {
    id: opts.id,
    scope: opts.scope,
    category: opts.category,
    activity: opts.activity,
    facility_id: opts.facility_id,
    period: opts.period,
    activity_value: opts.activity_value,
    activity_unit: opts.activity_unit,
    factor_id: opts.factor_id,
    factor_value: opts.factor_value,
    factor_unit: opts.factor_unit,
    co2e_tonnes: Math.round(co2e_tonnes * 100) / 100,
    actual_cost: Math.round(actual_cost),
    should_cost,
    waste_cost,
    cost_intensity: Math.round(cost_intensity * 10) / 10,
    data_quality: opts.quality,
    supplier_id: opts.supplier_id,
    methodology: opts.methodology,
    verified: opts.rand() > 0.15,
  };
}

export const emissions: EmissionRecord[] = generateEmissions();

// -----------------------------------------------------------------------
// Opportunities / reduction initiatives
// -----------------------------------------------------------------------

export const opportunities: Opportunity[] = [
  {
    id: "opp-01",
    title: "LED retrofit — stadium floodlights & concourse",
    description:
      "Replace 1,240 halide floodlights and concourse fixtures with dimmable LED. Retains broadcast-grade light levels while cutting matchday load by ~58%.",
    scope: 2,
    category: "electricity",
    facility_id: "fac-stadium",
    abatement_tco2e: 412,
    annual_savings_gbp: 685_000,
    capex_gbp: 1_420_000,
    payback_years: 2.1,
    mac_cost: -1662, // £ saved per tCO2e abated
    confidence: "high",
    status: "approved",
    owner: "M. Chen (Facilities)",
    target_date: "2025-09-30",
  },
  {
    id: "opp-02",
    title: "HVAC schedule optimization (non-matchday idle)",
    description:
      "BMS rule change: deep-setback HVAC outside matchday + 4h prep window. No capital required; pure operational change.",
    scope: 2,
    category: "electricity",
    facility_id: "fac-stadium",
    abatement_tco2e: 184,
    annual_savings_gbp: 295_000,
    capex_gbp: 12_000,
    payback_years: 0.04,
    mac_cost: -1603,
    confidence: "high",
    status: "in_progress",
    owner: "D. Okafor (BMS)",
    target_date: "2025-06-30",
    actual_savings_gbp: 78_000,
    actual_abatement: 54,
  },
  {
    id: "opp-03",
    title: "Gas boiler → heat pump hybrid",
    description:
      "Replace primary gas boiler with 1.2MW air-source heat pump hybrid. Sized for stadium heating + changing rooms. Keeps gas for peak draw.",
    scope: 1,
    category: "stationary_combustion",
    facility_id: "fac-stadium",
    abatement_tco2e: 264,
    annual_savings_gbp: -18_000, // slight opex increase initially
    capex_gbp: 780_000,
    payback_years: 8.5,
    mac_cost: 68,
    confidence: "medium",
    status: "proposed",
  },
  {
    id: "opp-04",
    title: "PPA — 100% renewable electricity",
    description:
      "5-year corporate PPA with a Scottish wind portfolio. Switches market-based Scope 2 to near-zero. Cost-neutral vs current tariff with hedge value.",
    scope: 2,
    category: "electricity",
    facility_id: "fac-stadium",
    abatement_tco2e: 1_210,
    annual_savings_gbp: 42_000,
    capex_gbp: 0,
    payback_years: 0,
    mac_cost: -35,
    confidence: "high",
    status: "approved",
    owner: "S. Raman (Procurement)",
    target_date: "2025-08-01",
  },
  {
    id: "opp-05",
    title: "Fleet — EV transition (ops vans)",
    description:
      "Replace 14 diesel vans with EV on next lease cycle. Charging via on-site solar car port.",
    scope: 1,
    category: "mobile_combustion",
    facility_id: "fac-training",
    abatement_tco2e: 38,
    annual_savings_gbp: 24_000,
    capex_gbp: 62_000,
    payback_years: 2.6,
    mac_cost: -632,
    confidence: "high",
    status: "proposed",
  },
  {
    id: "opp-06",
    title: "Waste — source separation + compactor",
    description:
      "Move from single-stream to 4-stream at concourses. 62% landfill → 18% landfill, balance to recycling + AD.",
    scope: 3,
    category: "waste",
    facility_id: "fac-stadium",
    abatement_tco2e: 142,
    annual_savings_gbp: 48_000,
    capex_gbp: 85_000,
    payback_years: 1.8,
    mac_cost: -338,
    confidence: "high",
    status: "in_progress",
    owner: "J. Hartley (Ops)",
    target_date: "2025-07-15",
    actual_savings_gbp: 11_000,
    actual_abatement: 34,
  },
  {
    id: "opp-07",
    title: "Rail-first travel policy",
    description:
      "Mandate rail for all UK business travel under 600km. 1:1 travel-day budget parity removes the time penalty.",
    scope: 3,
    category: "business_travel",
    facility_id: "fac-hq",
    abatement_tco2e: 48,
    annual_savings_gbp: 14_000,
    capex_gbp: 0,
    payback_years: 0,
    mac_cost: -292,
    confidence: "medium",
    status: "approved",
    owner: "K. Ellis (HR)",
    target_date: "2025-07-01",
  },
  {
    id: "opp-08",
    title: "Supplier engagement — top 5 by emissions",
    description:
      "Launch targeted engagement with 5 highest-emitting Tier-1 suppliers; require verified product-level factors + annual reduction plans.",
    scope: 3,
    category: "purchased_goods",
    facility_id: "fac-hq",
    abatement_tco2e: 186,
    annual_savings_gbp: 38_000,
    capex_gbp: 15_000,
    payback_years: 0.4,
    mac_cost: -124,
    confidence: "medium",
    status: "proposed",
  },
  {
    id: "opp-09",
    title: "Solar canopy — car park (680 kWp)",
    description:
      "680 kWp PV canopy over West car park. Behind-the-meter consumption; any surplus exported under SEG.",
    scope: 2,
    category: "electricity",
    facility_id: "fac-stadium",
    abatement_tco2e: 138,
    annual_savings_gbp: 96_000,
    capex_gbp: 580_000,
    payback_years: 6.0,
    mac_cost: -612,
    confidence: "high",
    status: "proposed",
  },
  {
    id: "opp-10",
    title: "Active fan travel — public transit subsidy",
    description:
      "Free stadium-linked rail travel on matchdays via bundled ticket. Modal shift study suggests 12pp drive → train.",
    scope: 3,
    category: "fan_travel",
    facility_id: "fac-stadium",
    abatement_tco2e: 420,
    annual_savings_gbp: -180_000, // net cost
    capex_gbp: 0,
    payback_years: 0,
    mac_cost: 428,
    confidence: "medium",
    status: "proposed",
  },
  {
    id: "opp-11",
    title: "Refrigerant leak detection & R-32 conversion",
    description:
      "Chilled water systems — fix leaks + migrate to R-32 on next service. Reduces fugitive + GWP exposure.",
    scope: 1,
    category: "refrigerants",
    facility_id: "fac-stadium",
    abatement_tco2e: 26,
    annual_savings_gbp: 8_400,
    capex_gbp: 34_000,
    payback_years: 4.0,
    mac_cost: -323,
    confidence: "medium",
    status: "proposed",
  },
  {
    id: "opp-12",
    title: "Kit sustainability — recycled poly target",
    description:
      "Work with Umbrae Sportswear on a 65% recycled polyester blend across replica and match kits. 3-year glide path.",
    scope: 3,
    category: "purchased_goods",
    facility_id: "fac-hq",
    abatement_tco2e: 92,
    annual_savings_gbp: -12_000,
    capex_gbp: 0,
    payback_years: 0,
    mac_cost: 130,
    confidence: "low",
    status: "proposed",
  },
];

// -----------------------------------------------------------------------
// Teardown decomposition — stadium electricity
// -----------------------------------------------------------------------

export const teardowns: TeardownDecomposition[] = [
  {
    facility_id: "fac-stadium",
    period: "FY25",
    category: "electricity",
    base_load_kwh: 1_680_000,
    production_load_kwh: 2_240_000,
    waste_load_kwh: 1_100_000,
    base_load_cost: 571_200,
    production_load_cost: 761_600,
    waste_load_cost: 374_000,
    benchmark_kwh_per_sqm: 81,
    actual_kwh_per_sqm: 104,
    waste_drivers: [
      { driver: "HVAC running non-matchdays", cost: 152_000, co2e: 92 },
      { driver: "Floodlights inefficient vs LED benchmark", cost: 98_000, co2e: 58 },
      { driver: "Hospitality suites unoccupied heating", cost: 64_000, co2e: 38 },
      { driver: "Standby loads (displays, PoE)", cost: 38_000, co2e: 22 },
      { driver: "Pump scheduling — cooling towers", cost: 22_000, co2e: 13 },
    ],
  },
  {
    facility_id: "fac-training",
    period: "FY25",
    category: "electricity",
    base_load_kwh: 420_000,
    production_load_kwh: 298_000,
    waste_load_kwh: 102_000,
    base_load_cost: 134_400,
    production_load_cost: 95_360,
    waste_load_cost: 32_640,
    benchmark_kwh_per_sqm: 48,
    actual_kwh_per_sqm: 67,
    waste_drivers: [
      { driver: "Pitch irrigation pump over-cycling", cost: 14_000, co2e: 8 },
      { driver: "Floodlight dimming schedule gap", cost: 9_800, co2e: 6 },
      { driver: "Changing room air-con overnight", cost: 5_600, co2e: 3 },
      { driver: "Staff kitchen appliances standby", cost: 2_200, co2e: 1 },
      { driver: "Lighting — corridors motion sensor fault", cost: 1_040, co2e: 1 },
    ],
  },
];

// -----------------------------------------------------------------------
// Audit events
// -----------------------------------------------------------------------

export const auditEvents: AuditEvent[] = [
  { id: "ae-001", timestamp: "2025-04-10T09:12:40Z", actor: "S. Raman", entity_type: "EmissionFactor", entity_id: "ef-elec-uk", action: "updated", detail: "Switched 2022 → 2023 DEFRA grid factor" },
  { id: "ae-002", timestamp: "2025-04-11T14:03:22Z", actor: "D. Okafor", entity_type: "Initiative", entity_id: "opp-02", action: "status_changed", detail: "proposed → in_progress" },
  { id: "ae-003", timestamp: "2025-04-12T11:45:01Z", actor: "K. Ellis", entity_type: "Report", entity_id: "rep-001", action: "submitted_for_review" },
  { id: "ae-004", timestamp: "2025-04-13T08:22:19Z", actor: "system", entity_type: "Invoice", entity_id: "inv-8821", action: "extracted", detail: "Utility bill → 38,420 kWh @ £0.34" },
  { id: "ae-005", timestamp: "2025-04-13T16:30:05Z", actor: "M. Chen", entity_type: "Opportunity", entity_id: "opp-01", action: "approved", detail: "Capex £1.42M signed off" },
  { id: "ae-006", timestamp: "2025-04-14T10:14:52Z", actor: "J. Hartley", entity_type: "EmissionRecord", entity_id: "em-00034", action: "verified" },
  { id: "ae-007", timestamp: "2025-04-14T13:44:30Z", actor: "system", entity_type: "Report", entity_id: "rep-002", action: "generated", detail: "BRSR Principle 6 — 8 sections, 48 disclosures" },
  { id: "ae-008", timestamp: "2025-04-15T09:00:00Z", actor: "S. Raman", entity_type: "Supplier", entity_id: "sup-1", action: "requested_factor", detail: "Product-level EF request to Umbrae" },
  { id: "ae-009", timestamp: "2025-04-15T15:22:10Z", actor: "CFO (approver)", entity_type: "Report", entity_id: "rep-002", action: "approved" },
  { id: "ae-010", timestamp: "2025-04-16T08:30:44Z", actor: "system", entity_type: "Calculation", entity_id: "calc-q4", action: "run", detail: "Q4 recompute: 420 records, 0 errors" },
];

// -----------------------------------------------------------------------
// Reports
// -----------------------------------------------------------------------

export const reports: Report[] = [
  { id: "rep-001", title: "FY25 Interim BRSR Principle 6", framework: "BRSR", period: "H1 FY25", status: "approved", version: "1.2", created_at: "2025-02-18", created_by: "K. Ellis" },
  { id: "rep-002", title: "CDP Climate Change 2024", framework: "CDP", period: "FY24", status: "submitted", version: "2.0", created_at: "2024-07-28", created_by: "S. Raman" },
  { id: "rep-003", title: "FY24 Annual CSRD Gap Assessment", framework: "CSRD", period: "FY24", status: "draft", version: "0.3", created_at: "2025-03-12", created_by: "K. Ellis" },
  { id: "rep-004", title: "TCFD Disclosure — FY24", framework: "TCFD", period: "FY24", status: "approved", version: "1.0", created_at: "2024-11-04", created_by: "CFO office" },
];

// -----------------------------------------------------------------------
// Frameworks
// -----------------------------------------------------------------------

export const frameworks: Framework[] = [
  {
    id: "BRSR",
    name: "Business Responsibility & Sustainability Report",
    description: "Indian regulatory framework for listed entities; Principle 6 covers environment.",
    disclosures: [
      { id: "P6.Q1", title: "Energy consumption by source", metric_refs: ["scope_1_energy", "scope_2_energy"] },
      { id: "P6.Q2", title: "Scope 1 & 2 GHG emissions (tCO2e)", metric_refs: ["scope_1_total", "scope_2_total"] },
      { id: "P6.Q3", title: "Emission intensity (tCO2e/£M revenue)", metric_refs: ["intensity_revenue"] },
      { id: "P6.Q4", title: "Reduction projects undertaken", metric_refs: ["initiatives_completed", "tco2e_abated"] },
      { id: "P6.Q5", title: "Water consumption", metric_refs: ["water_m3"] },
      { id: "P6.Q6", title: "Waste management", metric_refs: ["waste_tonnes", "recycling_rate"] },
      { id: "P6.Q7", title: "Air emissions (other than GHG)", metric_refs: ["nox", "sox", "pm"] },
      { id: "P6.Q8", title: "EIA & compliance", metric_refs: ["eia_status"] },
    ],
  },
  {
    id: "CDP",
    name: "CDP Climate Change",
    description: "Investor-led global disclosure on climate, water and forests.",
    disclosures: [
      { id: "C1", title: "Governance", metric_refs: ["board_oversight"] },
      { id: "C2", title: "Risks & opportunities", metric_refs: ["risk_register"] },
      { id: "C3", title: "Business strategy", metric_refs: ["strategy_narrative"] },
      { id: "C4", title: "Targets & performance", metric_refs: ["sbti_target", "progress"] },
      { id: "C5", title: "Emissions methodology", metric_refs: ["methodology"] },
      { id: "C6", title: "Emissions data", metric_refs: ["scope_1_total", "scope_2_total", "scope_3_total"] },
      { id: "C7", title: "Emissions breakdowns", metric_refs: ["by_facility", "by_category"] },
      { id: "C8", title: "Energy", metric_refs: ["energy_by_source"] },
      { id: "C9", title: "Additional metrics", metric_refs: ["custom"] },
    ],
  },
  {
    id: "CSRD",
    name: "CSRD / ESRS",
    description: "EU Corporate Sustainability Reporting Directive — ESRS standards.",
    disclosures: [
      { id: "E1-1", title: "Transition plan for climate change mitigation", metric_refs: ["transition_plan"] },
      { id: "E1-4", title: "Targets related to climate change", metric_refs: ["sbti_target"] },
      { id: "E1-5", title: "Energy consumption and mix", metric_refs: ["energy_mix"] },
      { id: "E1-6", title: "Gross Scopes 1, 2, 3 and total emissions", metric_refs: ["scope_1_total", "scope_2_total", "scope_3_total"] },
    ],
  },
  {
    id: "TCFD",
    name: "TCFD — Task Force on Climate-related Financial Disclosures",
    description: "Four-pillar framework: Governance, Strategy, Risk Management, Metrics & Targets.",
    disclosures: [
      { id: "G-a", title: "Board oversight of climate", metric_refs: ["board_oversight"] },
      { id: "S-a", title: "Climate risks & opportunities", metric_refs: ["risk_register"] },
      { id: "R-a", title: "Risk identification process", metric_refs: ["risk_process"] },
      { id: "M-a", title: "Metrics used to assess climate", metric_refs: ["all_scopes"] },
    ],
  },
];

// -----------------------------------------------------------------------
// Aggregates helpers
// -----------------------------------------------------------------------

export function totalsByScope() {
  const s1 = emissions.filter(e => e.scope === 1).reduce((a, e) => a + e.co2e_tonnes, 0);
  const s2 = emissions.filter(e => e.scope === 2).reduce((a, e) => a + e.co2e_tonnes, 0);
  const s3 = emissions.filter(e => e.scope === 3).reduce((a, e) => a + e.co2e_tonnes, 0);
  return {
    scope1: Math.round(s1 * 10) / 10,
    scope2: Math.round(s2 * 10) / 10,
    scope3: Math.round(s3 * 10) / 10,
    total: Math.round((s1 + s2 + s3) * 10) / 10,
  };
}

export function totalsByMonth() {
  return MONTHS.map(period => {
    const rec = emissions.filter(e => e.period === period);
    return {
      period,
      scope1: Math.round(rec.filter(e => e.scope === 1).reduce((a, e) => a + e.co2e_tonnes, 0) * 10) / 10,
      scope2: Math.round(rec.filter(e => e.scope === 2).reduce((a, e) => a + e.co2e_tonnes, 0) * 10) / 10,
      scope3: Math.round(rec.filter(e => e.scope === 3).reduce((a, e) => a + e.co2e_tonnes, 0) * 10) / 10,
      total: Math.round(rec.reduce((a, e) => a + e.co2e_tonnes, 0) * 10) / 10,
    };
  });
}

export function totalCostMetrics() {
  const actual = emissions.reduce((a, e) => a + e.actual_cost, 0);
  const should = emissions.reduce((a, e) => a + e.should_cost, 0);
  const waste = emissions.reduce((a, e) => a + e.waste_cost, 0);
  return {
    actual_cost: Math.round(actual),
    should_cost: Math.round(should),
    waste_cost: Math.round(waste),
    waste_pct: Math.round((waste / actual) * 1000) / 10,
  };
}

export function byCategory() {
  const groups = new Map<string, number>();
  emissions.forEach(e => {
    groups.set(e.category, (groups.get(e.category) ?? 0) + e.co2e_tonnes);
  });
  return Array.from(groups.entries())
    .map(([category, co2e_tonnes]) => ({ category, co2e_tonnes: Math.round(co2e_tonnes * 10) / 10 }))
    .sort((a, b) => b.co2e_tonnes - a.co2e_tonnes);
}

export function byFacility() {
  return facilities.map(f => {
    const rec = emissions.filter(e => e.facility_id === f.id);
    return {
      facility: f,
      scope1: Math.round(rec.filter(e => e.scope === 1).reduce((a, e) => a + e.co2e_tonnes, 0) * 10) / 10,
      scope2: Math.round(rec.filter(e => e.scope === 2).reduce((a, e) => a + e.co2e_tonnes, 0) * 10) / 10,
      scope3: Math.round(rec.filter(e => e.scope === 3).reduce((a, e) => a + e.co2e_tonnes, 0) * 10) / 10,
      total: Math.round(rec.reduce((a, e) => a + e.co2e_tonnes, 0) * 10) / 10,
      actual_cost: rec.reduce((a, e) => a + e.actual_cost, 0),
      waste_cost: rec.reduce((a, e) => a + e.waste_cost, 0),
    };
  });
}

export const CATEGORY_LABELS: Record<string, string> = {
  stationary_combustion: "Stationary combustion",
  mobile_combustion: "Mobile combustion",
  refrigerants: "Refrigerants",
  electricity: "Electricity",
  heat_steam: "Heat & steam",
  purchased_goods: "Purchased goods",
  fuel_energy_upstream: "Fuel & energy (upstream)",
  upstream_transport: "Upstream transport",
  waste: "Waste",
  business_travel: "Business travel",
  commuting: "Commuting",
  fan_travel: "Fan travel",
  water: "Water",
};

export { MONTHS };
