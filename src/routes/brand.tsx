import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/brand")({
  component: () => (
    <AppShell
      role="Brand"
      userName="Aurelia Audio"
      nav={[
        { to: "/brand", label: "Campaigns" },
        { to: "/brand/campaigns/new", label: "Create campaign" },
      ]}
    />
  ),
});
