import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/affiliate/earnings")({
  head: () => ({ meta: [{ title: "Earnings — ViralSpace" }] }),
  component: Earnings,
});

function Earnings() {
  const rows = [
    { campaign: "SoundWave Pro Earbuds", action: "sales", amount: "$248.50", status: "Paid" },
    { campaign: "Lumen Daily Journal App", action: "survey", amount: "$1.50", status: "Paid" },
    { campaign: "Northwind Coffee", action: "task", amount: "$5.00", status: "Pending" },
  ];
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Earnings</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Lifetime" value="$1,284.20" tint="bg-sales-bg text-sales-foreground" />
        <Stat label="This month" value="$255.00" tint="bg-promote-bg text-promote-foreground" />
        <Stat label="Pending" value="$5.00" tint="bg-task-bg text-task-foreground" />
      </div>
      <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/60">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Campaign</th>
              <th className="px-5 py-3">Action</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.campaign} className="border-t border-border/60">
                <td className="px-5 py-3 font-medium">{r.campaign}</td>
                <td className="px-5 py-3 capitalize text-muted-foreground">{r.action}</td>
                <td className="px-5 py-3">{r.status}</td>
                <td className="px-5 py-3 text-right font-semibold">{r.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value, tint }: { label: string; value: string; tint: string }) {
  return (
    <div className="rounded-2xl bg-card p-5 ring-1 ring-border/60">
      <div className={`mb-3 inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ${tint}`}>{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
