import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
}

export function AppShell({
  role,
  nav,
  userName,
}: {
  role: "Brand" | "Affiliate" | "Admin";
  nav: NavItem[];
  userName: string;
}) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </div>
            <span className="text-lg font-bold tracking-tight">ViralSpace</span>
            <span className="ml-2 rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
              {role}
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((n) => {
              const active = path === n.to || (n.to !== "/" && path.startsWith(n.to));
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden text-right text-sm md:block">
              <div className="font-semibold">{userName}</div>
              <div className="text-xs text-muted-foreground">{role} account</div>
            </div>
            <div className="grid size-9 place-items-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
              {userName.slice(0, 1)}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
