# Dynamic IT — Full-Stack Digital Agency Service Management and Project Tracking Platform

**Dynamic IT** is a full-stack, database-driven digital agency web application and client project tracking platform developed with **React.js (Vite)**, **Tailwind CSS**, **Node.js**, **Express.js**, and **MongoDB (Mongoose)**.

It enables customers to explore agency services, submit project requirements with file attachments, receive and accept custom quotations, track live project milestones and completion percentages, view payment balances, and exchange project messages with the agency administrator.

---

## 1. Key Features

### Public Website Module
- **Home Page**: Hero section, live workflow preview, database-driven Services Overview, Why Choose Dynamic IT, How It Works (4-step lifecycle), Featured Portfolio, Client Testimonials, and Contact CTA.
- **Six Core Digital Services (Stored in MongoDB)**:
  1. Meta Ads and Digital Marketing
  2. Website Development
  3. Landing Page Design
  4. Domain and Hosting Assistance
  5. Graphic Design and Branding
  6. SEO Services
- **Service Details, Pricing, Portfolio & Contact Pages**: Dynamic service details with "Request a Quote" integration, sample package pricing table, filterable portfolio case studies, and MongoDB-backed contact form.

### Customer Portal Module
- **Customer Dashboard**: Real-time statistics from MongoDB (Total Requests, Pending Quotations, Active Projects, Completed Projects, Payment Summary, and Recent Activities).
- **Service Request Submission**: Submit project title, description, requirements, budget (`৳`), preferred deadline, and reference attachments (`PDF`, `JPG`, `PNG`, `DOCX`).
- **Quotation Management**: Review proposed amount, estimated delivery days, project scope, and terms; accept or reject quotations with one click.
- **Project Progress Tracking**: Live progress bar (`0%` → `40%` → `65%` → `100%`), milestone status checklist, expected delivery date, and payment summary.
- **Payments & Project Messaging**: View recorded payment installments, remaining balance, and chat directly with the administrator per project.

### Admin Control Center Module
- **Admin Analytics Dashboard**: Real MongoDB KPIs and **Recharts** visualizations (Service Demand Bar Chart & Project Status Pie Chart).
- **Request & Quotation Management**: Review customer requests, add internal notes, and send custom quotations.
- **Project & Milestone Management**: Initialize projects from accepted quotations (with duplicate prevention), update progress percentages (`25%`, `40%`, `65%`, `85%`, `100%` or custom), and manage milestones.
- **Manual Payment Ledger**: Record client payments (`bKash`, `Nagad`, `Bank Transfer`, `Cash`, `Card`) with automatic remaining balance calculation.
- **Customer, Service & Inquiry Management**: Manage the MongoDB service catalogue, view/deactivate customer accounts, reply to project messages, and review public contact inquiries.

---

## 2. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, JavaScript (ES6+), Tailwind CSS, React Router DOM v6, Axios, Lucide React Icons, Recharts |
| **Backend** | Node.js, Express.js, REST API |
| **Database** | MongoDB, Mongoose ODM (8 Collections with ObjectId references & indexes) |
| **Security & Auth** | JWT (`jsonwebtoken`), HTTP-only Cookies (`cookie-parser`), `bcryptjs` Password Hashing, Role-Based Access Control (`customer` / `admin`) |
| **File Uploads** | `Multer` (Server-side PDF/JPG/PNG/DOCX validation) + Optional `Cloudinary` integration |

---

## 3. Demo Credentials (Pre-Seeded)

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@dynamicit.com` | `Password123` |
| **Demo Customer 1** | `rahim@technova.bd` | `Password123` |
| **Demo Customer 2** | `nusrat@greenleaf.com.bd` | `Password123` |

*(You can also click the **"Demo Customer"** or **"Demo Admin"** quick-fill buttons on the `/login` page during your presentation.)*

---

## 4. Quick Start & Running Locally

### Prerequisites
- **Node.js** (v18+ or v20/v24)
- **MongoDB** (Local MongoDB Server or MongoDB Atlas). *Note: If local MongoDB is installed at `C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe`, the backend will automatically start a local MongoDB instance if port `27017` is not yet running.*

### Step 1: Install Dependencies
```bash
npm --prefix backend install
npm --prefix frontend install
```

### Step 2: Seed Sample Data (Optional — Backend Auto-Seeds on First Start)
```bash
npm --prefix backend run seed
```

### Step 3: Start the Backend API Server (Port 5000)
```bash
npm --prefix backend run dev
```

### Step 4: Start the Frontend Vite Server (Port 5173)
Open a second terminal and run:
```bash
npm --prefix frontend run dev
```
Then open **`http://localhost:5173`** in your browser.

### Step 5: Run Automated 16-Step Workflow Verification
To verify the entire 16-step live demonstration workflow end-to-end against MongoDB:
```bash
npm --prefix backend run test:workflow
```

---

## 5. Architecture & Viva Documentation

Detailed technical documentation for project evaluation and viva presentation is located in the `documentation/` directory:
- [Database Design & ER Diagram](documentation/database-design.md)
- [REST API Documentation](documentation/api-documentation.md)
- [System Architecture & Security Controls](documentation/system-architecture.md)
- [16-Step Live Demo Script & Viva Q&A](documentation/workflow.md)
- [Project Progress Log](PROJECT_PROGRESS.md)
