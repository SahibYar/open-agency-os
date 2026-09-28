import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/console/shell";
import { contactName, useAgency } from "@/lib/agency/store";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/conversations")({ component: Conversations });

function Conversations() {
  const { conversations, contacts, reply } = useAgency();
  const [active, setActive] = useState(conversations[0]?.id ?? "");
  const [draft, setDraft] = useState("");
  const thread = conversations.find((c) => c.id === active) ?? conversations[0];

  return (
    <main>
      <PageHead kicker="Shared inbox" title="Conversations" tool="Chatwoot" />
      <div className="grid overflow-hidden rounded-xl border border-border md:grid-cols-[16rem_1fr]">
        <ul className="border-b border-border md:border-b-0 md:border-r">
          {conversations.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setActive(c.id)}
                className={cn(
                  "w-full px-4 py-3 text-left",
                  thread?.id === c.id && "bg-raised",
                )}
              >
                <span className="flex items-center justify-between text-sm">
                  <span className="font-medium">{contactName(contacts, c.contactId)}</span>
                  {c.unread > 0 && (
                    <span className="rounded-full bg-accent px-1.5 text-[11px] text-accent-fg">{c.unread}</span>
                  )}
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted">
                  {c.channel} · {c.messages.at(-1)?.body}
                </span>
              </button>
            </li>
          ))}
        </ul>
        {thread && (
          <div className="flex min-h-96 flex-col">
            <div className="border-b border-border px-4 py-3 text-sm">
              {contactName(contacts, thread.contactId)} · {thread.channel}
            </div>
            <ul className="flex-1 space-y-3 overflow-y-auto p-4">
              {thread.messages.map((m) => (
                <li
                  key={m.id}
                  className={cn(
                    "max-w-[36rem] rounded-xl px-3 py-2 text-sm leading-relaxed",
                    m.direction === "out" && "ml-auto bg-accent text-accent-fg",
                    m.direction === "in" && "bg-surface",
                    m.direction === "note" && "border border-border text-muted",
                  )}
                >
                  {m.direction === "note" && <span className="mb-1 block text-[10px] uppercase tracking-[0.14em]">Private note</span>}
                  {m.body}
                </li>
              ))}
            </ul>
            <form
              className="flex gap-2 border-t border-border p-3"
              onSubmit={(e) => {
                e.preventDefault();
                reply(thread.id, draft);
                setDraft("");
              }}
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Reply as the agency"
                className="h-11 flex-1 rounded-md border border-border bg-bg px-3 text-sm"
              />
              <button type="submit" className="h-11 rounded-md bg-accent px-4 text-sm font-medium text-accent-fg">
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
