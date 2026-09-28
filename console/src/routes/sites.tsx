import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/components/console/shell";
import { useAgency } from "@/lib/agency/store";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/sites")({ component: Sites });

function Sites() {
  const { pages, togglePage } = useAgency();
  const [id, setId] = useState(pages[0]?.id ?? "");
  const page = pages.find((p) => p.id === id) ?? pages[0];
  return (
    <main>
      <PageHead kicker="Funnels" title="Sites" tool="WordPress" />
      <div className="grid gap-3 lg:grid-cols-[16rem_1fr]">
        <ul className="space-y-2">
          {pages.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setId(p.id)}
                className={cn("w-full rounded-xl border border-border px-3 py-3 text-left", page?.id === p.id && "bg-surface")}
              >
                <span className="block text-sm font-medium">{p.name}</span>
                <span className="text-xs text-muted">{p.path} · {p.status} · {p.visits.toLocaleString()} visits</span>
              </button>
            </li>
          ))}
        </ul>
        {page && (
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-muted">{page.status === "published" ? "Live" : "Draft"}</p>
              <button type="button" onClick={() => togglePage(page.id)} className="h-10 rounded-md border border-border-strong px-3 text-sm">
                {page.status === "published" ? "Unpublish" : "Publish"}
              </button>
            </div>
            <article className="overflow-hidden rounded-xl border border-border bg-surface">
              <div className="border-b border-border px-4 py-2 font-mono text-xs text-subtle">northline.studio{page.path}</div>
              <div className="px-6 py-10">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Northline</p>
                <h2 className="mt-3 max-w-md font-display text-4xl leading-tight">{page.name}</h2>
                <p className="mt-3 max-w-md text-sm text-muted">
                  Forms on this page post into n8n, which writes the person to Twenty and the thread to Chatwoot.
                </p>
                <div className="mt-6 inline-flex h-11 items-center rounded-md bg-accent px-4 text-sm font-medium text-accent-fg">
                  Book a time
                </div>
              </div>
            </article>
          </div>
        )}
      </div>
    </main>
  );
}
