import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../lib/auth-context";
import { AuthShell, Field } from "./login";

export const Route = createFileRoute("/signup/affiliate")({
  head: () => ({ meta: [{ title: "Join as a creator — ViralSpace" }] }),
  component: SignupAffiliate,
});

const PLATFORMS = [
  "Instagram", "TikTok", "YouTube", "X / Twitter", "Facebook",
  "Snapchat", "Pinterest", "LinkedIn", "Twitch", "Threads", "Reddit"
];

function SignupAffiliate() {
  const { signUp } = useAuth();
  const nav = useNavigate();
  
  const [formData, setFormData] = useState({
    displayName: "",
    primaryPlatform: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signUp(formData.email, formData.password, 'affiliate');
      alert("Account created successfully! Please check your email to confirm.");
      nav({ to: "/affiliate" });
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Earn from campaigns" subtitle="Join as a creator and pick your first action.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field 
          label="Display name" 
          placeholder="alex.creates" 
          value={formData.displayName}
          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
          required 
        />

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Primary platform</span>
          <select
            value={formData.primaryPlatform}
            onChange={(e) => setFormData({ ...formData, primaryPlatform: e.target.value })}
            required
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
          >
            <option value="" disabled>Select a platform…</option>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>

        <Field 
          label="Email" 
          type="email" 
          placeholder="you@email.com" 
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required 
        />
        <Field 
          label="Password" 
          type="password" 
          placeholder="At least 8 characters" 
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required 
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button 
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-70"
        >
          {loading ? "Creating account..." : "Create creator account"}
        </button>
      </form>
    </AuthShell>
  );
}