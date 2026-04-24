import { loadApprovals } from "@/lib/db";
import { ApprovalsView } from "./approvals-view";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const approvals = await loadApprovals();
  return <ApprovalsView approvals={approvals} />;
}
