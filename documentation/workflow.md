# Dynamic IT — End-to-End Business Workflow & Viva Preparation Guide

## 1. Complete Business Workflow Diagram

```mermaid
sequenceDiagram
    actor Customer
    participant Portal as Dynamic IT Platform (React + Express)
    actor Admin
    database DB as MongoDB

    Customer->>Portal: 1. Register & Login (/register, /login)
    Portal->>DB: Save User (role: customer, bcrypt hash)
    Customer->>Portal: 2. Browse 6 Services (/services)
    Portal->>DB: GET /api/services
    Customer->>Portal: 3. Submit Service Request (/customer/requests/new)
    Portal->>DB: Create ServiceRequest (status: pending)
    Admin->>Portal: 4. Review Request (/admin/requests)
    Portal->>DB: PATCH status -> under_review
    Admin->>Portal: 5. Create Custom Quotation (৳15,000, 15 days)
    Portal->>DB: Create Quotation (status: pending) & Request -> quoted
    Customer->>Portal: 6. Accept Quotation (/customer/quotations)
    Portal->>DB: PATCH Quotation -> accepted & Request -> accepted
    Admin->>Portal: 7. Create Project from Accepted Quotation
    Portal->>DB: Create Project (progress: 0%, status: in_progress)
    Admin->>Portal: 8. Update Progress (40% -> 65% -> 100%)
    Portal->>DB: PATCH Project progress & milestones
    Customer->>Portal: 9. Track Real-Time Progress (/customer/projects)
    Admin->>Portal: 10. Record Partial Payment (৳7,500)
    Portal->>DB: Create Payment (remainingAmount: ৳7,500, status: partial)
    Customer->>Portal: 11. View Payment Ledger & Exchange Project Messages
    Portal->>DB: Save & Retrieve Project Messages
```

---

## 2. Step-by-Step Live Demonstration Script (Section 11)

Use this exact script during your university presentation:

1. **Step 1 — Open Public Website**: Open `http://localhost:5173`. Show the Hero headline (*"Grow Your Business with Smart Digital Solutions."*), workflow preview, and footer.
2. **Step 2 — Browse the Six Digital Services**: Click **Services** in the navbar. Show all 6 database-driven services (*Meta Ads and Digital Marketing*, *Website Development*, *Landing Page Design*, *Domain and Hosting Assistance*, *Graphic Design and Branding*, *SEO Services*).
3. **Step 3 — Register a New Customer**: Click **Get Started** (`/register`), enter customer details, and submit.
4. **Step 4 — Customer Dashboard**: Show that registration automatically logs the customer in with an HTTP-only JWT cookie and redirects to `/customer/dashboard`.
5. **Step 5 — Submit a Website Development Request**: Click **Submit Request** (`/customer/requests/new`). Click the **Auto-Fill Demo Website Request** button (or fill manually), attach an optional PDF/PNG reference file, and submit.
6. **Step 6 — Log in as Admin**: Open an Incognito window (or second browser) at `http://localhost:5173/login`, click **Demo Admin** (`admin@dynamicit.com` / `Password123`), and sign in.
7. **Step 7 — Admin Reviews Request**: Go to **Service Requests** (`/admin/requests`), click **Review / Update Status**, set status to `Under Review`, and save.
8. **Step 8 — Admin Creates Quotation**: Click **Create Quotation** on that request (or click **Demo ৳15,000 Quote** on `/admin/quotations`):
   - Proposed Price: `৳15,000`
   - Estimated Delivery: `15 days`
   - Scope: `Five-page responsive business website`
   - Click **Send Quotation to Customer**.
9. **Step 9 & 10 — Customer Accepts Quotation**: Switch to the customer window, open **My Quotations** (`/customer/quotations`), review the `৳15,000` / `15 Days` proposal, and click **Accept Quotation**.
10. **Step 11 — Admin Initializes Project**: Switch to the admin window, open **Quotations** or **Projects & Progress** (`/admin/projects`), and click **Create Project Workspace**.
11. **Step 12 — Admin Updates Progress to 40%, then 65%**: On `/admin/projects`, click the quick progress button **40%**, then click **65%**.
12. **Step 13 — Customer Sees 65% Progress**: Switch to the customer window, click **Refresh Progress** on `/customer/projects` (or `/customer/dashboard`), and show the live **65%** progress bar.
13. **Step 14 — Admin Records Partial Payment**: In the admin window, click **Record Payment** (`/admin/payments`), click **Demo 50% Partial Payment** (`৳7,500` via `bKash`), and save.
14. **Step 15 — Customer Verifies Payment & Remaining Balance**: In the customer window, open **Payments & Invoices** (`/customer/payments`) and show Total Cost (`৳15,000`), Paid Amount (`৳7,500`), and Remaining Balance (`৳7,500`).
15. **Step 16 — Exchange Project Message**: Open **Project Messages** in both windows and send a message from the customer and a reply from the administrator.

---

## 3. Likely University Viva Questions & Confident Answers

### Q1: Why did you separate `ServiceRequest`, `Quotation`, and `Project` into three different MongoDB collections instead of keeping everything in one collection?
**Answer**: Separating them follows **Single Responsibility** and **Database Normalization** principles:
- A `ServiceRequest` represents the customer's initial inquiry and desired budget.
- A `Quotation` represents the agency's formal commercial offer with expiry date (`validUntil`), terms, and proposed price (`amount`). A request could theoretically receive a revised quotation if the first one expires.
- A `Project` only exists after a quotation is formally `accepted`, tracking operational execution (`progress`, `milestones`, `expectedDeliveryDate`).

### Q2: How do you prevent a customer from changing the quotation price or marking their own project as 100% complete?
**Answer**: Through **Role-Based Access Control (RBAC)** and **Endpoint Separation**:
- Customer quotation response (`PATCH /api/quotations/:id/respond`) only accepts `status` (`accepted` or `rejected`) and explicitly rejects any payload attempting to modify `amount`.
- Project progress (`PATCH /api/projects/:id/progress`) and payment recording (`POST /api/payments`) are protected by `authorize('admin')` middleware on the backend.

### Q3: How does your authentication system work?
**Answer**: Upon login or registration, the backend verifies credentials with `bcryptjs.compare()`, signs a **JSON Web Token (JWT)** containing the user's `_id` and `role`, and sends it in an **HTTP-only cookie** (`res.cookie('token', token, { httpOnly: true })`). Every protected request passes through `authMiddleware.js`, which verifies the JWT signature and checks that `user.isActive === true` in MongoDB.

### Q4: How do you prevent duplicate projects from being created from the same accepted quotation?
**Answer**: At two levels:
1. **Application Level**: `createProject` checks `await Project.findOne({ quotation: quotationId })` and returns HTTP 400 if a project already exists.
2. **Database Level**: In `Project.js`, the `quotation` field has `unique: true`, creating a unique MongoDB index that guarantees 1-to-1 integrity even under concurrent requests.

### Q5: How is the remaining payment balance calculated?
**Answer**: Whenever an administrator records a payment in `paymentController.js`, the backend queries all non-refunded payments for that project, sums `paidAmount`, and computes `remainingAmount = Math.max(0, project.totalAmount - cumulativePaid)`. If `remainingAmount === 0`, the payment status automatically becomes `paid`; otherwise `partial`.
