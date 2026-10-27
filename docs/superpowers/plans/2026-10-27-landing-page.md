# VOYBYCT Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and ship the VOYBYCT landing page (from Figma) as a static Next.js site, with a contact modal and a Behance link, structured to grow into the main site.

**Architecture:** The Next.js App Router renders one statically generated page made of small presentational components. The only dynamic piece is `POST /api/contact`, which validates input and delegates delivery to `sendContactMessage()`; delivery stays unconfigured (503) until an inbox is chosen.

**Tech Stack:** Next.js (latest stable, App Router), TypeScript, CSS Modules, `next/font`, `next/image`, Vitest, ESLint, npm, Vercel.

**Spec:** `docs/superpowers/specs/2026-10-27-landing-page-design.md`

## Global Constraints

- No Tailwind, no GSAP/Lenis, no third-party form service, no CMS.
- Styling: CSS Modules per component + `app/globals.css` holding design tokens as CSS variables.
- The landing page must be statically generated (`○ /` in `next build` output).
- Figma source: file `ibQ44dnSfDhARHzcwV1ywO`, frame node `1:3` ("Landing Page", 1200px wide).
- Copy (verbatim): ticker "the page is under design maintenance |"; tagline "an antidote to bland"; buttons "Get in touch" / "check out our work" (rendered uppercase via CSS); about paragraph exactly as in Figma node `2003:14`.
- Unconfigured-contact message (verbatim): "The contact form isn't connected yet — please reach out on Behance for now."
- Page title: "VOYBYCT — an antidote to bland".
- Behance link: `target="_blank" rel="noopener noreferrer"`; URL lives only in `lib/site.ts` (placeholder `https://www.behance.net/` until provided).
- Message max length: 5000 characters. All three fields required.
- Respect `prefers-reduced-motion`. No horizontal scroll at 375px.

## Review Focus

- Whitespace-only fields (`"   "`) must be rejected as empty, not accepted → tested in Task 2.
- Message exactly 5000 chars accepted, 5001 rejected → tested in Task 2.
- Malformed / non-JSON request body must return 400, not crash with 500 → tested in Task 3.
- Honeypot filled must return 200 without sending (bots get no signal) → tested in Task 3.
- Double-clicking submit must not send twice; the submit button is disabled while submitting → checked in Task 5's manual verification.

---

### Task 1: Scaffold the project

