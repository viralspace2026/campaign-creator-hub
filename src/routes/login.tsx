import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../lib/auth-context";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in — ViralSpace" }] }),
  component: Login,
});

function Login() {
  const { signIn } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signIn(email, password);
      
      // Small delay to let profile load
      setTimeout(() => {
        // We'll improve this logic once we have protected routes
        nav({ to: "/", replace: true });
      }, 400);
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue your campaigns.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field 
          label="Email" 
          type="email" 
          placeholder="you@brand.com" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <Field 
          label="Password" 
          type="password" 
          placeholder="••••••••" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button 
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-70"
        >
          {loading ? "Signing in..." : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link to="/signup/brand" className="font-semibold text-primary">Brand</Link>{" "}
        ·{" "}
        <Link to="/signup/affiliate" className="font-semibold text-primary">Creator</Link>
      </p>
    </AuthShell>
  );
}

// ==================== HELPER COMPONENTS ====================

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