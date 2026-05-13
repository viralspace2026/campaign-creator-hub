import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Check, X } from "lucide-react";
import { ActionTile } from "@/components/ActionTile";
import { store, useStore } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin review — ViralSpace" }] }),
  component: Admin,
});

function Admin() {
  const campaigns = useStore((s) => s.campaigns);
  const pending = campaigns.filter((c) => c.status === "pending");
  const recent = campaigns.filter((c) => c.status === "live" || c.status === "rejected").slice(0, 5);

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

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Review queue</h1>
          <p className="mt-1 text-muted-foreground">Approve campaigns to make them live for creators.</p>
        </div>

        {pending.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-border p-12 text-center text-muted-foreground">
            All caught up. ✨
          </div>
        ) : (
          <div className="grid gap-4">
            {pending.map((c) => (
              <article key={c.id} className="grid gap-4 rounded-2xl bg-card p-5 ring-1 ring-border/60 md:grid-cols-[120px_1fr_auto] md:items-center">
                <img src={c.image} alt="" className="aspect-square w-full rounded-xl object-cover md:w-[120px]" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{c.title}</h3>
                    <span className="rounded-md bg-task-bg px-2 py-0.5 text-xs font-semibold text-task-foreground">Pending</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{c.description || "No description provided."}</p>
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
                    onClick={() => store.setStatus(c.id, "rejected")}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-sm font-semibold text-secondary-foreground hover:bg-accent"
                  >
                    <X className="size-4" /> Reject
                  </button>
                  <button
                    onClick={() => store.setStatus(c.id, "live")}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                  >
                    <Check className="size-4" /> Approve
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {recent.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Recent decisions</h2>
            <div className="grid gap-2">
              {recent.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-xl bg-card px-4 py-3 ring-1 ring-border/60">
                  <div className="flex items-center gap-3">
                    <img src={c.image} alt="" className="size-9 rounded-lg object-cover" />
                    <span className="text-sm font-medium">{c.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-md px-2 py-0.5 text-xs font-semibold capitalize ${
                      c.status === "live" ? "bg-success-bg text-promote-foreground" : "bg-destructive/10 text-destructive"
                    }`}>{c.status}</span>
                    <button
                      onClick={() => store.setStatus(c.id, "pending")}
                      className="text-xs font-medium text-muted-foreground hover:text-foreground"
                    >
                      Reopen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
