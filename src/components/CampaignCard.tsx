import { Link } from "@tanstack/react-router";
import { Star, ShoppingBag, TrendingUp, Users, Eye } from "lucide-react";
import { ActionTile } from "@/components/ActionTile";
import type { Campaign } from "@/lib/mock-data";

export function CampaignCard({ campaign, hrefBase = "/affiliate/campaigns" }: { campaign: Campaign; hrefBase?: string }) {
  const c = campaign;
  return (
    <article className="rounded-3xl bg-card p-5 shadow-[0_1px_2px_rgba(20,20,40,0.04),0_8px_24px_-12px_rgba(80,40,180,0.12)] ring-1 ring-border/60">
      <div className="grid gap-5 md:grid-cols-[minmax(0,260px)_1fr]">
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
          <h3 className="text-2xl font-bold leading-tight tracking-tight">{c.title}</h3>
          <p className="text-muted-foreground">{c.description}</p>

          {c.price !== undefined && (
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <span className="text-3xl font-bold text-primary">${c.price.toFixed(2)}</span>
              {c.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">${c.originalPrice.toFixed(2)}</span>
              )}
              {c.discount && (
                <span className="rounded-lg bg-success-bg px-2.5 py-1 text-sm font-semibold text-promote-foreground">
                  {c.discount}
                </span>
              )}
            </div>
          )}

          {(c.commission || c.epc) && (
            <div className="mt-2 flex items-center gap-6 border-t border-border/70 pt-3">
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

      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border/70 pt-4 sm:grid-cols-4">
        <Stat icon={ShoppingBag} label="Total Sales" value={c.stats.totalSales.toLocaleString()} tint="bg-sales-bg text-sales-foreground" />
        <Stat icon={TrendingUp} label="Conversion" value={c.stats.conversionRate} tint="bg-promote-bg text-promote-foreground" />
        <Stat icon={Users} label="Affiliates" value={c.stats.affiliates.toLocaleString()} tint="bg-survey-bg text-survey-foreground" />
        <Stat icon={Eye} label="Unique Visitors" value={c.stats.visitors.toLocaleString()} tint="bg-task-bg text-task-foreground" />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border/70 pt-4 sm:grid-cols-4">
        {c.actions.map((a) => (
          <Link key={a} to={`${hrefBase}/$id`} params={{ id: c.id }}>
            <ActionTile type={a} />
          </Link>
        ))}
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
      <div className={`grid size-10 place-items-center rounded-xl ${tint}`}>
        <Icon className="size-5" />
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-semibold">{value}</div>
      </div>
    </div>
  );
}
