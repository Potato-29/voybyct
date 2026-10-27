# VOYBYCT

Landing page for VOYBYCT, a design studio — "an antidote to bland". It is live while the
main website is being designed, and the codebase is set up to grow into that site.

Built with Next.js (App Router), TypeScript and CSS Modules. The page is statically
generated; the only server code is the contact form endpoint.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

| Script | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests |

## Project layout

```
app/                    routes, layout, metadata (icon, OG image, robots, sitemap)
  api/contact/route.ts  POST endpoint for the "Get in touch" form
components/             Ticker, Hero, About, ActionBar, ContactModal
lib/site.ts             site-wide links and copy (contact email, title, description)
lib/contact.ts          form validation and sendContactMessage()
public/images/          assets exported from Figma
docs/superpowers/       design spec and implementation plan
```

Design source: Figma file `ibQ44dnSfDhARHzcwV1ywO`, frame "Landing Page".

## Contact form

The form posts to `/api/contact`, which validates the input and calls
`sendContactMessage()` in `lib/contact.ts`. Delivery is **not connected yet**: until it is,
the endpoint responds 503 and the form tells visitors to email the studio instead.

To enable it:

1. Implement delivery inside `sendContactMessage()` (for example with [Resend](https://resend.com)).
2. Set the environment variables from `.env.example` (`CONTACT_TO_EMAIL`, `RESEND_API_KEY`)
   locally in `.env.local` and in the Vercel project settings.

## Placeholders to replace

- `lib/site.ts` → `url` (production domain).

## Deploying

Import the GitHub repo into [Vercel](https://vercel.com/new) — no configuration is needed.
Every push to `main` deploys to production; other branches get preview URLs.
