import { loadSuppliers, loadAllInvoices, loadSupplierOnboarding } from "@/lib/db";
import { SuppliersView } from "./suppliers-view";

export const dynamic = "force-dynamic";

export default async function SuppliersPage() {
  const [suppliers, invoices, onboarding] = await Promise.all([
    loadSuppliers(),
    loadAllInvoices(),
    loadSupplierOnboarding(),
  ]);
  return <SuppliersView suppliers={suppliers} invoices={invoices} onboarding={onboarding} />;
}
