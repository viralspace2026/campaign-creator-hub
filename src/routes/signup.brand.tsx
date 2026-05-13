import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthShell, Field } from "./login";

export const Route = createFileRoute("/signup/brand")({
  head: () => ({ meta: [{ title: "Create a brand account — ViralSpace" }] }),
  component: SignupBrand,
});

function SignupBrand() {
  const nav = useNavigate();
  return (
    <AuthShell title="Launch your first campaign" subtitle="Create a brand workspace in under a minute.">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          nav({ to: "/brand" });
        }}
        className="space-y-4"
      >
        <Field label="Brand name" placeholder="Aurelia Audio" required />
        <Field label="Website" placeholder="https://aurelia.com" />
        <Field label="Work email" type="email" placeholder="you@brand.com" required />
        <Field label="Password" type="password" placeholder="At least 8 characters" required />
        <button className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground shadow-sm transition hover:opacity-90">
          Create brand account
        </button>
        <p className="text-center text-xs text-muted-foreground">
          By continuing you agree to our Terms and Privacy.
        </p>
      </form>
    </AuthShell>
  );
}
