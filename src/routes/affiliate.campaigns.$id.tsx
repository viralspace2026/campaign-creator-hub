import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Copy, Check, CheckCircle2, Share2, Activity } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { actionMeta, type ActionType } from "@/lib/mock-data";
import { ActionTile } from "@/components/ActionTile";
import { store, useStore } from "@/lib/store";

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
    "Download brand banners from the campaign kit",
    "Post them with your tagged referral link",
    "Get paid based on impressions and click-through performance",
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

          {c.price !== undefined && (
            <div className="flex items-center gap-3 pt-1">
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
          </div>

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
