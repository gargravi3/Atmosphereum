import { loadTeardowns, loadFacilities } from "@/lib/db";
import { TeardownView } from "./teardown-view";

export const dynamic = "force-dynamic";

export default async function TeardownPage() {
  const [teardowns, facilities] = await Promise.all([loadTeardowns(), loadFacilities()]);
  return (
    <TeardownView
      teardowns={teardowns}
      facilities={facilities.map((f) => ({ id: f.id, name: f.name, area_sqm: f.area_sqm }))}
    />
  );
}
