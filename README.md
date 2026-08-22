# DM-First CRM (#16)

An Instagram-native pipeline for businesses whose inbound is DMs, not forms. Sixth Type-3 (Pure
leadMarketing) build, and the simplest so far — confirmed via research that Instagram outreach in
`leadMarketing` has no Plan/Batch/quota scheduling model (unlike WhatsApp-Only CRM `#13` or
Warmup-as-a-Service `#14`), just three bolt-on fields directly on `Lead` (`instagramUrl`,
`instagramStatus`, `instagramDmAt`), phase-6-scoped and simulate-only there (no Instagram/Meta API
integration anywhere — a human manually DMs through the real Instagram app, then clicks a status
button).

`instagramStatus`'s 4-value enum (`PENDING | DM_SENT | SKIPPED | REPLIED`) is confirmed to actually
match the source's real code (unlike `WhatsAppBatchLead`'s, which had a hidden extra value) — ported
as-is.

**New here, not in the source**: `DmTemplate` + `GET /leads/:id/compose`. leadMarketing has no DM
message-copy builder at all (unlike WhatsApp's `builders.ts` or Warmup's `EmailTemplate`) — a human
composes the DM from scratch inside Instagram. Added a lightweight template + interpolation
(`{{name}}`, `{{city}}`, `{{country}}`, `{{category}}`) since a "DM-native pipeline" product needs at
least a starting point to personalize.

Instagram discovery (leadMarketing's `scripts/scrape-instagram.ts`, a Playwright scraper that finds
a lead's Instagram link on their own website) was **not** ported — it would drag in the same Docker/
headless-Chromium/Render weight as Audit Magnet CRM (`#11`) for a feature outside this card's stated
scope ("Instagram lead capture" via CSV import/manual entry, not auto-discovery).

## Local dev

Backend: `:3319`. Frontend: `:5193`.

```
npm install
npm run prisma:generate
npx prisma migrate dev --name init
npm run dev
```

```
cd frontend
npm install
npm run dev
```
