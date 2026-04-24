import { loadOpportunities } from "@/lib/db";
import { MacCurveView } from "./mac-curve-view";

export const dynamic = "force-dynamic";

export default async function MacCurvePage() {
  const opportunities = await loadOpportunities();
  return <MacCurveView opportunities={opportunities} />;
}
