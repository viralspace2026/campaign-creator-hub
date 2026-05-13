import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — ViralSpace" }] }),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const [role, setRole] = useState<"brand" | "affiliate" | "admin">("brand");
  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue your campaigns.">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          nav({ to: role === "brand" ? "/brand" : role === "affiliate" ? "/affiliate" : "/admin" });
        }}
        className="space-y-4"
      >
        <Field label="Email" type="email" placeholder="you@brand.com" />
        <Field label="Password" type="password" placeholder="••••••••" />

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Continue as</label>
          <div className="grid grid-cols-3 gap-2">
            {(["brand", "affiliate", "admin"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize transition ${
                  role === r
                    ? "border-primary bg-secondary text-secondary-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <button className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground shadow-sm transition hover:opacity-90">
          Log in
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link to="/signup/brand" className="font-semibold text-primary">
          Brand
        </Link>{" "}
        ·{" "}
        <Link to="/signup/affiliate" className="font-semibold text-primary">
          Creator
        </Link>
      </p>
    </AuthShell>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </div>
          <span className="text-lg font-bold tracking-tight">ViralSpace</span>
        </Link>
      </header>
      <main className="mx-auto grid max-w-md gap-2 px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mb-6 text-muted-foreground">{subtitle}</p>
        <div className="rounded-3xl bg-card p-6 shadow-[0_8px_30px_-12px_rgba(80,40,180,0.18)] ring-1 ring-border/60">
          {children}
        </div>
      </main>
    </div>
  );
}

export function Field({ label, ...rest }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input
        {...rest}
        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
    </label>
  );
}
