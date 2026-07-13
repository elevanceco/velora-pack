# Velora Pack Implementation Plan

## Scope

Implement customer authentication, role-based access, authenticated navbar state, and quotation request flow using the existing Prisma schema.

Important:

- Do not modify `prisma/schema.prisma`.
- Do not create migrations.
- Do not modify seed data.
- Reuse the existing NextAuth, Prisma client, shadcn/ui components, and Velora Pack UI design.
- Do not refactor unrelated dashboard or landing page features.

---

# Phase 1 — Audit Existing Implementation

## Goal

Understand existing auth, session, navbar, quotation form, product data access, and route structure before changing code.

## Tasks

- [ ] Inspect existing NextAuth configuration.
- [ ] Inspect credentials provider logic.
- [ ] Confirm session contains `user.id` and `user.role`.
- [ ] Inspect `/admin/login` page and existing login flow.
- [ ] Inspect public navbar component.
- [ ] Inspect quotation form or Request Quote modal.
- [ ] Inspect product detail page routing.
- [ ] Inspect existing Prisma client import pattern.
- [ ] Inspect `WebsiteSetting` access pattern for WhatsApp number.
- [ ] Identify whether the project uses server actions or API routes for database writes.
- [ ] List files that will be modified before implementation begins.

## Acceptance Criteria

- Existing auth and data flow are understood.
- No code is changed during this phase.
- A concise implementation plan is presented before proceeding.

---

# Phase 2 — Customer Registration Backend

## Goal

Create secure backend registration logic using the existing `User`, `CustomerProfile`, `SalesProfile`, and customer-sales assignment relations.

## Tasks

- [ ] Create a reusable registration server action or API route based on existing project conventions.
- [ ] Validate registration input with Zod.
- [ ] Required input:
  - [ ] Full Name
  - [ ] Company Name
  - [ ] Phone Number
  - [ ] Email Address
  - [ ] Password
  - [ ] Confirm Password

- [ ] Optional input:
  - [ ] Referral Code

- [ ] Normalize email to lowercase.
- [ ] Trim all text input.
- [ ] Validate email uniqueness.
- [ ] Validate password minimum length.
- [ ] Validate password confirmation.
- [ ] Hash password using bcryptjs.
- [ ] Use Prisma transaction.
- [ ] Create `User` with role `CUSTOMER`.
- [ ] Create linked `CustomerProfile`.
- [ ] If referral code exists:
  - [ ] Normalize referral code to uppercase.
  - [ ] Find `SalesProfile`.
  - [ ] Confirm linked user role is `SALES`.
  - [ ] Assign customer using existing `assignedSalesId`.

- [ ] If referral code is empty:
  - [ ] Create customer without sales assignment.

- [ ] Return safe success and error responses.

## Acceptance Criteria

- Registration creates both `User` and `CustomerProfile`.
- Password is stored as a hash.
- Duplicate email is rejected.
- Valid referral code assigns the correct sales user.
- Invalid referral code returns a user-friendly error.
- No raw Prisma errors are exposed.

---

# Phase 3 — Customer Registration UI

## Goal

Create a responsive registration page at `/register`.

## Tasks

- [ ] Create `/register` page.
- [ ] Reuse existing Velora Pack design tokens and shadcn/ui components.
- [ ] Add fields:
  - [ ] Full Name
  - [ ] Company Name
  - [ ] Phone Number
  - [ ] Email Address
  - [ ] Password
  - [ ] Confirm Password
  - [ ] Referral Code (optional)

- [ ] Show inline validation errors.
- [ ] Show loading state during submission.
- [ ] Show safe error state.
- [ ] Redirect to `/login?registered=true` after successful registration.
- [ ] Add link to `/login` for existing users.
- [ ] Do not auto-login after registration.

## Acceptance Criteria

- Customer can register successfully.
- Form is usable on mobile and desktop.
- Existing users can navigate to login.
- Success redirect works.

---

# Phase 4 — Login and Role-Based Redirect

## Goal

Update login flow to redirect users according to their role.

## Tasks

- [ ] Reuse existing credentials login flow.
- [ ] Update login redirect logic:
  - [ ] `CUSTOMER` → `/quotation`
  - [ ] `OWNER` → `/admin`
  - [ ] `ADMIN` → `/admin`
  - [ ] `SALES` → `/admin`

- [ ] Show user-friendly invalid credential error.
- [ ] Add loading state.
- [ ] Support safe internal `callbackUrl` only.
- [ ] Reject external callback URLs.
- [ ] Show registration success message when `registered=true`.

## Acceptance Criteria

- Each role redirects correctly.
- Customer does not land on internal dashboard.
- Internal user does not land on quotation page by default.
- External redirect URLs are blocked.

---

# Phase 5 — Route Protection

## Goal

Protect customer and internal routes based on authentication and role.

## Tasks

- [ ] Protect `/admin/*`.
- [ ] Allow `/admin/*` only for `OWNER`, `ADMIN`, and `SALES`.
- [ ] Protect `/quotation`.
- [ ] Protect `/account/*`.
- [ ] Allow `/quotation` and `/account/*` only for `CUSTOMER`.
- [ ] Redirect unauthenticated users to `/login`.
- [ ] Redirect `CUSTOMER` from `/admin/*` to `/quotation`.
- [ ] Redirect internal roles from `/quotation` and `/account/*` to `/admin`.
- [ ] Enforce checks server-side or in middleware.

