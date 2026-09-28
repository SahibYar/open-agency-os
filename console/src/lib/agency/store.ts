import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Stage =
  | "New"
  | "Contacted"
  | "Qualified"
  | "Appointment"
  | "Proposal"
  | "Won"
  | "Lost";

export const STAGES: Stage[] = [
  "New",
  "Contacted",
  "Qualified",
  "Appointment",
  "Proposal",
  "Won",
  "Lost",
];

export type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  tags: string[];
  score: number;
};

export type Opportunity = {
  id: string;
  contactId: string;
  title: string;
  value: number;
  stage: Stage;
};

export type Message = {
  id: string;
  direction: "in" | "out" | "note";
  body: string;
  at: string;
};

export type Conversation = {
  id: string;
  contactId: string;
  channel: "SMS" | "Email" | "WhatsApp" | "Chat";
  unread: number;
  messages: Message[];
};

export type Booking = {
  id: string;
  contactId: string;
  title: string;
  at: string;
  status: "confirmed" | "pending";
};

export type Invoice = {
  id: string;
  contactId: string;
  memo: string;
  amount: number;
  status: "open" | "paid" | "overdue";
};

export type Campaign = {
  id: string;
  name: string;
  segment: string;
  status: "live" | "draft" | "paused";
  sent: number;
  opens: number;
  clicks: number;
  enrolled: string[];
};

export type Workflow = {
  id: string;
  name: string;
  tool: string;
  minutes: string;
  description: string;
};

export type Run = {
  id: string;
  workflowId: string;
  contactId: string;
  at: string;
  summary: string;
};

export type SitePage = {
  id: string;
  name: string;
  path: string;
  status: "published" | "draft";
  visits: number;
};

export type Program = {
  id: string;
  name: string;
  price: number;
  members: string[];
};

export type Review = {
  id: string;
  contactId: string;
  stars: number;
  body: string;
  source: string;
};

export type AgencyState = {
  contacts: Contact[];
  opportunities: Opportunity[];
  conversations: Conversation[];
  bookings: Booking[];
  invoices: Invoice[];
  campaigns: Campaign[];
  workflows: Workflow[];
  runs: Run[];
  pages: SitePage[];
  programs: Program[];
  reviews: Review[];
  addLead: (input: {
    name: string;
    email: string;
    phone: string;
    company: string;
    source: string;
  }) => void;
  reply: (conversationId: string, body: string) => void;
  moveOpp: (id: string, stage: Stage) => void;
  book: (input: { contactId: string; title: string; at: string }) => void;
  markPaid: (id: string) => void;
  enroll: (campaignId: string, contactId: string) => void;
  runWorkflow: (workflowId: string, contactId: string) => void;
  requestReview: (contactId: string) => void;
  togglePage: (id: string) => void;
  addMember: (programId: string, contactId: string) => void;
  reset: () => void;
};

