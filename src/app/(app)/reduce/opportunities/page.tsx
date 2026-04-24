import { loadOpportunities, loadFacilities } from "@/lib/db";
import { OpportunitiesView } from "./opportunities-view";

export const dynamic = "force-dynamic";

export default async function OpportunitiesPage() {
  const [opportunities, facilities] = await Promise.all([loadOpportunities(), loadFacilities()]);
  return (
    <OpportunitiesView
      opportunities={opportunities}
      facilities={facilities.map((f) => ({ id: f.id, name: f.name }))}
    />
  );
}
