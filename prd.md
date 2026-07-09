# Velora Pack Product Requirements Document

## Product Overview

Velora Pack is a fictional B2B plastic OPP packaging manufacturer created as a portfolio project for LokalTech.

The product consists of two connected experiences:

1. Public company profile website for product discovery, SEO, and lead generation.
2. Internal dashboard for managing products, leads, prospects, blogs, customers, and sales ownership.

The website should help a packaging manufacturer look credible, showcase capabilities, and convert visitors into sales conversations through quotation requests and WhatsApp.

---

## Problem Statement

Many manufacturing companies rely on outdated websites, marketplace listings, social media, or direct WhatsApp communication.

This creates several problems:

- Product information is difficult to find.
- Production capabilities are not communicated clearly.
- Buyers cannot easily request quotations.
- Sales teams receive incomplete inquiries.
- Customer information is scattered across WhatsApp chats.
- Repeat customers cannot view their previous requests.

Velora Pack solves this by combining a modern company profile, structured quotation requests, customer accounts, and an internal sales workflow.

---

## Target Users

### Public Visitor

A potential buyer who wants to understand the company, browse products, and request a quotation.

Examples:

- Food and beverage brand
- Garment business
- Fashion brand
- Cosmetics business
- Retailer
- Distributor
- Packaging reseller

### Customer

A registered buyer who can submit quotation requests with pre-filled company data and later view quotation history.

### Sales

An internal user responsible for following up assigned customers, leads, and prospects.

### Admin

An internal user responsible for managing products, blogs, customers, leads, and sales assignments.

### Owner

An internal user with full access to all system data and settings.

---

## Product Goals

- Make Velora Pack look professional and trustworthy.
- Help visitors discover products and manufacturing capabilities.
- Generate structured quotation leads.
- Reduce quotation form friction with customer accounts and autofill.
- Assign customers and leads to sales representatives.
- Preserve a clear history of customer quotation requests.
- Keep WhatsApp as the fastest sales communication channel.

---

## Non-Goals for Current Version

The current version does not need:

- Online payment
- Full ERP workflow
- Production scheduling
- Inventory management
- Customer order tracking
- Automatic quotation pricing calculation
- File upload for artwork
- PDF quotation generation

These can be added in future phases after the lead and customer foundation is stable.

---

## User Roles and Permissions

| Role     | Main Access                                                    |
| -------- | -------------------------------------------------------------- |
| OWNER    | Full internal dashboard access                                 |
| ADMIN    | Products, blogs, customers, leads, prospects, sales assignment |
| SALES    | Assigned customers, assigned leads, own prospects              |
| CUSTOMER | Customer profile, quotation request, quotation history         |

---

## Key User Flows

### Customer Registration

1. Visitor clicks Register.
2. Visitor enters name, email, password, company name, and phone number.
3. Visitor may enter an optional sales referral code.
4. System validates the data.
5. System creates a `User` with role `CUSTOMER`.
6. System creates a linked `CustomerProfile`.
7. If referral code is valid, customer is assigned to the related sales user.
8. Customer is redirected to quotation page.

### Customer Login

1. Customer enters email and password.
2. System validates credentials.
3. Customer redirects to `/quotation`.
4. Internal users redirect to `/admin`.

### Request Quotation

1. Visitor opens Request Quotation form.
2. Product dropdown loads active products from the database.
3. If opened from a product detail page, the product is preselected.
4. Logged-in customer sees auto-filled personal and company data.
5. Customer selects product, quantity, printing requirement, and notes.
6. System creates a `Lead`.
7. System attaches customer and assigned sales when available.
8. System opens WhatsApp with a structured quotation message.
9. Sales can view the lead in the internal dashboard.

### Sales Assignment

1. Customer registers with a referral code, or without one.
2. Referral code assigns the customer to a sales user automatically.
3. Customers without referral code remain unassigned.
4. Owner or admin can assign an unassigned customer to a sales user.
5. New quotation requests inherit the customer's assigned sales user.

---

## Public Website Pages

- Home
- Products
- Product Detail
- About
- Industries
- Blog
- Blog Detail
- Contact
- Login
- Register
- Quotation

---

## Customer Pages

- `/account` - customer profile
- `/account/quotations` - quotation history
- `/quotation` - request quotation form

---

## Internal Dashboard Pages

- `/admin` - dashboard overview
- `/admin/prospects` - sales prospect management
- `/admin/leads` - inbound quotation requests
- `/admin/products` - product management
- `/admin/customers` - customer management and sales assignment
- `/admin/blogs` - blog management
- `/admin/settings` - website settings

---

## Data Model Summary

### User

Stores login credentials, role, and sales assignment.

### CustomerProfile

Stores company-specific customer data such as company name, phone, industry, address, company email, website, and job title.

### SalesProfile

Stores a unique referral code for sales users.

### Product

Stores public catalog products.

### Lead

Stores quotation requests and customer data snapshot at the time of submission.

### Prospect

Stores manually managed outbound sales prospects.

---

## Current Feature Scope

### Request Quotation

- Product dropdown sourced from database.
- Product detail page can preselect a product.
- Product selection stores `productId`.
- Include Other / Custom Packaging Requirement option.
- Save quotation request as a Lead.
- Generate WhatsApp message after successful submission.

### Authentication

- Customer registration.
- Customer login.
- Role-based redirect.
- Protected customer and admin routes.
- Navbar changes based on authentication state.

### Customer Data

- Customer profile created during registration.
- Quotation form auto-fills customer data.
- Customer can update profile data later.

---

## Success Criteria

The feature is complete when:

- A visitor can register as a customer.
- A customer record creates both `User` and `CustomerProfile`.
- A referral code assigns the correct sales user.
- A customer can log in successfully.
- Login redirects based on role.
- A quotation form loads products from the database.
- A logged-in customer sees auto-filled data.
- Submitting quotation creates a Lead with `productId`, `customerId`, and `salesId` where applicable.
- WhatsApp opens with a complete formatted message.
- Owner/admin can see the new lead in the dashboard.
