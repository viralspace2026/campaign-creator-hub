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
  link: string;
  actions: ActionConfig[];
}

interface State {
  campaigns: StoredCampaign[];
  draft: CampaignDraft;
  joined: Record<string, ActionType[]>; // campaignId -> joined action types
}

const KEY = "viralspace-state-v1";
const emptyDraft: CampaignDraft = { title: "", description: "", link: "", actions: [] };

function load(): State {
  if (typeof window === "undefined") {
    return { campaigns: mockCampaigns as StoredCampaign[], draft: emptyDraft, joined: {} };
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { campaigns: mockCampaigns as StoredCampaign[], draft: emptyDraft, joined: {} };
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
};

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(state),
    () => selector(state),
  );
}
