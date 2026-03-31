# PROJECT B — Web

> Handcrafted accessories & lifestyle goods.  
> Industrial minimal e-commerce built with Next.js 14.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Kakao, Naver, Google)
- **Images**: Cloudflare R2
- **Payment**: Tosspayments
- **Deploy**: Vercel

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy env template
cp .env.example .env.local

# 3. Fill in environment variables in .env.local

# 4. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── layout.tsx        # Root layout (fonts, header, footer)
│   ├── page.tsx          # Home page
│   ├── shop/             # Product listing
│   ├── product/          # Product detail [slug]
│   ├── brand/            # Brand story
│   ├── magazine/         # Blog/magazine
│   ├── store-location/   # Offline store info
│   ├── reviews/          # Photo reviews
│   ├── cs/               # Customer service
│   ├── cart/              # Shopping cart
│   ├── checkout/         # Checkout flow
│   ├── order-complete/   # Order confirmation
│   ├── mypage/           # My page (orders, wishlist)
│   ├── auth/             # Login / Signup
│   └── notice/           # Notice & Events
├── components/
│   ├── ui/               # Base UI components (Button, Input, etc.)
│   ├── layout/           # Header, Footer, Navigation
│   ├── shop/             # Product cards, filters, etc.
│   └── common/           # Shared components
├── lib/
│   ├── supabase/         # Supabase client (client, server, middleware)
│   └── utils.ts          # Utility functions
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── constants/            # Site config, navigation, etc.
└── styles/
    └── globals.css       # Design system + Tailwind
```

## Design System

**Industrial Minimal** — monochrome, sharp corners, wide letter-spacing, uppercase headings.

- Palette: `#0A0A0A` (Jet Black) → `#FAFAFA` (Snow)
- Heading: Archivo (geometric sans-serif)
- Body: Pretendard (Korean optimized)
- Corners: `border-radius: 0` everywhere
- Product images: 1:1 square ratio

## Branch Strategy

| Branch | Purpose | Deploy |
|--------|---------|--------|
| `main` | Production | Vercel Production |
| `develop` | Integration | Vercel Preview |
| `feature/*` | Feature dev | PR Preview |

## Scripts

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run lint         # ESLint
npm run type-check   # TypeScript check
```
