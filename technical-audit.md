# Velora Pack — Technical Audit Report

**Date:** July 15, 2026  
**Repository:** velora-pack  
**Audit Scope:** Full codebase inspection (no modification)

---

## 1. Current Project Architecture

```
velora-pack (Next.js App Router)
├── app/                    # Pages, components, API routes
│   ├── page.tsx            # Landing page (public)
│   ├── login/              # Customer login
│   ├── register/           # Customer registration
│   ├── api/auth/[...nextauth]/  # NextAuth handler (proxy to external backend)
│   ├── api/leads/          # Lead creation endpoint
│   ├── api/products/       # Product listing proxy
│   └── components/         # UI components (sections, auth, quotation)
├── components/ui/          # shadcn/ui primitives
├── lib/                    # Auth config, JWT helpers, Prisma client, utils
├── hooks/                  # Custom hooks (use-quotation-form)
├── types/                  # TypeScript type augmentation (next-auth)
├── prisma/                 # Schema + migrations
└── app/generated/prisma/   # Generated Prisma client (non-standard output dir)
```

**Architecture Pattern:** Hybrid frontend + backend proxy.

- **External backend** (`NEXT_PUBLIC_BACKEND_URL`) handles: authentication API, admin dashboard, user management.
- **This repo** handles: public landing page, customer auth UI, quotation request flow, customer registration.
- Prisma is configured but the primary data source for products is the external backend (via proxy).
- Leads are created in the local database AND referenced on the external backend.

**Key architectural decision:** The system is split into two separate applications sharing one database. This creates tight coupling and a single point of failure (the external backend must be running for auth to work).

---

## 2. Existing Features and Implementation Status

| Feature                                                                                        | Status       | Notes                                                      |
| ---------------------------------------------------------------------------------------------- | ------------ | ---------------------------------------------------------- |
| Landing page (hero, products, capabilities, certifications, industries, metrics, process, CTA) | ✅ Complete  | Well-structured sections with motion/react animations      |
| Customer registration (User + CustomerProfile in transaction)                                  | ✅ Complete  | Uses bcryptjs, email normalization, referral code support  |
| Customer login                                                                                 | ✅ Complete  | NextAuth Credentials Provider, proxies to external backend |
| Role-based redirect (ADMIN → /admin, CUSTOMER → /)                                             | ✅ Complete  | Login form checks role after auth                          |
| Navbar auth state (login/register vs logout/dashboard)                                         | ✅ Complete  | Shows different UI based on session                        |
| Quotation request modal                                                                        | ✅ Complete  | Product dropdown from DB, validation, WhatsApp integration |
| Product preselection from detail page                                                          | ✅ Complete  | Via `selectedProductId` context                            |
| Lead creation in DB                                                                            | ✅ Complete  | Via `/api/leads` POST                                      |
| WhatsApp message generation                                                                    | ✅ Complete  | Structured message, opens WhatsApp                         |
| Auth link between frontend & backend                                                           | ❌ Broken    | Todo explicitly states login required twice                |
| SALES role permission scoping                                                                  | ❌ Missing   | Not implemented                                            |
| Lead saved before WhatsApp redirect                                                            | ❌ Complete? | Need to verify order of operations                         |
| Fallback "Open WhatsApp" button                                                                | ❌ Missing   | No fallback if popup blocked                               |
| Customer account page (/account)                                                               | ❌ Missing   | Not implemented                                            |
| Quotation history (/account/quotations)                                                        | ❌ Missing   | Not implemented                                            |
| Admin dashboard pages                                                                          | 🔄 External  | Exist in separate backend repo                             |
| Blog system                                                                                    | 🔄 Partial   | Schema exists, no frontend implementation                  |

---

## 3. Authentication Flow

```
Login Flow:
┌──────────┐     POST /api/auth/login     ┌──────────────────┐
│  Browser │ ──────────────────────────→  │  External Backend │
│ (NextAuth) │ ←────────────────────────── │  (JWT auth)       │
└──────────┘     { user, accessToken }    └──────────────────┘
     │
     ▼
  JWT stored in NextAuth session
     │
     ▼
  Check role from /api/auth/session
     │
     ├── CUSTOMER → redirect to /
     ├── ADMIN     → redirect to EXTERNAL /admin
     ├── OWNER     → redirect to EXTERNAL /admin
     └── SALES     → redirect to EXTERNAL /admin

Registration Flow:
┌──────────┐     POST /api/auth/register  ┌──────────────────┐
│  Browser │ ──────────────────────────→  │  External Backend │
│ (register) │ ←────────────────────────── │                  │
└──────────┘     { success, user }        └──────────────────┘
```