## Acceptance Criteria

- Unauthorized roles cannot access protected pages through direct URL.
- UI visibility is not the only access control.
- Redirect behavior is consistent.

---

# Phase 6 — Navbar Authentication State

## Goal

Update public navbar based on session and role without changing existing visual design.

## Tasks

### Guest State

- [ ] Show Login button.
- [ ] Show Register button.
- [ ] Keep Request Quote CTA.

### Customer State

- [ ] Show My Account or Profile button.
- [ ] Show Logout button.
- [ ] Keep Request Quote CTA.

### Internal User State

- [ ] Show Admin Dashboard button.
- [ ] Show Logout button.
- [ ] Do not show Register button.

## Acceptance Criteria

- Navbar reflects current session state.
- Customer and internal navigation are clearly separated.
- No major UI redesign is introduced.
- Avoid session loading flicker where possible.

---

# Phase 7 — Quotation Form Product Integration

## Goal

Connect quotation product selection to existing product data.

## Tasks

- [ ] Load products from the existing Product table.
- [ ] Populate product dropdown using product names.
- [ ] Store selected `productId`.
- [ ] Add `Other / Custom Packaging Requirement` option.
- [ ] Support product preselection from product detail page.
- [ ] Use a safe query parameter or existing routing convention for preselection.
- [ ] Do not add new database fields.

## Acceptance Criteria

- Product dropdown displays current database products.
- Selected product persists as `productId` in Lead.
- Product detail CTA preselects the correct product.
- Custom requirement option works.

---

# Phase 8 — Quotation Form Customer Autofill

## Goal

Reduce form friction for logged-in customers.

## Tasks

- [ ] Fetch current customer and CustomerProfile data.
- [ ] Auto-fill:
  - [ ] Full Name
  - [ ] Company Name
  - [ ] Phone Number
  - [ ] Email Address
  - [ ] Company Industry if available
  - [ ] Company Address if available
  - [ ] Company Email if available

- [ ] Keep all auto-filled fields editable.
- [ ] Guest flow should remain usable if guest quotation is enabled.

## Acceptance Criteria

- Logged-in customer sees correct profile data.
- User can edit form values before submit.
- Form does not crash when optional profile values are missing.

---

# Phase 9 — Lead Creation and WhatsApp Redirect

## Goal

Create structured leads before sending the customer to WhatsApp.

## Tasks

- [ ] Validate quotation form using Zod.
- [ ] Create Lead using existing schema.
- [ ] Save:
  - [ ] Name
  - [ ] Company
  - [ ] Phone
  - [ ] Email
  - [ ] Product ID
  - [ ] Estimated Quantity
  - [ ] Custom Printing
  - [ ] Notes

- [ ] If customer is logged in:
  - [ ] Set `customerId`.
  - [ ] Set `salesId` from `assignedSalesId` when available.

- [ ] Persist Lead successfully before opening WhatsApp.
- [ ] Read WhatsApp number from WebsiteSetting when existing project patterns allow it.
- [ ] Generate a structured WhatsApp message.
- [ ] Encode message with `encodeURIComponent`.
- [ ] Open WhatsApp in a new tab.
- [ ] Show fallback Open WhatsApp button if browser blocks popup.
- [ ] Show success state after lead creation.

## Acceptance Criteria

- Lead exists in database before WhatsApp redirect.
- Lead contains correct customer, product, and sales relation when available.
- WhatsApp message contains the submitted quotation data.
- Failure to open WhatsApp does not lose the lead.

---

# Phase 10 — Manual Verification

## Customer Registration

- [ ] Register with valid data.
- [ ] Register with duplicate email.
- [ ] Register with invalid referral code.
- [ ] Register with valid referral code.
- [ ] Verify User and CustomerProfile records are created.
- [ ] Verify assignedSalesId is correct for valid referral code.

## Login and Authorization

- [ ] Login as CUSTOMER and verify redirect to `/quotation`.
- [ ] Login as OWNER and verify redirect to `/admin`.
- [ ] Login as ADMIN and verify redirect to `/admin`.
- [ ] Login as SALES and verify redirect to `/admin`.
- [ ] Verify CUSTOMER cannot access `/admin`.
- [ ] Verify internal roles cannot access `/account`.
- [ ] Verify unauthenticated users redirect to `/login`.

## Quotation

- [ ] Open quotation from general CTA.
- [ ] Open quotation from product detail page and verify preselected product.
- [ ] Verify product dropdown loads from database.
- [ ] Submit quotation as customer.
- [ ] Verify Lead is created.
- [ ] Verify Lead has customerId.
- [ ] Verify Lead inherits assigned salesId.
- [ ] Verify WhatsApp message is correctly formatted.
- [ ] Verify fallback behavior if WhatsApp popup is blocked.

---

# Future Scope

Not part of the current implementation:

- Customer profile edit page
- Customer quotation history page
- PDF quotation download
- Reorder flow
- Order history
- Artwork upload
- Automatic pricing calculation
- Email notifications
- WhatsApp notification automation
- Full quotation model separate from Lead
