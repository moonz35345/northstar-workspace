# Northstar Workspace

**[View the live demo →](https://dashboard-northstar.netlify.app/)**

A premium, responsive portfolio demo for fictional European agency **Northstar Studio**. All people, companies, addresses, documents and financial records are fictional. Email addresses use the reserved `.example` domain.

The brief supplied two framework alternatives. This implementation combines analytics and the client portal in **Next.js App Router + React + TypeScript + Tailwind CSS v4 + Recharts**. Next.js replaces the alternative Vite build system; there is one cohesive application.

## Run locally

Requires Node.js 22+ and npm.

```sh
npm install
npm run dev
```

Open http://localhost:3000. On Windows with PowerShell execution-policy restrictions, use `npm.cmd` in place of `npm`.

```sh
npm test
npm run lint
npm run typecheck
npm run build
npm start
```

## Explore

- Overview: period selection (30/90/180 days), paid revenue vs the preceding equal-length period, chart, project/customer/ticket totals and CSV report.
- Projects: search, status filters, project details, admin progress updates. Progress maps to in progress / review (85%+) / completed (100%).
- Customers: create, edit, delete with confirmation, search, status filters, sorting and spreadsheet-safe CSV export. Deleting a customer also removes their related projects, tickets and invoices so analytics stay consistent.
- Documents: search, preview and download actual fictional text/CSV sample content. The proposal preview is text, not a generated PDF.
- Support: create tickets, search/filter and change status.
- Notifications: mark individual/all notifications read.
- Settings: save profile and digest preference, switch demo identities, simulate sign-out, reset records. Digest is a preference simulation; no emails are sent.
- Sidebar collapses on desktop and opens as a drawer on mobile. Theme switching persists independently of data resets.

Admin is the initial demo identity. Choose **Explore the demo**, the profile avatar, or Settings → Switch demo identity to simulate the Forma Studio client view. Client screens show only Forma records; customer mutations and project updates are hidden. **This is presentation logic, not authorization.** Every record remains accessible in the browser. Sign-out is simulated and resets on page reload; no passwords, sessions or credentials are used.

All edits use `northstar-demo-v1` in localStorage. Reset restores original data. Storage failures show an error; corrupt storage can be recovered through Reset. Data only persists on this device/origin and may be cleared by the browser. The initial loading state prevents an unsaved seed from overwriting stored changes.

## Data and structure

The reporting reference date is deliberately fixed at **29 October 2026** to keep the seeded portfolio stable over time. Revenue is the sum of paid invoice amounts within the selected trailing window; previous revenue uses the immediately preceding equal window. Chart buckets partition those same periods. Projects, active customers and unresolved ticket cards are current snapshot counts, so they do not vary by revenue period. Project budgets are not recognized revenue.

```
src/app/                 App Router entry, metadata, theme and responsive styles
src/components/          Workspace orchestration and reusable accessible primitives
src/lib/data.ts          Typed models, deterministic seed, analytics and CSV functions
src/lib/storage.ts       Browser repository boundary
src/test/                Shared test setup
```

To add a real backend, replace `loadData` / `saveData` with a typed API/repository and move mutations and authorization to the server. Replace the simulated identity state with an authentication provider's verified server session. Keep analytics as pure functions or move them to authorized database queries.

## Tests and accessibility

Vitest, Testing Library and jsdom cover revenue consistency, client scoping, cascading deletion, reset independence, CSV quoting/formula protection, storage corruption/persistence, modal focus/Escape, customer CRUD/reset and client ticket workflows. Accessible controls include labels, visible keyboard focus, a skip link, live status/error feedback, focus-trapped dialogs with restored focus, reduced motion support and semantic tables. The revenue chart has a textual accessible summary.

## Deployment

**Vercel:** import the repository, select Next.js, use `npm run build`, then deploy. No environment variables are required for this demo.

**Node hosting:** run `npm ci`, `npm run build`, and `npm start`. Bind a hosting platform's `PORT` if supplied; Next supports it. Configure health checks against `/`. To use a different local port, run `npm start -- --port 3066`.

This repository is prepared for deployment; it has not been published by the coding agent.

## Production security checklist

- Integrate a maintained authentication provider, verified server sessions, secure cookies and an explicit sign-out/session-expiration flow.
- Enforce tenant membership and permissions on every server request and database query. Never trust client IDs or client-side role state.
- Add a persistent database with migrations, tenant-scoped constraints, backups and tested restore procedures.
- Validate all inputs on the server, implement rate limits, CSRF protection appropriate to the chosen session mechanism, and audit security events.
- Use private object storage, content-type/size validation, malware scanning and short-lived authorized download links for uploads.
- Store secrets in hosting environment configuration. Never commit credentials. Set TLS and suitable CSP/security headers.
- Plan GDPR retention, consent where required, data export/deletion and EU processing agreements with infrastructure providers.
- Replace demo financial assumptions with audited billing sources, timezone/date rules and currency handling.
- Add server authorization tests, end-to-end browser tests and manual assistive-technology review before production.
