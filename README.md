# LejersNet – Members Area (Prototype)

A working, responsive web-app prototype for **LejersNet**, a digital membership service for tenants in Denmark. This is the logged-in member area, styled after the production brand at [lejersnet.com](https://www.lejersnet.com) and the mobile prototype.

All UI copy is in **English**.

## What's inside

- **Auth** – sign up, sign in, forgot/reset password, Google & Facebook social login (mocked), block/unblock members, "Refresh from Wix" sync action.
- **Home** – greeting, navy hero with "Become a Member Now" / "Contact", housing directory shortcut, Documents & Pictures stat cards, and a "Needs attention" list of missed inspection sections.
- **Addresses (Housing Directory)** – list, search, add, edit, delete (with confirmation), each with Move-In / Move-Out actions.
- **Move-In / Move-Out Upload** – category chips (Living Room, Kitchen, Bathroom, Bedroom, Balcony, Keys/Meters, Lease Contract, Other documents), camera + file upload with previews, previous uploads grouped by category, full-screen preview, download, delete, and a Move-In vs Move-Out side-by-side comparison.
- **Documents tab** – keyword search + category filter, grouped by address, preview / download / delete.
- **Pictures tab** – search + filter, "Grouped by address" / "All pictures" toggle, masonry grid, multi-select delete, full-screen swipe viewer with Move-In / Move-Out badges.
- **Profile tab** – avatar, bio, public info, editable personal info / email / password, copyable profile URL, privacy toggle (Private / Public), blocked members list with Unblock, My Subscriptions, My Addresses, My Orders, sign out.
- **Subscription flow** – plan card (49 DKK / month, no commitment, 14-day satisfaction guarantee, 5 benefits) → checkout (billing + payment + order summary) → processing → success / failure. On success a subscription and order are created.
- **Contact** – email, phone, support hours, and a message form.
- **UI system** – loading skeletons, empty states, toasts, confirmation dialogs, mobile bottom tab bar + desktop left sidebar (Home, Documents, Pictures, Profile).

## Design system

- Primary navy `#0B1F4B`, navy dark `#081637`, navy light `#1B3270`
- Accent `#3B82F6`, success `#16A34A`, warning `#F59E0B`, danger `#DC2626`
- Background `#F5F7FB`, card `#FFFFFF`, border `#E5E9F2`
- Inter font, 16px card radius, 8px spacing grid, soft shadows
- Mobile-first; desktop sidebar appears at ≥1024px

## Tech stack

- React + TypeScript + Vite
- Tailwind CSS
- React Router
- TanStack React Query (provider wired up; data layer is currently an in-memory store with `localStorage` persistence so the prototype is fully clickable without a backend)
- lucide-react icons

## Getting started

```bash
npm install
npm run dev      # start dev server
npm run build    # production build
npm run typecheck
```

The app starts on a sign-in screen. Use any email + password (6+ chars) to sign in, or click Google / Facebook for instant mock social login. Demo data is seeded automatically: 2 addresses, sample pictures & documents, 1 active subscription, 2 orders, and 1 blocked member.

## Environment variables

The prototype runs without any backend, but the production app expects these (referenced behind the adapter interfaces in `src/lib/store.ts`):

```env
# Wix Members API / OAuth
WIX_CLIENT_ID=
WIX_CLIENT_SECRET=
WIX_REDIRECT_URI=

# Social login
GOOGLE_CLIENT_ID=
FACEBOOK_APP_ID=

# Payments (Stripe test mode)
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Storage (S3-compatible)
S3_BUCKET=
S3_REGION=
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
```

## What's mocked

- **Wix Members API** – auth, profile sync, and member block/unblock are mocked in `src/lib/store.ts` behind an adapter interface (`authApi`, `profileApi`, `blockApi`) so real Wix endpoints can replace them later.
- **Payment provider** – `SubscribePage` uses a mock Stripe test-mode flow. Card `4242 4242 4242 4242` succeeds; any other number fails. Replace with a real `stripe-js` integration behind the same interface.
- **File storage** – uploads are stored as data URLs in `localStorage` for the prototype. Swap `mediaApi` for signed-URL S3 uploads in production.
- **Database** – no external DB is required for the prototype. The data model (`users`, `blocks`, `subscriptions`, `orders`, `addresses`, `inspections`, `categories`, `media`) is defined in `src/types.ts` and seeded in `src/lib/seed.ts`; map these 1:1 to PostgreSQL tables when wiring Supabase or a Node/Express backend.
- **Social login** – Google and Facebook buttons simulate a successful OAuth round-trip.

## Notes on security (production checklist)

- Enforce signed URLs and encryption at rest for uploaded files.
- Validate file type and size on the server (the client picker is advisory only).
- Rate-limit auth routes (sign in, forgot password).
- Implement row-level security so only the owner and LejersNet staff can access a member's files.
- Verify OAuth `state` and ID-token signatures for social login.
- Confirm Stripe webhook signatures before acting on payment events.
