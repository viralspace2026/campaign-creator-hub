import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/affiliate")({
  component: () => (
    <AppShell
      role="Affiliate"
      userName="alex.creates"
      nav={[
        { to: "/affiliate", label: "Browse" },
        { to: "/affiliate/performance", label: "Performance" },
        { to: "/affiliate/earnings", label: "Earnings" },
        { to: "/profile", label: "Profile" },
      ]}
    />
  ),
});