function atOffset(days: number, hour: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}`;
}

const WORKFLOWS: Workflow[] = [
  {
    id: "form-to-crm",
    name: "Form → Twenty → Mautic",
    tool: "n8n",
    minutes: "25 min",
    description: "Normalize a lead, upsert the person, enroll the segment.",
  },
  {
    id: "speed-to-lead",
    name: "Speed-to-lead SMS",
    tool: "n8n + Twilio",
    minutes: "20 min",
    description: "Text a new lead within a minute and log it on the thread.",
  },
  {
    id: "booking-reminder",
    name: "Booking → pipeline + reminder",
    tool: "Cal.com",
    minutes: "15 min",
    description: "Move the deal to Appointment and queue a T-24h SMS.",
  },
  {
    id: "inbox-context",
    name: "Inbox shows the CRM",
    tool: "Chatwoot",
    minutes: "40 min",
    description: "Drop deal value, stage, and last campaign onto the thread.",
  },
];

function seed(): Omit<
  AgencyState,
  | "addLead"
  | "reply"
  | "moveOpp"
  | "book"
  | "markPaid"
  | "enroll"
  | "runWorkflow"
  | "requestReview"
  | "togglePage"
  | "addMember"
  | "reset"
> {
  const contacts: Contact[] = [
    { id: "c1", name: "Amina Shah", email: "amina@bloomdental.co", phone: "+1 415 555 0142", company: "Bloom Dental", source: "Facebook ad", tags: ["dental", "hot"], score: 86 },
    { id: "c2", name: "James Okonkwo", email: "james@oklogistics.com", phone: "+1 312 555 0190", company: "Okonkwo Logistics", source: "Referral", tags: ["b2b"], score: 71 },
    { id: "c3", name: "Priya Raman", email: "priya@saffron.catering", phone: "+1 737 555 0118", company: "Saffron Catering", source: "Instagram", tags: ["events"], score: 64 },
    { id: "c4", name: "Luis Ortega", email: "luis@ortegalaw.com", phone: "+1 305 555 0177", company: "Ortega Law", source: "Google", tags: ["legal"], score: 58 },
    { id: "c5", name: "Hannah Cole", email: "hannah@colefitness.com", phone: "+1 720 555 0133", company: "Cole Fitness", source: "Website", tags: ["fitness", "member"], score: 80 },
    { id: "c6", name: "Wei Chen", email: "wei@harboracct.com", phone: "+1 206 555 0164", company: "Harbor Accounting", source: "Webinar", tags: ["finance"], score: 49 },
    { id: "c7", name: "Fatima Noor", email: "fatima@noorinteriors.com", phone: "+1 646 555 0188", company: "Noor Interiors", source: "WhatsApp", tags: ["home"], score: 77 },
    { id: "c8", name: "Owen Blake", email: "owen@blakeroofing.com", phone: "+1 214 555 0120", company: "Blake Roofing", source: "Google", tags: ["home"], score: 44 },
  ];
  return {
    contacts,
    opportunities: [
      { id: "o1", contactId: "c1", title: "New patient funnel", value: 4800, stage: "Proposal" },
      { id: "o2", contactId: "c2", title: "Fleet landing + SMS", value: 7200, stage: "Qualified" },
      { id: "o3", contactId: "c3", title: "Wedding season ads", value: 3100, stage: "Appointment" },
      { id: "o4", contactId: "c4", title: "Intake chatbot", value: 2600, stage: "Contacted" },
      { id: "o5", contactId: "c7", title: "Showroom consults", value: 5400, stage: "New" },
      { id: "o6", contactId: "c5", title: "Membership relaunch", value: 1900, stage: "Won" },
    ],
    conversations: [
      {
        id: "t1",
        contactId: "c1",
        channel: "WhatsApp",
        unread: 1,
        messages: [
          { id: "m1", direction: "out", body: "Amina — we held Friday 10:00 for the implant consult page review.", at: atOffset(-1, 9) },
          { id: "m2", direction: "in", body: "Can we move it to 11? The hygienist block runs long.", at: atOffset(0, 8) },
        ],
      },
      {
        id: "t2",
        contactId: "c7",
        channel: "SMS",
        unread: 2,
        messages: [
          { id: "m3", direction: "in", body: "Saw the ad. Do you book design consults this week?", at: atOffset(0, 7) },
          { id: "m4", direction: "in", body: "Budget is around 5k if the calendar fills.", at: atOffset(0, 7) },
        ],
      },
      {
        id: "t3",
        contactId: "c2",
        channel: "Email",
        unread: 0,
        messages: [
          { id: "m5", direction: "out", body: "James, the fleet page draft is in WordPress. Reply if the quote form fields look right.", at: atOffset(-2, 15) },
          { id: "m6", direction: "in", body: "Add trailer type. Then send the proposal.", at: atOffset(-1, 11) },
        ],
      },
      {
        id: "t4",
        contactId: "c3",
        channel: "Chat",
        unread: 0,
        messages: [
          { id: "m7", direction: "in", body: "Website chat: looking for tasting-event ads before November.", at: atOffset(-3, 16) },
        ],
      },
    ],
    bookings: [
      { id: "b1", contactId: "c1", title: "Funnel review", at: atOffset(1, 10), status: "confirmed" },
      { id: "b2", contactId: "c3", title: "Campaign kickoff", at: atOffset(2, 14), status: "confirmed" },
      { id: "b3", contactId: "c4", title: "Discovery call", at: atOffset(0, 16), status: "pending" },
    ],
    invoices: [
      { id: "i1", contactId: "c5", memo: "Membership relaunch — setup", amount: 1900, status: "paid" },
      { id: "i2", contactId: "c1", memo: "Funnel build, 50%", amount: 2400, status: "open" },
      { id: "i3", contactId: "c2", memo: "Landing page deposit", amount: 1800, status: "overdue" },
      { id: "i4", contactId: "c6", memo: "Webinar follow-up audit", amount: 650, status: "open" },
    ],
    campaigns: [
      { id: "k1", name: "New patient — 5 emails", segment: "Dental leads", status: "live", sent: 1280, opens: 486, clicks: 92, enrolled: ["c1"] },
      { id: "k2", name: "Speed-to-lead, no reply", segment: "Ads, last 7 days", status: "live", sent: 640, opens: 210, clicks: 44, enrolled: ["c7", "c8"] },
      { id: "k3", name: "Review ask after job", segment: "Won, 3 days", status: "paused", sent: 88, opens: 41, clicks: 19, enrolled: ["c5"] },
    ],
    workflows: WORKFLOWS,
    runs: [
      { id: "r1", workflowId: "speed-to-lead", contactId: "c7", at: atOffset(0, 7), summary: "SMS sent 42s after the WhatsApp lead." },
      { id: "r2", workflowId: "form-to-crm", contactId: "c8", at: atOffset(-1, 13), summary: "Blake Roofing upserted and tagged source=Google." },
    ],
    pages: [
      { id: "p1", name: "New patient offer", path: "/new-patients", status: "published", visits: 2404 },
      { id: "p2", name: "Fleet quote", path: "/fleet-quote", status: "draft", visits: 118 },
      { id: "p3", name: "Book a consult", path: "/consult", status: "published", visits: 860 },
    ],
    programs: [
      { id: "g1", name: "Agency operator course", price: 499, members: ["c5", "c2"] },
      { id: "g2", name: "Client portal — Bloom", price: 0, members: ["c1"] },
    ],
    reviews: [
      { id: "v1", contactId: "c5", stars: 5, body: "They replaced our HighLevel workflows in a week and we still own the list.", source: "Google" },
      { id: "v2", contactId: "c2", stars: 4, body: "Quote form is faster. Waiting on the trailer field.", source: "Google" },
    ],
  };
}

export const useAgency = create<AgencyState>()(
  persist(
    (set, get) => ({
      ...seed(),
      addLead: (input) => {
        const id = uid("c");
        const contact: Contact = {
          id,
          name: input.name.trim(),
          email: input.email.trim(),
          phone: input.phone.trim(),
          company: input.company.trim() || "Independent",
          source: input.source,
          tags: ["new"],
          score: 50,
        };
        const opp: Opportunity = {
          id: uid("o"),
          contactId: id,
          title: `${contact.company} — inbound`,
          value: 1500,
          stage: "New",
        };
        const convo: Conversation = {
          id: uid("t"),
          contactId: id,
          channel: "Chat",
          unread: 1,
          messages: [
            {
              id: uid("m"),
              direction: "in",
              body: `New lead from ${input.source}. ${contact.company} asked to be contacted.`,
              at: new Date().toISOString(),
            },
          ],
        };
        set((s) => ({
          contacts: [contact, ...s.contacts],
          opportunities: [opp, ...s.opportunities],
          conversations: [convo, ...s.conversations],
          campaigns: s.campaigns.map((c) =>
            c.id === "k2" ? { ...c, enrolled: [...c.enrolled, id], sent: c.sent + 1 } : c,
          ),
          runs: [
            {
              id: uid("r"),
              workflowId: "form-to-crm",
              contactId: id,
              at: new Date().toISOString(),
              summary: `Upserted ${contact.name} in Twenty, opened a Chatwoot thread, enrolled Mautic segment.`,
            },
            ...s.runs,
          ],
        }));
      },
      reply: (conversationId, body) => {
        const text = body.trim();
        if (!text) return;
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  unread: 0,
                  messages: [
                    ...c.messages,
                    { id: uid("m"), direction: "out", body: text, at: new Date().toISOString() },
                  ],
                }
              : c,
          ),
        }));
      },
      moveOpp: (id, stage) =>
        set((s) => ({
          opportunities: s.opportunities.map((o) => (o.id === id ? { ...o, stage } : o)),
        })),
      book: ({ contactId, title, at }) => {
        set((s) => ({
          bookings: [
            { id: uid("b"), contactId, title, at, status: "confirmed" },
            ...s.bookings,
          ],
          opportunities: s.opportunities.map((o) =>
            o.contactId === contactId && o.stage !== "Won" && o.stage !== "Lost"
              ? { ...o, stage: "Appointment" }
              : o,
          ),
          runs: [
            {
              id: uid("r"),
              workflowId: "booking-reminder",
              contactId,
              at: new Date().toISOString(),
              summary: `Cal.com booking created. Deal moved to Appointment. Reminder queued.`,
            },
            ...s.runs,
          ],
        }));
      },
      markPaid: (id) =>
        set((s) => ({
          invoices: s.invoices.map((i) => (i.id === id ? { ...i, status: "paid" } : i)),
        })),
      enroll: (campaignId, contactId) =>
        set((s) => ({
          campaigns: s.campaigns.map((c) =>
            c.id === campaignId && !c.enrolled.includes(contactId)
              ? { ...c, enrolled: [...c.enrolled, contactId] }
              : c,
          ),
        })),
      runWorkflow: (workflowId, contactId) => {
        const contact = get().contacts.find((c) => c.id === contactId);
        if (!contact) return;
        const name = contact.name.split(" ")[0];
        set((s) => {
          let conversations = s.conversations;
          let summary = "Workflow ran.";
          if (workflowId === "speed-to-lead") {
            summary = `Twilio SMS to ${name}: we can talk today. Logged on the thread.`;
            const msg: Message = {
              id: uid("m"),
              direction: "out",
              body: `${name}, this is Northline — saw your enquiry. Want a 15-min look at the offer today?`,
              at: new Date().toISOString(),
            };
            const existing = conversations.find((c) => c.contactId === contactId);
            conversations = existing
              ? conversations.map((c) =>
                  c.contactId === contactId ? { ...c, messages: [...c.messages, msg] } : c,
                )
              : [
                  {
                    id: uid("t"),
                    contactId,
                    channel: "SMS",
                    unread: 0,
                    messages: [msg],
                  },
                  ...conversations,
                ];
          } else if (workflowId === "inbox-context") {
            const opp = s.opportunities.find((o) => o.contactId === contactId);
            summary = "Private note posted in Chatwoot with deal and campaign context.";
            const msg: Message = {
              id: uid("m"),
              direction: "note",
              body: opp
                ? `CRM: ${opp.title} · ${opp.stage} · $${opp.value.toLocaleString()}. Source ${contact.source}.`
                : `CRM: no open deal. Source ${contact.source}. Score ${contact.score}.`,
              at: new Date().toISOString(),
            };
            const existing = conversations.find((c) => c.contactId === contactId);
            conversations = existing
              ? conversations.map((c) =>
                  c.contactId === contactId ? { ...c, messages: [...c.messages, msg] } : c,
                )
              : [
                  { id: uid("t"), contactId, channel: "Chat", unread: 0, messages: [msg] },
                  ...conversations,
                ];
          } else if (workflowId === "booking-reminder") {
            summary = `Reminder SMS queued for ${name}'s next booking.`;
          } else {
            summary = `${contact.name} upserted in Twenty and enrolled in the ads segment.`;
          }
          return {
            conversations,
            campaigns:
              workflowId === "form-to-crm"
                ? s.campaigns.map((c) =>
                    c.id === "k2" && !c.enrolled.includes(contactId)
                      ? { ...c, enrolled: [...c.enrolled, contactId] }
                      : c,
                  )
                : s.campaigns,
            runs: [
              { id: uid("r"), workflowId, contactId, at: new Date().toISOString(), summary },
              ...s.runs,
            ],
          };
        });
      },
      requestReview: (contactId) => {
        const contact = get().contacts.find((c) => c.id === contactId);
        if (!contact) return;
        const msg: Message = {
          id: uid("m"),
          direction: "out",
          body: `${contact.name.split(" ")[0]}, if the work landed well, a Google review helps the next client find us: https://g.page/northline/review`,
          at: new Date().toISOString(),
        };
        set((s) => {
          const existing = s.conversations.find((c) => c.contactId === contactId);
          return {
            conversations: existing
              ? s.conversations.map((c) =>
                  c.contactId === contactId ? { ...c, messages: [...c.messages, msg] } : c,
                )
              : [
                  { id: uid("t"), contactId, channel: "SMS", unread: 0, messages: [msg] },
                  ...s.conversations,
                ],
            runs: [
              {
                id: uid("r"),
                workflowId: "speed-to-lead",
                contactId,
                at: new Date().toISOString(),
                summary: `Review request SMS sent to ${contact.name}. Reputation stays a playbook until a module exists.`,
              },
              ...s.runs,
            ],
          };
        });
      },
      togglePage: (id) =>
        set((s) => ({
          pages: s.pages.map((p) =>
            p.id === id
              ? { ...p, status: p.status === "published" ? "draft" : "published" }
              : p,
          ),
        })),
      addMember: (programId, contactId) =>
        set((s) => ({
          programs: s.programs.map((p) =>
            p.id === programId && !p.members.includes(contactId)
              ? { ...p, members: [...p.members, contactId] }
              : p,
          ),
        })),
      reset: () => set(seed()),
    }),
    { name: "aperture-agency-v1", skipHydration: true },
  ),
);

export function contactName(contacts: Contact[], id: string) {
  return contacts.find((c) => c.id === id)?.name ?? "Unknown";
}

export function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
