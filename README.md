# Dynamic IT — Full-Stack Digital Agency Service Management and Project Tracking Platform

**Dynamic IT** is a full-stack, database-driven digital agency web application and client project tracking platform built with **React.js (Vite)**, **Tailwind CSS**, **Node.js**, **Express.js**, and **MongoDB (Mongoose)**.

It enables customers to explore agency services, submit project requirements with validated reference documents, receive and accept custom quotations, track live project milestones and completion percentages (`0%` → `100%`) with an audit trail, view payment balances, and exchange project messages with the agency administrator.

---

## 1. Core Features & Modules

### Public Agency Website
- **Home Page**: Navigation bar, Hero section with live portal preview, database-driven Services Overview, Why Choose Dynamic IT, interactive 4-step How We Work section, Featured Sample Portfolio, clearly identified Sample Client Feedback, interactive **FAQ accordion**, and Contact CTA.
- **Six Core Digital Services (Stored in MongoDB)**:
  1. Meta Ads and Digital Marketing
  2. Website Development
  3. Landing Page Design
  4. Domain and Hosting Assistance
  5. Graphic Design and Branding
  6. SEO Services
- **About, Service Details, Pricing, Portfolio & Contact Pages**:
  - Dynamic service details with technical deliverables and "Request a Custom Quote" flow.
  - Curated service packages and live MongoDB rate ledger.
  - Sample portfolio showcase with an interactive **Project Details Modal**.
  - Contact form saving inquiries directly to MongoDB.

### Customer Portal
- **Customer Dashboard**: Real-time statistics from MongoDB (Total Requests, Pending Quotations, Active Projects, Completed Projects, Financial Ledger, and Event Log).
- **Service Request Submission**: Select a service, enter project title and requirements, set an optional estimated budget (`৳`) and preferred deadline, and attach reference files (`PDF`, `JPG`, `PNG`, `DOCX` up to 8MB).
- **Quotation Management**: View proposed amount, delivery timeline, scope, terms, and validity date; accept or decline pending quotations.
- **Project Progress & Audit History**: View live completion percentage (`0%` to `100%`), milestone checklists, expected delivery date, payment summary, and a chronological **Project Activity & Audit History** log.
- **Payment Ledger & Project Messages**: Inspect recorded payment installments, remaining balance, and communicate directly with the administrator per project.

### Admin Control Center
- **Admin Overview Dashboard**: Real MongoDB KPIs and **Recharts** visualizations (Service Demand Bar Chart & Project Status Pie Chart).
- **Service & Customer Management**: Add, edit, feature, or deactivate services; search customers, inspect their requests/projects, and activate/deactivate accounts.
- **Request & Quotation Desk**: Review customer requests, view protected attachments, update review notes, create custom quotations, and edit pending quotations (`PUT /api/quotations/:id`).
- **Project Operations & Payment Ledger**: Initialize projects from accepted quotations (with duplicate prevention), update progress percentages and milestones, record manual payments (with overpayment protection), and reply to project messages and public contact inquiries.

---

## 2. Security & Data Integrity Architecture

1. **Strict JWT & Cookie Authentication**:
   - No hardcoded JWT secret fallbacks (`JWT_SECRET` is required in `.env`).
   - Authentication uses `httpOnly` cookies (`SameSite` and `Secure` aware) and does not expose raw JWT tokens in browser JSON responses.
2. **Explicit CORS Allowlist**:
   - Only origins configured in `CLIENT_URL` (plus local Vite dev ports in development) are permitted. Arbitrary origins are rejected with `403`.
3. **Security Headers, NoSQL Sanitization & Rate Limiting**:
   - Sets `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, and `Strict-Transport-Security` (in production).
   - Recursively strips `$` and `.` operator keys from `req.body`, `req.query`, and `req.params`.
   - Enforces IP rate limiting on `/api/auth/login`, `/api/auth/register`, `/api/contact`, and `/api/*`.
4. **Magic-Byte File Upload Verification & Protected Access**:
   - Validates extension, MIME type, AND the actual binary file header magic bytes (`%PDF`, JPEG `FF D8 FF`, PNG `89 50 4E 47`, DOCX `50 4B 03 04`).
   - Uploaded customer documents are served through an authenticated, ownership-verified endpoint (`/api/uploads/:filename`) rather than an unrestricted public static directory.
5. **Business Rules Enforced on Backend**:
   - Duplicate project creation from the same quotation is blocked by both controller validation and a unique MongoDB index.
   - Total recorded payments cannot exceed the agreed project amount unless `allowAdjustment: true` is explicitly specified.
   - Project status (`completed`) and completion percentage (`100%`) are kept bidirectionally consistent, and every update appends an entry to `project.history`.

---

## 3. Local Setup & Running Instructions

### Prerequisites
- **Node.js** v18+ (tested on v24.12.0)
- **MongoDB** (Local MongoDB Server on port `27017` or MongoDB Atlas)

### 1. Install Dependencies
```powershell
npm.cmd --prefix backend install
npm.cmd --prefix frontend install
```

### 2. Configure Environment Variables
Copy `backend/.env.example` to `backend/.env` and `frontend/.env.example` to `frontend/.env`.
Ensure `JWT_SECRET` and `MONGODB_URI` are set in `backend/.env`.

### 3. Start Backend Server (Port 5000)
```powershell
cd backend
npm.cmd run dev
```

### 4. Start Frontend Dev Server (Port 5173)
Open a second terminal:
```powershell
cd frontend
npm.cmd run dev
```
Open **`http://localhost:5173`** in your browser.

### 5. Run the 20-Step Automated E2E & Security Verification Suite
```powershell
npm.cmd --prefix backend run test:workflow
```

---

## 4. Known Limitations

1. **Manual Payment Recording**: As designed, payments (`bKash`, `Nagad`, `Bank Transfer`, `Cash`) are recorded and verified manually by the administrator rather than through an automated third-party payment gateway.
2. **Polling / Refresh Messaging**: Project messages use standard REST API fetches (`GET /api/messages/:projectId`) rather than persistent WebSockets.
3. **In-Memory Rate Limiter**: The IP rate limiter uses an in-memory `Map` suitable for single-instance deployments; multi-instance horizontal scaling would require a shared Redis store.
4. **Cloud File Persistence**: In production (`NODE_ENV=production`), `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` must be configured in `backend/.env` for file uploads unless `ALLOW_LOCAL_UPLOADS_IN_PROD=true` is set on a persistent disk volume.
