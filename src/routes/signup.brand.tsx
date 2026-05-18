import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "../lib/auth-context";
import { AuthShell, Field } from "./login";

export const Route = createFileRoute("/signup/brand")({
  head: () => ({ meta: [{ title: "Create a brand account — ViralSpace" }] }),
  component: SignupBrand,
});

function SignupBrand() {
  const { signUp } = useAuth();
  const nav = useNavigate();
  
  const [formData, setFormData] = useState({
    brandName: "",
    website: "",
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
      await signUp(formData.email, formData.password, 'brand');
      alert("Brand account created successfully! Please check your email.");
      nav({ to: "/brand" });
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Launch your first campaign" subtitle="Create a brand workspace in under a minute.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field 
          label="Brand name" 
          placeholder="Aurelia Audio" 
          value={formData.brandName}
          onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
          required 
        />
        
        <Field 
          label="Website" 
          placeholder="https://aurelia.com" 
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
        />

        <Field 
          label="Work email" 
          type="email" 
          placeholder="you@brand.com" 
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
          {loading ? "Creating account..." : "Create brand account"}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          By continuing you agree to our Terms and Privacy.
        </p>
      </form>
    </AuthShell>
  );
}