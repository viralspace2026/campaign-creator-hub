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
  budgetTotal?: number;
  budgetSpent?: number;
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

export interface AffiliateProfile {
  age: number;
  gender: string; // "Female" | "Male" | "Non-binary"
  location: string; // country code or name
  followers: number;
  platforms: string[];
  niches: string[];
  verified: boolean;
}

export interface SurveySubmission {
  campaignId: string;
  completedAt: number;
  reward: number;
  credited: boolean;
}

export type TaskReviewStatus = "pending" | "approved" | "rejected";

export interface TaskSubmission {
  campaignId: string;
  proof: string;
  submittedAt: number;
  status: TaskReviewStatus;
  reward: number;
  reviewedAt?: number;
  reviewNote?: string;
  credited: boolean;
}

interface State {
  campaigns: StoredCampaign[];
  draft: CampaignDraft;
  joined: Record<string, ActionType[]>; // campaignId -> joined action types
  affiliateLinks: Record<string, string>; // campaignId -> unique referral code
  visits: Record<string, Visit[]>; // campaignId -> recorded visitor entries
  profile: Profile;
  affiliateProfile: AffiliateProfile;
  surveys: Record<string, SurveySubmission>;
  tasks: Record<string, TaskSubmission>;
  withdrawals: Withdrawal[];
}

