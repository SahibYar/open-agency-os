import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/console/shell";
import { contactName, useAgency } from "@/lib/agency/store";

export const Route = createFileRoute("/reputation")({ component: Reputation });

function Reputation() {
  const { reviews, contacts, requestReview } = useAgency();
  const won = contacts.filter((c) => c.tags.includes("member") || c.id === "c5" || c.id === "c2");
  return (
    <main>
      <PageHead kicker="Honest gap" title="Reputation" tool="n8n playbook" />
      <p className="mb-4 max-w-2xl text-sm text-muted">
        There is no open Birdeye. This screen sends a review request through the same SMS path as speed-to-lead and keeps the replies you already have.
      </p>
      <ul className="mb-6 flex flex-wrap gap-2">
        {won.map((c) => (
          <li key={c.id}>
            <button type="button" onClick={() => requestReview(c.id)} className="h-10 rounded-md border border-border-strong px-3 text-sm">
              Ask {c.name.split(" ")[0]}
            </button>
          </li>
        ))}
      </ul>
      <ul className="space-y-2">
        {reviews.map((r) => (
          <li key={r.id} className="rounded-xl border border-border p-4">
            <p className="text-sm">{ "★".repeat(r.stars) }{"☆".repeat(5 - r.stars)}</p>
            <p className="mt-2 text-sm leading-relaxed">{r.body}</p>
            <p className="mt-2 text-xs text-subtle">{contactName(contacts, r.contactId)} · {r.source}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
