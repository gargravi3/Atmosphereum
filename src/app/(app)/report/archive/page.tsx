import { loadReports } from "@/lib/db";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

function fmtDate(d: unknown): string {
  if (!d) return "—";
  if (d instanceof Date) return d.toISOString().slice(0, 10);
  if (typeof d === "string") return d.slice(0, 10);
  return String(d);
}

export default async function ArchivePage() {
  const reports = await loadReports();
  return (
    <div className="px-8 py-10 space-y-8">
      <SectionHeader
        eyebrow="Report · Archive"
        title="Every report, versioned."
        description="Immutable record of all generated, reviewed and submitted disclosures. Full audit lineage from each report back to the source ledger."
        actions={<Button>New report</Button>}
      />

      <div className="border border-rule bg-paper-soft overflow-hidden">
        <table className="w-full text-sm data-grid">
          <thead className="bg-paper-warm">
            <tr className="border-b border-rule text-left">
              <th className="px-5 py-3 text-[10px] uppercase tracking-widest text-ink-muted">Title</th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-ink-muted">Framework</th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-ink-muted">Period</th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-ink-muted">Status</th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-ink-muted">Completion</th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-ink-muted">Created</th>
              <th className="px-4 py-3 text-[10px] uppercase tracking-widest text-ink-muted">Author</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id} className="border-b border-rule last:border-0 hover:bg-paper-warm transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-3.5 h-3.5 text-ink-muted" />
                    <span className="font-medium">{r.title}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <Badge variant="default">{r.framework_code}</Badge>
                </td>
                <td className="px-4 py-4 font-mono tabular text-ink-soft">{r.period}</td>
                <td className="px-4 py-4">
                  <Badge
                    variant={
                      r.status === "approved" || r.status === "submitted"
                        ? "moss"
                        : r.status === "in_review"
                        ? "ochre"
                        : "outline"
                    }
                  >
                    {r.status.replace("_", " ")}
                  </Badge>
                </td>
                <td className="px-4 py-4 font-mono tabular">{r.completion_pct}%</td>
                <td className="px-4 py-4 font-mono text-ink-soft">{fmtDate(r.created_at)}</td>
                <td className="px-4 py-4 text-ink-soft">{r.created_by}</td>
                <td className="px-5 py-4 text-right">
                  <Button variant="ghost" size="sm">
                    <Download className="w-3 h-3" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {reports.length === 0 && (
        <div className="border border-rule bg-paper-soft p-8 text-center text-ink-muted text-sm">
          No reports generated yet.
        </div>
      )}
    </div>
  );
}
