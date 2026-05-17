import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
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
import { actionMeta, type ActionType } from "@/lib/mock-data";
import { formatPayout, payoutFor, useStore, type Visit } from "@/lib/store";
import { Copy, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/affiliate/performance")({
  head: () => ({ meta: [{ title: "Performance — ViralSpace" }] }),
  component: Performance,
});

function Performance() {
  const campaigns = useStore((s) => s.campaigns);
  const joined = useStore((s) => s.joined);
  const links = useStore((s) => s.affiliateLinks);
  const visits = useStore((s) => s.visits);
  const surveys = useStore((s) => s.surveys);
  const tasks = useStore((s) => s.tasks);

  const entries = Object.entries(joined).flatMap(([cid, acts]) => {
    const c = campaigns.find((x) => x.id === cid);
    if (!c) return [];
    return acts.map((a) => ({ campaign: c, action: a }));
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My performance</h1>
        <p className="mt-1 text-muted-foreground">Analytics for every action you participate in.</p>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-border p-12 text-center text-muted-foreground">
          You haven&rsquo;t joined any campaigns yet. <Link to="/affiliate" className="font-semibold text-primary hover:underline">Browse campaigns →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map(({ campaign, action }) => (
            <ParticipationCard
              key={`${campaign.id}-${action}`}
              campaignId={campaign.id}
              campaignTitle={campaign.title}
              campaignImage={campaign.image}
              action={action}
              link={links[campaign.id]}
              visits={visits[campaign.id] ?? []}
              survey={surveys[campaign.id]}
              task={tasks[campaign.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ParticipationCard({
  campaignId,
  campaignTitle,
  campaignImage,
  action,
  link,
  visits,
  survey,
  task,
}: {
  campaignId: string;
  campaignTitle: string;
  campaignImage: string;
  action: ActionType;
  link?: string;
  visits: Visit[];
  survey?: { reward: number; credited: boolean; completedAt: number };
  task?: { status: "pending" | "approved" | "rejected"; reward: number; credited: boolean };
}) {
  const meta = actionMeta[action];
  const refLink = link
    ? `${typeof window !== "undefined" ? window.location.origin : "https://viral.space"}/affiliate/campaigns/${campaignId}?ref=${link}`
    : "";

  return (
    <div className="rounded-3xl bg-card p-5 ring-1 ring-border/60">
      <div className="flex flex-wrap items-center gap-3">
        <img src={campaignImage} alt="" className="size-12 rounded-xl object-cover" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">{campaignTitle}</div>
          <div className="text-xs text-muted-foreground">{meta.label} action</div>
        </div>
        <div className="w-24">
          <ActionTile type={action} size="sm" />
        </div>
        <Link
          to="/affiliate/campaigns/$id"
          params={{ id: campaignId }}
          className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1.5 text-xs font-semibold hover:bg-accent"
        >
          Open <ExternalLink className="size-3" />
        </Link>
      </div>

      <div className="mt-4">
        {action === "sales" && <SalesView visits={visits} refLink={refLink} />}
        {action === "promote" && <PromoteView visits={visits} refLink={refLink} />}
        {action === "survey" && (
          <SimpleStat
            primary={survey?.credited ? "Completed" : "In progress"}
            secondary={survey ? `Credited $${survey.reward.toFixed(2)} on ${new Date(survey.completedAt).toLocaleDateString()}` : "Awaiting completion"}
          />
        )}
        {action === "task" && (
          <SimpleStat
            primary={task ? task.status.toUpperCase() : "Not submitted"}
            secondary={
              task
                ? task.credited
                  ? `Credited $${task.reward.toFixed(2)} after brand approval`
                  : task.status === "pending"
                    ? "Awaiting brand review before credit is released"
                    : "Submission rejected"
                : "Submit proof on the campaign page"
            }
          />
        )}
      </div>
    </div>
  );
}

function SalesView({ visits, refLink }: { visits: Visit[]; refLink: string }) {
  const visitorCount = visits.length;
  const conversions = Math.round(visitorCount * 0.04);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Clicks" value={visitorCount.toLocaleString()} />
        <Stat label="Conversions" value={conversions.toLocaleString()} />
        <Stat label="Conv. rate" value={visitorCount ? `${((conversions / visitorCount) * 100).toFixed(1)}%` : "—"} />
        <Stat label="Earnings" value={`$${(conversions * 12).toFixed(2)}`} />
      </div>
      <LinkRow url={refLink} />
      <VisitsChart visits={visits} />
    </div>
  );
}

function PromoteView({ visits, refLink }: { visits: Visit[]; refLink: string }) {
  const total = visits.length;
  const engaged = visits.filter((v) => (v.engagedSeconds ?? 0) > 5).length;
  const mobile = visits.filter((v) => v.device === "Mobile").length;
  const avg = visits.reduce((s, v) => s + (v.engagedSeconds ?? 0), 0) / Math.max(1, total);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Total clicks" value={total.toLocaleString()} />
        <Stat label="Engaged" value={engaged.toLocaleString()} />
        <Stat label="Mobile share" value={total ? `${Math.round((mobile / total) * 100)}%` : "—"} />
        <Stat label="Avg time" value={`${avg.toFixed(0)}s`} />
      </div>
      <LinkRow url={refLink} />
      <VisitsChart visits={visits} />
    </div>
  );
}

function LinkRow({ url }: { url: string }) {
  if (!url) return null;
  return (
    <div className="flex items-center gap-2 rounded-xl bg-muted/60 p-3">
      <code className="flex-1 truncate text-xs">{url}</code>
      <button
        onClick={() => navigator.clipboard?.writeText(url)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
      >
        <Copy className="size-3" /> Copy
      </button>
    </div>
  );
}

function VisitsChart({ visits }: { visits: Visit[] }) {
  const data = useMemo(() => {
    const days = 7;
    const buckets = Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      d.setHours(0, 0, 0, 0);
      return { ts: d.getTime(), date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), value: 0 };
    });
    visits.forEach((v) => {
      const day = new Date(v.timestamp);
      day.setHours(0, 0, 0, 0);
      const b = buckets.find((x) => x.ts === day.getTime());
      if (b) b.value += 1;
    });
    return buckets;
  }, [visits]);

  return (
    <div className="h-40">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="affFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} width={28} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
          <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} fill="url(#affFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/60 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
}

function SimpleStat({ primary, secondary }: { primary: string; secondary: string }) {
  return (
    <div className="rounded-xl bg-muted/60 p-4">
      <div className="text-sm font-bold">{primary}</div>
      <div className="mt-1 text-xs text-muted-foreground">{secondary}</div>
    </div>
  );
}
