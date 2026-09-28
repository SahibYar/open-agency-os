import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/console/shell";
import { contactName, money, useAgency } from "@/lib/agency/store";

export const Route = createFileRoute("/memberships")({ component: Memberships });

function Memberships() {
  const { programs, contacts, addMember } = useAgency();
  const [who, setWho] = useState<Record<string, string>>({});
  return (
    <main>
      <PageHead kicker="Access" title="Memberships" tool="WordPress" />
      <ul className="grid gap-3 md:grid-cols-2">
        {programs.map((p) => (
          <li key={p.id} className="rounded-xl border border-border bg-surface p-4">
            <h2 className="font-medium">{p.name}</h2>
            <p className="text-sm text-muted">{p.price ? money(p.price) : "Included"} · {p.members.length} members</p>
            <ul className="mt-3 space-y-1 text-sm">
              {p.members.map((id) => (
                <li key={id}>{contactName(contacts, id)}</li>
              ))}
            </ul>
            <div className="mt-3 flex gap-2">
              <select
                value={who[p.id] ?? ""}
                onChange={(e) => setWho({ ...who, [p.id]: e.target.value })}
                className="h-10 flex-1 rounded-md border border-border bg-bg px-2 text-sm"
              >
                <option value="">Add member…</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button type="button" onClick={() => who[p.id] && addMember(p.id, who[p.id])} className="h-10 rounded-md bg-accent px-3 text-sm font-medium text-accent-fg">
                Grant
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
