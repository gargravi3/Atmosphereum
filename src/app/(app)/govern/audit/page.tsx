import { loadAuditEvents } from "@/lib/db";
import { AuditView } from "./audit-view";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const events = await loadAuditEvents(500);
  return <AuditView events={events} />;
}
