import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Plus, X } from "lucide-react";
import { ActionTile } from "@/components/ActionTile";
import { actionMeta, type ActionType } from "@/lib/mock-data";
import { store, useStore, type ActionConfig } from "@/lib/store";

export const Route = createFileRoute("/brand/campaigns/new")({
  head: () => ({ meta: [{ title: "New campaign — ViralSpace" }] }),
  component: NewCampaign,
});

function NewCampaign() {
  const nav = useNavigate();
  const draft = useStore((s) => s.draft);
  const [step, setStep] = useState<"details" | "actions" | "checkout">("details");
  const [picker, setPicker] = useState(false);
  const [editing, setEditing] = useState<ActionType | null>(null);

  const addAction = (cfg: ActionConfig) => {
    store.setDraftActions([...draft.actions.filter((x) => x.type !== cfg.type), cfg]);
    setEditing(null);
  };

  const total = draft.actions.length * 199 + 49;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <button onClick={() => nav({ to: "/brand" })} className="rounded-lg p-2 hover:bg-muted">
          <ArrowLeft className="size-4" />
        </button>
        <h1 className="text-2xl font-bold tracking-tight">Create a campaign</h1>
        <button
          onClick={() => { store.resetDraft(); setStep("details"); }}
          className="ml-auto text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Reset draft
        </button>
      </div>

      <Stepper step={step} />

      {step === "details" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4 rounded-3xl bg-card p-6 ring-1 ring-border/60">
            <Input label="Campaign title" value={draft.title} onChange={(v) => store.updateDraft({ title: v })} placeholder="SoundWave Pro Earbuds" />
            <Textarea label="Description" value={draft.description} onChange={(v) => store.updateDraft({ description: v })} placeholder="Tell creators what this campaign is about." />

            <ImageDropzone
              images={draft.images}
              onChange={(imgs) => store.updateDraft({ images: imgs })}
            />
          </div>
          <aside className="rounded-3xl bg-card p-6 ring-1 ring-border/60">
            <h3 className="font-semibold">Auto-saved draft</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Your campaign is saved locally as you type. Add at least one action to publish.
            </p>
            <button
              disabled={!draft.title}
              onClick={() => setStep("actions")}
              className="mt-4 w-full rounded-xl bg-primary py-2.5 font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50"
            >
              Continue to actions
            </button>
          </aside>
        </div>
      )}

      {step === "actions" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4 rounded-3xl bg-card p-6 ring-1 ring-border/60">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Actions on this campaign</h3>
              <button
                onClick={() => setPicker(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-sm font-semibold text-secondary-foreground hover:bg-accent"
              >
                <Plus className="size-4" /> Add action
              </button>
            </div>

            {draft.actions.length === 0 ? (
              <button
                onClick={() => setPicker(true)}
                className="grid w-full place-items-center rounded-2xl border-2 border-dashed border-border py-12 text-muted-foreground hover:border-primary hover:text-foreground"
              >
                <Plus className="mb-1 size-6" />
                <span className="text-sm font-medium">Add your first action</span>
              </button>
            ) : (
              <ul className="space-y-2">
                {draft.actions.map((a) => (
                  <li key={a.type} className="flex items-center justify-between rounded-2xl bg-muted/50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-28">
                        <ActionTile type={a.type} size="sm" />
                      </div>
                      <span className="text-sm text-muted-foreground">{a.summary}</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => { setEditing(a.type); setPicker(true); }}
                        className="rounded-lg px-2 py-1 text-xs font-medium hover:bg-background"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => store.setDraftActions(draft.actions.filter((x) => x.type !== a.type))}
                        className="rounded-lg p-1.5 hover:bg-background"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <aside className="rounded-3xl bg-card p-6 ring-1 ring-border/60">
            <h3 className="font-semibold">Ready when you are</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Combine any actions. One campaign can have all four — or just one.
            </p>
            <button
              disabled={draft.actions.length === 0}
              onClick={() => setStep("checkout")}
              className="mt-4 w-full rounded-xl bg-primary py-2.5 font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50"
            >
              Continue to checkout
            </button>
          </aside>
        </div>
      )}

      {step === "checkout" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4 rounded-3xl bg-card p-6 ring-1 ring-border/60">
            <h3 className="font-semibold">Order summary</h3>
            <ul className="divide-y divide-border/70">
              <li className="flex items-center justify-between py-3 text-sm">
                <span>Base campaign listing</span>
                <span className="font-semibold">$49.00</span>
              </li>
              {draft.actions.map((a) => (
                <li key={a.type} className="flex items-center justify-between py-3 text-sm">
                  <span className="capitalize">{a.type} module — {a.summary}</span>
                  <span className="font-semibold">$199.00</span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-border/70 pt-3">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold">${total.toFixed(2)}</span>
            </div>
          </div>
          <aside className="rounded-3xl bg-card p-6 ring-1 ring-border/60">
            <h3 className="font-semibold">After payment</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Your campaign enters admin review. Once approved, it goes live to creators.
            </p>
            <button
              onClick={() => { store.submitDraft(); nav({ to: "/brand" }); }}
              className="mt-4 w-full rounded-xl bg-primary py-2.5 font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              Pay ${total.toFixed(2)} and submit
            </button>
          </aside>
        </div>
      )}

      {picker && (
        <Modal onClose={() => { setPicker(false); setEditing(null); }} title="Add an action">
          {editing === null ? (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                Pick what you want creators to do. You can add more than one.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {(["sales", "promote", "survey", "task"] as ActionType[]).map((t) => (
                  <button key={t} onClick={() => setEditing(t)} className="text-left">
                    <div className={`rounded-2xl p-4 ${actionMeta[t].bg}`}>
                      <ActionTile type={t} />
                      <p className={`mt-3 text-sm ${actionMeta[t].fg}`}>{actionMeta[t].description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <ActionForm
              type={editing}
              initial={draft.actions.find((a) => a.type === editing)?.data}
              onCancel={() => setEditing(null)}
              onSave={(cfg) => {
                addAction(cfg);
                setPicker(false);
              }}
            />
          )}
        </Modal>
      )}
    </div>
  );
}

function Stepper({ step }: { step: "details" | "actions" | "checkout" }) {
  const steps: Array<{ id: typeof step; label: string }> = [
    { id: "details", label: "Details" },
    { id: "actions", label: "Actions" },
    { id: "checkout", label: "Checkout" },
  ];
  const idx = steps.findIndex((s) => s.id === step);
  return (
    <ol className="flex items-center gap-2">
      {steps.map((s, i) => (
        <li key={s.id} className="flex items-center gap-2">
          <div
            className={`grid size-7 place-items-center rounded-full text-xs font-bold ${
              i <= idx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {i < idx ? <Check className="size-3.5" /> : i + 1}
          </div>
          <span className={`text-sm font-medium ${i === idx ? "text-foreground" : "text-muted-foreground"}`}>
            {s.label}
          </span>
          {i < steps.length - 1 && <div className="mx-2 h-px w-8 bg-border" />}
        </li>
      ))}
    </ol>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl bg-card p-6 shadow-xl ring-1 ring-border/60">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-muted">
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ActionForm({
  type,
  initial,
  onSave,
  onCancel,
}: {
  type: ActionType;
  initial?: Record<string, string>;
  onSave: (cfg: ActionConfig) => void;
  onCancel: () => void;
}) {
  const [state, setState] = useState<Record<string, string>>(initial ?? {});
  const fields = formFieldsFor(type);

  const summary = (() => {
    switch (type) {
      case "sales":
        return `${state.kind || "Digital"} · $${state.price || "0"} · ${state.commission || "0%"} commission`;
      case "promote":
        return `Budget $${state.budget || "0"} · ${state.plan || "Starter"} plan`;
      case "survey":
        return `${state.responses || "100"} responses · $${state.reward || "0"} per participant`;
      case "task":
        return `${state.kind || "Referral"} · $${state.reward || "0"} per completion`;
    }
  })();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-32">
          <ActionTile type={type} />
        </div>
        <p className="text-sm text-muted-foreground">{actionMeta[type].description}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((f) =>
          f.type === "select" ? (
            <Select key={f.key} label={f.label} options={f.options!} value={state[f.key] || ""} onChange={(v) => setState({ ...state, [f.key]: v })} />
          ) : (
            <Input key={f.key} label={f.label} value={state[f.key] || ""} onChange={(v) => setState({ ...state, [f.key]: v })} placeholder={f.placeholder} />
          ),
        )}
      </div>
      {type === "survey" && (
        <p className="rounded-lg bg-survey-bg p-3 text-sm text-survey-foreground">
          Note: survey questions are written by the ViralSpace admin team after submission.
        </p>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onCancel} className="rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted">
          Back
        </button>
        <button onClick={() => onSave({ type, summary, data: state })} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
          Save action
        </button>
      </div>
    </div>
  );
}

interface FormField {
  key: string;
  label: string;
  type: "text" | "select";
  placeholder?: string;
  options?: string[];
}

function formFieldsFor(type: ActionType): FormField[] {
  switch (type) {
    case "sales":
      return [
        { key: "kind", label: "Item type", type: "select", options: ["Digital", "Physical"] },
        { key: "price", label: "Price (USD)", type: "text", placeholder: "69.99" },
        { key: "commission", label: "Affiliate commission", type: "text", placeholder: "25%" },
        { key: "category", label: "Category", type: "text", placeholder: "Audio" },
      ];
    case "promote":
      return [
        { key: "budget", label: "Budget (USD)", type: "text", placeholder: "500" },
        { key: "plan", label: "Plan", type: "select", options: ["Starter", "Growth", "Scale"] },
      ];
    case "survey":
      return [
        { key: "audience", label: "Target audience", type: "text", placeholder: "Gen Z, US, music fans" },
        { key: "responses", label: "Responses needed", type: "text", placeholder: "200" },
        { key: "reward", label: "Reward per participant", type: "text", placeholder: "1.50" },
      ];
    case "task":
      return [
        { key: "kind", label: "Task type", type: "select", options: ["Referral", "Signup", "Download", "Social post"] },
        { key: "reward", label: "Reward (USD)", type: "text", placeholder: "5" },
        { key: "proof", label: "Proof required", type: "text", placeholder: "Screenshot of post" },
      ];
  }
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
    </label>
  );
}

function Textarea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <textarea
        value={value}
        rows={4}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
    </label>
  );
}

function Select({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

function Uploader({ label, hint }: { label: string; hint?: string }) {
  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <div className="grid place-items-center rounded-xl border-2 border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        <span>Drag & drop or click to upload</span>
        {hint && <span className="text-xs">{hint}</span>}
      </div>
    </div>
  );
}
