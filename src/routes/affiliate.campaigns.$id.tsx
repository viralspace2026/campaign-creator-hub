import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { useState } from "react";
import { mockCampaigns, actionMeta, type ActionType } from "@/lib/mock-data";
import { ActionTile } from "@/components/ActionTile";

export const Route = createFileRoute("/affiliate/campaigns/$id")({
  loader: ({ params }) => {
    const c = mockCampaigns.find((x) => x.id === params.id);
    if (!c) throw notFound();
    return c;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.title} — Campaign` : "Campaign" },
      { name: "description", content: loaderData?.description ?? "" },
      { property: "og:image", content: loaderData?.image ?? "" },
    ],
  }),
  component: Detail,
  notFoundComponent: () => (
    <div className="p-12 text-center">
      <h1 className="text-2xl font-bold">Campaign not found</h1>
      <Link to="/affiliate" className="mt-4 inline-block text-primary">
        Back to browse
      </Link>
    </div>
  ),
});

function Detail() {
  const c = Route.useLoaderData();
  const [active, setActive] = useState<ActionType>(c.actions[0]);
  const [copied, setCopied] = useState(false);
  const refLink = `https://viral.space/r/${c.id}/alex`;

  return (
    <div className="space-y-6">
      <Link to="/affiliate" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to campaigns
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="overflow-hidden rounded-3xl bg-accent">
          <img src={c.image} alt={c.title} className="aspect-[4/3] w-full object-cover" />
        </div>
        <div className="space-y-3">
          <span className="inline-flex w-fit rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
            {c.productType}
          </span>
          <h1 className="text-4xl font-bold tracking-tight">{c.title}</h1>
          <p className="text-muted-foreground">{c.description}</p>

          {c.price !== undefined && (
            <div className="flex items-center gap-3 pt-1">
              <span className="text-3xl font-bold text-primary">${c.price.toFixed(2)}</span>
              {c.originalPrice && <span className="text-lg text-muted-foreground line-through">${c.originalPrice.toFixed(2)}</span>}
              {c.discount && (
                <span className="rounded-md bg-success-bg px-2.5 py-1 text-sm font-semibold text-promote-foreground">{c.discount}</span>
              )}
            </div>
          )}

          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {c.actions.map((a: ActionType) => (
              <ActionTile key={a} type={a} size="sm" selected={active === a} onClick={() => setActive(a)} />
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-card p-6 ring-1 ring-border/60">
        <div className="flex items-center gap-3">
          <div className="w-32">
            <ActionTile type={active} />
          </div>
          <div>
            <h3 className="text-lg font-semibold capitalize">{actionMeta[active].label} action</h3>
            <p className="text-sm text-muted-foreground">{actionMeta[active].description}</p>
          </div>
        </div>

        <div className="mt-5">
          {active === "sales" && (
            <div className="space-y-3">
              <p className="text-sm">You earn <strong>{c.commission}</strong> on every sale through your link.</p>
              <div className="flex items-center gap-2 rounded-xl bg-muted/60 p-3">
                <code className="flex-1 truncate text-sm">{refLink}</code>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(refLink);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
                >
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copied ? "Copied" : "Copy link"}
                </button>
              </div>
            </div>
          )}
          {active === "promote" && (
            <p className="text-sm">Share campaign banners and links. Get paid based on visibility performance.</p>
          )}
          {active === "survey" && (
            <p className="text-sm">Answer the curated questions and receive payment after completion.</p>
          )}
          {active === "task" && (
            <p className="text-sm">Complete the marketing task, upload proof, and get paid once verified.</p>
          )}
          <button className="mt-5 rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground hover:opacity-90">
            Join this action
          </button>
        </div>
      </div>
    </div>
  );
}