**Files:**
- Create: Next.js app at repo root (`app/`, `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `.gitignore`)
- Create: `vitest.config.ts`, `lib/site.ts`, `.env.example`
- Delete: create-next-app boilerplate (default `page.module.css`, demo SVGs in `public/`)

**Interfaces:**
- Produces: `npm run dev | build | lint | test` scripts; `@/` path alias to the repo root; `site` from `lib/site.ts`:
  ```ts
  export const site = { name: "VOYBYCT", title: "VOYBYCT — an antidote to bland",
    description: string /* about paragraph */, url: string /* "https://voybyct.vercel.app" placeholder */,
    behanceUrl: "https://www.behance.net/" } as const;
  ```

- [ ] **Step 1:** Scaffold into a temporary directory (create-next-app refuses a non-empty dir because of `docs/`): `npx create-next-app@latest ../voybyct-tmp --ts --eslint --app --no-tailwind --no-src-dir --import-alias "@/*" --use-npm --turbopack --yes`, then move its contents (including dotfiles, excluding `.git`) into the repo root and delete `../voybyct-tmp`.
- [ ] **Step 2:** `npm i -D vitest`; add a `"test": "vitest run"` script; `vitest.config.ts` with `environment: "node"` and the `@` alias resolving to the repo root.
- [ ] **Step 3:** Strip the boilerplate: `app/page.tsx` renders `<main />`, `app/globals.css` keeps only a minimal reset, and the demo assets are removed.
- [ ] **Step 4:** Create `lib/site.ts` (above) and `.env.example` documenting `CONTACT_TO_EMAIL=` and `RESEND_API_KEY=`, each with a one-line comment.
- [ ] **Step 5:** Verify: `npm run build` succeeds, `npm run lint` is clean, and `npm test` exits 0 with "No test files found" (pass `--passWithNoTests` in the script).
- [ ] **Step 6:** Commit: `chore: scaffold Next.js app with Vitest`.

### Task 2: Contact validation and sender

**Files:**
- Create: `lib/contact.ts`
- Test: `lib/contact.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type ContactData = { name: string; email: string; message: string };
  export type ContactErrors = Partial<Record<keyof ContactData, string>>;
  export type ValidationResult =
    | { ok: true; data: ContactData; isSpam: boolean }
    | { ok: false; errors: ContactErrors };
  export const MESSAGE_MAX = 5000;
  export function validateContact(input: unknown): ValidationResult;
  export class ContactNotConfiguredError extends Error {}
  export function isContactConfigured(env?: Record<string, string | undefined>): boolean;
  export async function sendContactMessage(data: ContactData, env?: Record<string, string | undefined>): Promise<void>;
  ```
  The honeypot field is named `company`; non-empty means `isSpam: true`. Values are trimmed before checks and returned trimmed.

- [ ] **Step 1: Write failing tests** in `lib/contact.test.ts`:
  - `validateContact({name:"Ada", email:"ada@x.co", message:"Hi"})` → `{ok:true, data:{…}, isSpam:false}`
  - `validateContact({name:"  Ada ", email:" ada@x.co ", message:" Hi "}).data` equals the trimmed values
  - `validateContact({name:"   ", email:"ada@x.co", message:"Hi"})` → `ok:false`, `errors.name` defined
  - `validateContact({name:"Ada", email:"not-an-email", message:"Hi"})` → `errors.email` defined
  - message of `"a".repeat(5000)` → `ok:true`; `"a".repeat(5001)` → `errors.message` defined
  - `validateContact(null)` and `validateContact("str")` → `ok:false` with all three errors
  - `validateContact({...valid, company:"bot"})` → `ok:true, isSpam:true`
  - `isContactConfigured({})` → `false`; with both `CONTACT_TO_EMAIL` and `RESEND_API_KEY` set → `true`
  - `sendContactMessage(valid, {})` rejects with `ContactNotConfiguredError`
- [ ] **Step 2:** Run `npm test` → FAIL (module not found).
- [ ] **Step 3:** Implement `lib/contact.ts`. Email check: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. `sendContactMessage` throws `ContactNotConfiguredError` when not configured; when configured it throws `Error("Email delivery not implemented")` (the provider is wired up later, out of scope).
- [ ] **Step 4:** Run `npm test` → all pass.
- [ ] **Step 5:** Commit: `feat: add contact validation and sender stub`.

### Task 3: `POST /api/contact` route

**Files:**
- Create: `app/api/contact/route.ts`
- Test: `app/api/contact/route.test.ts`

**Interfaces:**
- Consumes: `validateContact`, `sendContactMessage`, `ContactNotConfiguredError` from `@/lib/contact`.
- Produces: `export async function POST(req: Request): Promise<Response>` with JSON responses:
  | Case | Status | Body |
  |---|---|---|
  | body not valid JSON | 400 | `{ error: "invalid_json" }` |
  | validation failed | 400 | `{ error: "invalid", errors: ContactErrors }` |
  | honeypot filled | 200 | `{ ok: true }` (sender NOT called) |
  | not configured | 503 | `{ error: "not_configured" }` |
  | sender threw other error | 500 | `{ error: "send_failed" }` |
  | sent | 200 | `{ ok: true }` |

- [ ] **Step 1: Write failing tests** that build `new Request("http://x/api/contact", {method:"POST", body})` and mock `sendContactMessage` with `vi.mock("@/lib/contact", async (orig) => ({...await orig(), sendContactMessage: vi.fn()}))`. Cover every row of the table, and assert that the sender is not called for the honeypot, invalid and invalid_json cases.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Implement the route. Wrap `req.json()` in try/catch for `invalid_json`; log unexpected errors with `console.error`.
- [ ] **Step 4:** `npm test` → all pass.
- [ ] **Step 5:** Commit: `feat: add contact API route`.

### Task 4: Design tokens, fonts and assets from Figma

**Files:**
- Create: `public/images/*` (hero, wordmark, V logo, symbols, plus the two unused hero alternates under `public/images/unused/`)
- Modify: `app/globals.css`, `app/layout.tsx`

**Interfaces:**
- Produces CSS variables in `:root` that the components use: `--color-black`, `--color-white`, `--color-red`, `--color-text`, `--font-display`, `--font-body`, `--ticker-height`, `--actionbar-height`. Exact values come from Figma.
- Produces image paths: `/images/hero.jpg`, `/images/wordmark.svg|png`, `/images/v-logo.svg|png`, `/images/symbols.svg|png`, `/images/arrow-down-right.svg`.

- [ ] **Step 1:** Load the figma-design-to-code guidance, then call `get_design_context` on node `1:3` (and the children as needed: `1:5`, `1:25`, `2003:23`, `2004:60`, `2004:43`) to get the font families, sizes, letter-spacing, colours and asset URLs.
- [ ] **Step 2:** Download the assets into `public/images/` with descriptive names (above). Export the hero at least 2400px wide and compress it; keep it under 500KB as WebP or JPG.
- [ ] **Step 3:** Load the fonts with `next/font/google` (or `next/font/local` if they aren't Google fonts; put the files in `app/fonts/`), exposed as `--font-display` / `--font-body` on `<html>`.
- [ ] **Step 4:** Write the tokens into `app/globals.css`; set the `body` background and colour. Do not use `overflow-x: hidden` on `html`/`body` to mask overflow; fix it at the source.
- [ ] **Step 5:** Verify: `npm run build` passes, and the fonts load in `npm run dev` (check the Network tab).
- [ ] **Step 6:** Commit: `feat: add design tokens, fonts and Figma assets`.

### Task 5: Landing page sections and contact modal

**Files:**
- Create: `components/Ticker/Ticker.tsx` + `.module.css`
- Create: `components/Hero/Hero.tsx` + `.module.css`
- Create: `components/About/About.tsx` + `.module.css`
- Create: `components/ActionBar/ActionBar.tsx` + `.module.css` (client component)
- Create: `components/ContactModal/ContactModal.tsx` + `.module.css` (client component)
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `site` from `@/lib/site`; `POST /api/contact` (Task 3 response table); `MESSAGE_MAX` from `@/lib/contact`; the tokens and images from Task 4.
- Produces: `<ContactModal open: boolean; onClose: () => void />`. `ActionBar` owns the `open` state and renders the modal.

- [ ] **Step 1:** `Ticker` — a server component in a `<header>`. Render the phrase enough times to fill the width, duplicated once, and animate `translateX(0 → -50%)` linearly and infinitely. Under `prefers-reduced-motion: reduce`, set `animation: none`. Add `aria-label` with the phrase once and `aria-hidden` on the repeated track.
- [ ] **Step 2:** `Hero` — `next/image` with `fill`, `priority`, `sizes="100vw"`, `object-fit: cover`; the wordmark as an `<h1>` (image with `alt="VOYBYCT"`) on the left and the tagline `<p>` on the right, matching Figma positions at 1200px; stack them centered below 768px.
- [ ] **Step 3:** `About` — a `<section>` with the V logo, the paragraph (`site.description`) and the symbols image; it's a two-column grid on desktop and stacks below 768px.
- [ ] **Step 4:** `ActionBar` — a `<footer>` with two equal halves and a 1px divider. The left is a `<button>` that opens the modal; the right is an `<a href={site.behanceUrl}>`; both have the arrow icon (decorative, `alt=""`).
- [ ] **Step 5:** `ContactModal` — a native `<dialog>` driven by `showModal()`/`close()` in an effect on `open`. It has a white centered card, a dimmed `::backdrop`, a × button, and the overlay-click closes it (the click target is the dialog itself). Escape closes it through the `cancel` event, which calls `onClose`. Fields: name, email, message (`maxLength={MESSAGE_MAX}`), and a visually hidden `company` input with `tabIndex={-1}` and `autoComplete="off"`. States: `idle | submitting | success | error`. The submit button is disabled while `submitting`. A 503 shows the verbatim unconfigured message; a 400 shows field errors; other failures show a generic retry message. Inputs keep their values on error. Focus returns to the trigger on close (native `<dialog>` behaviour; verify it).
- [ ] **Step 6:** Compose `app/page.tsx`: `<Ticker/> <main><Hero/><About/></main> <ActionBar/>`.
- [ ] **Step 7: Manual verification** in the browser at 1440, 1024, 768 and 375px against the Figma screenshot:
  - The ticker scrolls (and is static with reduced motion emulated).
  - The modal opens and closes via ×, Escape and an overlay click, and focus returns to "Get in touch".
  - Submitting empty fields shows field errors; submitting valid data shows the unconfigured message, and double-clicking sends only one request (Network tab).
  - The Behance link opens in a new tab.
  - There's no horizontal scroll at 375px.
- [ ] **Step 8:** `npm run build` shows `○ /` (static); `npm run lint` is clean; `npm test` passes.
- [ ] **Step 9:** Commit: `feat: build landing page sections and contact modal`.

### Task 6: SEO metadata, icons, robots and sitemap

**Files:**
- Modify: `app/layout.tsx`
- Create: `app/robots.ts`, `app/sitemap.ts`, `app/icon.png` (from the V logo), `app/opengraph-image.jpg` (1200×630 crop of the hero)

**Interfaces:**
- Consumes: `site` from `@/lib/site`.

- [ ] **Step 1:** In `layout.tsx`, export `metadata` with `metadataBase: new URL(site.url)`, `title: site.title`, `description: site.description`, `openGraph` (type `website`, siteName) and `twitter` (`summary_large_image`). Set `<html lang="en">`.
- [ ] **Step 2:** `robots.ts` allows everything and points to `${site.url}/sitemap.xml`; `sitemap.ts` lists `/`.
- [ ] **Step 3:** Add `icon.png` and `opengraph-image.jpg`.
- [ ] **Step 4:** Verify: `npm run build`, then `npm start`, and check that `/robots.txt`, `/sitemap.xml` and the page `<head>` contain the title, description, `og:image` and icon links.
- [ ] **Step 5:** Commit: `feat: add SEO metadata, icons, robots and sitemap`.

### Task 7: Final checks and push

**Files:**
- Create: `README.md` (replace the create-next-app one) covering what the project is, `npm` scripts, env vars, how to enable contact delivery, and Vercel deploy notes.

- [ ] **Step 1:** Write the README.
- [ ] **Step 2:** Run `npm run lint && npm test && npm run build` — all green.
- [ ] **Step 3:** Commit: `docs: add project README`.
- [ ] **Step 4:** Push the branch: `git push -u origin landing-page`. (Vercel import and merging to `main` are done by the user.)
