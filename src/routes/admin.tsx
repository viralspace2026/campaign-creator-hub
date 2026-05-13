import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Check, X } from "lucide-react";
import { useState } from "react";
import { mockCampaigns, type Campaign } from "@/lib/mock-data";
import { ActionTile } from "@/components/ActionTile";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin review — ViralSpace" }] }),
  component: Admin,
});

function Admin() {
  const [items, setItems] = useState<Campaign[]>(
    mockCampaigns.filter((c) => c.status === "pending").concat(mockCampaigns.filter((c) => c.status === "live").slice(0, 1).map((c) => ({ ...c, status: "pending" }))),
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </div>
            <span className="text-lg font-bold tracking-tight">ViralSpace</span>
            <span className="ml-2 rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">Admin</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Review queue</h1>
          <p className="mt-1 text-muted-foreground">Approve campaigns to make them live for creators.</p>
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-border p-12 text-center text-muted-foreground">
            All caught up. ✨
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((c) => (
              <article key={c.id} className="grid gap-4 rounded-2xl bg-card p-5 ring-1 ring-border/60 md:grid-cols-[120px_1fr_auto] md:items-center">
                <img src={c.image} alt="" className="aspect-square w-full rounded-xl object-cover md:w-[120px]" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{c.title}</h3>
                    <span className="rounded-md bg-task-bg px-2 py-0.5 text-xs font-semibold text-task-foreground">Pending</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {c.actions.map((a) => (
                      <div key={a} className="w-24">
                        <ActionTile type={a} size="sm" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setItems(items.filter((x) => x.id !== c.id))}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-sm font-semibold text-secondary-foreground hover:bg-accent"
                  >
                    <X className="size-4" /> Reject
                  </button>
                  <button
                    onClick={() => setItems(items.filter((x) => x.id !== c.id))}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                  >
                    <Check className="size-4" /> Approve
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
