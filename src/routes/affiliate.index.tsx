import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { type ActionType } from "@/lib/mock-data";
import { CampaignCard } from "@/components/CampaignCard";
import { ActionTile } from "@/components/ActionTile";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/affiliate/")({
  head: () => ({ meta: [{ title: "Browse campaigns — ViralSpace" }] }),
  component: Browse,
});

function Browse() {
  const campaigns = useStore((s) => s.campaigns);
  const [filter, setFilter] = useState<ActionType | "all">("all");
  const [q, setQ] = useState("");
  const live = campaigns.filter((c) => c.status === "live");
  const visible = live.filter(
    (c) =>
      (filter === "all" || c.actions.includes(filter)) &&
      (q === "" || `${c.title} ${c.description} ${c.brand}`.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Find a campaign</h1>
          <p className="mt-1 text-muted-foreground">Pick the actions you want to do. Get paid.</p>
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search brands or products"
            className="w-full rounded-xl border border-input bg-card py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
          All
        </FilterChip>
        {(["sales", "promote", "survey", "task"] as ActionType[]).map((t) => (
          <div key={t} className="w-28">
            <ActionTile type={t} size="sm" onClick={() => setFilter(t)} selected={filter === t} />
          </div>
        ))}
      </div>

      <div className="grid gap-6">
        {visible.map((c) => (
          <CampaignCard key={c.id} campaign={c} showPayouts />
        ))}
        {visible.length === 0 && (
          <div className="rounded-3xl border-2 border-dashed border-border p-12 text-center text-muted-foreground">
            No campaigns match your filters yet.
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
        active ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground ring-1 ring-border hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}
