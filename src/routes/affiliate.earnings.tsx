import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Wallet, ArrowDownToLine, Clock, X } from "lucide-react";
import { affiliateBalance, payoutFor, store, useStore } from "@/lib/store";

export const Route = createFileRoute("/affiliate/earnings")({
  head: () => ({ meta: [{ title: "Earnings — ViralSpace" }] }),
  component: Earnings,
});

function Earnings() {
  const campaigns = useStore((s) => s.campaigns);
  const joined = useStore((s) => s.joined);
  const surveys = useStore((s) => s.surveys);
  const tasks = useStore((s) => s.tasks);
  const visits = useStore((s) => s.visits);
  const withdrawals = useStore((s) => s.withdrawals);

  const balance = useMemo(
    () => affiliateBalance({ campaigns, joined, surveys, tasks, visits, withdrawals } as never),
    [campaigns, joined, surveys, tasks, visits, withdrawals],
  );

  const [open, setOpen] = useState(false);

  // Build earnings rows from joined actions
  const rows: { campaign: string; action: string; amount: string; status: string }[] = [];
  Object.entries(joined).forEach(([cid, acts]) => {
    const c = campaigns.find((x) => x.id === cid);
    if (!c) return;
    acts.forEach((a) => {
      let amount = 0;
      let status = "—";
      if (a === "survey") {
        const sv = surveys[cid];
        if (sv) {
          amount = sv.reward;
          status = sv.credited ? "Paid" : "Pending";
        }
      } else if (a === "task") {
        const t = tasks[cid];
        if (t) {
          amount = t.reward;
          status = t.status === "approved" ? "Paid" : t.status === "pending" ? "Pending" : "Rejected";
        }
      } else if (a === "sales") {
        const list = visits[cid] ?? [];
        const conv = Math.round(list.length * 0.04);
        amount = conv * payoutFor(c, a);
        status = amount > 0 ? "Paid" : "—";
      } else if (a === "promote") {
        const list = visits[cid] ?? [];
        amount = (list.length / 1000) * payoutFor(c, a);
        status = amount > 0 ? "Paid" : "—";
      }
      rows.push({
        campaign: c.title,
        action: a,
        amount: `$${amount.toFixed(2)}`,
        status,
      });
    });
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Earnings</h1>
          <p className="mt-1 text-muted-foreground">Track your balance and request payouts.</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          disabled={balance.available <= 0}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50"
        >
          <ArrowDownToLine className="size-4" /> Request withdrawal
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <BalanceCard
          icon={Wallet}
          label="Available balance"
          value={`$${balance.available.toFixed(2)}`}
          accent="bg-success-bg text-promote-foreground"
          highlight
        />
        <BalanceCard
          icon={Clock}
          label="Pending review"
          value={`$${balance.pending.toFixed(2)}`}
          accent="bg-task-bg text-task-foreground"
        />
        <BalanceCard
          icon={Wallet}
          label="Lifetime earned"
          value={`$${balance.lifetime.toFixed(2)}`}
          accent="bg-sales-bg text-sales-foreground"
        />
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Earnings by action</h2>
        <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/60">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 sm:px-5">Campaign</th>
                  <th className="px-4 py-3 sm:px-5">Action</th>
                  <th className="px-4 py-3 sm:px-5">Status</th>
                  <th className="px-4 py-3 text-right sm:px-5">Amount</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-sm text-muted-foreground">
                      No earnings yet — join a campaign to start earning.
                    </td>
                  </tr>
                ) : (
                  rows.map((r, i) => (
                    <tr key={i} className="border-t border-border/60">
                      <td className="px-4 py-3 font-medium sm:px-5">{r.campaign}</td>
                      <td className="px-4 py-3 capitalize text-muted-foreground sm:px-5">{r.action}</td>
                      <td className="px-4 py-3 sm:px-5">{r.status}</td>
                      <td className="px-4 py-3 text-right font-semibold sm:px-5">{r.amount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Withdrawal history</h2>
        <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border/60">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 sm:px-5">Requested</th>
                  <th className="px-4 py-3 sm:px-5">Method</th>
                  <th className="px-4 py-3 sm:px-5">Destination</th>
                  <th className="px-4 py-3 sm:px-5">Status</th>
                  <th className="px-4 py-3 text-right sm:px-5">Amount</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">
                      No withdrawals yet.
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((w) => (
                    <tr key={w.id} className="border-t border-border/60">
                      <td className="px-4 py-3 text-xs text-muted-foreground sm:px-5">
                        {new Date(w.requestedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 sm:px-5">{w.method}</td>
                      <td className="px-4 py-3 text-muted-foreground sm:px-5">{w.destination}</td>
                      <td className="px-4 py-3 sm:px-5 capitalize">
                        <span
                          className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${
                            w.status === "paid"
                              ? "bg-success-bg text-promote-foreground"
                              : w.status === "rejected"
                                ? "bg-destructive/10 text-destructive"
                                : "bg-task-bg text-task-foreground"
                          }`}
                        >
                          {w.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold sm:px-5">${w.amount.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {open && (
        <WithdrawDialog
          maxAmount={balance.available}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function WithdrawDialog({ maxAmount, onClose }: { maxAmount: number; onClose: () => void }) {
  const [amount, setAmount] = useState(maxAmount.toFixed(2));
  const [method, setMethod] = useState("PayPal");
  const [destination, setDestination] = useState("");

  const submit = () => {
    const v = Number(amount);
    if (!Number.isFinite(v) || v <= 0 || v > maxAmount) return;
    if (!destination.trim()) return;
    store.requestWithdrawal(v, method, destination.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-3xl bg-card p-5 shadow-2xl ring-1 ring-border sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Request withdrawal</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Available: <strong>${maxAmount.toFixed(2)}</strong>
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Amount (USD)</span>
            <div className="flex gap-2">
              <span className="grid place-items-center rounded-lg bg-muted px-3 text-sm font-semibold">$</span>
              <input
                type="number"
                min="1"
                max={maxAmount}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
              />
              <button
                type="button"
                onClick={() => setAmount(maxAmount.toFixed(2))}
                className="rounded-lg bg-secondary px-3 text-xs font-semibold text-secondary-foreground hover:opacity-90"
              >
                Max
              </button>
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Payout method</span>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
            >
              <option>PayPal</option>
              <option>Bank transfer</option>
              <option>Stripe</option>
              <option>Wise</option>
              <option>Crypto (USDC)</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">
              {method === "Bank transfer" ? "Account / IBAN" : method.includes("Crypto") ? "Wallet address" : "Email or account ID"}
            </span>
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={method === "Bank transfer" ? "GB29 NWBK..." : method.includes("Crypto") ? "0x..." : "you@email.com"}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
            />
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg bg-muted px-4 py-2 text-sm font-semibold hover:bg-accent">Cancel</button>
          <button
            onClick={submit}
            disabled={!destination.trim() || Number(amount) <= 0 || Number(amount) > maxAmount}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            Submit request
          </button>
        </div>
      </div>
    </div>
  );
}

function BalanceCard({
  icon: Icon,
  label,
  value,
  accent,
  highlight,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  accent: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 ring-1 ring-border/60 ${
        highlight ? "bg-gradient-to-br from-primary/5 to-card" : "bg-card"
      }`}
    >
      <div className={`mb-3 grid size-10 place-items-center rounded-xl ${accent}`}>
        <Icon className="size-5" />
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold sm:text-3xl">{value}</div>
    </div>
  );
}
