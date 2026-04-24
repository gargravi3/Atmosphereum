import { SectionHeader } from "@/components/ui/section-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { loadOrg, loadFacilities } from "@/lib/db";
import { fmt } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [org, facilities] = await Promise.all([loadOrg(), loadFacilities()]);

  return (
    <div className="px-8 py-10 space-y-10 max-w-4xl">
      <SectionHeader
        eyebrow="Settings"
        title="Configuration & preferences."
      />

      <section>
        <h2 className="font-display text-xl tracking-tight mb-4">Organisation</h2>
        <dl className="border border-rule bg-paper-soft divide-y divide-rule">
          <Row label="Legal name" value={org.legal_name ?? org.name} />
          <Row label="Trading name" value={org.name} />
          <Row label="Sector" value={org.sector} />
          <Row label="Employees" value={fmt.int(org.employees)} />
          <Row label="FY revenue" value={fmt.gbp(org.revenue_gbp)} />
          <Row label="Fiscal year" value={`${org.fy_start} → ${org.fy_end}`} />
          <Row label="Reporting boundary" value="Operational control" />
          <Row label="Reporting currency" value={org.currency} />
        </dl>
      </section>

      <section>
        <h2 className="font-display text-xl tracking-tight mb-4">
          Facilities <span className="text-ink-muted font-mono text-xs ml-2">({facilities.length})</span>
        </h2>
        <div className="border border-rule bg-paper-soft divide-y divide-rule">
          {facilities.map((f) => (
            <div key={f.id} className="grid grid-cols-[240px_1fr_auto] gap-4 px-5 py-3.5 text-sm items-center">
              <div className="font-medium">{f.name}</div>
              <div className="text-ink-muted">
                {f.city}, {f.country} · {f.type.replace(/_/g, " ")}
              </div>
              <div className="font-mono text-xs text-ink-muted">
                {fmt.int(f.area_sqm)} m²
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl tracking-tight mb-4">Period & currency</h2>
        <div className="border border-rule bg-paper-soft p-5 flex items-center gap-4">
          <select className="h-9 px-3 text-sm bg-paper border border-rule">
            <option>{org.fiscal_year} (current)</option>
          </select>
          <select className="h-9 px-3 text-sm bg-paper border border-rule" defaultValue={org.currency}>
            <option value="GBP">GBP (£)</option>
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
          </select>
          <Badge variant="moss">Auto-convert legacy records</Badge>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl tracking-tight mb-4">Theme</h2>
        <div className="border border-rule bg-paper-soft p-5 flex items-center gap-4">
          <Button variant="default">Light</Button>
          <Button variant="outline">Dark</Button>
          <Button variant="outline">System</Button>
          <div className="ml-auto text-xs text-ink-muted font-mono">Editorial · default</div>
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl tracking-tight mb-4">Integrations</h2>
        <div className="border border-rule bg-paper-soft p-5 text-sm text-ink-soft">
          Manage your ERP, IoT, and document extraction connections under{" "}
          <a href="/record/sources" className="text-ember hover:underline">Record · Data Sources</a>.
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[200px_1fr] gap-4 px-5 py-3.5 text-sm">
      <dt className="text-ink-muted text-xs uppercase tracking-wider self-center">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