**Critical observation:** NextAuth is used client-side (`signIn`, `useSession`) but authentication is completely delegated to the external backend. This means:

1. If the external backend is down, nobody can log in.
2. The session cookie from NextAuth is valid locally, but tokens must also work on the external backend.
3. The `lib/jwt.ts` helper exists but is NOT used in the auth flow — NextAuth manages its own JWT encoding.
4. The todo explicitly notes: _"auth blom konek antara backend dan frontend, jadi sementara hrs login 2 kali karna dianggep beda user"_ — meaning users currently need to log in separately on the frontend and backend because sessions are not shared.

---

## 4. API Integration

### `/api/products` (GET)

- Proxies to `NEXT_PUBLIC_BACKEND_URL/api/products`
- Returns JSON with `products` array
- No caching, no error transformation
- Called on every modal open

### `/api/leads` (POST)

- Accepts customer data, product selection, quotation details
- First fetches product from external backend to validate
- Creates lead in local database
- Returns lead data with WhatsApp message

### `/api/auth/[...nextauth]` (NextAuth handler)

- Standard NextAuth API route
- All auth logic delegated to external backend

### No other API routes exist

- No customer profile update endpoint
- No quotation history endpoint
- No blog endpoints

---

## 5. UI/UX Consistency

**Strengths:**

- Consistent color tokens (velora-navy, velora-blue, film-blue, velora-bg, velora-border, success, error)
- Responsive design (mobile-first with sm/md/lg breakpoints)
- shadcn/ui components used consistently (Button, Input, Dialog, Select, Textarea, Label, RadioGroup)
- Custom animations with motion/react (fade-up, slide-in, zoom)
- Form validation with clear error messages and field-level errors
- Loading states with Loader2 spinner
- WhatsApp FAB with safe-area-aware positioning

**Issues:**

- No loading skeletons for product fetch during modal open
- No empty state for product dropdown (if API fails, dropdown is empty with no feedback)
- Login error message is generic ("Invalid email or password") — no distinction between wrong credentials vs backend down
- Customer redirect after login goes to `/` instead of `/quotation` (as specified in AGENTS.md)
- No toast/notification system for success states
- Some sections use hardcoded data (trust indicators, avatars, metrics) that could come from DB

---

## 6. Code Quality

### What's Good

- TypeScript throughout, no `any` usage observed
- Clean separation of concerns (components, hooks, lib, api routes)
- Proper form validation with touched/error tracking
- Consistent naming conventions
- cn() utility for className merging
- Form data is properly typed with discriminated unions

### Issues Found

**1. Missing `useEffect` dependency:**

```typescript
// request-quotation-modal.tsx
useEffect(() => {
  if (!open) return;
  if (!selectedProductId) return;
  setField("productId", selectedProductId);
}, [open, selectedProductId, setField]);
```

`setField` is wrapped in `useCallback` so it won't cause issues, but ESLint would flag this if exhaustive-deps is off.

**2. Redundant product type definition:**

- `types/products.ts` defines a `Product` type
- Generated Prisma models also define `Product`
- The modal uses `Product[]` without explicit import — likely relying on the Prisma generated type

**3. Auth session fetch after signIn:**

```typescript
// login-form.tsx
const sessionResponse = await fetch("/api/auth/session", { cache: "no-store" });
const session = await sessionResponse.json();
const role = session?.user?.role;
```

This extra round-trip is fragile. NextAuth returns the user/role in the `signIn` result, but the client redirect logic forces a secondary fetch. Additionally, this fetch could fail silently and leave the user in an undefined state.

**4. Lead creation doesn't handle guest users:**
The PRD mentions guest quotation with `customerId = null`, but the lead creation flow assumes customer is logged in. There's no guest mode in the current implementation.

**5. `customPrinting` type inconsistency:**

- `useQuotationForm` hook defines: `customPrinting: boolean | null`
- `buildQuotationWhatsAppMessage` checks: `data.customPrinting === "yes"` (string comparison)
- The radio group returns string values, but the form stores boolean/null
- This mismatch means WhatsApp message may not display correctly

**6. prisma.config.ts uses non-standard setup:**

