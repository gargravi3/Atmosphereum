import { loadEmissions, loadFacilities, loadFactors, CATEGORY_LABELS } from "@/lib/db";
import { EmissionsView } from "./emissions-view";

export const dynamic = "force-dynamic";

export default async function EmissionsPage() {
  const [emissions, facilities, factors] = await Promise.all([
    loadEmissions(),
    loadFacilities(),
    loadFactors(),
  ]);
  return (
    <EmissionsView
      emissions={emissions}
      facilities={facilities.map((f) => ({ id: f.id, name: f.name, geography: f.geography }))}
      factors={factors.map((f) => ({ id: f.id, name: f.name, source: f.source, version: f.version }))}
      categoryLabels={CATEGORY_LABELS}
    />
  );
}
