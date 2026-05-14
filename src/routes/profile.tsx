import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useRef } from "react";
import { ArrowLeft, Camera } from "lucide-react";
import { store, useStore } from "@/lib/store";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — ViralSpace" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const profile = useStore((s) => s.profile);
  const fileRef = useRef<HTMLInputElement>(null);
  const referrer = useRouterState({ select: (s) => s.location.state as { from?: string } | undefined });
  const back = referrer?.from || (profile.role === "Affiliate" ? "/affiliate" : profile.role === "Admin" ? "/admin" : "/brand");

  const onAvatar = (file: File) => {
    const r = new FileReader();
    r.onload = () => store.updateProfile({ avatar: String(r.result) });
    r.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/70 bg-background/85">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-6 py-4">
          <Link to={back} className="rounded-lg p-2 hover:bg-muted">
            <ArrowLeft className="size-4" />
          </Link>
          <h1 className="text-xl font-bold tracking-tight">Profile</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-6 py-8">
        <section className="rounded-3xl bg-card p-6 ring-1 ring-border/60">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="grid size-20 place-items-center overflow-hidden rounded-full bg-accent text-2xl font-bold text-accent-foreground">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  profile.name.slice(0, 1)
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 grid size-7 place-items-center rounded-full bg-primary text-primary-foreground shadow ring-2 ring-card"
              >
                <Camera className="size-3.5" />
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files && e.target.files[0] && onAvatar(e.target.files[0])}
              />
            </div>
            <div>
              <div className="text-lg font-bold">{profile.name}</div>
              <div className="text-sm text-muted-foreground">{profile.email}</div>
              <span className="mt-1 inline-block rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                {profile.role}
              </span>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-3xl bg-card p-6 ring-1 ring-border/60">
          <h2 className="font-semibold">Account details</h2>
          <Field label="Display name" value={profile.name} onChange={(v) => store.updateProfile({ name: v })} />
          <Field label="Email" value={profile.email} onChange={(v) => store.updateProfile({ email: v })} />
          <div>
            <span className="mb-1.5 block text-sm font-medium">Bio</span>
            <textarea
              rows={4}
              value={profile.bio}
              onChange={(e) => store.updateProfile({ bio: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
            />
          </div>
          <div>
            <span className="mb-1.5 block text-sm font-medium">Role</span>
            <div className="flex gap-2">
              {(["Brand", "Affiliate", "Admin"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => store.updateProfile({ role: r })}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                    profile.role === r ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Changes are saved automatically.</p>
        </section>
      </main>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
    </label>
  );
}
