export type Customer = {
  id: string;
  name: string;
  company: string;
  email: string;
  country: string;
  status: "Active" | "Invited" | "Inactive";
  joined: string;
  color: string;
};
export type Project = {
  id: string;
  name: string;
  clientId: string;
  category: string;
  progress: number;
  budget: number;
  due: string;
  color: string;
  status: "In progress" | "In review" | "Completed";
};
export type Ticket = {
  id: string;
  title: string;
  clientId: string;
  priority: string;
  status: "Open" | "In progress" | "Resolved";
  date: string;
  description: string;
};
export type Invoice = {
  id: string;
  clientId: string;
  amount: number;
  date: string;
  paid: boolean;
};
export type DemoData = {
  customers: Customer[];
  projects: Project[];
  tickets: Ticket[];
  invoices: Invoice[];
  readNotifications: string[];
  account: { name: string; email: string; company: string; digest: boolean };
};
export const TODAY = "2026-10-29";
export const currency = (value: number) =>
  new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
export const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
export function seedData(): DemoData {
  const customers: Customer[] = [
    {
      id: "c1",
      name: "Olivia Martin",
      company: "Forma Studio",
      email: "olivia@forma.example",
      country: "Netherlands",
      status: "Active",
      joined: "2026-04-12",
      color: "peach",
    },
    {
      id: "c2",
      name: "Lucas Weber",
      company: "Bloom & Co.",
      email: "lucas@bloom.example",
      country: "Germany",
      status: "Active",
      joined: "2026-05-08",
      color: "sage",
    },
    {
      id: "c3",
      name: "Sophie Laurent",
      company: "Maison Collective",
      email: "sophie@maison.example",
      country: "France",
      status: "Active",
      joined: "2026-06-21",
      color: "lavender",
    },
    {
      id: "c4",
      name: "Noah Andersson",
      company: "Nordic Ventures",
      email: "noah@nordic.example",
      country: "Sweden",
      status: "Active",
      joined: "2026-07-04",
      color: "blue",
    },
    {
      id: "c5",
      name: "Isabella Rossi",
      company: "Olive Digital",
      email: "isabella@olive.example",
      country: "Italy",
      status: "Invited",
      joined: "2026-10-21",
      color: "rose",
    },
    {
      id: "c6",
      name: "Oliver Jensen",
      company: "Arc Copenhagen",
      email: "oliver@arc.example",
      country: "Denmark",
      status: "Inactive",
      joined: "2026-03-17",
      color: "sand",
    },
  ];
  const projects: Project[] = [
    {
      id: "p1",
      name: "Website redesign",
      clientId: "c1",
      category: "Design & development",
      progress: 72,
      budget: 18500,
      due: "2026-11-12",
      color: "sage",
      status: "In progress",
    },
    {
      id: "p2",
      name: "Brand identity",
      clientId: "c2",
      category: "Brand strategy",
      progress: 90,
      budget: 12000,
      due: "2026-11-04",
      color: "lavender",
      status: "In review",
    },
    {
      id: "p3",
      name: "E-commerce platform",
      clientId: "c3",
      category: "Development",
      progress: 45,
      budget: 32000,
      due: "2026-11-24",
      color: "peach",
      status: "In progress",
    },
    {
      id: "p4",
      name: "Investor portal",
      clientId: "c4",
      category: "Product design",
      progress: 100,
      budget: 24000,
      due: "2026-10-23",
      color: "blue",
      status: "Completed",
    },
    {
      id: "p5",
      name: "Growth campaign",
      clientId: "c2",
      category: "Digital marketing",
      progress: 34,
      budget: 8400,
      due: "2026-12-02",
      color: "rose",
      status: "In progress",
    },
    {
      id: "p6",
      name: "Content direction",
      clientId: "c1",
      category: "Creative strategy",
      progress: 100,
      budget: 6500,
      due: "2026-10-14",
      color: "sand",
      status: "Completed",
    },
  ];
  const invoices: Invoice[] = [];
  for (let month = 4; month <= 10; month++)
    for (let client = 0; client < 4; client++)
      for (let batch = 0; batch < 3; batch++)
        invoices.push({
          id: `i${month}-${client}-${batch}`,
          clientId: `c${client + 1}`,
          amount: 900 + month * 130 + client * 320 + batch * 210,
          date: `2026-${String(month).padStart(2, "0")}-${String(4 + batch * 8 + client).padStart(2, "0")}`,
          paid: month < 10 || batch < 2,
        });
  return {
    customers,
    projects,
    invoices,
    tickets: [
      {
        id: "t1",
        title: "Feedback on homepage concepts",
        clientId: "c1",
        priority: "Medium",
        status: "Open",
        date: "2026-10-29",
        description:
          "Could we explore a warmer colour palette for the new homepage?",
      },
      {
        id: "t2",
        title: "Product import assistance",
        clientId: "c3",
        priority: "High",
        status: "In progress",
        date: "2026-10-28",
        description:
          "Please help map the sample product catalogue to the new store.",
      },
      {
        id: "t3",
        title: "Brand guidelines approved",
        clientId: "c2",
        priority: "Low",
        status: "Resolved",
        date: "2026-10-26",
        description: "The latest version looks great. Thank you!",
      },
    ],
    readNotifications: [],
    account: {
      name: "Alex Morgan",
      email: "alex@northstar.example",
      company: "Northstar Studio",
      digest: true,
    },
  };
}
export function metrics(data: DemoData, days: number, clientId?: string) {
  const end = new Date(TODAY + "T23:59:59Z").getTime();
  const start = end - days * 86400000;
  const applicable = data.invoices.filter(
    (i) => i.paid && (!clientId || i.clientId === clientId),
  );
  const sum = (from: number, to: number) =>
    applicable
      .filter(
        (i) =>
          new Date(i.date).getTime() > from && new Date(i.date).getTime() <= to,
      )
      .reduce((s, i) => s + i.amount, 0);
  const revenue = sum(start, end),
    previous = sum(start - days * 86400000, start);
  const projects = data.projects.filter(
    (p) => !clientId || p.clientId === clientId,
  );
  const customers = data.customers.filter(
    (c) => (!clientId || c.id === clientId) && c.status === "Active",
  );
  const tickets = data.tickets.filter(
    (t) => (!clientId || t.clientId === clientId) && t.status !== "Resolved",
  );
  const buckets = Array.from({ length: days > 90 ? 7 : 6 }, (_, index) => {
    const n = days > 90 ? 7 : 6;
    const from = start + (days * 86400000 * index) / n;
    const to = start + (days * 86400000 * (index + 1)) / n;
    return {
      label: new Date(to).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      }),
      revenue: sum(from, to),
      previous: sum(from - days * 86400000, to - days * 86400000),
    };
  });
  return {
    revenue,
    previous,
    change: previous ? ((revenue - previous) / previous) * 100 : 0,
    projects: projects.filter((p) => p.status !== "Completed").length,
    customers: customers.length,
    tickets: tickets.length,
    buckets,
  };
}
export function deleteCustomer(data: DemoData, id: string): DemoData {
  return {
    ...data,
    customers: data.customers.filter((c) => c.id !== id),
    projects: data.projects.filter((p) => p.clientId !== id),
    tickets: data.tickets.filter((t) => t.clientId !== id),
    invoices: data.invoices.filter((i) => i.clientId !== id),
  };
}
export function csvCustomers(customers: Customer[]) {
  const cell = (s: string) =>
    '"' + s.replace(/^[=+@\-]/, "'$&").replaceAll('"', '""') + '"';
  return (
    "\uFEFF" +
    [
      ["Name", "Company", "Email", "Country", "Status"],
      ...customers.map((c) => [
        c.name,
        c.company,
        c.email,
        c.country,
        c.status,
      ]),
    ]
      .map((row) => row.map(cell).join(","))
      .join("\r\n")
  );
}
export const documents = [
  {
    id: "d1",
    name: "Website project proposal",
    type: "PDF",
    size: "248 KB",
    clientId: "c1",
    date: "24 Oct 2026",
    body: "WEBSITE PROJECT PROPOSAL\nForma Studio × Northstar\nScope: discovery, design, development and launch.\nBudget: EUR 18,500.\nFictional portfolio sample. Not a legal agreement.",
  },
  {
    id: "d2",
    name: "Brand guidelines v2",
    type: "TXT",
    size: "12 KB",
    clientId: "c2",
    date: "26 Oct 2026",
    body: "BLOOM & CO. — BRAND GUIDELINES\nPrimary colour: forest green.\nTone: thoughtful, warm, optimistic.\nUse generous whitespace and clear typography.\nFictional portfolio sample.",
  },
  {
    id: "d3",
    name: "Product catalogue template",
    type: "CSV",
    size: "4 KB",
    clientId: "c3",
    date: "27 Oct 2026",
    body: "SKU,Name,Price EUR\nMC-001,Linen throw,89\nMC-002,Ceramic vase,45",
  },
  {
    id: "d4",
    name: "October progress report",
    type: "TXT",
    size: "18 KB",
    clientId: "c1",
    date: "28 Oct 2026",
    body: "OCTOBER PROGRESS REPORT\nWebsite redesign: 72% complete.\nContent direction: delivered.\nNext milestone: responsive development.\nFictional portfolio sample.",
  },
];
