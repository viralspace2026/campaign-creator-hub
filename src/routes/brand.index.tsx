import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, ShoppingBag, TrendingUp, Users, Eye, Copy, Check, X, Pencil, Trash2, DollarSign } from "lucide-react";
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
import { useStore, store } from "@/lib/store";
import { actionMeta, type ActionType } from "@/lib/mock-data";
import type { StoredCampaign } from "@/lib/store";

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
  const taskSubmissions = useStore((s) => s.tasks);
  const [range, setRange] = useState<Range>("30d");
  const [metric, setMetric] = useState<Metric>("visitors");
  const [actionView, setActionView] = useState<{ campaign: StoredCampaign; action: ActionType } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<StoredCampaign | null>(null);
  const [topUp, setTopUp] = useState<StoredCampaign | null>(null);

  const pendingTasks = Object.values(taskSubmissions).filter((t) => t.status === "pending");
  const reviewedTasks = Object.values(taskSubmissions).filter((t) => t.status !== "pending");

  const previewLinkFor = (id: string) =>
    `${typeof window !== "undefined" ? window.location.origin : "https://viral.space"}/affiliate/campaigns/${id}`;

  const copyPreview = (id: string) => {
    navigator.clipboard?.writeText(previewLinkFor(id));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

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
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Task proof reviews</h2>
          <span className="text-xs text-muted-foreground">
            {pendingTasks.length} pending · {reviewedTasks.length} reviewed
          </span>
        </div>
        {pendingTasks.length === 0 && reviewedTasks.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No task submissions yet. Affiliates submit proof — you approve to release credit.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/60">
            <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Campaign</th>
                  <th className="px-5 py-3">Proof</th>
                  <th className="px-5 py-3">Submitted</th>
                  <th className="px-5 py-3">Reward</th>
                  <th className="px-5 py-3 text-right">Decision</th>
                </tr>
              </thead>
              <tbody>
                {[...pendingTasks, ...reviewedTasks].map((t) => {
                  const c = campaigns.find((x) => x.id === t.campaignId);
                  return (
                    <tr key={t.campaignId} className="border-t border-border/60">
                      <td className="px-5 py-3 font-medium">{c?.title ?? t.campaignId}</td>
                      <td className="px-5 py-3 max-w-[260px] truncate text-xs text-muted-foreground" title={t.proof}>
                        {t.proof}
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">
                        {new Date(t.submittedAt).toLocaleString()}
                      </td>
                      <td className="px-5 py-3 font-semibold">${t.reward.toFixed(2)}</td>
                      <td className="px-5 py-3 text-right">
                        {t.status === "pending" ? (
                          <div className="inline-flex gap-1.5">
                            <button
                              onClick={() => store.reviewTask(t.campaignId, "approved")}
                              className="rounded-lg bg-success-bg px-2.5 py-1 text-xs font-semibold text-promote-foreground hover:opacity-90"
                            >
                              Approve & credit
                            </button>
                            <button
                              onClick={() => store.reviewTask(t.campaignId, "rejected", "Proof not valid")}
                              className="rounded-lg bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive hover:bg-destructive/15"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span
                            className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold capitalize ${
                              t.status === "approved"
                                ? "bg-success-bg text-promote-foreground"
                                : "bg-destructive/10 text-destructive"
                            }`}
                          >
                            {t.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">All campaigns</h2>
        <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/60">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 sm:px-5">Campaign</th>
                  <th className="px-4 py-3 sm:px-5">Status</th>
                  <th className="px-4 py-3 sm:px-5">Actions</th>
                  <th className="px-4 py-3 sm:px-5">Budget</th>
                  <th className="px-4 py-3 sm:px-5">Preview</th>
                  <th className="px-4 py-3 text-right sm:px-5">Manage</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => {
                  const total = c.budgetTotal ?? 0;
                  const spent = c.budgetSpent ?? 0;
                  const remaining = Math.max(0, total - spent);
                  const pct = total > 0 ? Math.min(100, (spent / total) * 100) : 0;
                  return (
                    <tr key={c.id} className="border-t border-border/60 align-top">
                      <td className="px-4 py-3 sm:px-5">
                        <div className="flex items-center gap-3">
                          <img src={c.image} alt="" className="size-10 rounded-lg object-cover" />
                          <div className="min-w-0">
                            <div className="truncate font-semibold">{c.title}</div>
                            <div className="text-xs text-muted-foreground">{c.productType}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 sm:px-5">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-4 py-3 sm:px-5">
                        <div className="flex flex-wrap gap-1.5">
                          {c.actions.map((a) => (
                            <div key={a} className="w-20 sm:w-24">
                              <ActionTile
                                type={a}
                                size="sm"
                                onClick={() => setActionView({ campaign: c, action: a })}
                              />
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 sm:px-5">
                        <div className="min-w-[120px] space-y-1">
                          <div className="text-xs text-muted-foreground">
                            ${remaining.toFixed(0)} / ${total.toFixed(0)}
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                          </div>
                          {remaining <= 0 && total > 0 && (
                            <div className="text-[10px] font-semibold uppercase text-destructive">Depleted</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 sm:px-5">
                        <button
                          onClick={() => copyPreview(c.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-foreground"
                          title={previewLinkFor(c.id)}
                        >
                          {copiedId === c.id ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                          {copiedId === c.id ? "Copied" : "Copy"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right sm:px-5">
                        <div className="inline-flex flex-wrap justify-end gap-1.5">
                          <button
                            onClick={() => setTopUp(c)}
                            className="inline-flex items-center gap-1 rounded-lg bg-success-bg px-2 py-1 text-xs font-semibold text-promote-foreground hover:opacity-90"
                            title="Top up budget"
                          >
                            <DollarSign className="size-3.5" /> Top up
                          </button>
                          <button
                            onClick={() => setEditing(c)}
                            className="inline-flex items-center gap-1 rounded-lg bg-muted px-2 py-1 text-xs font-semibold hover:bg-accent"
                            title="Edit campaign"
                          >
                            <Pencil className="size-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete "${c.title}"? This cannot be undone.`)) {
                                store.deleteCampaign(c.id);
                              }
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-destructive/10 px-2 py-1 text-xs font-semibold text-destructive hover:bg-destructive/15"
                            title="Delete campaign"
                          >
                            <Trash2 className="size-3.5" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {editing && <EditCampaignDialog campaign={editing} onClose={() => setEditing(null)} />}
      {topUp && <TopUpDialog campaign={topUp} onClose={() => setTopUp(null)} />}

      {actionView && (
        <ActionAnalyticsDialog
          campaign={actionView.campaign}
          action={actionView.action}
          onClose={() => setActionView(null)}
        />
      )}
    </div>
  );
}

function ActionAnalyticsDialog({
  campaign,
  action,
  onClose,
}: {
  campaign: StoredCampaign;
  action: ActionType;
  onClose: () => void;
}) {
  const [range, setRange] = useState<Range>("30d");
  const meta = actionMeta[action];

  // Derive per-action splits from campaign stats with deterministic weighting.
  const weight: Record<ActionType, number> = { sales: 0.45, promote: 0.25, survey: 0.15, task: 0.15 };
  const total = campaign.actions.reduce((s, a) => s + weight[a], 0) || 1;
  const share = weight[action] / total;
  const visitors = Math.round(campaign.stats.visitors * share);
  const sales = Math.round(campaign.stats.totalSales * share);
  const affiliates = Math.round(campaign.stats.affiliates * share);
  const conv = visitors > 0 ? ((sales / visitors) * 100).toFixed(2) : "0.00";

  const series = useMemo(() => {
    const rand = seedRandom(action.length * 11 + range.length * 7 + campaign.id.length);
    const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
    const base = visitors / days;
    const today = new Date();
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (days - 1 - i));
      return {
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        value: Math.max(0, +(base * (0.6 + rand() * 0.9)).toFixed(2)),
      };
    });
  }, [action, range, campaign.id, visitors]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-3xl bg-card p-6 shadow-2xl ring-1 ring-border"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-28">
              <ActionTile type={action} size="sm" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {meta.label} performance — <span className="text-muted-foreground">{campaign.title}</span>
              </h3>
              <p className="text-sm text-muted-foreground">{meta.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniStat label="Visitors" value={visitors.toLocaleString()} />
          <MiniStat label="Conversion" value={`${conv}%`} />
          <MiniStat label="Affiliates" value={affiliates.toLocaleString()} />
          <MiniStat label={action === "sales" ? "Sales" : action === "task" ? "Submissions" : action === "survey" ? "Responses" : "Engagements"} value={sales.toLocaleString()} />
        </div>

        <div className="mt-5 flex items-center justify-between">
          <h4 className="text-sm font-semibold">Trend</h4>
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
        <div className="mt-3 h-64 w-full">
          <ResponsiveContainer>
            <AreaChart data={series} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`fill-${action}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={`var(--${action})`} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={`var(--${action})`} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} minTickGap={20} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={40} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
              <Area type="monotone" dataKey="value" stroke={`var(--${action})`} strokeWidth={2} fill={`url(#fill-${action})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/60 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-bold">{value}</div>
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

function EditCampaignDialog({ campaign, onClose }: { campaign: StoredCampaign; onClose: () => void }) {
  const [title, setTitle] = useState(campaign.title);
  const [description, setDescription] = useState(campaign.description);
  const [image, setImage] = useState(campaign.image);
  const [price, setPrice] = useState(campaign.price?.toString() ?? "");
  const [commission, setCommission] = useState(campaign.commission ?? "");

  const hasSales = campaign.actions.includes("sales");

  const save = () => {
    store.updateCampaign(campaign.id, {
      title,
      description,
      image,
      ...(hasSales ? { price: price ? Number(price) : undefined, commission } : {}),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-3xl bg-card p-5 shadow-2xl ring-1 ring-border sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold">Edit campaign</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <DialogField label="Title">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30" />
          </DialogField>
          <DialogField label="Description">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30" />
          </DialogField>
          <DialogField label="Image URL">
            <input value={image} onChange={(e) => setImage(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30" />
          </DialogField>
          {hasSales && (
            <div className="grid grid-cols-2 gap-3">
              <DialogField label="Price (USD)">
                <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30" />
              </DialogField>
              <DialogField label="Commission">
                <input value={commission} onChange={(e) => setCommission(e.target.value)} placeholder="e.g. 25% per sale" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30" />
              </DialogField>
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg bg-muted px-4 py-2 text-sm font-semibold hover:bg-accent">Cancel</button>
          <button onClick={save} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">Save changes</button>
        </div>
      </div>
    </div>
  );
}

function TopUpDialog({ campaign, onClose }: { campaign: StoredCampaign; onClose: () => void }) {
  const [amount, setAmount] = useState("100");
  const total = campaign.budgetTotal ?? 0;
  const spent = campaign.budgetSpent ?? 0;
  const remaining = Math.max(0, total - spent);
  const presets = [50, 100, 250, 500, 1000];

  const apply = () => {
    const v = Number(amount);
    if (!Number.isFinite(v) || v <= 0) return;
    store.topUpBudget(campaign.id, v);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-3xl bg-card p-5 shadow-2xl ring-1 ring-border sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Refill budget</h3>
            <p className="mt-1 text-sm text-muted-foreground">{campaign.title}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-muted/60 p-3 text-center text-xs">
          <div>
            <div className="text-muted-foreground">Remaining</div>
            <div className="font-bold">${remaining.toFixed(0)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Spent</div>
            <div className="font-bold">${spent.toFixed(0)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Total</div>
            <div className="font-bold">${total.toFixed(0)}</div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => setAmount(String(p))}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ring-1 transition ${
                amount === String(p)
                  ? "bg-primary text-primary-foreground ring-primary"
                  : "bg-card text-muted-foreground ring-border hover:bg-muted"
              }`}
            >
              +${p}
            </button>
          ))}
        </div>

        <label className="mt-3 block text-sm font-medium">Custom amount</label>
        <div className="mt-1 flex gap-2">
          <span className="grid place-items-center rounded-lg bg-muted px-3 text-sm font-semibold">$</span>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
          />
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg bg-muted px-4 py-2 text-sm font-semibold hover:bg-accent">Cancel</button>
          <button onClick={apply} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
            Add ${Number(amount || 0).toFixed(0)}
          </button>
        </div>
      </div>
    </div>
  );
}

function DialogField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}

