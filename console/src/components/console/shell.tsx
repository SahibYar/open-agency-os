import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Aperture,
  BarChart3,
  Calendar,
  CreditCard,
  GitBranch,
  Globe,
  Inbox,
  LayoutDashboard,
  Megaphone,
  Menu,
  RotateCcw,
  Star,
  Target,
  Users,
  Workflow,
  X,
} from "lucide-react";
import { useAgency } from "@/lib/agency/store";
import { cn } from "@/lib/cn";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/conversations", label: "Conversations", icon: Inbox },
  { to: "/calendars", label: "Calendars", icon: Calendar },
  { to: "/contacts", label: "Contacts", icon: Users },
  { to: "/opportunities", label: "Opportunities", icon: Target },
  { to: "/payments", label: "Payments", icon: CreditCard },
  { to: "/marketing", label: "Marketing", icon: Megaphone },
  { to: "/automations", label: "Automations", icon: Workflow },
  { to: "/sites", label: "Sites", icon: Globe },
  { to: "/memberships", label: "Memberships", icon: GitBranch },
  { to: "/reputation", label: "Reputation", icon: Star },
  { to: "/reporting", label: "Reporting", icon: BarChart3 },
] as const;

export function useHydratedAgency() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    void useAgency.persist.rehydrate();
    setReady(true);
  }, []);
  return ready;
}

export function ConsoleShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const reset = useAgency((s) => s.reset);
  const [open, setOpen] = useState(false);
  useHydratedAgency();

  const nav = (
    <nav className="flex flex-col gap-0.5">
      {NAV.map((item) => {
        const active = path === item.to;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted",
              active && "bg-raised text-fg",
            )}
          >
            <item.icon className="size-4 shrink-0" strokeWidth={1.6} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-dvh bg-bg text-fg md:grid md:grid-cols-[15.5rem_1fr]">
      <aside className="hidden border-r border-border md:flex md:flex-col md:px-3 md:py-4">
        <Brand />
        <div className="mt-5 flex-1">{nav}</div>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-3 inline-flex items-center gap-2 px-3 py-2 text-xs text-subtle"
        >
          <RotateCcw className="size-3.5" />
          Reset demo data
        </button>
      </aside>
      {open && (
        <div className="fixed inset-0 z-50 bg-bg md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Brand />
            <button type="button" onClick={() => setOpen(false)} className="grid size-11 place-items-center" aria-label="Close menu">
              <X className="size-5" />
            </button>
          </div>
          <div className="overflow-y-auto px-3 pb-8">{nav}</div>
        </div>
      )}
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-bg/90 px-3 py-2 backdrop-blur md:hidden">
          <button type="button" onClick={() => setOpen(true)} className="grid size-11 place-items-center" aria-label="Open menu">
            <Menu className="size-5" />
          </button>
          <span className="font-display text-lg">Northline</span>
          <span className="w-11" />
        </header>
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</div>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-2">
      <span className="grid size-8 place-items-center rounded-[10px] border border-border-strong">
        <Aperture className="size-4" strokeWidth={1.6} />
      </span>
      <span className="leading-none">
        <span className="block font-display text-lg">Northline</span>
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted">Aperture demo</span>
      </span>
    </div>
  );
}

export function PageHead({
  kicker,
  title,
  tool,
  children,
}: {
  kicker: string;
  title: string;
  tool: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-subtle">{kicker}</p>
        <h1 className="mt-1 font-display text-3xl tracking-tight sm:text-4xl">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-full border border-border px-2.5 py-1 font-mono text-[11px] text-muted">
          {tool}
        </span>
        {children}
      </div>
    </div>
  );
}
