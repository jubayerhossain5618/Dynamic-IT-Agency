# Dynamic IT — REST API Documentation

All API endpoints are prefixed with `/api` and return consistent JSON responses:

```json
{
  "success": true,
  "message": "Optional human-readable status message",
  "...": "Payload data"
}
```

Authentication is handled via **HTTP-only cookies** (`token`) as well as `Authorization: Bearer <token>` headers for API client testing (Postman / Thunder Client).

---

## 1. Authentication (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Registers a new `customer` account (never allows admin role assignment). |
| `POST` | `/api/auth/login` | Public | Authenticates customer or admin and issues JWT cookie + token. |
| `POST` | `/api/auth/logout` | Private | Clears authentication cookie. |
| `GET` | `/api/auth/me` | Private | Returns the currently authenticated user profile. |
| `PUT` | `/api/auth/profile` | Private | Updates user name, phone, company, or password. |

---

## 2. Services (`/api/services`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/services` | Public | Lists active digital agency services (supports `?category=`, `?search=`, `?includeInactive=true`). |
| `GET` | `/api/services/:slug` | Public | Retrieves a single service by URL slug or MongoDB `_id`. |
| `POST` | `/api/services` | Admin | Creates a new service in MongoDB. |
| `PUT` | `/api/services/:id` | Admin | Updates an existing service. |
| `DELETE` | `/api/services/:id` | Admin | Deactivates (or permanently deletes with `?permanent=true`) a service. |

---

## 3. Service Requests (`/api/requests`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/requests` | Customer | Submits a service request (`multipart/form-data` with up to 5 reference files or JSON). |
| `GET` | `/api/requests/my` | Customer | Lists only the authenticated customer's service requests. |
| `GET` | `/api/requests` | Admin | Lists all customer service requests (supports `?status=` and `?search=`). |
| `GET` | `/api/requests/:id` | Owner / Admin | Retrieves request details, attachments, quotations, and project link. |
| `PATCH` | `/api/requests/:id/status` | Admin | Updates request status (`pending`, `under_review`, `quoted`, `accepted`, `rejected`) and `adminNotes`. |

---

## 4. Quotations (`/api/quotations`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/quotations` | Admin | Creates a custom quotation (`requestId`, `amount`, `estimatedDays`, `scope`, `terms`, `validUntil`). |
| `GET` | `/api/quotations` | Admin | Lists all quotations with customer and project creation status. |
| `GET` | `/api/quotations/my` | Customer | Lists only the authenticated customer's quotations. |
| `GET` | `/api/quotations/:id` | Owner / Admin | Retrieves single quotation details. |
| `PATCH` | `/api/quotations/:id/respond` | Customer | Accepts (`status: "accepted"`) or rejects (`status: "rejected"`) a pending, non-expired quotation. |

---

## 5. Projects (`/api/projects`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/projects` | Admin | Creates a project from an accepted quotation (prevents duplicates). |
| `GET` | `/api/projects/my` | Customer | Lists the authenticated customer's projects with payment summaries. |
| `GET` | `/api/projects` | Admin | Lists all projects across the agency with payment summaries. |
| `GET` | `/api/projects/:id` | Owner / Admin | Retrieves project details, milestones, payments, and messages. |
| `PATCH` | `/api/projects/:id/progress` | Admin | Updates project completion percentage (`0`–`100`) and milestones. |
| `PATCH` | `/api/projects/:id/status` | Admin | Updates project status (`not_started`, `in_progress`, `on_hold`, `completed`, `cancelled`). |
| `POST` | `/api/projects/:id/milestones` | Admin | Adds a new milestone to a project. |
| `PATCH` | `/api/projects/:id/milestones/:milestoneId` | Admin | Updates milestone status (`pending`, `in_progress`, `completed`). |

---

## 6. Payments (`/api/payments`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/payments` | Admin | Records a manual payment (`projectId`, `paidAmount`, `paymentMethod`, `paymentDate`, `notes`) and computes `remainingAmount`. |
| `GET` | `/api/payments/my` | Customer | Lists the authenticated customer's payments and overall balance summary. |
| `GET` | `/api/payments` | Admin | Lists all recorded payments and total collected revenue. |
| `PATCH` | `/api/payments/:id` | Admin | Updates a payment record and recalculates remaining balance. |

---

## 7. Messages (`/api/messages`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/messages` | Customer / Admin | Sends a project-related message (`projectId`, `message`). |
| `GET` | `/api/messages/my` | Customer / Admin | Retrieves all messages for the current user. |
| `GET` | `/api/messages/:projectId` | Owner / Admin | Retrieves the conversation thread for a specific project. |
| `PATCH` | `/api/messages/:id/read` | Owner / Admin | Marks a message as read. |

---

## 8. Contact, Customers & Dashboards

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/contact` | Public | Saves public contact form submission to MongoDB. |
| `GET` | `/api/contact` | Admin | Lists all public contact form submissions. |
| `GET` | `/api/customers` | Admin | Lists all customer accounts with request, project, and payment stats. |
| `GET` | `/api/customers/:id` | Admin | Retrieves full customer profile and history. |
| `PATCH` | `/api/customers/:id/status` | Admin | Activates or deactivates a customer account. |
| `GET` | `/api/dashboard/customer` | Customer | Aggregates real MongoDB dashboard metrics and recent activities for the logged-in customer. |
| `GET` | `/api/dashboard/admin` | Admin | Aggregates real MongoDB agency metrics and Recharts analytics for the admin dashboard. |
