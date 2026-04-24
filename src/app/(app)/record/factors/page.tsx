import { loadFactors, CATEGORY_LABELS } from "@/lib/db";
import { FactorsView } from "./factors-view";

export const dynamic = "force-dynamic";

export default async function FactorsPage() {
  const factors = await loadFactors();
  return <FactorsView factors={factors} categoryLabels={CATEGORY_LABELS} />;
}
