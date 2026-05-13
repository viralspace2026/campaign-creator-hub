import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, ShoppingBag, TrendingUp, Users, Eye } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ActionTile } from "@/components/ActionTile";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/brand/")({
  head: () => ({ meta: [{ title: "Campaigns — Brand dashboard" }] }),
  component: BrandHome,
});

type Range = "7d" | "30d" | "90d";
type Metric = "visitors" | "conversion" | "earnings";

function seedRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateSeries(range: Range, metric: Metric) {
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const rand = seedRandom(metric.length * 17 + days);
  const base = metric === "visitors" ? 800 : metric === "conversion" ? 4 : 120;
  const variance = metric === "visitors" ? 600 : metric === "conversion" ? 2.5 : 90;
  const out = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: Math.max(0, +(base + (rand() - 0.3) * variance).toFixed(2)),
    });
  }
  return out;
}

function BrandHome() {
  const campaigns = useStore((s) => s.campaigns);
  const [range, setRange] = useState<Range>("30d");
  const [metric, setMetric] = useState<Metric>("visitors");

  const totals = campaigns.reduce(
    (acc, c) => ({
      sales: acc.sales + c.stats.totalSales,
      visitors: acc.visitors + c.stats.visitors,
      affiliates: acc.affiliates + c.stats.affiliates,
    }),
    { sales: 0, visitors: 0, affiliates: 0 },
  );

  const series = useMemo(() => generateSeries(range, metric), [range, metric]);
  const metricMeta = {
    visitors: { label: "Visitors", color: "var(--task)", suffix: "" },
    conversion: { label: "Conversion rate", color: "var(--promote)", suffix: "%" },
    earnings: { label: "Earnings", color: "var(--sales)", suffix: "$" },
  }[metric];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your campaigns</h1>
          <p className="mt-1 text-muted-foreground">Manage live, pending, and draft campaigns.</p>
        </div>
        <Link
          to="/brand/campaigns/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
        >
          <Plus className="size-4" /> Create campaign
        </Link>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total sales" value={totals.sales.toLocaleString()} icon={ShoppingBag} tint="bg-sales-bg text-sales-foreground" />
        <KpiCard label="Avg conversion" value="5.21%" icon={TrendingUp} tint="bg-promote-bg text-promote-foreground" />
        <KpiCard label="Affiliates" value={totals.affiliates.toLocaleString()} icon={Users} tint="bg-survey-bg text-survey-foreground" />
        <KpiCard label="Visitors" value={totals.visitors.toLocaleString()} icon={Eye} tint="bg-task-bg text-task-foreground" />
      </section>

      <section className="rounded-3xl bg-card p-6 ring-1 ring-border/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Performance</h2>
            <p className="text-sm text-muted-foreground">Aggregated mock data across your campaigns.</p>
          </div>
          <div className="flex gap-2">
            <SegGroup
              value={metric}
              onChange={(v) => setMetric(v as Metric)}
              options={[
                { value: "visitors", label: "Visitors" },
                { value: "conversion", label: "Conversion" },
                { value: "earnings", label: "Earnings" },
              ]}
            />
            <SegGroup
              value={range}
              onChange={(v) => setRange(v as Range)}
              options={[
                { value: "7d", label: "7d" },
                { value: "30d", label: "30d" },
                { value: "90d", label: "90d" },
              ]}
            />
          </div>
        </div>
        <div className="mt-5 h-72 w-full">
          <ResponsiveContainer>
            <AreaChart data={series} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="metricFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={metricMeta.color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={metricMeta.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} minTickGap={20} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={40} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }}
                formatter={(v: number) => [`${metricMeta.suffix === "$" ? "$" : ""}${v}${metricMeta.suffix === "%" ? "%" : ""}`, metricMeta.label]}
              />
              <Area type="monotone" dataKey="value" stroke={metricMeta.color} strokeWidth={2} fill="url(#metricFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">All campaigns</h2>
        <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Campaign</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
                <th className="px-5 py-3 text-right">Sales</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-t border-border/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <img src={c.image} alt="" className="size-10 rounded-lg object-cover" />
                      <div>
                        <div className="font-semibold">{c.title}</div>
                        <div className="text-xs text-muted-foreground">{c.productType}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {c.actions.map((a) => (
                        <div key={a} className="w-24">
                          <ActionTile type={a} size="sm" />
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right font-semibold">{c.stats.totalSales.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SegGroup({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="inline-flex rounded-xl bg-muted p-1 text-xs">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-lg px-3 py-1.5 font-semibold transition ${
            value === o.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: "draft" | "pending" | "live" | "rejected" }) {
  const map: Record<string, string> = {
    live: "bg-success-bg text-promote-foreground",
    pending: "bg-task-bg text-task-foreground",
    draft: "bg-muted text-muted-foreground",
    rejected: "bg-destructive/10 text-destructive",
  };
  return (
    <span className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold capitalize ${map[status]}`}>
      {status}
    </span>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  tint,
}: {
  label: string;
  value: string;
  icon: typeof ShoppingBag;
  tint: string;
}) {
  return (
    <div className="rounded-2xl bg-card p-5 ring-1 ring-border/60">
      <div className={`mb-3 grid size-10 place-items-center rounded-xl ${tint}`}>
        <Icon className="size-5" />
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
