import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/console/shell";
import { STAGES, contactName, money, useAgency, type Stage } from "@/lib/agency/store";

export const Route = createFileRoute("/opportunities")({ component: Opportunities });

function Opportunities() {
  const { opportunities, contacts, moveOpp } = useAgency();
  return (
    <main>
      <PageHead kicker="Pipeline" title="Opportunities" tool="Twenty" />
      <div className="flex gap-3 overflow-x-auto pb-2">
        {STAGES.map((stage) => (
          <section key={stage} className="w-64 shrink-0 rounded-xl border border-border bg-surface p-3">
            <h2 className="px-1 text-xs uppercase tracking-[0.14em] text-subtle">{stage}</h2>
            <ul className="mt-2 space-y-2">
              {opportunities
                .filter((o) => o.stage === stage)
                .map((o) => (
                  <li key={o.id} className="rounded-lg border border-border bg-bg p-3">
                    <p className="text-sm font-medium">{o.title}</p>
                    <p className="text-xs text-muted">{contactName(contacts, o.contactId)}</p>
                    <p className="mt-1 text-sm">{money(o.value)}</p>
                    <label className="mt-2 block text-[11px] text-subtle">
                      Move
                      <select
                        value={o.stage}
                        onChange={(e) => moveOpp(o.id, e.target.value as Stage)}
                        className="mt-1 h-9 w-full rounded-md border border-border bg-surface px-2 text-xs text-fg"
                      >
                        {STAGES.map((st) => (
                          <option key={st}>{st}</option>
                        ))}
                      </select>
                    </label>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