- Uses `@prisma/adapter-pg` instead of the standard Prisma Client
- Client output path is `app/generated/prisma` instead of `node_modules/.prisma/client`

**7. No middleware.ts:**

- Route protection appears to be done client-side only
- No server-side redirect/middleware for unauthenticated access
- A CUSTOMER could theoretically access /admin by typing the URL

---

## 7. Potential Bugs / Code Smells

### Bug: Login redirect for CUSTOMER

AGENTS.md states: _"CUSTOMER redirects to /quotation"_  
Current code: `router.push("/");` (redirects to homepage, not quotation)

### Bug: productId cleared on modal close/reopen

If a user closes the modal and reopens without selecting a different product, `selectedProductId` might reset. The effect only fires on `open` change, but the context value may not persist.

### Code Smell: External backend dependency for EVERYTHING

- Product listing → external backend proxy
- Login auth → external backend
- Registration → external backend
- Lead creation → validates product against external backend

If the external backend is down:

- Users can't log in or register
- Products can't be loaded
- Leads can't be created (the product validation fails)

### Code Smell: Lead creation sequence

The lead API route first fetches the product from external backend, then creates the lead locally. If the external backend is slow, the entire request is slow. Product data could be cached locally.

### Code Smell: Hardcoded data

- `TRUST_INDICATORS` array in quotation modal
- Hero section avatar letters and metrics
- Footer company description
- WhatsApp number `6281284849822` in `lib/whatsapp.ts` and directly in FAB

### Code Smell: `lib/jwt.ts` throws on import if env missing

```typescript
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is missing.");
  }
  return secret;
}
```

This function is never called in the current auth flow (NextAuth manages its own token), so it's dead code that could crash the app if ever imported.

---

## 8. Performance Concerns

1. **No product caching:** Products are fetched from external backend on every modal open. No client-side cache, no React Query/SWR, no ISR.

2. **No static generation:** All pages are server-rendered. The landing page could benefit from static generation with revalidation.

3. **motion/react on scroll:** Multiple sections use `whileInView` with motion.div — this can cause cumulative layout shift and performance issues on low-end devices.

4. **No image optimization strategy:** Using Next.js Image with static imports is good, but no `sizes` prop on many images (unless specified). Hero section uses `fill` with no `sizes`.

5. **API call on every modal open:** `/api/products` is called every time the dialog opens. The products data rarely changes and should be cached.

---

## 9. Security Concerns

1. **No server-side route protection:** No middleware.ts exists. Route access control appears to be client-side only. A CUSTOMER could potentially access admin routes.

2. **Auth dependency on external service:** Single point of failure. No fallback auth mechanism.

3. **No input sanitization:** API routes accept user input but there's no visible Zod validation on the API layer. The client-side hook validates, but API routes should also validate.

4. **No rate limiting:** API routes and auth endpoints have no rate limiting, making them vulnerable to brute force attacks.

5. **Prisma client in app directory:** Generated client files in `app/generated/prisma` could be accidentally served as API routes or exposed to clients.

6. **JWT secret handling:** The `lib/jwt.ts` helper exists but is redundant — JWT handling is done by NextAuth internally. Extra JWT code increases attack surface.

7. **No CSRF protection:** Next.js API routes don't have CSRF tokens, and the auth endpoints are vulnerable to CSRF attacks.

---

## 10. Technical Debt

### High

- **Dual auth system**: Frontend (NextAuth) + Backend (JWT) — auth is not synchronized, users need to login twice
- **No shared database access**: Both apps access the same PostgreSQL database but this repo only uses it for leads and the external backend manages users — leads to potential data inconsistency
- **No tests**: Zero unit, integration, or E2E tests
- **No middleware**: Route protection is incomplete

### Medium

- **Custom Prisma output path**: `app/generated/prisma` instead of standard — confusing, could cause import issues
- **Hardcoded business data**: Trust indicators, metrics, WhatsApp number are hardcoded in components
- **Generated client checked into version control**: The `app/generated/prisma` directory appears to be committed (no .gitignore entry for it)
- **`lib/jwt.ts` is dead code**: Not used anywhere in the auth flow
- **No seed script**: `prisma/seed.ts` doesn't exist yet

### Low

- **Product type duplication**: Defined in `types/products.ts` and generated by Prisma
- **customPrinting type mismatch**: Boolean in form state, string in WhatsApp builder
- **No environment validation at build time**: Missing env vars only fail at runtime
- **Missing loading/empty states**: Product dropdown, login form

---

