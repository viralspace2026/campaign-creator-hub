import { Link } from "@tanstack/react-router";
import { Star, ShoppingBag, TrendingUp, Users, Eye } from "lucide-react";
import { ActionTile } from "@/components/ActionTile";
import { actionMeta, type Campaign } from "@/lib/mock-data";
import { formatPayout, payoutFor, type StoredCampaign } from "@/lib/store";

export function CampaignCard({
  campaign,
  hrefBase = "/affiliate/campaigns",
  showPayouts = false,
}: {
  campaign: Campaign;
  hrefBase?: string;
  showPayouts?: boolean;
}) {
  const c = campaign;
  const hasSales = c.actions.includes("sales");

  return (
    <article className="rounded-3xl bg-card p-4 shadow-[0_1px_2px_rgba(20,20,40,0.04),0_8px_24px_-12px_rgba(80,40,180,0.12)] ring-1 ring-border/60 sm:p-5">
      <div className="grid gap-4 sm:gap-5 md:grid-cols-[minmax(0,260px)_1fr]">
        <div className="relative overflow-hidden rounded-2xl bg-accent">
          {c.featured && (
            <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-xl bg-card px-2.5 py-1 text-xs font-semibold shadow-sm">
              <Star className="size-3.5 fill-primary text-primary" />
              Featured
            </span>
          )}
          <img src={c.image} alt={c.title} className="h-full w-full object-cover aspect-square" loading="lazy" />
        </div>

        <div className="flex flex-col gap-3">
          <span className="inline-flex w-fit rounded-lg bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
            {c.productType}
          </span>
          <h3 className="text-xl font-bold leading-tight tracking-tight sm:text-2xl">{c.title}</h3>
          <p className="text-sm text-muted-foreground sm:text-base">{c.description}</p>

          {hasSales && c.price !== undefined && (
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <span className="text-2xl font-bold text-primary sm:text-3xl">${c.price.toFixed(2)}</span>
              {c.originalPrice && (
                <span className="text-base text-muted-foreground line-through sm:text-lg">${c.originalPrice.toFixed(2)}</span>
              )}
              {c.discount && (
                <span className="rounded-lg bg-success-bg px-2.5 py-1 text-sm font-semibold text-promote-foreground">
                  {c.discount}
                </span>
              )}
            </div>
          )}

          {hasSales && (c.commission || c.epc) && (
            <div className="mt-2 flex flex-wrap items-center gap-6 border-t border-border/70 pt-3">
              {c.commission && (
                <div>
                  <div className="text-xs text-muted-foreground">Commission</div>
                  <div className="font-semibold text-primary">{c.commission}</div>
                </div>
              )}
              {c.epc && (
                <div className="border-l border-border/70 pl-6">
                  <div className="text-xs text-muted-foreground">EPC</div>
                  <div className="font-semibold">{c.epc}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border/70 pt-4 sm:grid-cols-4 sm:gap-4">
        <Stat icon={ShoppingBag} label="Total Sales" value={c.stats.totalSales.toLocaleString()} tint="bg-sales-bg text-sales-foreground" />
        <Stat icon={TrendingUp} label="Conversion" value={c.stats.conversionRate} tint="bg-promote-bg text-promote-foreground" />
        <Stat icon={Users} label="Affiliates" value={c.stats.affiliates.toLocaleString()} tint="bg-survey-bg text-survey-foreground" />
        <Stat icon={Eye} label="Visitors" value={c.stats.visitors.toLocaleString()} tint="bg-task-bg text-task-foreground" />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border/70 pt-4 sm:grid-cols-4">
        {c.actions.map((a) => {
          const payout = showPayouts ? payoutFor(campaign as StoredCampaign, a) : 0;
          return (
            <Link key={a} to={`${hrefBase}/$id`} params={{ id: c.id }} className="block">
              <ActionTile type={a} />
              {showPayouts && (
                <div className="mt-1.5 text-center text-xs font-semibold text-muted-foreground">
                  {formatPayout(payout, a)}
                </div>
              )}
              {!showPayouts && (
                <div className="mt-1.5 text-center text-[11px] text-muted-foreground">
                  {actionMeta[a].label}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </article>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: typeof ShoppingBag;
  label: string;
  value: string;
  tint: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`grid size-9 place-items-center rounded-xl sm:size-10 ${tint}`}>
        <Icon className="size-4 sm:size-5" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="truncate font-semibold">{value}</div>
      </div>
    </div>
  );
}
