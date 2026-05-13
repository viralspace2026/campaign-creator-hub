import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight, BarChart3, Megaphone, ClipboardList, ListChecks } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ViralSpace — Campaigns that move" },
      {
        name: "description",
        content:
          "Brands launch campaigns. Creators amplify them. ViralSpace is one workspace for sales, promotion, surveys, and tasks.",
      },
      { property: "og:title", content: "ViralSpace — Campaigns that move" },
      {
        property: "og:description",
        content: "One workspace for sales, promotion, surveys, and tasks.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </div>
          <span className="text-lg font-bold tracking-tight">ViralSpace</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            Log in
          </Link>
          <Link
            to="/signup/brand"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            Get started
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-12 md:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
              The campaign workspace
            </span>
            <h1 className="mt-5 text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              Campaigns that <span className="text-primary">move.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Brands plug in sales, promotion, surveys and tasks — all attached to one campaign.
              Creators pick the actions they want, perform them, and get paid.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/signup/brand"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                I'm a brand <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/signup/affiliate"
                className="inline-flex items-center gap-2 rounded-xl bg-secondary px-5 py-3 font-semibold text-secondary-foreground transition hover:bg-accent"
              >
                I'm a creator <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Pill icon={BarChart3} label="Sales" tint="bg-sales-bg text-sales-foreground" />
              <Pill icon={Megaphone} label="Promote" tint="bg-promote-bg text-promote-foreground" />
              <Pill icon={ClipboardList} label="Survey" tint="bg-survey-bg text-survey-foreground" />
              <Pill icon={ListChecks} label="Task" tint="bg-task-bg text-task-foreground" />
            </div>
          </div>

          <PreviewCard />
        </div>
      </section>
    </div>
  );
}

function Pill({ icon: Icon, label, tint }: { icon: typeof BarChart3; label: string; tint: string }) {
  return (
    <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold ${tint}`}>
      <Icon className="size-4" />
      {label}
    </div>
  );
}

function PreviewCard() {
  return (
    <div className="rounded-3xl bg-card p-5 shadow-[0_30px_80px_-30px_rgba(80,40,180,0.35)] ring-1 ring-border/60">
      <div className="overflow-hidden rounded-2xl bg-accent">
        <img
          src="https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=80"
          alt="SoundWave Pro Earbuds"
          className="aspect-[5/3] w-full object-cover"
        />
      </div>
      <div className="mt-4 space-y-2">
        <span className="inline-flex rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
          Physical Product
        </span>
        <h3 className="text-xl font-bold">SoundWave Pro Earbuds</h3>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-primary">$69.99</span>
          <span className="text-sm text-muted-foreground line-through">$99.99</span>
          <span className="rounded-md bg-success-bg px-2 py-0.5 text-xs font-semibold text-promote-foreground">
            30% OFF
          </span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2">
        <MiniTile label="Sales" tint="bg-sales-bg text-sales-foreground" />
        <MiniTile label="Promote" tint="bg-promote-bg text-promote-foreground" />
        <MiniTile label="Survey" tint="bg-survey-bg text-survey-foreground" />
        <MiniTile label="Task" tint="bg-task-bg text-task-foreground" />
      </div>
    </div>
  );
}

function MiniTile({ label, tint }: { label: string; tint: string }) {
  return <div className={`rounded-lg px-2 py-2 text-center text-xs font-semibold ${tint}`}>{label}</div>;
}
