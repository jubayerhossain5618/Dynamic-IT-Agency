# Dynamic IT — Database Architecture & ER Design

Dynamic IT uses **MongoDB** with **Mongoose ODM** to enforce strict schema validation, reference integrity (`ObjectId`), indexing, and role-based data isolation.

---

## 1. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USER ||--o{ SERVICE_REQUEST : "submits (customer)"
    USER ||--o{ QUOTATION : "receives (customer)"
    USER ||--o{ QUOTATION : "creates (admin)"
    USER ||--o{ PROJECT : "owns (customer)"
    USER ||--o{ PAYMENT : "makes (customer)"
    USER ||--o{ MESSAGE : "sends / receives"

    SERVICE ||--o{ SERVICE_REQUEST : "requested for"
    SERVICE_REQUEST ||--o{ QUOTATION : "generates"
    QUOTATION ||--|| PROJECT : "initializes (1:1 unique)"
    SERVICE_REQUEST ||--o| PROJECT : "linked to"
    PROJECT ||--o{ PAYMENT : "records installments"
    PROJECT ||--o{ MESSAGE : "contains thread"

    USER {
        ObjectId _id PK
        String name
        String email UK
        String password
        String phone
        String company
        String role "customer | admin"
        Boolean isActive
        Date createdAt
        Date updatedAt
    }

    SERVICE {
        ObjectId _id PK
        String title
        String slug UK
        String category
        String shortDescription
        String description
        String[] features
        String[] deliverables
        Number startingPrice
        String pricingType
        String image
        Boolean isActive
        Boolean isFeatured
    }

    SERVICE_REQUEST {
        ObjectId _id PK
        ObjectId customer FK
        ObjectId service FK
        String projectTitle
        String description
        String requirements
        Number budget
        Date preferredDeadline
        Object[] attachments
        String status "pending | under_review | quoted | accepted | rejected | project_created"
        String adminNotes
    }

    QUOTATION {
        ObjectId _id PK
        ObjectId request FK
        ObjectId customer FK
        ObjectId createdBy FK
        Number amount
        String currency "BDT"
        Number estimatedDays
        String scope
        String terms
        Date validUntil
        String status "pending | accepted | rejected | expired"
        Date respondedAt
    }

    PROJECT {
        ObjectId _id PK
        ObjectId quotation FK_UK
        ObjectId request FK
        ObjectId customer FK
        String projectTitle
        String description
        Number totalAmount
        Date startDate
        Date expectedDeliveryDate
        Number progress "0..100"
        String status "not_started | in_progress | on_hold | completed | cancelled"
        Object[] milestones
    }

    PAYMENT {
        ObjectId _id PK
        ObjectId project FK
        ObjectId customer FK
        Number totalAmount
        Number paidAmount
        Number remainingAmount
        String paymentMethod
        Date paymentDate
        String status "pending | partial | paid | refunded"
        String notes
    }

    MESSAGE {
        ObjectId _id PK
        ObjectId sender FK
        ObjectId receiver FK
        ObjectId project FK
        ObjectId request FK
        String message
        Boolean isRead
        Date createdAt
    }

    CONTACT_MESSAGE {
        ObjectId _id PK
        String name
        String email
        String phone
        String subject
        String message
        String status "new | read | replied"
        Date createdAt
    }
```

---

## 2. Collection Specifications & Indexes

### 2.1 `users` (`backend/models/User.js`)
- **Purpose**: Stores both `customer` and `admin` accounts.
- **Security**: Passwords are automatically hashed via a Mongoose `pre('save')` hook using `bcryptjs` (salt rounds: 10), and `password` has `select: false` by default.
- **Indexes**:
  - `{ email: 1 }` (Unique)
  - `{ role: 1, isActive: 1 }`

### 2.2 `services` (`backend/models/Service.js`)
- **Purpose**: Stores the agency's service catalogue (including the 6 core digital services).
- **Indexes**:
  - `{ slug: 1 }` (Unique)
  - `{ isActive: 1, isFeatured: -1 }`
  - `{ category: 1 }`

### 2.3 `servicerequests` (`backend/models/ServiceRequest.js`)
- **Purpose**: Captures client project requirements, budget, preferred deadline, and uploaded reference files (`attachments`).
- **Indexes**:
  - `{ customer: 1, createdAt: -1 }`
  - `{ status: 1, createdAt: -1 }`

### 2.4 `quotations` (`backend/models/Quotation.js`)
- **Purpose**: Stores custom proposals created by the administrator for a specific `ServiceRequest`.
- **Indexes**:
  - `{ request: 1 }`
  - `{ customer: 1, createdAt: -1 }`
  - `{ status: 1 }`

### 2.5 `projects` (`backend/models/Project.js`)
- **Purpose**: Tracks active and completed projects initialized from an accepted quotation, including `progress` (`0` to `100`) and embedded `milestones`.
- **Integrity Constraint**: `quotation` is marked `unique: true` so duplicate projects can never be created from the same accepted quotation.
- **Indexes**:
  - `{ quotation: 1 }` (Unique)
  - `{ customer: 1, status: 1 }`

### 2.6 `payments` (`backend/models/Payment.js`)
- **Purpose**: Records manual payment installments (`bKash`, `Nagad`, `Bank Transfer`, `Cash`, `Card / Other`) and automatically calculates cumulative paid amount and `remainingAmount`.
- **Indexes**:
  - `{ project: 1 }`
  - `{ customer: 1, paymentDate: -1 }`

### 2.7 `messages` (`backend/models/Message.js`)
- **Purpose**: Stores project-specific communication between the customer and administrator.
- **Indexes**:
  - `{ project: 1, createdAt: 1 }`
  - `{ sender: 1, receiver: 1, createdAt: -1 }`

### 2.8 `contactmessages` (`backend/models/ContactMessage.js`)
- **Purpose**: Stores public inquiries submitted from the Contact page.
