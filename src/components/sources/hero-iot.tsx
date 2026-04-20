"use client";
import { useEffect, useState, useMemo } from "react";
import { ChevronRight, Radio, Zap, Thermometer, Fan } from "lucide-react";
import { fmt } from "@/lib/utils";
import type { Connector, ConnectorDetail, IotPoint, IotPointGroup, MpanMeter } from "@/lib/fixtures/sources";

function iconFor(tag: string) {
  if (tag.includes("Temp")) return Thermometer;
  if (tag.includes("Fan")) return Fan;
  if (tag.includes("kW") || tag.includes("Power")) return Zap;
  return Radio;
}

/**
 * Main IoT hero — dispatches between BMS (point tree) and MPAN (meters).
 */
export function HeroIot({
  connector,
  detail,
}: {
  connector: Connector;
  detail: ConnectorDetail;
}) {
  if (detail.mpanMeters && detail.mpanMeters.length > 0) {
    return <HeroMpan meters={detail.mpanMeters} />;
  }
  if (detail.iotPoints) {
    return <HeroBms groups={detail.iotPoints} />;
  }
  return <div className="p-5 text-sm text-ink-muted">No points discovered yet.</div>;
}

// -----------------------------------------------------------------------
// BMS — point tree + live sparkline
// -----------------------------------------------------------------------

