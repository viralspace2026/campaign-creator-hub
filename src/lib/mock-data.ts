export type ActionType = "sales" | "promote" | "survey" | "task";

export interface Campaign {
  id: string;
  brand: string;
  brandLogo?: string;
  title: string;
  description: string;
  image: string;
  productType: "Physical Product" | "Digital Product" | "Service";
  price?: number;
  originalPrice?: number;
  discount?: string;
  commission?: string;
  epc?: string;
  actions: ActionType[];
  stats: {
    totalSales: number;
    conversionRate: string;
    affiliates: number;
    visitors: number;
  };
  status: "draft" | "pending" | "live";
  featured?: boolean;
}

export const mockCampaigns: Campaign[] = [
  {
    id: "soundwave-pro",
    brand: "Aurelia Audio",
    title: "SoundWave Pro Earbuds",
    description: "Premium noise-cancelling earbuds with high-fidelity sound and long battery life.",
    image:
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=80",
    productType: "Physical Product",
    price: 69.99,
    originalPrice: 99.99,
    discount: "30% OFF",
    commission: "25% per sale",
    epc: "$12.45",
    actions: ["sales", "promote", "survey", "task"],
    stats: { totalSales: 1248, conversionRate: "6.34%", affiliates: 356, visitors: 15892 },
    status: "live",
    featured: true,
  },
  {
    id: "lumen-journal",
    brand: "Lumen Studio",
    title: "Lumen Daily Journal App",
    description: "Mindful journaling that adapts to your routines with AI-powered prompts.",
    image:
      "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=900&q=80",
    productType: "Digital Product",
    price: 4.99,
    commission: "40% per sale",
    epc: "$2.10",
    actions: ["sales", "survey"],
    stats: { totalSales: 612, conversionRate: "4.10%", affiliates: 142, visitors: 7340 },
    status: "live",
  },
  {
    id: "northwind-coffee",
    brand: "Northwind Roasters",
    title: "Single-Origin Coffee Subscription",
    description: "Discover a new micro-lot every month, roasted within 48 hours of shipping.",
    image:
      "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=900&q=80",
    productType: "Physical Product",
    price: 24,
    commission: "$6 per signup",
    epc: "$3.80",
    actions: ["sales", "promote", "task"],
    stats: { totalSales: 489, conversionRate: "5.20%", affiliates: 88, visitors: 4920 },
    status: "live",
  },
  {
    id: "pulse-fitness",
    brand: "Pulse Fitness",
    title: "12-Week Strength Program",
    description: "A structured progressive overload plan with video coaching and weekly check-ins.",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=80",
    productType: "Service",
    price: 149,
    commission: "30% per sale",
    epc: "$18.20",
    actions: ["sales", "survey", "task"],
    stats: { totalSales: 230, conversionRate: "3.80%", affiliates: 64, visitors: 3120 },
    status: "live",
  },
  {
    id: "bloom-skincare",
    brand: "Bloom Skincare",
    title: "Bloom Glow Serum Launch",
    description: "Help us launch a clean, plant-based serum with feedback and visibility.",
    image:
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80",
    productType: "Physical Product",
    price: 38,
    commission: "20% per sale",
    epc: "$5.40",
    actions: ["promote", "survey"],
    stats: { totalSales: 0, conversionRate: "—", affiliates: 0, visitors: 0 },
    status: "pending",
  },
];

export const actionMeta: Record<
  ActionType,
  { label: string; description: string; bg: string; fg: string; icon: string }
> = {
  sales: {
    label: "Sales",
    description: "Earn commission promoting this product with your referral link.",
    bg: "bg-sales-bg",
    fg: "text-sales-foreground",
    icon: "BarChart3",
  },
  promote: {
    label: "Promote",
    description: "Drive visibility and traffic. Get paid based on performance.",
    bg: "bg-promote-bg",
    fg: "text-promote-foreground",
    icon: "Megaphone",
  },
  survey: {
    label: "Survey",
    description: "Answer curated questions and get paid on completion.",
    bg: "bg-survey-bg",
    fg: "text-survey-foreground",
    icon: "ClipboardList",
  },
  task: {
    label: "Task",
    description: "Complete a marketing task, submit proof, get paid.",
    bg: "bg-task-bg",
    fg: "text-task-foreground",
    icon: "ListChecks",
  },
};
