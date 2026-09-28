import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/console/shell";
import { contactName, useAgency } from "@/lib/agency/store";

export const Route = createFileRoute("/calendars")({ component: Calendars });

function Calendars() {
  const { bookings, contacts, book } = useAgency();
  const [contactId, setContactId] = useState(contacts[0]?.id ?? "");
  const [title, setTitle] = useState("Strategy call");
  const [when, setWhen] = useState("");

  const sorted = [...bookings].sort((a, b) => +new Date(a.at) - +new Date(b.at));

  return (
    <main>
      <PageHead kicker="Scheduling" title="Calendars" tool="Cal.com" />
      <form
        className="mb-4 grid gap-2 rounded-xl border border-border bg-surface p-4 sm:grid-cols-[1fr_1fr_1fr_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          if (!when) return;
          book({ contactId, title, at: new Date(when).toISOString() });
          setWhen("");
        }}
      >
        <select value={contactId} onChange={(e) => setContactId(e.target.value)} className="h-11 rounded-md border border-border bg-bg px-3 text-sm">
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="h-11 rounded-md border border-border bg-bg px-3 text-sm" />
        <input required type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="h-11 rounded-md border border-border bg-bg px-3 text-sm" />
        <button type="submit" className="h-11 rounded-md bg-accent px-4 text-sm font-medium text-accent-fg">Book</button>
      </form>
      <ul className="space-y-2">
        {sorted.map((b) => {
          const d = new Date(b.at);
          return (
            <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-4 py-3">
              <div>
                <p className="font-medium">{b.title}</p>
                <p className="text-sm text-muted">{contactName(contacts, b.contactId)}</p>
              </div>
              <p className="text-sm">
                {d.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                <span className="ml-2 text-subtle">{b.status}</span>
              </p>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-sm text-muted">Booking moves the open deal to Appointment and logs an n8n run.</p>
    </main>
  );
}
