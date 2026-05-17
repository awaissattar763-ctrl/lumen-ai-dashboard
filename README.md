# Lumen — AI SaaS Dashboard

A modern, Apple-inspired AI SaaS dashboard built with **Next.js 14**, **Tailwind CSS**, and **shadcn/ui** components.

## Design philosophy

- **Minimal** — generous whitespace, restrained color, considered typography
- **White background** with subtle red (`hsl(0 72% 51%)`) accents
- **Rounded cards** (24–28px radii) and soft Apple-style shadows
- **Display typography** — Fraunces serif paired with Inter body
- **Premium feel** — frosted-glass nav, animated hero, micro-interactions

## Pages

| Route | Description |
| --- | --- |
| `/` | Marketing home with hero, features, workflow showcase, CTA |
| `/dashboard` | Workspace with stats, activity chart, document list, recent queries |
| `/pricing` | Three-tier pricing with monthly/yearly toggle and FAQ |
| `/login` | Split-screen sign-in with OAuth providers and testimonial panel |
| `/upload` | PDF drag-and-drop with simulated upload + indexing progress |

## Getting started

```bash
# Install dependencies
npm install

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS with custom design tokens
- **Components:** shadcn/ui (Button, Card, Input, Label, Badge, Progress, Separator, Avatar)
- **Icons:** Lucide
- **Charts:** Recharts
- **Fonts:** Fraunces (display) + Inter (body) + JetBrains Mono (code)

## Project structure

```
.
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home
│   ├── globals.css         # Design tokens, fonts
│   ├── dashboard/page.tsx
│   ├── pricing/page.tsx
│   ├── login/page.tsx
│   └── upload/page.tsx
├── components/
│   ├── navbar.tsx          # Frosted-glass top nav
│   ├── footer.tsx
│   ├── logo.tsx
│   └── ui/                 # shadcn primitives
└── lib/utils.ts
```

## Customization

- **Brand color:** edit `--primary` in `app/globals.css`
- **Radius:** edit `--radius` (default `1rem`)
- **Fonts:** swap the Google Fonts import at the top of `globals.css`
