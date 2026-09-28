import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/console/shell";
import { contactName, useAgency } from "@/lib/agency/store";

export const Route = createFileRoute("/automations")({ component: Automations });

function Automations() {
  const { workflows, runs, contacts, runWorkflow } = useAgency();
  const [who, setWho] = useState(contacts[0]?.id ?? "");
  return (
    <main>
      <PageHead kicker="The bus" title="Automations" tool="n8n" />
      <label className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        Run against
        <select value={who} onChange={(e) => setWho(e.target.value)} className="h-10 rounded-md border border-border bg-surface px-3">
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>
      <ul className="grid gap-3 md:grid-cols-2">
        {workflows.map((w) => (
          <li key={w.id} className="rounded-xl border border-border p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-subtle">{w.tool} · {w.minutes}</p>
            <h2 className="mt-1 font-medium">{w.name}</h2>
            <p className="mt-1 text-sm text-muted">{w.description}</p>
            <button
              type="button"
              onClick={() => runWorkflow(w.id, who)}
              className="mt-3 h-10 rounded-md bg-accent px-3 text-sm font-medium text-accent-fg"
            >
              Run
            </button>
          </li>
        ))}
      </ul>
      <h2 className="mt-8 font-display text-2xl">Executions</h2>
      <ul className="mt-3 space-y-2">
        {runs.map((r) => (
          <li key={r.id} className="rounded-xl border border-border px-4 py-3 text-sm">
            <span className="text-fg">{workflows.find((w) => w.id === r.workflowId)?.name}</span>
            <span className="text-muted"> · {contactName(contacts, r.contactId)} · {r.summary}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
