import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/console/shell";
import { contactName, useAgency } from "@/lib/agency/store";

export const Route = createFileRoute("/marketing")({ component: Marketing });

function Marketing() {
  const { campaigns, contacts, enroll } = useAgency();
  const [pick, setPick] = useState<Record<string, string>>({});
  return (
    <main>
      <PageHead kicker="Campaigns" title="Marketing" tool="Mautic" />
      <ul className="grid gap-3 lg:grid-cols-3">
        {campaigns.map((c) => {
          const openRate = c.sent ? Math.round((c.opens / c.sent) * 100) : 0;
          return (
            <li key={c.id} className="rounded-xl border border-border bg-surface p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-subtle">{c.status}</p>
              <h2 className="mt-1 font-medium">{c.name}</h2>
              <p className="text-sm text-muted">{c.segment}</p>
              <p className="mt-3 text-sm">{c.sent.toLocaleString()} sent · {openRate}% opens · {c.clicks} clicks</p>
              <p className="mt-2 text-xs text-subtle">
                {c.enrolled.map((id) => contactName(contacts, id)).join(", ") || "No one enrolled"}
              </p>
              <div className="mt-3 flex gap-2">
                <select
                  value={pick[c.id] ?? ""}
                  onChange={(e) => setPick({ ...pick, [c.id]: e.target.value })}
                  className="h-10 flex-1 rounded-md border border-border bg-bg px-2 text-sm"
                >
                  <option value="">Enroll…</option>
                  {contacts.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => pick[c.id] && enroll(c.id, pick[c.id])}
                  className="h-10 rounded-md border border-border-strong px-3 text-sm"
                >
                  Add
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
