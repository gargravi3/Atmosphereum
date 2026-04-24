"use client";
import { useMemo, useState } from "react";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fmt, cn } from "@/lib/utils";
import { Search, ChevronRight } from "lucide-react";
import type { SupplierRow } from "@/lib/db";

type Invoice = {
  id: string;
  number: string;
  date: unknown;
  value: number;
  currency: string;
  value_usd: number | null;
  scope3_category: number | null;
  status: string;
  co2e_tonnes: number | null;
  carbon_liability_usd: number | null;
  supplier_id: string;
  supplier_name: string;
  facility_name: string | null;
  country: string | null;
};

type Onboarding = {
  id: string;
  supplier_id: string;
  supplier_name: string;
  tier: string | null;
  stage: string;
  invited_at: unknown;
  questionnaire_completed: unknown;
};

export function SuppliersView({
  suppliers,
  invoices,
  onboarding,
}: {
  suppliers: SupplierRow[];
  invoices: Invoice[];
  onboarding: Onboarding[];
}) {
  const [q, setQ] = useState("");
  const [tier, setTier] = useState<"all" | 1 | 2 | 3>("all");
  const [selected, setSelected] = useState<SupplierRow | null>(null);

  const filtered = useMemo(() => {
    return suppliers
      .filter((s) => tier === "all" || s.tier === tier)
      .filter((s) =>
        q === ""
          ? true
          : s.name.toLowerCase().includes(q.toLowerCase()) ||
            s.category.toLowerCase().includes(q.toLowerCase())
      )
      .sort((a, b) => b.annual_spend_gbp - a.annual_spend_gbp);
  }, [suppliers, tier, q]);

  const totalSpend = suppliers.reduce((a, s) => a + s.annual_spend_gbp, 0);
  const totalCo2 = suppliers.reduce((a, s) => a + s.co2e_tonnes, 0);
  const tier1Count = suppliers.filter((s) => s.tier === 1).length;
  const sbtiCount = suppliers.filter((s) => s.has_sbti_target).length;

  const selectedInvoices = selected
    ? invoices.filter((i) => i.supplier_id === selected.id)
    : [];
  const selectedOnboarding = selected
    ? onboarding.find((o) => o.supplier_id === selected.id)
    : null;

  return (
    <div className="px-8 py-10 space-y-8">
      <SectionHeader
        eyebrow="Record · Supplier ledger"
        title="Who we buy from, and at what carbon cost."
        description="Every Tier-1 vendor, their spend, their emissions exposure, and their engagement status. Click any supplier to inspect invoices, onboarding, and engagement history."
        actions={<Button>Invite supplier</Button>}
      />

      <div className="grid grid-cols-4 gap-0 divide-x divide-rule border-y border-rule py-6">
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">Suppliers</div>
          <div className="display-number text-3xl">{suppliers.length}</div>
        </div>
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">Annual spend</div>
          <div className="display-number text-3xl">{fmt.gbpShort(totalSpend)}</div>
        </div>
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">Upstream CO₂e</div>
          <div className="display-number text-3xl text-ember">{fmt.int(totalCo2)}</div>
          <div className="text-xs text-ink-muted font-mono mt-1">tCO₂e / yr</div>
        </div>
        <div className="px-6">
          <div className="text-micro uppercase tracking-widest text-moss mb-2">SBTi aligned</div>
          <div className="display-number text-3xl text-moss">
            {sbtiCount}
            <span className="text-sm text-ink-muted font-mono ml-1">/ {tier1Count}</span>
          </div>
          <div className="text-xs text-ink-muted font-mono mt-1">of Tier-1</div>
        </div>
      </div>

      <div className="flex items-center gap-3 border-y border-rule py-4">
        <div className="flex items-center gap-1 bg-paper-soft border border-rule">
          {(["all", 1, 2, 3] as const).map((t) => (
            <button
              key={String(t)}
              onClick={() => setTier(t)}
              className={cn(
                "px-3 h-8 text-xs font-mono uppercase tracking-wider transition-colors",
                tier === t ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"
              )}
            >
              {t === "all" ? "All tiers" : `Tier ${t}`}
            </button>
          ))}
        </div>
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search supplier or category…"
              className="w-full h-8 pl-8 pr-3 text-sm bg-paper-soft border border-rule focus:border-ink-muted outline-none"
            />
          </div>
        </div>
        <div className="ml-auto text-xs text-ink-muted font-mono">
          {filtered.length} suppliers
        </div>
      </div>

      <div className="border border-rule bg-paper-soft overflow-hidden">
        <table className="w-full text-sm data-grid">
          <thead className="bg-paper-warm">
            <tr className="text-left border-b border-rule">
              <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-ink-muted">Supplier</th>
              <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-ink-muted">Category</th>
              <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-ink-muted">Tier</th>
              <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-ink-muted text-right">Spend / yr</th>
              <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-ink-muted text-right">tCO₂e</th>
              <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-ink-muted">Engagement</th>
              <th className="px-4 py-2.5 text-[10px] uppercase tracking-widest text-ink-muted text-center">ESG</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr
                key={s.id}
                onClick={() => setSelected(s)}
                className="border-b border-rule last:border-0 hover:bg-paper-warm cursor-pointer transition-colors group"
              >
                <td className="px-4 py-3">
                  <div className="font-medium">{s.name}</div>
                  {s.country && <div className="text-[10px] text-ink-muted font-mono">{s.country}</div>}
                </td>
                <td className="px-4 py-3 text-xs text-ink-soft">{s.category}</td>
                <td className="px-4 py-3">
                  <Badge variant={s.tier === 1 ? "ember" : s.tier === 2 ? "ochre" : "outline"}>
                    T{s.tier}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-right font-mono tabular">
                  {fmt.gbpShort(s.annual_spend_gbp)}
                </td>
                <td className="px-4 py-3 text-right font-mono tabular text-ember">
                  {fmt.int(s.co2e_tonnes)}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={s.has_sbti_target ? "moss" : s.engagement_tier === "Strategic" ? "ochre" : "outline"}>
                    {s.has_sbti_target ? "SBTi" : s.engagement_tier ?? "None"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-center">
                  {s.esg_score != null ? (
                    <span className={cn("inline-block w-7 h-5 text-[10px] font-mono font-semibold leading-5 text-center",
                      s.esg_score >= 70 ? "bg-moss-faint text-moss" :
                      s.esg_score >= 50 ? "bg-ochre-faint text-ochre" :
                      "bg-ember-faint text-ember"
                    )}>
                      {Math.round(s.esg_score)}
                    </span>
                  ) : (
                    <span className="text-ink-muted">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <ChevronRight className="w-3.5 h-3.5 text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-ink-muted text-sm">No suppliers match.</div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-ink/20" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-paper border-l border-rule h-full overflow-y-auto animate-fade-in shadow-lift"
          >
            <div className="sticky top-0 bg-paper border-b border-rule px-6 py-5 flex items-start justify-between gap-4">
              <div>
                <div className="text-micro uppercase tracking-[0.2em] text-ember mb-2">
                  Supplier · {selected.code ?? selected.id.slice(0, 8)}
                </div>
                <h3 className="font-display text-2xl leading-tight">{selected.name}</h3>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <Badge variant={selected.tier === 1 ? "ember" : selected.tier === 2 ? "ochre" : "outline"}>
                    Tier {selected.tier}
                  </Badge>
                  <Badge variant="default">{selected.category}</Badge>
                  {selected.has_sbti_target && <Badge variant="moss">SBTi validated</Badge>}
                  {selected.cdp_score && <Badge variant="outline">CDP {selected.cdp_score}</Badge>}
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-ink-muted hover:text-ink text-lg leading-none">
                ×
              </button>
            </div>

            <div className="px-6 py-6 space-y-8">
              <section>
                <h4 className="text-micro uppercase tracking-widest text-ink-muted mb-3">Key numbers</h4>
                <div className="grid grid-cols-2 border border-rule divide-x divide-rule">
                  <div className="p-4">
                    <div className="text-[10px] uppercase tracking-widest text-ink-muted mb-1">Annual spend</div>
                    <div className="display-number text-xl">{fmt.gbp(selected.annual_spend_gbp)}</div>
                  </div>
                  <div className="p-4">
                    <div className="text-[10px] uppercase tracking-widest text-ink-muted mb-1">Upstream CO₂e</div>
                    <div className="display-number text-xl text-ember">{fmt.int(selected.co2e_tonnes)} tCO₂e</div>
                  </div>
                </div>
              </section>

              {selectedOnboarding && (
                <section>
                  <h4 className="text-micro uppercase tracking-widest text-ink-muted mb-3">Onboarding</h4>
                  <dl className="border border-rule bg-paper-soft divide-y divide-rule">
                    <Row label="Stage" value={selectedOnboarding.stage.replace(/_/g, " ")} />
                    <Row
                      label="Invited"
                      value={selectedOnboarding.invited_at ? new Date(String(selectedOnboarding.invited_at)).toLocaleDateString() : "—"}
                    />
                    <Row
                      label="Questionnaire"
                      value={selectedOnboarding.questionnaire_completed ? "Completed" : "Pending"}
                    />
                    <Row label="Engagement tier" value={selectedOnboarding.tier ?? "—"} />
                  </dl>
                </section>
              )}

              <section>
                <h4 className="text-micro uppercase tracking-widest text-ink-muted mb-3">
                  Invoices ({selectedInvoices.length})
                </h4>
                {selectedInvoices.length === 0 ? (
                  <div className="border border-rule bg-paper-soft p-4 text-xs text-ink-muted italic">
                    No invoices on file.
                  </div>
                ) : (
                  <div className="border border-rule bg-paper-soft">
                    {selectedInvoices.slice(0, 8).map((inv) => (
                      <div key={inv.id} className="px-4 py-3 border-b border-rule last:border-0 flex items-center gap-4 text-sm">
                        <div className="font-mono tabular text-xs text-ink-muted shrink-0">
                          {inv.date ? new Date(String(inv.date)).toLocaleDateString() : "—"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-xs truncate">{inv.number}</div>
                          {inv.scope3_category && (
                            <div className="text-[10px] text-ink-muted uppercase tracking-widest">
                              {inv.scope3_category}
                            </div>
                          )}
                        </div>
                        <div className="font-mono tabular text-right">
                          {inv.currency} {fmt.int(inv.value)}
                        </div>
                        {inv.co2e_tonnes != null && (
                          <div className="text-xs font-mono tabular text-ember w-16 text-right">
                            {fmt.dec(inv.co2e_tonnes, 1)} t
                          </div>
                        )}
                        <Badge variant={inv.status === "approved" ? "moss" : inv.status === "pending" ? "ochre" : "outline"}>
                          {inv.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h4 className="text-micro uppercase tracking-widest text-ink-muted mb-3">Metadata</h4>
                <dl className="border border-rule bg-paper-soft divide-y divide-rule">
                  <Row label="Country" value={selected.country ?? "—"} />
                  <Row label="Industry" value={selected.industry ?? "—"} />
                  <Row label="Contact email" value={selected.contact_email ?? "—"} />
                  <Row label="Website" value={selected.website ?? "—"} />
                  <Row label="EF source" value={selected.supplier_ef_source ?? "—"} />
                </dl>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-4 p-3.5 text-sm">
      <dt className="text-ink-muted text-xs uppercase tracking-wider">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
