"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { flushSync } from "react-dom";
import {
  Activity,
  ArrowDown,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  CreditCard,
  Ellipsis,
  FileText,
  FolderClosed,
  LayoutGrid,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  Trash2,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  currency,
  csvCustomers,
  deleteCustomer,
  documents,
  initials,
  metrics,
  seedData,
  TODAY,
  type Customer,
  type DemoData,
  type Project,
} from "../lib/data";
import { loadData, saveData } from "../lib/storage";
import { Badge, download, Empty, Modal } from "./ui";
import { AnimatedNumber } from "./animated-number";
import { useReducedMotion } from "../lib/use-reduced-motion";
type Page =
  | "Overview"
  | "Projects"
  | "Customers"
  | "Documents"
  | "Support tickets"
  | "Notifications"
  | "Settings";
const navigation = [
  { name: "Overview", icon: LayoutGrid },
  { name: "Projects", icon: FolderClosed },
  { name: "Customers", icon: Users },
  { name: "Documents", icon: FileText },
  { name: "Support tickets", icon: MessageSquare },
] as const;
export default function Workspace() {
  const reducedMotion = useReducedMotion();
  const [data, setData] = useState<DemoData>(seedData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState<Page>("Overview");
  const [dark, setDark] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [days, setDays] = useState(30);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [sort, setSort] = useState("name");
  const [role, setRole] = useState<"admin" | "client">("admin");
  const [signedIn, setSignedIn] = useState(true);
  const [modal, setModal] = useState<
    "customer" | "ticket" | "reset" | "signin" | "document" | "project" | null
  >(null);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedDoc, setSelectedDoc] = useState(documents[0]);
  const [toast, setToast] = useState("");
  const [customerDelete, setCustomerDelete] = useState<Customer | null>(null);
  useEffect(() => {
    try {
      setData(loadData());
      setDark(localStorage.getItem("northstar-theme") === "dark");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(timer);
  }, [toast]);
  const closeModal = useCallback(() => {
    setModal(null);
    setCustomerDelete(null);
  }, []);
  function update(next: DemoData, message = "Changes saved") {
    try {
      saveData(next);
      setData(next);
      setError("");
      setToast(message);
    } catch {
      setError(
        "Your browser could not save changes. Allow local storage and try again.",
      );
    }
  }
  function navigate(next: Page) {
    const changePage = () => {
      setPage(next);
      setSearch("");
      setStatus("All statuses");
      setMobile(false);
    };
    if (document.startViewTransition && !reducedMotion && page !== next) {
      document.startViewTransition(() => flushSync(changePage));
    } else {
      changePage();
    }
  }
  const clientId = role === "client" ? "c1" : undefined;
  const insight = useMemo(
    () => metrics(data, days, clientId),
    [data, days, clientId],
  );
  const customerList = data.customers
    .filter(
      (c) =>
        (!clientId || c.id === clientId) &&
        `${c.name} ${c.company} ${c.email} ${c.country}`
          .toLowerCase()
          .includes(search.toLowerCase()) &&
        (status === "All statuses" || c.status === status),
    )
    .sort((a, b) =>
      sort === "newest"
        ? b.joined.localeCompare(a.joined)
        : sort === "company"
          ? a.company.localeCompare(b.company)
          : a.name.localeCompare(b.name),
    );
  const projectList = data.projects.filter(
    (p) =>
      (!clientId || p.clientId === clientId) &&
      `${p.name} ${data.customers.find((c) => c.id === p.clientId)?.company}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (status === "All statuses" || p.status === status),
  );
  const tickets = data.tickets.filter(
    (t) =>
      (!clientId || t.clientId === clientId) &&
      `${t.title} ${t.description}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (status === "All statuses" || t.status === status),
  );
  const visibleDocs = documents.filter(
    (d) =>
      data.customers.some((c) => c.id === d.clientId) &&
      (!clientId || d.clientId === clientId) &&
      d.name.toLowerCase().includes(search.toLowerCase()),
  );
  const notifications = [
    {
      id: "n1",
      title: "Your weekly workspace update is ready",
      detail: "A fresh look at your projects, clients, and performance.",
      icon: TrendingUp,
      clientId: "c1",
    },
    {
      id: "n2",
      title: "New feedback on Website redesign",
      detail: "Olivia Martin shared feedback on the latest concepts.",
      icon: MessageSquare,
      clientId: "c1",
    },
    {
      id: "n3",
      title: "Brand identity is ready for review",
      detail: "The Bloom & Co. project has reached its review milestone.",
      icon: FolderClosed,
      clientId: "c2",
    },
  ].filter((n) => !clientId || n.clientId === clientId);
  const unread = notifications.filter(
    (n) => !data.readNotifications.includes(n.id),
  ).length;
  const currentName = role === "admin" ? data.account.name : "Olivia Martin";
  const exportCustomers = () => {
    download(
      "northstar-customers.csv",
      csvCustomers(customerList),
      "text/csv;charset=utf-8",
    );
    setToast("Customer export downloaded");
  };
  const projectCard = (p: Project) => {
    const client = data.customers.find((c) => c.id === p.clientId);
    return (
      <button
        key={p.id}
        className="project-card"
        onClick={() => {
          setSelectedProject(p);
          setModal("project");
        }}
      >
        <div className="project-top">
          <span className={"project-symbol " + p.color}>
            {p.id === "p1" ? (
              <LayoutGrid size={21} />
            ) : p.id === "p2" ? (
              <Sparkles size={21} />
            ) : (
              <BriefcaseBusiness size={21} />
            )}
          </span>
          <Badge>{p.status}</Badge>
        </div>
        <h3>{p.name}</h3>
        <p>
          {client?.company} <span>·</span> {p.category}
        </p>
        <div className="project-progress-label">
          <span>Progress</span>
          <strong>{p.progress}%</strong>
        </div>
        <div className="progress-track">
          <div style={{ width: p.progress + "%" }} />
        </div>
        <div className="project-footer">
          <div className="avatar-stack">
            <span className={"avatar tiny " + (client?.color || "sage")}>
              {initials(client?.name || "Demo")}
            </span>
            <span className="avatar tiny lavender">AM</span>
          </div>
          <span>
            Due{" "}
            {new Date(p.due + "T12:00:00").toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
            })}
          </span>
        </div>
      </button>
    );
  };
  const customerTable = (overview = false) => (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>
              <button
                className="table-sort"
                onClick={() => setSort(sort === "name" ? "company" : "name")}
              >
                Customer <ArrowDown size={12} />
              </button>
            </th>
            <th>Company</th>
            <th>Status</th>
            <th>Country</th>
            <th>Joined</th>
            <th>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {(overview ? customerList.slice(0, 4) : customerList).map((c) => (
            <tr key={c.id}>
              <td>
                <div className="person">
                  <span className={"avatar " + c.color}>
                    {initials(c.name)}
                  </span>
                  <span>
                    <strong>{c.name}</strong>
                    <small>{c.email}</small>
                  </span>
                </div>
              </td>
              <td>{c.company}</td>
              <td>
                <Badge>{c.status}</Badge>
              </td>
              <td>{c.country}</td>
              <td>
                {new Date(c.joined + "T12:00:00").toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td>
                {role === "admin" ? (
                  <div className="row-actions">
                    <button
                      aria-label={"Edit " + c.name}
                      title="Edit customer"
                      onClick={() => {
                        setEditing(c);
                        setModal("customer");
                      }}
                    >
                      <Ellipsis size={18} />
                    </button>
                    <button
                      aria-label={"Delete " + c.name}
                      title="Delete customer"
                      onClick={() => setCustomerDelete(c)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ) : (
                  <ShieldCheck size={17} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!customerList.length && <Empty />}
    </div>
  );
  return (
    <div className={"app " + (collapsed ? "is-collapsed" : "")}>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      {mobile && (
        <div className="sidebar-scrim" onClick={() => setMobile(false)} />
      )}
      <aside
        className={"sidebar " + (mobile ? "mobile-open" : "")}
        aria-label="Main navigation"
      >
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("Overview");
          }}
        >
          <span className="brand-mark">
            <Sparkles size={25} strokeWidth={1.5} />
          </span>
          <span>
            northstar<span className="brand-dot">.</span>
          </span>
        </a>
        <button
          className="workspace-switch"
          onClick={() => navigate("Settings")}
        >
          <span className="workspace-logo">N</span>
          <span>
            <strong>Northstar Studio</strong>
            <small>Workspace · Demo</small>
          </span>
          <ChevronDown size={15} />
        </button>
        <div className="nav-caption">WORKSPACE</div>
        <nav>
          {navigation.map((item) => (
            <button
              key={item.name}
              className={"nav-item " + (page === item.name ? "selected" : "")}
              onClick={() => navigate(item.name)}
              title={item.name}
              aria-current={page === item.name ? "page" : undefined}
            >
              <item.icon size={19} />
              <span>{item.name}</span>
              {item.name === "Support tickets" && <b>{insight.tickets}</b>}
            </button>
          ))}
        </nav>
        <div className="nav-bottom">
          <button
            className={
              "nav-item " + (page === "Notifications" ? "selected" : "")
            }
            onClick={() => navigate("Notifications")}
            title="Notifications"
          >
            <Bell size={19} />
            <span>Notifications</span>
            {unread > 0 && <i className="notification-dot" />}
          </button>
          <button
            className={"nav-item " + (page === "Settings" ? "selected" : "")}
            onClick={() => navigate("Settings")}
            title="Settings"
          >
            <Settings size={19} />
            <span>Settings</span>
          </button>
          <button
            className="nav-item"
            onClick={() => {
              setToast(
                "Need a hand? This demo is browser-local. Use Settings to switch roles or reset your workspace.",
              );
            }}
            title="Help and support"
          >
            <CircleHelp size={19} />
            <span>Help & support</span>
            <ArrowUpRight size={14} />
          </button>
          <div className="demo-card">
            <span>
              <Sparkles size={16} /> A little space to explore
            </span>
            <p>
              Real workflows. Fictional data.
              <br />
              Make this workspace your own.
            </p>
            <button onClick={() => setModal("signin")}>
              Explore the demo <ArrowRight size={15} />
            </button>
          </div>
          <button className="profile" onClick={() => setModal("signin")}>
            <span className="avatar profile-avatar">
              {initials(currentName)}
            </span>
            <span>
              <strong>{currentName}</strong>
              <small>
                {role === "admin" ? "Workspace admin" : "Client · Forma Studio"}
              </small>
            </span>
            <ChevronDown size={16} />
          </button>
        </div>
        <button
          className="collapse-toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-btn mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMobile(true)}
            >
              <Menu size={20} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{page}</strong>
          </div>
          <div className="topbar-actions">
            <span className="demo-pill">
              <i /> DEMO WORKSPACE
            </span>
            <button
              className="icon-btn theme-button"
              onClick={() => {
                setDark(!dark);
                try {
                  localStorage.setItem(
                    "northstar-theme",
                    dark ? "light" : "dark",
                  );
                } catch {
                  setToast("Theme changed for this session");
                }
              }}
              aria-label={dark ? "Use light theme" : "Use dark theme"}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              className="icon-btn notification-button"
              aria-label={"Notifications, " + unread + " unread"}
              onClick={() => navigate("Notifications")}
            >
              <Bell size={19} />
              {unread > 0 && <i />}
            </button>
            <button
              className="avatar top-avatar"
              aria-label="Switch demo identity"
              onClick={() => setModal("signin")}
            >
              {initials(currentName)}
            </button>
          </div>
        </header>
        <main id="main" key={page}>
          <div className="page-heading">
            <div>
              <div className="eyebrow">YOUR WORKSPACE, AT A GLANCE</div>
              <h1>
                {page === "Overview"
                  ? `Good morning, ${currentName.split(" ")[0]}`
                  : page}
                <span className="heading-period">.</span>
                {page === "Overview" && <span className="greeting-sun">☀</span>}
              </h1>
              <p>
                {page === "Overview"
                  ? "Here’s what’s happening with your business today."
                  : page === "Projects"
                    ? "From the first idea to the finishing touches. Keep everything moving."
                    : page === "Customers"
                      ? "Good relationships start with a little organisation."
                      : page === "Documents"
                        ? "Everything you need, right where you need it."
                        : page === "Support tickets"
                          ? "A shared space to ask, resolve, and keep moving forward."
                          : page === "Notifications"
                            ? "The latest from your people and projects."
                            : "Make this workspace feel like yours."}
              </p>
            </div>
            <div className="heading-actions">
              {page === "Overview" ? (
                <>
                  <button
                    className="btn"
                    onClick={() => {
                      download(
                        "northstar-report.csv",
                        "Metric,Value\nRevenue EUR," +
                          insight.revenue +
                          "\nActive projects," +
                          insight.projects +
                          "\nActive customers," +
                          insight.customers +
                          "\nOpen tickets," +
                          insight.tickets,
                        "text/csv;charset=utf-8",
                      );
                      setToast("Overview report downloaded");
                    }}
                  >
                    <ArrowDownToLine size={15} /> Export report
                  </button>
                  <label className="range-select">
                    <Activity size={15} />
                    <select
                      aria-label="Reporting time range"
                      value={days}
                      onChange={(e) => setDays(Number(e.target.value))}
                    >
                      <option value={30}>Last 30 days</option>
                      <option value={90}>Last 90 days</option>
                      <option value={180}>Last 6 months</option>
                    </select>
                    <ChevronDown size={14} />
                  </label>
                </>
              ) : page === "Customers" && role === "admin" ? (
                <button
                  className="btn primary"
                  onClick={() => {
                    setEditing(null);
                    setModal("customer");
                  }}
                >
                  <Plus size={16} /> Add customer
                </button>
              ) : page === "Support tickets" ? (
                <button
                  className="btn primary"
                  onClick={() => setModal("ticket")}
                >
                  <Plus size={16} /> New ticket
                </button>
              ) : null}
            </div>
          </div>
          {error && (
            <div className="error-banner" role="alert">
              {error}
              <button className="btn" onClick={() => setModal("reset")}>
                Reset demo
              </button>
            </div>
          )}
          {!signedIn ? (
            <div className="signin-panel">
              <span className="brand-mark">
                <Sparkles />
              </span>
              <h2>Your workspace is waiting.</h2>
              <p>Choose a fictional identity to explore this demo.</p>
              <button
                className="btn primary"
                onClick={() => setModal("signin")}
              >
                Demo sign in <ArrowRight size={16} />
              </button>
            </div>
          ) : loading ? (
            <div className="loading" role="status">
              <span className="spinner" /> Getting your workspace ready…
            </div>
          ) : (
            <>
              {page === "Overview" && (
                <>
                  <div className="kpi-grid">
                    {[
                      {
                        title: "Total revenue",
                        value: insight.revenue,
                        icon: CreditCard,
                        change: `${insight.change >= 0 ? "+" : ""}${insight.change.toFixed(1)}%`,
                        foot: "vs. previous period",
                        accent: "sage",
                        spark: true,
                      },
                      {
                        title: "Active projects",
                        value: insight.projects,
                        icon: FolderClosed,
                        change:
                          String(
                            data.projects.filter(
                              (p) =>
                                (!clientId || p.clientId === clientId) &&
                                p.status === "In review",
                            ).length,
                          ) + " in review",
                        foot: "Moving things forward",
                        accent: "lavender",
                      },
                      {
                        title: "Active customers",
                        value: insight.customers,
                        icon: Users,
                        change:
                          String(
                            data.customers.filter(
                              (c) =>
                                (!clientId || c.id === clientId) &&
                                c.status === "Invited",
                            ).length,
                          ) + " invited",
                        foot: "Building lasting relationships",
                        accent: "peach",
                      },
                      {
                        title: "Open tickets",
                        value: insight.tickets,
                        icon: MessageSquare,
                        change:
                          String(
                            data.tickets.filter(
                              (t) =>
                                (!clientId || t.clientId === clientId) &&
                                t.status === "Resolved",
                            ).length,
                          ) + " resolved",
                        foot: "A little support goes a long way",
                        accent: "blue",
                      },
                    ].map((k) => (
                      <div className="kpi-card" key={k.title}>
                        <div className="kpi-label">
                          {k.title}
                          <span className={"kpi-icon " + k.accent}>
                            <k.icon size={17} />
                          </span>
                        </div>
                        <div className="kpi-value">
                          <AnimatedNumber value={k.value} money={!!k.spark} />
                          {k.spark && (
                            <svg
                              className="sparkline"
                              viewBox="0 0 100 38"
                              aria-hidden="true"
                            >
                              <path
                                d={insight.buckets
                                  .map(
                                    (bucket, index) =>
                                      `${index === 0 ? "M" : "L"}${(index * 100) / (insight.buckets.length - 1)} ${36 - (bucket.revenue / Math.max(1, ...insight.buckets.map((item) => item.revenue))) * 32}`,
                                  )
                                  .join(" ")}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="kpi-bottom">
                          <span className={k.spark ? "trend" : "soft-tag"}>
                            {k.spark && <TrendingUp size={12} />} {k.change}
                          </span>
                          <span>{k.foot}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="insights-grid">
                    <section className="panel revenue-panel">
                      <div className="section-heading">
                        <div>
                          <h2>Revenue overview</h2>
                          <p>A little perspective on your business growth.</p>
                        </div>
                        <div className="chart-legend">
                          <span>
                            <i />
                            Current period
                          </span>
                          <span>
                            <i />
                            Previous period
                          </span>
                        </div>
                      </div>
                      <div className="chart-summary">
                        <strong>
                          <AnimatedNumber value={insight.revenue} money />
                        </strong>
                        <span className="trend">
                          <ArrowUpRight size={13} />
                          {insight.change.toFixed(1)}%
                        </span>
                        <small>vs. previous period</small>
                      </div>
                      <div
                        className="revenue-chart"
                        role="img"
                        aria-label={`Revenue: ${currency(insight.revenue)}, previous period: ${currency(insight.previous)}`}
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={insight.buckets}
                            margin={{
                              top: 12,
                              right: 10,
                              left: -20,
                              bottom: 0,
                            }}
                          >
                            <defs>
                              <linearGradient
                                id="revenueFill"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                              >
                                <stop
                                  offset="0%"
                                  stopColor="#2b7563"
                                  stopOpacity={0.18}
                                />
                                <stop
                                  offset="100%"
                                  stopColor="#2b7563"
                                  stopOpacity={0.01}
                                />
                              </linearGradient>
                            </defs>
                            <CartesianGrid
                              vertical={false}
                              stroke="var(--line)"
                              strokeDasharray="3 4"
                            />
                            <XAxis
                              dataKey="label"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: "var(--muted)", fontSize: 10 }}
                              dy={9}
                              minTickGap={10}
                            />
                            <YAxis
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: "var(--muted)", fontSize: 10 }}
                              tickFormatter={(v) =>
                                "€" + (v / 1000).toFixed(0) + "k"
                              }
                            />
                            <Tooltip
                              contentStyle={{
                                background: "var(--panel)",
                                border: "1px solid var(--line)",
                                borderRadius: 10,
                                fontSize: 12,
                              }}
                              formatter={(value) => currency(Number(value))}
                            />
                            <Area
                              name="Previous period"
                              isAnimationActive={!reducedMotion}
                              animationDuration={850}
                              animationEasing="ease-out"
                              type="monotone"
                              dataKey="previous"
                              stroke="#bdc7bf"
                              fill="none"
                              strokeDasharray="5 5"
                              strokeWidth={2}
                            />
                            <Area
                              name="Current period"
                              isAnimationActive={!reducedMotion}
                              animationDuration={850}
                              animationEasing="ease-out"
                              type="monotone"
                              dataKey="revenue"
                              stroke="#317662"
                              fill="url(#revenueFill)"
                              strokeWidth={2.5}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="chart-footer">
                        <span className="live-dot" /> Based on paid demo
                        invoices{" "}
                        <button onClick={() => navigate("Customers")}>
                          View customers <ArrowUpRight size={13} />
                        </button>
                      </div>
                    </section>
                    <section className="panel activity-panel">
                      <div className="section-heading">
                        <h2>Recent activity</h2>
                        <span className="subtle-label">THIS WEEK</span>
                      </div>
                      <div className="activity-list">
                        {[...data.tickets]
                          .filter((t) => !clientId || t.clientId === clientId)
                          .sort((a, b) => b.date.localeCompare(a.date))
                          .slice(0, 3)
                          .map((t, i) => (
                            <button
                              className="activity-item"
                              key={t.id}
                              onClick={() => navigate("Support tickets")}
                            >
                              <span
                                className={
                                  "activity-icon " +
                                  ["sage", "lavender", "peach"][i]
                                }
                              >
                                {i === 0 ? (
                                  <MessageSquare size={16} />
                                ) : i === 1 ? (
                                  <FolderClosed size={16} />
                                ) : (
                                  <Check size={16} />
                                )}
                              </span>
                              <span>
                                <strong>
                                  {t.status === "Resolved"
                                    ? "A little progress, delivered"
                                    : "New update from " +
                                      (data.customers
                                        .find((c) => c.id === t.clientId)
                                        ?.name.split(" ")[0] || "a customer")}
                                </strong>
                                <p>{t.title}</p>
                                <small>
                                  {t.date === TODAY
                                    ? "Today"
                                    : new Date(
                                        t.date + "T12:00:00",
                                      ).toLocaleDateString("en-GB", {
                                        day: "numeric",
                                        month: "short",
                                      })}{" "}
                                  <span>·</span> {t.status}
                                </small>
                              </span>
                            </button>
                          ))}
                      </div>
                      <button
                        className="activity-all"
                        onClick={() => navigate("Notifications")}
                      >
                        View all activity <ArrowRight size={14} />
                      </button>
                    </section>
                  </div>
                  <section className="projects-section">
                    <div className="section-heading">
                      <div className="title-with-count">
                        <h2>Active projects</h2>
                        <span className="count">{insight.projects}</span>
                      </div>
                      <button
                        className="text-btn"
                        onClick={() => navigate("Projects")}
                      >
                        View all projects <ArrowRight size={14} />
                      </button>
                    </div>
                    <div className="project-grid">
                      {projectList
                        .filter((p) => p.status !== "Completed")
                        .slice(0, 3)
                        .map(projectCard)}
                    </div>
                    {!insight.projects && (
                      <Empty
                        title="All caught up"
                        description="Your completed projects are available in Projects."
                      />
                    )}
                  </section>
                  <section className="panel customers-panel">
                    <div className="section-heading">
                      <div>
                        <h2>
                          Customers{" "}
                          <span className="count">{customerList.length}</span>
                        </h2>
                        <p>The people behind the projects.</p>
                      </div>
                      <button
                        className="btn small"
                        onClick={() => navigate("Customers")}
                      >
                        View all customers <ArrowRight size={14} />
                      </button>
                    </div>
                    {customerTable(true)}
                  </section>
                </>
              )}
              {page === "Projects" && (
                <>
                  <div className="filterbar">
                    <label className="search-box">
                      <Search size={16} />
                      <input
                        placeholder="Search projects…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        aria-label="Search projects"
                      />
                    </label>
                    <select
                      aria-label="Project status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      {[
                        "All statuses",
                        "In progress",
                        "In review",
                        "Completed",
                      ].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                    <span className="result-count">
                      {projectList.length} projects
                    </span>
                  </div>
                  <div className="project-grid full">
                    {projectList.map(projectCard)}
                  </div>
                  {!projectList.length && <Empty />}
                </>
              )}
              {page === "Customers" && (
                <section className="panel">
                  <div className="filterbar">
                    <label className="search-box">
                      <Search size={16} />
                      <input
                        aria-label="Search customers"
                        placeholder="Search customers…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </label>
                    <select
                      aria-label="Customer status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      {["All statuses", "Active", "Invited", "Inactive"].map(
                        (s) => (
                          <option key={s}>{s}</option>
                        ),
                      )}
                    </select>
                    <select
                      aria-label="Sort customers"
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                    >
                      <option value="name">Name A–Z</option>
                      <option value="company">Company A–Z</option>
                      <option value="newest">Newest first</option>
                    </select>
                    <button className="btn" onClick={exportCustomers}>
                      <ArrowDownToLine size={15} /> Export CSV
                    </button>
                  </div>
                  {customerTable()}
                  <div className="table-footer">
                    Showing {customerList.length} customers{" "}
                    <span>All records are fictional</span>
                  </div>
                </section>
              )}
              {page === "Documents" && (
                <>
                  <div className="filterbar">
                    <label className="search-box">
                      <Search size={16} />
                      <input
                        aria-label="Search documents"
                        placeholder="Search documents…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </label>
                    <span className="result-count">
                      {visibleDocs.length} sample documents
                    </span>
                  </div>
                  <div className="document-grid">
                    {visibleDocs.map((d) => (
                      <button
                        className="panel document-card"
                        key={d.id}
                        onClick={() => {
                          setSelectedDoc(d);
                          setModal("document");
                        }}
                      >
                        <span className="document-illustration">
                          <FileText size={42} strokeWidth={1} />
                          <span>{d.type === "PDF" ? "SAMPLE" : d.type}</span>
                        </span>
                        <h3>{d.name}</h3>
                        <p>
                          {
                            data.customers.find((c) => c.id === d.clientId)
                              ?.company
                          }
                        </p>
                        <div>
                          <span>{d.date}</span>
                          <ArrowUpRight size={16} />
                        </div>
                      </button>
                    ))}
                  </div>
                  {!visibleDocs.length && <Empty />}
                </>
              )}
              {page === "Support tickets" && (
                <section className="panel">
                  <div className="filterbar">
                    <label className="search-box">
                      <Search size={16} />
                      <input
                        aria-label="Search tickets"
                        placeholder="Search tickets…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </label>
                    <select
                      aria-label="Ticket status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      {["All statuses", "Open", "In progress", "Resolved"].map(
                        (s) => (
                          <option key={s}>{s}</option>
                        ),
                      )}
                    </select>
                  </div>
                  <div className="ticket-list">
                    {tickets.map((t) => (
                      <article className="ticket" key={t.id}>
                        <span className="activity-icon lavender">
                          <MessageSquare size={20} />
                        </span>
                        <div>
                          <small>
                            {t.id.toUpperCase()} ·{" "}
                            {
                              data.customers.find((c) => c.id === t.clientId)
                                ?.company
                            }{" "}
                            · {t.date}
                          </small>
                          <h3>{t.title}</h3>
                          <p>{t.description}</p>
                          <span
                            className={"priority " + t.priority.toLowerCase()}
                          >
                            {t.priority} priority
                          </span>
                        </div>
                        <label className="ticket-status">
                          <span className="sr-only">Status for {t.title}</span>
                          <select
                            value={t.status}
                            onChange={(e) =>
                              update(
                                {
                                  ...data,
                                  tickets: data.tickets.map((item) =>
                                    item.id === t.id
                                      ? {
                                          ...item,
                                          status: e.target
                                            .value as typeof t.status,
                                        }
                                      : item,
                                  ),
                                },
                                "Ticket status updated",
                              )
                            }
                          >
                            {["Open", "In progress", "Resolved"].map((s) => (
                              <option key={s}>{s}</option>
                            ))}
                          </select>
                        </label>
                      </article>
                    ))}
                  </div>
                  {!tickets.length && (
                    <Empty
                      title="All clear"
                      description="Create a ticket or try a different filter."
                    />
                  )}
                </section>
              )}
              {page === "Notifications" && (
                <section className="panel notification-panel">
                  <div className="section-heading">
                    <h2>
                      Your updates{" "}
                      <span className="count">{unread} unread</span>
                    </h2>
                    <button
                      className="btn"
                      onClick={() =>
                        update(
                          {
                            ...data,
                            readNotifications: notifications.map((n) => n.id),
                          },
                          "All notifications marked as read",
                        )
                      }
                    >
                      <Check size={15} /> Mark all read
                    </button>
                  </div>
                  {notifications.map((n) => (
                    <button
                      className={
                        "notification-row " +
                        (!data.readNotifications.includes(n.id) ? "unread" : "")
                      }
                      key={n.id}
                      onClick={() => {
                        update(
                          {
                            ...data,
                            readNotifications: [
                              ...new Set([...data.readNotifications, n.id]),
                            ],
                          },
                          "Notification marked as read",
                        );
                      }}
                    >
                      <span className="activity-icon sage">
                        <n.icon size={19} />
                      </span>
                      <span>
                        <strong>{n.title}</strong>
                        <p>{n.detail}</p>
                        <small>October 2026</small>
                      </span>
                      {!data.readNotifications.includes(n.id) && (
                        <i className="notification-dot" />
                      )}
                    </button>
                  ))}
                </section>
              )}
              {page === "Settings" && (
                <div className="settings-grid">
                  <section className="panel settings-panel">
                    <h2>Profile & preferences</h2>
                    <p>These details are saved only in this browser.</p>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const f = new FormData(e.currentTarget);
                        update({
                          ...data,
                          account: {
                            name: String(f.get("name")).trim(),
                            email: String(f.get("email")).trim(),
                            company: String(f.get("company")).trim(),
                            digest: f.get("digest") === "on",
                          },
                        });
                      }}
                    >
                      <label>
                        Full name
                        <input
                          name="name"
                          defaultValue={data.account.name}
                          required
                          maxLength={70}
                        />
                      </label>
                      <label>
                        Email address
                        <input
                          name="email"
                          type="email"
                          defaultValue={data.account.email}
                          required
                        />
                      </label>
                      <label>
                        Company
                        <input
                          name="company"
                          defaultValue={data.account.company}
                          required
                          maxLength={100}
                        />
                      </label>
                      <label className="checkbox-label">
                        <input
                          name="digest"
                          type="checkbox"
                          defaultChecked={data.account.digest}
                        />{" "}
                        Weekly digest preference (simulation; no emails sent)
                      </label>
                      <button className="btn primary" type="submit">
                        Save preferences
                      </button>
                    </form>
                  </section>
                  <div>
                    <section className="panel settings-panel">
                      <span className="activity-icon sage">
                        <ShieldCheck size={20} />
                      </span>
                      <h2>A safe space to explore</h2>
                      <p>
                        This is a fictional demo. Identity and permission
                        changes are client-side simulations, not secure
                        authentication.
                      </p>
                      <div className="simulation-box">
                        Current demo role:{" "}
                        <strong>
                          {role === "admin"
                            ? "Workspace admin"
                            : "Client · Forma Studio"}
                        </strong>
                      </div>
                      <button
                        className="btn"
                        onClick={() => setModal("signin")}
                      >
                        Switch demo identity <ArrowRight size={15} />
                      </button>
                      <button
                        className="btn signout-btn"
                        onClick={() => {
                          setSignedIn(false);
                          setToast("Signed out of the simulated session");
                          navigate("Overview");
                        }}
                      >
                        <LogOut size={15} /> Demo sign out
                      </button>
                    </section>
                    <section className="panel settings-panel reset-panel">
                      <h2>Start fresh</h2>
                      <p>
                        Restore the original fictional records and clear all
                        demo edits.
                      </p>
                      <button
                        className="btn danger"
                        onClick={() => setModal("reset")}
                      >
                        Reset sample data
                      </button>
                    </section>
                  </div>
                </div>
              )}
            </>
          )}
          <footer className="footer">
            <span>Made for better working days.</span>
            <span>
              <span className="live-dot" /> All systems, a little more organised{" "}
              <span className="footer-separator">|</span> Fictional demo · v1.0
            </span>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <Check size={17} />
          {toast}
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
      {customerDelete && (
        <Modal title="Delete this customer?" onClose={closeModal}>
          <p className="modal-description">
            This removes {customerDelete.name} and their related projects,
            invoices and tickets from the demo. You can restore sample records
            using Reset.
          </p>
          <div className="modal-actions">
            <button className="btn" onClick={closeModal}>
              Cancel
            </button>
            <button
              className="btn danger"
              onClick={() => {
                update(
                  deleteCustomer(data, customerDelete.id),
                  "Customer and related records deleted",
                );
                closeModal();
              }}
            >
              Delete customer
            </button>
          </div>
        </Modal>
      )}
      {modal === "customer" && (
        <Modal
          title={editing ? "Edit customer" : "Add a customer"}
          onClose={closeModal}
        >
          <p className="modal-description">
            A new connection, a new possibility. Use fictional details only.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const customer: Customer = {
                id: editing?.id || crypto.randomUUID(),
                name: String(f.get("name")).trim(),
                company: String(f.get("company")).trim(),
                email: String(f.get("email")).trim(),
                country: String(f.get("country")).trim(),
                status: String(f.get("status")) as Customer["status"],
                joined: editing?.joined || TODAY,
                color: editing?.color || "sage",
              };
              if (!customer.name || !customer.company || !customer.country) {
                setToast("Please fill out each field");
                return;
              }
              if (
                data.customers.some(
                  (c) =>
                    c.id !== customer.id &&
                    c.email.toLowerCase() === customer.email.toLowerCase(),
                )
              ) {
                setToast("A customer already uses that email");
                return;
              }
              update(
                {
                  ...data,
                  customers: editing
                    ? data.customers.map((c) =>
                        c.id === editing.id ? customer : c,
                      )
                    : [customer, ...data.customers],
                },
                editing ? "Customer updated" : "Customer added",
              );
              closeModal();
            }}
          >
            <label>
              Full name
              <input
                name="name"
                defaultValue={editing?.name}
                required
                maxLength={70}
                placeholder="e.g. Emma de Vries"
              />
            </label>
            <div className="form-grid">
              <label>
                Company
                <input
                  name="company"
                  defaultValue={editing?.company}
                  required
                  maxLength={80}
                  placeholder="Studio name"
                />
              </label>
              <label>
                Country
                <input
                  name="country"
                  defaultValue={editing?.country}
                  required
                  maxLength={50}
                  placeholder="Netherlands"
                />
              </label>
            </div>
            <label>
              Email address
              <input
                name="email"
                type="email"
                defaultValue={editing?.email}
                required
                placeholder="emma@studio.example"
              />
            </label>
            <label>
              Status
              <select name="status" defaultValue={editing?.status || "Active"}>
                {["Active", "Invited", "Inactive"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <div className="modal-actions">
              <button className="btn" type="button" onClick={closeModal}>
                Cancel
              </button>
              <button className="btn primary">
                {editing ? "Save changes" : "Add customer"}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {modal === "ticket" && (
        <Modal title="How can we help?" onClose={closeModal}>
          <p className="modal-description">
            Create a demo support ticket. We’ll keep the details together.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const title = String(f.get("title")).trim(),
                description = String(f.get("description")).trim();
              if (!title || !description) return;
              update(
                {
                  ...data,
                  tickets: [
                    {
                      id: "t-" + crypto.randomUUID().slice(0, 6),
                      title,
                      description,
                      priority: String(f.get("priority")),
                      clientId: clientId || String(f.get("client")),
                      status: "Open",
                      date: TODAY,
                    },
                    ...data.tickets,
                  ],
                },
                "Support ticket created",
              );
              closeModal();
            }}
          >
            <label>
              Subject
              <input
                name="title"
                required
                maxLength={100}
                placeholder="What would you like help with?"
              />
            </label>
            {role === "admin" && (
              <label>
                Customer
                <select name="client" required>
                  {data.customers.map((c) => (
                    <option value={c.id} key={c.id}>
                      {c.company}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label>
              Priority
              <select name="priority">
                <option>Medium</option>
                <option>Low</option>
                <option>High</option>
              </select>
            </label>
            <label>
              Details
              <textarea
                name="description"
                required
                rows={4}
                maxLength={2000}
                placeholder="Tell us a little more…"
              />
            </label>
            <div className="modal-actions">
              <button type="button" className="btn" onClick={closeModal}>
                Cancel
              </button>
              <button className="btn primary" disabled={!data.customers.length}>
                Create ticket
              </button>
            </div>
          </form>
        </Modal>
      )}
      {modal === "reset" && (
        <Modal title="A fresh start?" onClose={closeModal}>
          <p className="modal-description">
            This restores all sample customers, projects, invoices, tickets,
            notifications and account settings. Your demo edits will be removed.
          </p>
          <div className="modal-actions">
            <button className="btn" onClick={closeModal}>
              Keep my edits
            </button>
            <button
              className="btn danger"
              onClick={() => {
                update(seedData(), "Sample workspace restored");
                closeModal();
              }}
            >
              Reset demo
            </button>
          </div>
        </Modal>
      )}
      {modal === "signin" && (
        <Modal title="Meet your demo workspace" onClose={closeModal}>
          <p className="modal-description">
            Choose a fictional identity. This simulates roles for the portfolio
            demo; it is not production authentication.
          </p>
          {[
            {
              value: "admin",
              name: data.account.name,
              detail: "Workspace admin · all customers and projects",
              icon: BriefcaseBusiness,
            },
            {
              value: "client",
              name: "Olivia Martin",
              detail: "Client · Forma Studio projects and documents",
              icon: Users,
            },
          ].map((r) => (
            <button
              key={r.value}
              className="identity-option"
              onClick={() => {
                setRole(r.value as typeof role);
                setSignedIn(true);
                navigate("Overview");
                closeModal();
                setToast("Simulated " + r.value + " session started");
              }}
            >
              <span className="activity-icon sage">
                <r.icon size={21} />
              </span>
              <span>
                <strong>{r.name}</strong>
                <small>{r.detail}</small>
              </span>
              <ArrowRight size={17} />
            </button>
          ))}
          <div className="simulation-box">
            <ShieldCheck size={16} /> No passwords. No real customer
            information. Browser-local demo.
          </div>
        </Modal>
      )}
      {modal === "document" && (
        <Modal title={selectedDoc.name} onClose={closeModal}>
          <p className="modal-description">
            Fictional sample ·{" "}
            {data.customers.find((c) => c.id === selectedDoc.clientId)?.company}
          </p>
          <pre className="document-preview">{selectedDoc.body}</pre>
          <p className="document-note">
            Sample content is available as{" "}
            {selectedDoc.type === "CSV" ? "CSV" : "plain text"}.
          </p>
          <div className="modal-actions">
            <button className="btn" onClick={closeModal}>
              Close
            </button>
            <button
              className="btn primary"
              onClick={() => {
                download(
                  selectedDoc.name +
                    (selectedDoc.type === "CSV" ? ".csv" : ".txt"),
                  selectedDoc.body,
                );
                setToast("Sample document downloaded");
              }}
            >
              <ArrowDownToLine size={15} /> Download sample
            </button>
          </div>
        </Modal>
      )}
      {modal === "project" && selectedProject && (
        <Modal title={selectedProject.name} onClose={closeModal}>
          <p className="modal-description">
            {
              data.customers.find((c) => c.id === selectedProject.clientId)
                ?.company
            }{" "}
            · {selectedProject.category}
          </p>
          <div className="project-detail">
            <div>
              <span>Project budget</span>
              <strong>{currency(selectedProject.budget)}</strong>
            </div>
            <div>
              <span>Target delivery</span>
              <strong>{selectedProject.due}</strong>
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              const progress = Number(f.get("progress"));
              update(
                {
                  ...data,
                  projects: data.projects.map((p) =>
                    p.id === selectedProject.id
                      ? {
                          ...p,
                          progress,
                          status:
                            progress === 100
                              ? "Completed"
                              : progress >= 85
                                ? "In review"
                                : "In progress",
                        }
                      : p,
                  ),
                },
                "Project progress updated",
              );
              closeModal();
            }}
          >
            <label>
              Progress{" "}
              {role === "client" ? `· ${selectedProject.progress}%` : ""}
              {role === "admin" ? (
                <input
                  aria-label="Project progress percentage"
                  name="progress"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={selectedProject.progress}
                  required
                />
              ) : (
                <progress value={selectedProject.progress} max={100} />
              )}
            </label>
            <div className="modal-actions">
              <button className="btn" type="button" onClick={closeModal}>
                Close
              </button>
              {role === "admin" && (
                <button className="btn primary">Update progress</button>
              )}
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