## What's Well Implemented

- **Quotation form UX**: Clean validation with touched/error state, loading spinners, field-level errors
- **Registration flow**: Proper use of Prisma transactions, bcrypt hashing, email normalization, referral code assignment
- **UI component quality**: Consistent use of shadcn/ui, responsive design, proper animations
- **Code structure**: Logical separation of pages, components, hooks, lib, and API routes
- **TypeScript discipline**: Strong typing throughout, no `any` abuse
- **Session-aware components**: Navbar correctly switches based on auth state and role

---

## What Should Be Improved

| Area                                        | Priority | Action                                       |
| ------------------------------------------- | -------- | -------------------------------------------- |
| Fix CUSTOMER redirect to `/quotation`       | High     | align with AGENTS.md spec                    |
| Implement middleware for route protection   | High     | Server-side redirect for unauthorized access |
| Add lead creation fallback (guest mode)     | High     | PRD mentions guest quotation                 |
| Normalize auth between frontend and backend | High     | Single sign-on required                      |
| Add product caching (client or server)      | Medium   | Reduce external backend calls                |
| Fix customPrinting type mismatch            | Medium   | Align string/boolean usage                   |
| Add loading skeletons and error states      | Medium   | Improve UX during data fetch                 |
| Add toast/notification system               | Medium   | User feedback for success/error              |
| Implement /account and /account/quotations  | Medium   | Customer self-service                        |
| Add SALES role scoping                      | Medium   | Assigned leads/customers only                |
| Add WhatsApp fallback button                | Low      | Handle blocked popups                        |
| Add test suite                              | High     | Critical for reliability                     |

---

## Missing Features (Based on Existing Code)

These are features referenced in the codebase (PRD, plan, AGENTS.md, todo) but not yet implemented:

1. **Customer account page** (`/account`) — profile update
2. **Quotation history** (`/account/quotations`) — previous requests
3. **Guest quotation flow** — non-logged-in users submitting leads
4. **WhatsApp fallback button** — when popup is blocked
5. **SALES role assignment scoping** — leads/customers filtered by assignment
6. **Blog frontend** — schema exists but no public blog pages
7. **Admin dashboard pages** — managed in external backend, not here
8. **Route middleware** — centralized route protection
9. **Data seed script** — `prisma/seed.ts` doesn't exist
10. **Contact/About pages** — referenced in footer/navbar but not implemented as distinct routes

---

## Prioritized Roadmap

### High (Must Fix)

1. **Fix CUSTOMER redirect** — change `router.push("/")` to `router.push("/quotation")`
2. **Implement route middleware** — protect `/admin/*` and `/quotation` server-side
3. **Resolve dual auth issue** — single sign-on between frontend and backend
4. **Add server-side validation** — Zod schemas for API routes
5. **Implement guest quotation** — support non-logged-in customers
6. **Add test suite** — at minimum integration tests for API routes and auth

### Medium (Should Fix)

7. **Add product caching** — reduce external backend dependency
8. **Fix customPrinting type** — align boolean/string usage
9. **Add /account and /account/quotations pages** — customer self-service
10. **Implement SALES role scoping** — assigned data only
11. **Add loading skeletons and error states** — improve UX
12. **Add toast notification system** — success/error feedback
13. **Add WhatsApp fallback** — handle blocked popups
14. **Create prisma seed script** — development convenience

### Low (Nice to Have)

15. **Remove dead code** — `lib/jwt.ts` if unused, `types/products.ts` if redundant
16. **Cache or SSR landing page** — improve initial load performance
17. **Implement blog frontend** — public blog pages
18. **Add Contact/About pages** — fully functional routes
19. **Replace hardcoded data** — move trust indicators, metrics to DB or config
20. **Gitignore generated prisma client** — add to `.gitignore`

---

## Summary

The codebase is **structurally sound** with good TypeScript discipline, consistent UI patterns, and a logical component hierarchy. The quotation flow is well-implemented with proper validation and WhatsApp integration.

The **biggest risks** are:

1. **Auth coupling** — complete dependency on the external backend for authentication
2. **No server-side route protection** — middleware is absent
3. **No tests** — zero test coverage
4. **Auth synchronization** — users need to log in twice
5. **CUSTOMER redirect** — misaligned with documented requirements

The most impactful single fix would be **implementing middleware.ts** for route protection and **fixing the auth synchronization** between frontend and backend. The second most impactful is **adding tests** to prevent regressions.
