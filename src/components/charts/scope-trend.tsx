"use client";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { fmt } from "@/lib/utils";

export function ScopeTrend({
  data,
}: {
  data: { period: string; scope1: number; scope2: number; scope3: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--ember)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--ember)" stopOpacity={0.03} />
          </linearGradient>
          <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--ochre)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--ochre)" stopOpacity={0.03} />
          </linearGradient>
          <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--slate)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--slate)" stopOpacity={0.03} />
          </linearGradient>
        </defs>
        <CartesianGrid
          stroke="var(--rule)"
          strokeDasharray="0"
          vertical={false}
        />
        <XAxis
          dataKey="period"
          stroke="var(--ink-muted)"
          tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
          tickFormatter={(v) => fmt.month(v + "-01")}
          tickLine={false}
          axisLine={{ stroke: "var(--rule)" }}
        />
        <YAxis
          stroke="var(--ink-muted)"
          tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => fmt.compact(v)}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--paper-soft)",
            border: "1px solid var(--rule)",
            borderRadius: 0,
            fontSize: 12,
            fontFamily: "var(--font-sans)",
          }}
          labelFormatter={(v) => fmt.month(v + "-01")}
          formatter={(value, name) => [
            `${fmt.dec(Number(value) ?? 0, 1)} tCO₂e`,
            String(name),
          ]}
        />
        <Area
          type="monotone"
          dataKey="scope3"
          stackId="1"
          stroke="var(--slate)"
          strokeWidth={1.5}
          fill="url(#g3)"
          name="Scope 3"
        />
        <Area
          type="monotone"
          dataKey="scope2"
          stackId="1"
          stroke="var(--ochre)"
          strokeWidth={1.5}
          fill="url(#g2)"
          name="Scope 2"
        />
        <Area
          type="monotone"
          dataKey="scope1"
          stackId="1"
          stroke="var(--ember)"
          strokeWidth={1.5}
          fill="url(#g1)"
          name="Scope 1"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
