import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthShell, Field } from "./login";

export const Route = createFileRoute("/signup/affiliate")({
  head: () => ({ meta: [{ title: "Join as a creator — ViralSpace" }] }),
  component: SignupAffiliate,
});

function SignupAffiliate() {
  const nav = useNavigate();
  return (
    <AuthShell title="Earn from campaigns" subtitle="Join as a creator and pick your first action.">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          nav({ to: "/affiliate" });
        }}
        className="space-y-4"
      >
        <Field label="Display name" placeholder="alex.creates" required />
        <Field label="Primary platform" placeholder="Instagram, TikTok, YouTube…" />
        <Field label="Email" type="email" placeholder="you@email.com" required />
        <Field label="Password" type="password" placeholder="At least 8 characters" required />
        <button className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground shadow-sm transition hover:opacity-90">
          Create creator account
        </button>
      </form>
    </AuthShell>
  );
}
