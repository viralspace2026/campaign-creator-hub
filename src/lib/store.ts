import { useSyncExternalStore } from "react";
import { mockCampaigns, type Campaign, type ActionType } from "./mock-data";

export type CampaignStatus = "draft" | "pending" | "live" | "rejected";

export interface ActionConfig {
  type: ActionType;
  summary: string;
  data: Record<string, string>;
}

export interface StoredCampaign extends Omit<Campaign, "status" | "actions"> {
  status: CampaignStatus;
  actions: ActionType[];
  actionConfigs?: ActionConfig[];
}

export interface CampaignDraft {
  title: string;
  description: string;
  images: string[]; // data URLs, max 6
  actions: ActionConfig[];
}

export interface Profile {
  name: string;
  email: string;
  bio: string;
  avatar: string; // data URL
  role: "Brand" | "Affiliate" | "Admin";
}

interface State {
  campaigns: StoredCampaign[];
  draft: CampaignDraft;
  joined: Record<string, ActionType[]>; // campaignId -> joined action types
  affiliateLinks: Record<string, string>; // campaignId -> unique referral code
  visits: Record<string, Visit[]>; // campaignId -> recorded visitor entries
  profile: Profile;
}

export interface Visit {
  id: string;
  campaignId: string;
  code: string; // affiliate referral code
  timestamp: number;
  ip: string;
  device: string; // "Mobile" | "Tablet" | "Desktop"
  os: string;
  browser: string;
  userAgent: string;
  referrer: string;
  language: string;
  screen: string;
  engagedSeconds?: number;
}

const KEY = "viralspace-state-v2";
const emptyDraft: CampaignDraft = { title: "", description: "", images: [], actions: [] };
const defaultProfile: Profile = {
  name: "Aurelia Audio",
  email: "team@aurelia.co",
  bio: "Building joyful audio experiences.",
  avatar: "",
  role: "Brand",
};

function load(): State {
  const base: State = { campaigns: mockCampaigns as StoredCampaign[], draft: emptyDraft, joined: {}, affiliateLinks: {}, visits: {}, profile: defaultProfile };
  if (typeof window === "undefined") return base;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...base, ...JSON.parse(raw) };
  } catch {}
  return base;
}

let state: State = load();
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
  listeners.forEach((l) => l());
}

function setState(updater: (s: State) => State) {
  state = updater(state);
  persist();
}

export const store = {
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  get: () => state,
  updateDraft(patch: Partial<CampaignDraft>) {
    setState((s) => ({ ...s, draft: { ...s.draft, ...patch } }));
  },
  setDraftActions(actions: ActionConfig[]) {
    setState((s) => ({ ...s, draft: { ...s.draft, actions } }));
  },
  resetDraft() {
    setState((s) => ({ ...s, draft: emptyDraft }));
  },
  submitDraft(): string {
    const id = `c-${Date.now()}`;
    const d = state.draft;
    const price = Number(d.actions.find((a) => a.type === "sales")?.data.price) || undefined;
    const commission = d.actions.find((a) => a.type === "sales")?.data.commission;
    const newCampaign: StoredCampaign = {
      id,
      brand: "Your Brand",
      title: d.title || "Untitled campaign",
      description: d.description || "",
      image:
        d.images[0] ||
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=80",
      productType: "Digital Product",
      price,
      commission,
      epc: "$0.00",
      actions: d.actions.map((a) => a.type),
      actionConfigs: d.actions,
      stats: { totalSales: 0, conversionRate: "—", affiliates: 0, visitors: 0 },
      status: "pending",
    };
    setState((s) => ({
      ...s,
      campaigns: [newCampaign, ...s.campaigns],
      draft: emptyDraft,
    }));
    return id;
  },
  setStatus(id: string, status: CampaignStatus) {
    setState((s) => ({
      ...s,
      campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, status } : c)),
    }));
  },
  joinAction(campaignId: string, type: ActionType) {
    setState((s) => {
      const cur = s.joined[campaignId] ?? [];
      if (cur.includes(type)) return s;
      return { ...s, joined: { ...s.joined, [campaignId]: [...cur, type] } };
    });
  },
  getOrCreateAffiliateLink(campaignId: string): string {
    const existing = state.affiliateLinks[campaignId];
    if (existing) return existing;
    const code = Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 6);
    setState((s) => ({ ...s, affiliateLinks: { ...s.affiliateLinks, [campaignId]: code } }));
    return code;
  },
  updateProfile(patch: Partial<Profile>) {
    setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }));
  },
};

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(state),
    () => selector(state),
  );
}
