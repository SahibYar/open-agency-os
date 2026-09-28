import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/console/shell";
import { contactName, money, useAgency } from "@/lib/agency/store";

export const Route = createFileRoute("/payments")({ component: Payments });

function Payments() {
  const { invoices, contacts, markPaid } = useAgency();
  const open = invoices.filter((i) => i.status !== "paid").reduce((n, i) => n + i.amount, 0);
  return (
    <main>
      <PageHead kicker="Money" title="Payments" tool="Stripe via n8n" />
      <p className="mb-4 text-sm text-muted">Collected outside the CRM. Open balance {money(open)}. Marking paid is the same event n8n would write back onto the contact.</p>
      <ul className="space-y-2">
        {invoices.map((i) => (
          <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border px-4 py-3">
            <div>
              <p className="font-medium">{i.memo}</p>
              <p className="text-sm text-muted">{contactName(contacts, i.contactId)} · {i.status}</p>
            </div>
            <div className="flex items-center gap-3">
              <span>{money(i.amount)}</span>
              {i.status !== "paid" && (
                <button type="button" onClick={() => markPaid(i.id)} className="h-10 rounded-md bg-accent px-3 text-sm font-medium text-accent-fg">
                  Mark paid
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
