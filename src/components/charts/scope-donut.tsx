"use client";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { fmt } from "@/lib/utils";

export function ScopeDonut({
  scope1,
  scope2,
  scope3,
}: {
  scope1: number;
  scope2: number;
  scope3: number;
}) {
  const total = scope1 + scope2 + scope3;
  const data = [
    { name: "Scope 1", value: scope1, color: "var(--ember)" },
    { name: "Scope 2", value: scope2, color: "var(--ochre)" },
    { name: "Scope 3", value: scope3, color: "var(--slate)" },
  ];

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={75}
            outerRadius={105}
            stroke="var(--paper-soft)"
            strokeWidth={2}
            startAngle={90}
            endAngle={-270}
          >
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-micro uppercase tracking-widest text-ink-muted">
          Total
        </div>
        <div className="display-number text-3xl">
          {fmt.dec(total / 1000, 2)}
        </div>
        <div className="text-xs text-ink-muted font-mono">ktCO₂e</div>
      </div>
    </div>
  );
}
