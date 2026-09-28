import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHead } from "@/components/console/shell";
import { STAGES, money, useAgency, contactName } from "@/lib/agency/store";

export const Route = createFileRoute("/")({ component: Dashboard });

function Dashboard() {
  const s = useAgency();
  const openPipe = s.opportunities.filter((o) => o.stage !== "Won" && o.stage !== "Lost");
  const pipeline = openPipe.reduce((n, o) => n + o.value, 0);
  const unread = s.conversations.reduce((n, c) => n + c.unread, 0);
  const overdue = s.invoices.filter((i) => i.status === "overdue").length;
  const today = s.bookings.filter((b) => new Date(b.at).toDateString() === new Date().toDateString());

  return (
    <main>
      <PageHead kicker="Northline studio" title="Today" tool="Aperture">
        <LeadForm />
      </PageHead>
      <dl className="grid gap-3 sm:grid-cols-4">
        <Stat k="Open pipeline" v={money(pipeline)} />
        <Stat k="Unread threads" v={String(unread)} />
        <Stat k="Booked today" v={String(today.length)} />
        <Stat k="Overdue invoices" v={String(overdue)} />
      </dl>
      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="font-medium">Pipeline</h2>
          <ul className="mt-3 space-y-2">
            {STAGES.filter((st) => st !== "Lost").map((st) => {
              const rows = s.opportunities.filter((o) => o.stage === st);
              const sum = rows.reduce((n, o) => n + o.value, 0);
              return (
                <li key={st} className="flex items-center justify-between text-sm">
                  <span className="text-muted">{st}</span>
                  <span>
                    {rows.length} · {money(sum)}
                  </span>
                </li>
              );
            })}
          </ul>
          <Link to="/opportunities" className="mt-4 inline-block text-sm text-muted">
            Open opportunities
          </Link>
        </section>
        <section className="rounded-xl border border-border bg-surface p-5">
          <h2 className="font-medium">Needs a reply</h2>
          <ul className="mt-3 space-y-3">
            {s.conversations
              .filter((c) => c.unread > 0)
              .map((c) => (
                <li key={c.id} className="text-sm">
                  <p className="font-medium">{contactName(s.contacts, c.contactId)}</p>
                  <p className="text-muted">{c.messages.at(-1)?.body}</p>
                </li>
              ))}
            {unread === 0 && <li className="text-sm text-muted">Inbox is clear.</li>}
          </ul>
          <Link to="/conversations" className="mt-4 inline-block text-sm text-muted">
            Open conversations
          </Link>
        </section>
      </div>
      <section className="mt-3 rounded-xl border border-border p-5">
        <h2 className="font-medium">Latest wiring</h2>
        <ul className="mt-3 space-y-2">
          {s.runs.slice(0, 4).map((r) => (
            <li key={r.id} className="text-sm text-muted">
              <span className="text-fg">{s.workflows.find((w) => w.id === r.workflowId)?.name}</span>
              {" — "}
              {r.summary}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <dt className="text-xs uppercase tracking-[0.14em] text-subtle">{k}</dt>
      <dd className="mt-2 font-display text-3xl">{v}</dd>
    </div>
  );
}

function LeadForm() {
  const addLead = useAgency((s) => s.addLead);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [note, setNote] = useState("");

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="h-10 rounded-md bg-accent px-4 text-sm font-medium text-accent-fg">
        Capture lead
      </button>
    );
  }

  return (
    <form
      className="grid w-full gap-2 rounded-xl border border-border bg-surface p-4 sm:w-auto sm:min-w-80"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim() || !email.trim()) return;
        addLead({ name, email, phone, company, source: "Manual" });
        setNote(`${name} is in Twenty, Chatwoot, and the ads segment.`);
        setName("");
        setEmail("");
        setPhone("");
        setCompany("");
      }}
    >
      <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="h-10 rounded-md border border-border bg-bg px-3 text-sm" />
      <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="h-10 rounded-md border border-border bg-bg px-3 text-sm" />
      <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="h-10 rounded-md border border-border bg-bg px-3 text-sm" />
      <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" className="h-10 rounded-md border border-border bg-bg px-3 text-sm" />
      <div className="flex gap-2">
        <button type="submit" className="h-10 flex-1 rounded-md bg-accent text-sm font-medium text-accent-fg">Save across the stack</button>
        <button type="button" onClick={() => setOpen(false)} className="h-10 rounded-md border border-border-strong px-3 text-sm">Close</button>
      </div>
      {note && <p className="text-xs text-ok">{note}</p>}
    </form>
  );
}
