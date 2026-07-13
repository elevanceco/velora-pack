# Velora Pack Development Rules

## Project Context

Velora Pack is a B2B plastic OPP packaging manufacturer demo project.

This repository is the internal dashboard and shared backend for:

- Public company profile website
- Customer authentication and customer portal
- Internal dashboard for owner, admin, and sales teams
- Lead and quotation request management

The project uses one shared PostgreSQL database. This repository is the source of truth for Prisma schema and database migrations.

---

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma ORM
- PostgreSQL
- NextAuth Credentials Provider
- bcryptjs for password hashing
- Zod for validation where applicable
- Lucide React for icons

---

## Core Business Rules

### Roles

- `OWNER`: full access to all internal dashboard features.
- `ADMIN`: manage products, leads, prospects, blogs, customers, and customer assignment.
- `SALES`: manage only assigned leads, assigned customers, and own prospects.
- `CUSTOMER`: access public website, customer profile, quotation request, and quotation history.

### Role Redirect Rules

After successful login:

- `CUSTOMER` redirects to `/quotation`.
- `OWNER`, `ADMIN`, and `SALES` redirect to `/admin`.

### Route Protection Rules

- `/admin/*` is only accessible by `OWNER`, `ADMIN`, and `SALES`.
- `/account/*` and `/quotation` are only accessible by authenticated `CUSTOMER` users.
- A `CUSTOMER` must never access `/admin`.
- Internal users must not access customer-only account pages unless explicitly required.
- All authorization checks must run on the server. Do not rely only on hidden buttons or client-side role checks.

### Customer Registration Rules

When a customer registers:

1. Validate all required fields.
2. Normalize email to lowercase.
3. Hash password using bcryptjs.
4. Create `User` with role `CUSTOMER`.
5. Create linked `CustomerProfile`.
6. If a valid referral code is provided:
   - Find `SalesProfile` by referral code.
   - Verify the related user has role `SALES`.
   - Assign that sales user as `assignedSalesId`.

7. If no referral code is provided:
   - Create the customer without `assignedSalesId`.

8. Use a Prisma transaction so `User` and `CustomerProfile` are created atomically.

### Quotation / Lead Rules

- A quotation request is stored as a `Lead` in the current version.
- Always store `productId` when a product is selected.
- Store a snapshot of customer data in `Lead`: name, company, phone, and email.
- If customer is logged in:
  - Auto-fill quotation form from `User` and `CustomerProfile`.
  - Set `customerId`.
  - Set `salesId` from the customer's `assignedSalesId` when available.

- Guest quotation is allowed only if explicitly enabled. Guest leads have `customerId = null`.
- After lead creation succeeds, generate a structured WhatsApp message and open WhatsApp.
- Never create a lead only in the client. All database writes must use a server action or API route.

---

## Prisma and Database Rules

- `prisma/schema.prisma` is the source of truth.
- Run Prisma migrations only from this repository.
- Never manually edit generated Prisma client files in `app/generated/prisma`.
- After schema changes, run:
  1. `npx prisma format`
  2. `npx prisma validate`
  3. `npx prisma migrate dev --name <descriptive_name>`
  4. `npx prisma generate`

- Update `prisma/seed.ts` whenever required schema fields or enums change.
- Delete dependent data first in seed files:
  - leads
  - prospects
  - sales profiles
  - customer profiles
  - products
  - settings
  - blogs
  - users

- Do not change existing database fields or relations without explaining migration impact first.

---

## Code Quality Rules

- Use TypeScript. Do not use `any`.
- Prefer server components by default.
- Use `"use client"` only when browser APIs, local state, event handlers, or NextAuth client hooks are required.
- Keep business logic out of page components.
- Put reusable server-side logic in `app/actions` or `lib`.
- Validate all external input using Zod.
- Return safe, user-friendly errors. Never expose raw database errors to users.
- Use consistent naming:
  - camelCase for variables and functions
  - PascalCase for components and types
  - kebab-case for route folders

- Do not create duplicate components if an existing component can be reused.
- Do not refactor unrelated files while implementing a feature.
- Do not change UI design, color tokens, or component library unless required by the task.

---

## UI Rules

- Use existing Velora color tokens:
  - `velora-navy`
  - `velora-blue`
  - `film-blue`
  - `velora-bg`
  - `velora-border`

- Use shadcn/ui components where appropriate.
- Use Lucide icons only.
- Maintain responsive layouts for mobile and desktop.
- Include loading, empty, error, and success states for user-facing flows.
- Keep forms simple and conversion-focused.
- Do not add dashboards, charts, tables, or fields unless they support a stated business requirement.

---

## Before Completing Any Task

1. Check the existing Prisma schema and generated client usage.
2. Check existing auth and route protection patterns.
3. Implement the smallest correct change.
4. Run TypeScript checks and relevant tests/build if available.
5. Report:
   - Files changed
   - Database or migration changes
   - Required environment variables
   - Manual verification steps
