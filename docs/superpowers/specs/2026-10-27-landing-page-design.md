# VOYBYCT Landing Page — Design Spec

Date: 2026-10-27
Status: Draft, awaiting review

## Purpose

VOYBYCT is a design studio. While the main website is being designed, they want a
single landing page live on the web. The project should be set up so the main site
can be built in the same codebase later without migrating.

Success criteria:
- The landing page matches the Figma frame "Landing Page" (file `ibQ44dnSfDhARHzcwV1ywO`, node `1:3`).
- It is fully static and fast, with correct SEO and social-preview metadata.
- "Get in touch" opens a working contact modal; "Check out our work" opens Behance.
- It works on mobile, tablet and desktop.
- The repo structure has clear room for future pages (`/work`, `/about`, etc.).

## Decisions

| Area | Choice |
|---|---|
| Framework | Next.js (latest stable, App Router), TypeScript |
| Rendering | Landing page statically generated at build time |
| Styling | CSS Modules + one global stylesheet with design tokens as CSS variables |
| Fonts | `next/font` (exact families taken from Figma during implementation) |
| Images | `next/image`, assets exported from Figma into `public/` |
| Animation | Plain CSS for now; GSAP/Lenis deferred until the main site needs them |
| Hosting | Vercel, auto-deploying from the GitHub repo `voybyct` |
| Package manager | npm |
| Linting | ESLint (Next.js config) |

Not chosen: Tailwind (the design is custom and editorial; tokens + CSS Modules is enough),
third-party form services (an internal API route keeps us in control).

## Page Layout (from Figma, 1200px desktop frame)

1. **Ticker strip** — black bar at the very top, white uppercase small text repeating
   "the page is under design maintenance |". Scrolls horizontally in an infinite loop
   (CSS animation). Respects `prefers-reduced-motion` (static when reduced).
2. **Hero** — full-width red image (~546px tall on desktop). The VOYBYCT wordmark sits
   on the left, the tagline "an antidote to bland" on the right, both vertically centered.
   The Figma frame contains three stacked hero images ("Surreal Portal Scene 1", "Surreal
   Portal Scene 2", "Stairway to the Moon"); only the visible one ships. The others are
   exported and kept in `public/` but not used, pending a decision from the client.
3. **About section** — white background. The V logo mark at top left, the description
   paragraph below it, and the three-symbol graphic on the right.
4. **Action bar** — black bar split into two equal halves by a 1px divider:
   - Left: "GET IN TOUCH ↘" → opens the contact modal.
   - Right: "CHECK OUT OUR WORK ↘" → opens the Behance profile in a new tab
     (`target="_blank" rel="noopener noreferrer"`).

### Responsive behavior

- Desktop (≥1024px): matches Figma.
- Tablet/mobile: the hero keeps the image with the wordmark and tagline stacked; the about
  section stacks vertically (logo, paragraph, symbols); the action bar halves stack or
  stay side by side with smaller type (whichever reads better; verify at 375px).
- No horizontal page scroll at any width.

## Contact Modal

- Opens from "Get in touch". Centered card with a white background over a dimmed overlay.
- Fields: Name (required), Email (required, valid format), Message (required, max 5000 chars).
- Hidden honeypot field to filter basic spam bots.
- Close via the × button, Escape key, or clicking the overlay. Focus is trapped inside
  while open and returns to the trigger button on close. Uses the native `<dialog>` element.
- States: idle → submitting (button disabled) → success message, or error message with
  the form contents preserved.

### Submission flow

1. The client posts JSON to `POST /api/contact`.
2. The route handler validates input server-side (same rules as above) and returns 400
   with field errors if it is invalid.
3. A valid submission is passed to `sendContactMessage()` in `lib/contact.ts`, the single
   place where delivery happens.
4. **Delivery is intentionally unconfigured for now** (the destination inbox is undecided).
   If `CONTACT_TO_EMAIL` or the provider key is not set, the handler returns 503, and the
   modal shows: "The contact form isn't connected yet — please reach out on Behance for now."
5. Later, delivery is implemented inside `sendContactMessage()` (e.g. Resend) and enabled by
   setting environment variables in Vercel. No UI changes are needed.

## Configuration

`lib/site.ts` holds the site-wide constants:
- `behanceUrl` — placeholder until the client provides the real URL.
- Site name, description, and canonical URL for metadata.

`.env.example` documents `CONTACT_TO_EMAIL` and the future provider API key.

## SEO & Metadata

- Title: "VOYBYCT — an antidote to bland"; description from the about paragraph.
- Open Graph and Twitter card using the hero image.
- Favicon/app icon from the V logo mark.
- `robots.ts` and `sitemap.ts` via the Next.js metadata routes.
- `lang="en"`, semantic landmarks (`header`, `main`, `section`, `footer`), alt text on images.

## Project Structure

```
app/
  layout.tsx            fonts, metadata, global CSS
  page.tsx              landing page (composes components)
  globals.css           design tokens + reset
  robots.ts, sitemap.ts
  api/contact/route.ts  form endpoint
components/
  Ticker/  Hero/  About/  ActionBar/  ContactModal/   (each: .tsx + .module.css)
lib/
  site.ts               links, copy, metadata constants
  contact.ts            validation + sendContactMessage()
public/
  images/               assets exported from Figma
docs/superpowers/       specs and plans
```

## Testing

- Unit tests (Vitest) for the contact validation and the route handler responses
  (400 invalid, 503 unconfigured, 200 when the sender succeeds via a stub).
- A manual visual check against Figma at 1440, 1024, 768 and 375px in the browser.
- `npm run build` and `npm run lint` pass with no errors.

## Out of Scope

- Main website pages, CMS, GSAP/Lenis animation.
- Choosing the inbox and email provider (deferred).
- Custom domain setup (done in Vercel once the client has the domain).

## Open Items (not blocking setup)

- Behance URL.
- Destination inbox for contact messages.
- Which hero image to use long-term (and whether the others rotate).
- GitHub remote: the local repo currently has no remote configured; connect it to
  `github.com/<owner>/voybyct` before the first push.
