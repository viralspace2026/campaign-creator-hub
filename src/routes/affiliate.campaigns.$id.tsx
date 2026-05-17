import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Copy, Check, CheckCircle2, Share2, Activity, Lock, ClipboardList, Upload, Hourglass, XCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { actionMeta, type ActionType } from "@/lib/mock-data";
import { ActionTile } from "@/components/ActionTile";
import { store, useStore, payoutFor, formatPayout } from "@/lib/store";

function parseUA(ua: string) {
  const isTablet = /iPad|Tablet/i.test(ua);
  const isMobile = !isTablet && /Mobi|Android|iPhone/i.test(ua);
  const device = isTablet ? "Tablet" : isMobile ? "Mobile" : "Desktop";
  const os = /Windows/i.test(ua) ? "Windows" : /Mac OS X/i.test(ua) ? "macOS" : /Android/i.test(ua) ? "Android" : /iPhone|iPad|iOS/i.test(ua) ? "iOS" : /Linux/i.test(ua) ? "Linux" : "Unknown";
  const browser = /Edg\//i.test(ua) ? "Edge" : /Chrome\//i.test(ua) ? "Chrome" : /Firefox\//i.test(ua) ? "Firefox" : /Safari\//i.test(ua) ? "Safari" : "Other";
  return { device, os, browser };
}

export const Route = createFileRoute("/affiliate/campaigns/$id")({
  head: () => ({ meta: [{ title: "Campaign — ViralSpace" }] }),
  component: Detail,
});

const NEXT_STEPS: Record<ActionType, string[]> = {
  sales: [
    "Copy your unique referral link below",
    "Share it across your audience and social channels",
    "Earn the listed commission on every verified sale",
  ],
  promote: [
    "Copy your unique tracking link below",
    "Share it on social, ads, newsletters, or banners",
    "We track every click — IP, device, referrer, and engagement time",
  ],
  survey: [
    "Open the curated survey from your dashboard",
    "Answer all questions honestly — typically takes 3–5 minutes",
    "Reward is paid out within 24h of validation",
  ],
  task: [
    "Read the task brief carefully",
    "Complete the marketing task as described",
    "Submit proof (screenshot or link). Get paid once verified.",
  ],
};

