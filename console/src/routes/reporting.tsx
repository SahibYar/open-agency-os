import { createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHead } from "@/components/console/shell";
import { STAGES, useAgency } from "@/lib/agency/store";

export const Route = createFileRoute("/reporting")({ component: Reporting });

function Reporting() {
  const { opportunities, conversations, campaigns } = useAgency();
  const pipe = STAGES.filter((s) => s !== "Lost").map((stage) => ({
    stage,
    value: opportunities.filter((o) => o.stage === stage).reduce((n, o) => n + o.value, 0),
  }));
  const channels = ["SMS", "Email", "WhatsApp", "Chat"].map((channel) => ({
    channel,
    threads: conversations.filter((c) => c.channel === channel).length,
  }));
  return (
    <main>
      <PageHead kicker="Numbers" title="Reporting" tool="Aperture" />
      <div className="grid gap-3 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-surface p-4">
          <h2 className="mb-3 text-sm font-medium">Pipeline value</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipe}>
                <XAxis dataKey="stage" tick={{ fill: "#9a9890", fontSize: 11 }} />
                <YAxis tick={{ fill: "#9a9890", fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#d8d4cc" radius={6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="rounded-xl border border-border bg-surface p-4">
          <h2 className="mb-3 text-sm font-medium">Inbox by channel</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channels}>
                <XAxis dataKey="channel" tick={{ fill: "#9a9890", fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fill: "#9a9890", fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="threads" fill="#8faa94" radius={6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
      <ul className="mt-3 grid gap-3 sm:grid-cols-3">
        {campaigns.map((c) => (
          <li key={c.id} className="rounded-xl border border-border p-4 text-sm">
            <p className="font-medium">{c.name}</p>
            <p className="text-muted">{c.sent.toLocaleString()} sent · {c.enrolled.length} enrolled</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
