import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthShell, Field } from "./login";

export const Route = createFileRoute("/signup/affiliate")({
  head: () => ({ meta: [{ title: "Join as a creator — ViralSpace" }] }),
  component: SignupAffiliate,
});

const PLATFORMS = [
  "Instagram",
  "TikTok",
  "YouTube",
  "X / Twitter",
  "Facebook",
  "Snapchat",
  "Pinterest",
  "LinkedIn",
  "Twitch",
  "Threads",
  "Reddit",
  "WhatsApp",
  "Telegram",
];

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

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Primary platform</span>
          <select
            required
            defaultValue=""
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
          >
            <option value="" disabled>
              Select a platform…
            </option>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        <Field label="Email" type="email" placeholder="you@email.com" required />
        <Field label="Password" type="password" placeholder="At least 8 characters" required />
        <button className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground shadow-sm transition hover:opacity-90">
          Create creator account
        </button>
      </form>
    </AuthShell>
  );
}