function Detail() {
  const { id } = useParams({ from: "/affiliate/campaigns/$id" });
  const c = useStore((s) => s.campaigns.find((x) => x.id === id));
  const joined = useStore((s) => s.joined[id] ?? []);
  const code = useStore((s) => s.affiliateLinks[id]);
  const [active, setActive] = useState<ActionType | null>(null);
  const [copied, setCopied] = useState(false);
  const visits = useStore((s) => s.visits[id] ?? []);
  const recordedRef = useRef(false);

  const current: ActionType | null = active ?? c?.actions[0] ?? null;
  const refLink = useMemo(
    () => (code ? `${typeof window !== "undefined" ? window.location.origin : "https://viral.space"}/affiliate/campaigns/${id}?ref=${code}` : ""),
    [id, code],
  );

  // Record visitor footprint when arriving via ?ref=<code>
  useEffect(() => {
    if (typeof window === "undefined" || recordedRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get("ref");
    if (!refCode) return;
    recordedRef.current = true;
    const ua = navigator.userAgent;
    const { device, os, browser } = parseUA(ua);
    const baseVisit = {
      campaignId: id,
      code: refCode,
      ip: "0.0.0.0",
      device,
      os,
      browser,
      userAgent: ua,
      referrer: document.referrer || "direct",
      language: navigator.language,
      screen: `${window.screen.width}x${window.screen.height}`,
    };
    const startedAt = Date.now();
    // Try resolving real IP (mock-friendly external lookup)
    fetch("https://api.ipify.org?format=json")
      .then((r) => r.json())
      .then((j) => store.recordVisit({ ...baseVisit, ip: j.ip ?? "0.0.0.0" }))
      .catch(() => store.recordVisit(baseVisit));
    // Track engagement on unload
    const onLeave = () => {
      const secs = Math.round((Date.now() - startedAt) / 1000);
      const list = store.getVisits(id);
      const mine = list.find((v) => v.code === refCode && v.userAgent === ua);
      if (mine) mine.engagedSeconds = secs;
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [id]);

  if (!c) {
    return (
      <div className="p-12 text-center">
        <h1 className="text-2xl font-bold">Campaign not found</h1>
        <Link to="/affiliate" className="mt-4 inline-block text-primary">
          Back to browse
        </Link>
      </div>
    );
  }

  const isJoined = current ? joined.includes(current) : false;

  return (
    <div className="space-y-6">
      <Link to="/affiliate" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to campaigns
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="overflow-hidden rounded-3xl bg-accent">
          <img src={c.image} alt={c.title} className="aspect-[4/3] w-full object-cover" />
        </div>
        <div className="space-y-3">
          <span className="inline-flex w-fit rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
            {c.productType}
          </span>
          <h1 className="text-4xl font-bold tracking-tight">{c.title}</h1>
          <p className="text-muted-foreground">{c.description}</p>

          {c.actions.includes("sales") && c.price !== undefined && (
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="text-3xl font-bold text-primary">${c.price.toFixed(2)}</span>
              {c.originalPrice && <span className="text-lg text-muted-foreground line-through">${c.originalPrice.toFixed(2)}</span>}
              {c.discount && (
                <span className="rounded-md bg-success-bg px-2.5 py-1 text-sm font-semibold text-promote-foreground">{c.discount}</span>
              )}
            </div>
          )}

          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {c.actions.map((a: ActionType) => (
              <div key={a} className="relative">
                <ActionTile type={a} size="sm" selected={current === a} onClick={() => setActive(a)} />
                <div className="mt-1 text-center text-[11px] font-semibold text-muted-foreground">
                  {formatPayout(payoutFor(c, a), a)}
                </div>
                {joined.includes(a) && (
                  <CheckCircle2 className="absolute -right-1 -top-1 size-4 rounded-full bg-card text-success" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {current && (
        <div className="rounded-3xl bg-card p-6 ring-1 ring-border/60">
          <div className="flex items-center gap-3">
            <div className="w-32">
              <ActionTile type={current} />
            </div>
            <div>
              <h3 className="text-lg font-semibold capitalize">{actionMeta[current].label} action</h3>
              <p className="text-sm text-muted-foreground">{actionMeta[current].description}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Next steps</h4>
              <ol className="space-y-2">
                {NEXT_STEPS[current].map((step, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {(current === "sales" || current === "promote") && (
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Your referral link</h4>
                {refLink ? (
                  <>
                    <div className="flex items-center gap-2 rounded-xl bg-muted/60 p-3">
                      <code className="flex-1 truncate text-sm">{refLink}</code>
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(refLink);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1500);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
                      >
                        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <ShareRow url={refLink} title={`Check out ${c.title}`} />
                    {current === "sales" && c.commission && (
                      <p className="text-xs text-muted-foreground">You earn <strong>{c.commission}</strong> on every verified sale.</p>
                    )}
                  </>
                ) : (
                  <p className="rounded-xl bg-muted/60 p-3 text-sm text-muted-foreground">
                    Click <strong>Participate</strong> to generate your unique affiliate link.
                  </p>
                )}
              </div>
            )}

            {current === "survey" && <SurveyPanel campaignId={id} />}
            {current === "task" && <TaskPanel campaignId={id} />}
          </div>

          {(current === "sales" || current === "promote") && (
            <button
              onClick={() => {
                store.joinAction(id, current);
                const newCode = store.getOrCreateAffiliateLink(id);
                const link = `${window.location.origin}/affiliate/campaigns/${id}?ref=${newCode}`;
                navigator.clipboard?.writeText(link).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1800);
                });
              }}
              disabled={isJoined}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {isJoined ? (<><CheckCircle2 className="size-4" /> Joined — link copied</>) : "Participate & copy my link"}
            </button>
          )}
        </div>
      )}

      {refLink && (
        <div className="rounded-3xl bg-card p-6 ring-1 ring-border/60">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="size-4 text-primary" />
            <h3 className="text-lg font-semibold">Visitor tracking</h3>
            <span className="ml-auto rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
              {visits.length} {visits.length === 1 ? "visit" : "visits"}
            </span>
          </div>
          {visits.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No visits yet. Share your link — every click is logged with IP, device, browser, referrer, language, and engagement time.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-2 py-2">Time</th>
                    <th className="px-2 py-2">IP</th>
                    <th className="px-2 py-2">Device</th>
                    <th className="px-2 py-2">OS / Browser</th>
                    <th className="px-2 py-2">Referrer</th>
                    <th className="px-2 py-2">Lang</th>
                    <th className="px-2 py-2 text-right">Engaged</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.map((v) => (
                    <tr key={v.id} className="border-t border-border/60">
                      <td className="px-2 py-2 text-muted-foreground">{new Date(v.timestamp).toLocaleString()}</td>
                      <td className="px-2 py-2 font-mono text-xs">{v.ip}</td>
                      <td className="px-2 py-2">{v.device}</td>
                      <td className="px-2 py-2">{v.os} · {v.browser}</td>
                      <td className="px-2 py-2 max-w-[180px] truncate text-muted-foreground">{v.referrer}</td>
                      <td className="px-2 py-2 text-muted-foreground">{v.language}</td>
                      <td className="px-2 py-2 text-right">{v.engagedSeconds ? `${v.engagedSeconds}s` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ShareRow({ url, title }: { url: string; title: string }) {
  const enc = encodeURIComponent;
  const text = `${title} — ${url}`;
  const targets = [
    { label: "WhatsApp", href: `https://wa.me/?text=${enc(text)}`, color: "bg-[#25D366] text-white" },
    { label: "X / Twitter", href: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`, color: "bg-foreground text-background" },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`, color: "bg-[#1877F2] text-white" },
    { label: "Telegram", href: `https://t.me/share/url?url=${enc(url)}&text=${enc(title)}`, color: "bg-[#0088cc] text-white" },
    { label: "Email", href: `mailto:?subject=${enc(title)}&body=${enc(text)}`, color: "bg-secondary text-secondary-foreground" },
  ];
  const nativeShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title, text: title, url }); } catch {}
    }
  };
  return (
    <div>
      <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Share</h4>
      <div className="flex flex-wrap gap-2">
        {targets.map((t) => (
          <a
            key={t.label}
            href={t.href}
            target="_blank"
            rel="noreferrer"
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold hover:opacity-90 ${t.color}`}
          >
            {t.label}
          </a>
        ))}
        {typeof navigator !== "undefined" && "share" in navigator && (
          <button
            onClick={nativeShare}
            className="inline-flex items-center gap-1.5 rounded-lg bg-card px-3 py-1.5 text-xs font-semibold ring-1 ring-border hover:bg-muted"
          >
            <Share2 className="size-3.5" /> More
          </button>
        )}
      </div>
    </div>
  );
}

function SurveyPanel({ campaignId }: { campaignId: string }) {
  const submission = useStore((s) => s.surveys[campaignId]);
  const profile = useStore((s) => s.affiliateProfile);
  const campaign = useStore((s) => s.campaigns.find((x) => x.id === campaignId));
  const eligibility = useMemo(
    () => store.qualifiesForSurvey(campaignId),
    // Recompute when inputs that affect eligibility change
    [campaignId, profile, campaign],
  );
  const [taking, setTaking] = useState(false);

  if (submission?.credited) {
    return (
      <div className="space-y-2 rounded-xl bg-success-bg p-4 text-sm text-promote-foreground ring-1 ring-success/30">
        <div className="flex items-center gap-2 font-semibold">
          <CheckCircle2 className="size-4" /> Survey completed
        </div>
        <p className="text-xs">
          Auto-credited <strong>${submission.reward.toFixed(2)}</strong> on{" "}
          {new Date(submission.completedAt).toLocaleDateString()}.
        </p>
      </div>
    );
  }

  if (!eligibility.ok) {
    return (
      <div className="space-y-3 rounded-xl bg-muted/60 p-4 text-sm">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <Lock className="size-4" /> Not yet qualified
        </div>
        <p className="text-xs text-muted-foreground">
          This survey screens affiliates before participation. You don&rsquo;t meet:
        </p>
        <ul className="space-y-1 text-xs">
          {eligibility.reasons.map((r) => (
            <li key={r} className="flex items-start gap-1.5 text-muted-foreground">
              <XCircle className="mt-0.5 size-3 shrink-0 text-destructive" /> <span>{r}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">
          Your profile: {profile.age} yrs · {profile.gender} · {profile.location} ·{" "}
          {profile.followers.toLocaleString()} followers · {profile.platforms.join(", ")}
        </p>
        <Link to="/profile" className="inline-flex items-center text-xs font-semibold text-primary hover:underline">
          Update profile →
        </Link>
      </div>
    );
  }

  if (taking) {
    return (
      <MockSurvey
        onCancel={() => setTaking(false)}
        onComplete={() => {
          store.joinAction(campaignId, "survey");
          store.completeSurvey(campaignId);
          setTaking(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-3 rounded-xl bg-survey-bg/40 p-4 text-sm ring-1 ring-survey-bg">
      <div className="flex items-center gap-2 font-semibold">
        <ClipboardList className="size-4 text-survey-foreground" /> You qualify
      </div>
      <p className="text-xs text-muted-foreground">
        Take the screened survey. Reward is auto-credited the moment you finish.
      </p>
      <button
        onClick={() => setTaking(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
      >
        Start survey
      </button>
    </div>
  );
}

function MockSurvey({ onComplete, onCancel }: { onComplete: () => void; onCancel: () => void }) {
  const questions = [
    "How often do you discover new products via creators?",
    "Which platform do you use most for shopping inspiration?",
    "How likely are you to recommend a product after trying it?",
  ];
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const choices = ["Never", "Sometimes", "Often", "Always"];

  const next = (a: string) => {
    const updated = [...answers, a];
    setAnswers(updated);
    if (step + 1 >= questions.length) onComplete();
    else setStep(step + 1);
  };

  return (
    <div className="space-y-3 rounded-xl bg-card p-4 ring-1 ring-border">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Question {step + 1} of {questions.length}</span>
        <button onClick={onCancel} className="hover:text-foreground">Cancel</button>
      </div>
      <p className="text-sm font-medium">{questions[step]}</p>
      <div className="grid grid-cols-2 gap-2">
        {choices.map((c) => (
          <button
            key={c}
            onClick={() => next(c)}
            className="rounded-lg bg-muted px-3 py-2 text-xs font-semibold hover:bg-accent"
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

function TaskPanel({ campaignId }: { campaignId: string }) {
  const submission = useStore((s) => s.tasks[campaignId]);
  const [proof, setProof] = useState("");

  if (submission) {
    const statusMap = {
      pending: { icon: Hourglass, tint: "bg-task-bg text-task-foreground", label: "Under review" },
      approved: { icon: CheckCircle2, tint: "bg-success-bg text-promote-foreground", label: "Approved & credited" },
      rejected: { icon: XCircle, tint: "bg-destructive/10 text-destructive", label: "Rejected" },
    } as const;
    const m = statusMap[submission.status];
    const Icon = m.icon;
    return (
      <div className={`space-y-2 rounded-xl p-4 text-sm ${m.tint}`}>
        <div className="flex items-center gap-2 font-semibold">
          <Icon className="size-4" /> {m.label}
        </div>
        <p className="text-xs opacity-90">
          Submitted {new Date(submission.submittedAt).toLocaleString()}
        </p>
        <p className="break-all rounded-lg bg-background/60 p-2 text-xs">
          Proof: {submission.proof}
        </p>
        {submission.status === "approved" && (
          <p className="text-xs">Credited <strong>${submission.reward.toFixed(2)}</strong> after brand review.</p>
        )}
        {submission.status === "pending" && (
          <p className="text-xs">Credit will be released once the brand approves your proof.</p>
        )}
        {submission.status === "rejected" && submission.reviewNote && (
          <p className="text-xs">Reason: {submission.reviewNote}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl bg-task-bg/40 p-4 text-sm ring-1 ring-task-bg">
      <div className="flex items-center gap-2 font-semibold">
        <Upload className="size-4 text-task-foreground" /> Submit proof
      </div>
      <p className="text-xs text-muted-foreground">
        Drop a link to your post, screenshot URL, or confirmation. Credit is released only after the brand reviews and approves.
      </p>
      <textarea
        value={proof}
        onChange={(e) => setProof(e.target.value)}
        rows={3}
        placeholder="https://tiktok.com/@you/video/123 — or paste screenshot URL"
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
      <button
        disabled={!proof.trim()}
        onClick={() => {
          store.joinAction(campaignId, "task");
          store.submitTaskProof(campaignId, proof.trim());
          setProof("");
        }}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        Submit for review
      </button>
    </div>
  );
}