export interface Withdrawal {
  id: string;
  amount: number;
  method: string;
  destination: string;
  status: "pending" | "paid" | "rejected";
  requestedAt: number;
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

const defaultAffiliateProfile: AffiliateProfile = {
  age: 26,
  gender: "Female",
  location: "US",
  followers: 12500,
  platforms: ["TikTok", "Instagram"],
  niches: ["Music", "Lifestyle"],
  verified: true,
};

function load(): State {
  const base: State = {
    campaigns: mockCampaigns as StoredCampaign[],
    draft: emptyDraft,
    joined: {},
    affiliateLinks: {},
    visits: {},
    profile: defaultProfile,
    affiliateProfile: defaultAffiliateProfile,
    surveys: {},
    tasks: {},
    withdrawals: [],
  };
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
      budgetTotal: Number(d.actions.find((a) => a.type === "sales")?.data.budget) || 500,
      budgetSpent: 0,
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
  updateCampaign(id: string, patch: Partial<StoredCampaign>) {
    setState((s) => ({
      ...s,
      campaigns: s.campaigns.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  },
  deleteCampaign(id: string) {
    setState((s) => ({ ...s, campaigns: s.campaigns.filter((c) => c.id !== id) }));
  },
  topUpBudget(id: string, amount: number) {
    setState((s) => ({
      ...s,
      campaigns: s.campaigns.map((c) =>
        c.id === id ? { ...c, budgetTotal: (c.budgetTotal ?? 0) + amount } : c,
      ),
    }));
  },
  requestWithdrawal(amount: number, method: string, destination: string): Withdrawal {
    const w: Withdrawal = {
      id: `w-${Date.now()}`,
      amount,
      method,
      destination,
      status: "pending",
      requestedAt: Date.now(),
    };
    setState((s) => ({ ...s, withdrawals: [w, ...s.withdrawals] }));
    return w;
  },
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
  recordVisit(v: Omit<Visit, "id" | "timestamp"> & { timestamp?: number }): Visit {
    const entry: Visit = {
      id: `v-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: v.timestamp ?? Date.now(),
      ...v,
    } as Visit;
    setState((s) => {
      const list = s.visits[entry.campaignId] ?? [];
      // Dedupe rapid duplicate hits within 2s for same code+ua
      if (list.some((x) => x.code === entry.code && x.userAgent === entry.userAgent && entry.timestamp - x.timestamp < 2000)) {
        return s;
      }
      return { ...s, visits: { ...s.visits, [entry.campaignId]: [entry, ...list].slice(0, 200) } };
    });
    return entry;
  },
  getVisits(campaignId: string): Visit[] {
    return state.visits[campaignId] ?? [];
  },
  updateProfile(patch: Partial<Profile>) {
    setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }));
  },
  updateAffiliateProfile(patch: Partial<AffiliateProfile>) {
    setState((s) => ({ ...s, affiliateProfile: { ...s.affiliateProfile, ...patch } }));
  },
  qualifiesForSurvey(campaignId: string): { ok: boolean; reasons: string[] } {
    const c = state.campaigns.find((x) => x.id === campaignId);
    const cfg = c?.actionConfigs?.find((a) => a.type === "survey")?.data ?? {};
    const p = state.affiliateProfile;
    const reasons: string[] = [];
    const minAge = Number(cfg.qualAgeMin);
    const maxAge = Number(cfg.qualAgeMax);
    if (minAge && p.age < minAge) reasons.push(`Minimum age ${minAge}`);
    if (maxAge && p.age > maxAge) reasons.push(`Maximum age ${maxAge}`);
    if (cfg.qualGender && cfg.qualGender !== "Any" && cfg.qualGender !== p.gender) {
      reasons.push(`Gender: ${cfg.qualGender}`);
    }
    if (cfg.qualLocation) {
      const allowed = cfg.qualLocation.split(",").map((s: string) => s.trim().toLowerCase()).filter(Boolean);
      if (allowed.length && !allowed.some((a: string) => p.location.toLowerCase().includes(a))) {
        reasons.push(`Location: ${cfg.qualLocation}`);
      }
    }
    const minF = Number(cfg.qualMinFollowers);
    if (minF && p.followers < minF) reasons.push(`Min ${minF.toLocaleString()} followers`);
    const needPlatforms = (cfg.qualPlatforms ?? "").split(",").map((s: string) => s.trim()).filter(Boolean);
    if (needPlatforms.length && !needPlatforms.some((pl: string) => p.platforms.includes(pl))) {
      reasons.push(`Platforms: ${needPlatforms.join("/")}`);
    }
    const needNiches = (cfg.qualNiches ?? "").split(",").map((s: string) => s.trim()).filter(Boolean);
    if (needNiches.length && !needNiches.some((n: string) => p.niches.includes(n))) {
      reasons.push(`Niches: ${needNiches.join("/")}`);
    }
    if (cfg.qualVerified === "yes" && !p.verified) reasons.push("Verified creators only");
    return { ok: reasons.length === 0, reasons };
  },
  completeSurvey(campaignId: string) {
    const c = state.campaigns.find((x) => x.id === campaignId);
    const reward = Number(c?.actionConfigs?.find((a) => a.type === "survey")?.data.reward) || 1.5;
    setState((s) => ({
      ...s,
      surveys: {
        ...s.surveys,
        [campaignId]: {
          campaignId,
          completedAt: Date.now(),
          reward,
          credited: true, // auto-credit
        },
      },
    }));
  },
  submitTaskProof(campaignId: string, proof: string) {
    const c = state.campaigns.find((x) => x.id === campaignId);
    const cfg = c?.actionConfigs?.find((a) => a.type === "task")?.data;
    const reward = Number(cfg?.price) || (cfg?.pricing === "Pro" ? 50 : cfg?.pricing === "Premium" ? 15 : cfg?.pricing === "Standard" ? 5 : 1);
    setState((s) => ({
      ...s,
      tasks: {
        ...s.tasks,
        [campaignId]: {
          campaignId,
          proof,
          submittedAt: Date.now(),
          status: "pending",
          reward,
          credited: false,
        },
      },
    }));
  },
  reviewTask(campaignId: string, decision: "approved" | "rejected", note?: string) {
    setState((s) => {
      const existing = s.tasks[campaignId];
      if (!existing) return s;
      return {
        ...s,
        tasks: {
          ...s.tasks,
          [campaignId]: {
            ...existing,
            status: decision,
            reviewedAt: Date.now(),
            reviewNote: note,
            credited: decision === "approved",
          },
        },
      };
    });
  },
};

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(state),
    () => selector(state),
  );
}
