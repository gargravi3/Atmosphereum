import { loadFrameworks, loadFrameworkMappings } from "@/lib/db";
import { FrameworksView } from "./frameworks-view";

export const dynamic = "force-dynamic";

export default async function FrameworksPage() {
  const [frameworks, mappings] = await Promise.all([loadFrameworks(), loadFrameworkMappings()]);
  return <FrameworksView frameworks={frameworks} mappings={mappings} />;
}
