import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/console/shell";
import { money, useAgency } from "@/lib/agency/store";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/contacts")({ component: Contacts });

function Contacts() {
  const s = useAgency();
  const [q, setQ] = useState("");
  const [id, setId] = useState(s.contacts[0]?.id ?? "");
  const list = s.contacts.filter((c) =>
    `${c.name} ${c.company} ${c.email}`.toLowerCase().includes(q.toLowerCase()),
  );
  const c = s.contacts.find((x) => x.id === id) ?? list[0];

  return (
    <main>
      <PageHead kicker="CRM" title="Contacts" tool="Twenty" />
      <div className="grid gap-3 lg:grid-cols-[18rem_1fr]">
        <div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search people"
            className="mb-2 h-11 w-full rounded-md border border-border bg-surface px-3 text-sm"
          />
          <ul className="overflow-hidden rounded-xl border border-border">
            {list.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => setId(row.id)}
                  className={cn("w-full px-3 py-3 text-left", c?.id === row.id && "bg-raised")}
                >
                  <span className="block text-sm font-medium">{row.name}</span>
                  <span className="text-xs text-muted">{row.company}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        {c && (
          <article className="rounded-xl border border-border bg-surface p-5">
            <h2 className="font-display text-3xl">{c.name}</h2>
            <p className="text-muted">{c.company}</p>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-subtle">Email</dt><dd>{c.email}</dd></div>
              <div><dt className="text-subtle">Phone</dt><dd>{c.phone || "—"}</dd></div>
              <div><dt className="text-subtle">Source</dt><dd>{c.source}</dd></div>
              <div><dt className="text-subtle">Score</dt><dd>{c.score}</dd></div>
            </dl>
            <p className="mt-3 text-xs uppercase tracking-[0.14em] text-subtle">{c.tags.join(" · ")}</p>
            <h3 className="mt-6 font-medium">Opportunities</h3>
            <ul className="mt-2 space-y-1 text-sm text-muted">
              {s.opportunities.filter((o) => o.contactId === c.id).map((o) => (
                <li key={o.id}>{o.title} · {o.stage} · {money(o.value)}</li>
              ))}
            </ul>
            <h3 className="mt-4 font-medium">Invoices</h3>
            <ul className="mt-2 space-y-1 text-sm text-muted">
              {s.invoices.filter((i) => i.contactId === c.id).map((i) => (
                <li key={i.id}>{i.memo} · {money(i.amount)} · {i.status}</li>
              ))}
            </ul>
          </article>
        )}
      </div>
    </main>
  );
}