function HeroBms({ groups }: { groups: IotPointGroup[] }) {
  const allPoints = useMemo(
    () => groups.flatMap((g) => g.points.map((p) => ({ ...p, group: g.group, sub: g.subGroup }))),
    [groups]
  );

  const [selectedTag, setSelectedTag] = useState(allPoints[0]?.tag || "");
  const [streams, setStreams] = useState<Record<string, number[]>>(() => {
    const map: Record<string, number[]> = {};
    allPoints.forEach((p) => {
      map[p.tag] = [...p.stream];
    });
    return map;
  });
  const [lastValues, setLastValues] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    allPoints.forEach((p) => {
      map[p.tag] = p.lastValue;
    });
    return map;
  });

  // Simulate live updates every 2s
  useEffect(() => {
    const id = setInterval(() => {
      setStreams((prev) => {
        const next: Record<string, number[]> = {};
        for (const p of allPoints) {
          const stream = prev[p.tag] || p.stream;
          const last = stream[stream.length - 1] ?? p.lastValue;
          const variance = (p.max - p.min) * 0.08;
          const drift = (Math.random() - 0.5) * variance;
          const newVal = Math.max(p.min, Math.min(p.max, last + drift));
          next[p.tag] = [...stream.slice(1), newVal];
        }
        return next;
      });
      setLastValues((prev) => {
        const next = { ...prev };
        for (const p of allPoints) {
          const stream = streams[p.tag];
          if (stream) next[p.tag] = stream[stream.length - 1];
        }
        return next;
      });
    }, 2000);
    return () => clearInterval(id);
    // streams intentionally omitted to avoid resubscribe loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPoints]);

  const selected = allPoints.find((p) => p.tag === selectedTag);

  const totalPoints = allPoints.length;
  const reporting = allPoints.filter((p) => lastValues[p.tag] !== undefined).length;

  return (
    <div className="flex flex-col h-full">
      {/* Footer-like metrics at top */}
      <div className="grid grid-cols-4 gap-0 divide-x divide-rule border-b border-rule">
        <Metric label="Points" value={String(totalPoints)} />
        <Metric label="Reporting" value={String(reporting)} trend="moss" />
        <Metric label="Gaps" value="0" />
        <Metric label="Latency" value="1.4s" />
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Left: point tree */}
        <div className="w-[220px] shrink-0 border-r border-rule overflow-y-auto bg-paper">
          {groups.map((g, i) => (
            <div key={i}>
              <div className="px-3 py-2 bg-paper-warm border-b border-rule">
                <div className="text-[10px] uppercase tracking-widest text-ink-muted font-mono">
                  {g.group}
                </div>
                {g.subGroup && (
                  <div className="text-[10px] text-ink-soft mt-0.5">{g.subGroup}</div>
                )}
              </div>
              {g.points.map((p) => {
                const Icon = iconFor(p.tag);
                const isSelected = p.tag === selectedTag;
                return (
                  <button
                    key={p.tag}
                    onClick={() => setSelectedTag(p.tag)}
                    className={`w-full text-left px-3 py-2 border-b border-rule flex items-center gap-2 text-[11px] transition-colors ${
                      isSelected
                        ? "bg-ink text-paper"
                        : "hover:bg-paper-warm"
                    }`}
                  >
                    <Icon
                      className={`w-3 h-3 shrink-0 ${
                        isSelected ? "text-paper" : "text-ink-muted"
                      }`}
                      strokeWidth={1.5}
                    />
                    <span className="truncate font-mono">{p.tag}</span>
                    {isSelected && (
                      <ChevronRight className="w-3 h-3 ml-auto shrink-0" strokeWidth={2} />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Right: live stream */}
        <div className="flex-1 min-w-0 p-5 overflow-y-auto">
          {selected && (
            <>
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <div className="text-micro uppercase tracking-widest text-ink-muted">
                    Live point
                  </div>
                  <div className="font-mono text-sm mt-0.5">{selected.tag}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-moss animate-pulse" />
                  <span className="text-[10px] uppercase tracking-wider text-moss font-mono">
                    Streaming
                  </span>
                </div>
              </div>

              <div className="display-number text-5xl tabular">
                {fmt.dec(lastValues[selected.tag] ?? selected.lastValue)}
                <span className="text-lg text-ink-muted ml-2 font-mono">
                  {selected.unit}
                </span>
              </div>
              <div className="text-[11px] text-ink-muted mt-1 font-mono">
                Updated {new Date().toLocaleTimeString("en-GB")}
              </div>

              {/* Sparkline */}
              <div className="mt-6">
                <Sparkline
                  data={streams[selected.tag] || selected.stream}
                  min={selected.min}
                  max={selected.max}
                />
                <div className="flex justify-between text-[10px] text-ink-faint font-mono mt-1">
                  <span>-20m</span>
                  <span>-10m</span>
                  <span>now</span>
                </div>
              </div>

              {/* Range */}
              <div className="grid grid-cols-2 gap-0 border border-rule divide-x divide-rule mt-6 bg-paper">
                <Metric label="Min (24h)" value={`${fmt.dec(selected.min)} ${selected.unit}`} />
                <Metric label="Max (24h)" value={`${fmt.dec(selected.max)} ${selected.unit}`} />
              </div>

              {/* Coverage strip */}
              <div className="mt-6">
                <div className="text-[10px] uppercase tracking-widest text-ink-muted mb-2">
                  Coverage · last 48 half-hour intervals
                </div>
                <CoverageStrip count={48} missing={[17, 18]} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------
// MPAN — smart meter grid
// -----------------------------------------------------------------------

function HeroMpan({ meters }: { meters: MpanMeter[] }) {
  const [selectedId, setSelectedId] = useState(meters[0]?.mpan || "");
  const selected = meters.find((m) => m.mpan === selectedId) || meters[0];

  const [streams, setStreams] = useState<Record<string, number[]>>(() => {
    const map: Record<string, number[]> = {};
    meters.forEach((m) => (map[m.mpan] = [...m.last48h]));
    return map;
  });

  useEffect(() => {
    const id = setInterval(() => {
      setStreams((prev) => {
        const next: Record<string, number[]> = {};
        for (const m of meters) {
          const stream = prev[m.mpan] || m.last48h;
          const last = stream[stream.length - 1];
          const drift = (Math.random() - 0.5) * last * 0.12;
          next[m.mpan] = [...stream.slice(1), Math.max(0, last + drift)];
        }
        return next;
      });
    }, 2500);
    return () => clearInterval(id);
  }, [meters]);

  return (
    <div className="p-5 space-y-5">
      {/* MPAN list */}
      <div>
        <div className="text-micro uppercase tracking-widest text-ink-muted mb-2">
          Registered MPANs / MPRNs
        </div>
        <div className="border border-rule bg-paper divide-y divide-rule">
          {meters.map((m) => {
            const stream = streams[m.mpan] || m.last48h;
            const last = stream[stream.length - 1];
            const isSelected = m.mpan === selectedId;
            return (
              <button
                key={m.mpan}
                onClick={() => setSelectedId(m.mpan)}
                className={`w-full grid grid-cols-[1fr_auto_auto] items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                  isSelected ? "bg-paper-warm" : "hover:bg-paper-warm"
                }`}
              >
                <div className="min-w-0">
                  <div className="font-mono text-xs tabular">
                    {m.mpan}
                    <span className="ml-2 text-[10px] text-ink-muted uppercase">
                      {m.kind}
                    </span>
                  </div>
                  <div className="text-[11px] text-ink-muted truncate mt-0.5">
                    {m.facility} · {m.tariff}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono tabular text-sm">
                    {fmt.dec(last)} <span className="text-[10px] text-ink-muted">{m.kind === "gas" ? "kWh/h" : "kW"}</span>
                  </div>
                  <div className="text-[10px] text-ink-faint font-mono">
                    live
                  </div>
                </div>
                <ChevronRight
                  className={`w-4 h-4 shrink-0 ${
                    isSelected ? "text-ink" : "text-ink-faint"
                  }`}
                  strokeWidth={1.25}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected meter chart */}
      {selected && (
        <div className="border border-rule bg-paper p-4">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <div className="text-micro uppercase tracking-widest text-ink-muted">
                Last 48 half-hour intervals
              </div>
              <div className="font-mono text-xs mt-0.5">{selected.mpan}</div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-moss animate-pulse" />
              <span className="text-[10px] uppercase tracking-wider text-moss font-mono">
                live
              </span>
            </div>
          </div>
          <Sparkline
            data={streams[selected.mpan] || selected.last48h}
            min={0}
            max={Math.max(...(streams[selected.mpan] || selected.last48h))}
            tall
          />
          <div className="flex justify-between text-[10px] text-ink-faint font-mono mt-1">
            <span>-24h</span>
            <span>-12h</span>
            <span>now</span>
          </div>

          {/* TOD bands */}
          <div className="grid grid-cols-3 gap-0 border-t border-rule mt-4 pt-3 divide-x divide-rule">
            <TodBand label="Day" pct={58} color="bg-ochre" />
            <TodBand label="Night" pct={24} color="bg-slate" />
            <TodBand label="Peak" pct={18} color="bg-ember" />
          </div>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------

function Metric({
  label,
  value,
  trend,
}: {
  label: string;
  value: string;
  trend?: "moss" | "ember";
}) {
  return (
    <div className="p-3">
      <div className="text-[10px] uppercase tracking-widest text-ink-muted">
        {label}
      </div>
      <div
        className={`display-number text-lg mt-0.5 ${
          trend === "moss" ? "text-moss" : trend === "ember" ? "text-ember" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Sparkline({
  data,
  min,
  max,
  tall,
}: {
  data: number[];
  min: number;
  max: number;
  tall?: boolean;
}) {
  const w = 480;
  const h = tall ? 120 : 80;
  const range = max - min || 1;
  const step = w / Math.max(1, data.length - 1);
  const points = data.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / range) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full"
      preserveAspectRatio="none"
      style={{ height: `${h}px` }}
    >
      <polyline
        fill="none"
        stroke="var(--ember)"
        strokeWidth={1.25}
        strokeLinejoin="round"
        points={points.join(" ")}
      />
      <polyline
        fill="var(--ember-faint)"
        fillOpacity={0.6}
        stroke="none"
        points={`0,${h} ${points.join(" ")} ${w},${h}`}
      />
    </svg>
  );
}

function CoverageStrip({ count, missing }: { count: number; missing: number[] }) {
  return (
    <div className="flex gap-[2px]">
      {Array.from({ length: count }, (_, i) => {
        const isMissing = missing.includes(i);
        return (
          <div
            key={i}
            className={`flex-1 h-5 ${
              isMissing ? "bg-ember/60" : "bg-moss/50"
            }`}
            title={isMissing ? "Missing interval" : "Data present"}
          />
        );
      })}
    </div>
  );
}

function TodBand({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div className="p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <span className={`w-1.5 h-1.5 ${color}`} />
        <span className="text-[10px] uppercase tracking-widest text-ink-muted">
          {label}
        </span>
      </div>
      <div className="display-number text-lg tabular">
        {pct}
        <span className="text-sm text-ink-muted">%</span>
      </div>
    </div>
  );
}
