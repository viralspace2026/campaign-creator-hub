import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, ShoppingBag, TrendingUp, Users, Eye } from "lucide-react";
import { mockCampaigns } from "@/lib/mock-data";
import { ActionTile } from "@/components/ActionTile";

export const Route = createFileRoute("/brand/")({
  head: () => ({ meta: [{ title: "Campaigns — Brand dashboard" }] }),
  component: BrandHome,
});

function BrandHome() {
  const mine = mockCampaigns.slice(0, 3);
  const totals = mine.reduce(
    (acc, c) => ({
      sales: acc.sales + c.stats.totalSales,
      visitors: acc.visitors + c.stats.visitors,
      affiliates: acc.affiliates + c.stats.affiliates,
    }),
    { sales: 0, visitors: 0, affiliates: 0 },
  );
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
              {mockCampaigns.map((c) => (
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

function StatusBadge({ status }: { status: "draft" | "pending" | "live" }) {
  const map = {
    live: "bg-success-bg text-promote-foreground",
    pending: "bg-task-bg text-task-foreground",
    draft: "bg-muted text-muted-foreground",
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
