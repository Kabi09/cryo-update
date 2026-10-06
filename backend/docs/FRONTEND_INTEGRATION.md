# Frontend Integration Guide & Contract

> **Target Audience:** Frontend React/MERN Engineering Team  
> **Source of Truth:** Cryo ERP Backend (`/api/v1`)

---

## 1. Connection & Base URL

* **Development Base URL:** `http://localhost:5000/api/v1`
* **Production Base URL:** `https://api.cryoscientific.com/api/v1` (configured via env `VITE_API_BASE_URL`)
* **Content-Type:** `application/json`
* **CORS:** Enabled with credential support (`Access-Control-Allow-Credentials: true`).

---

## 2. Authentication Flow

### Login
```http
POST /api/v1/auth/login
```
**Request Body:**
```json
{
  "email": "sales@cryo.com",
  "password": "Password@123"
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "6702...",
      "name": "Sales Executive",
      "email": "sales@cryo.com",
      "role": "SALES",
      "employeeId": "EMP-SAL-001",
      "department": "SALES",
      "designation": "Sales Executive",
      "permissions": ["lead.view", "lead.create", "quotation.view", "..."]
    },
    "tokens": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi..."
    }
  }
}
```

### Authorization Header
Include on all authenticated requests:
```http
Authorization: Bearer <accessToken>
```

### Token Refresh Flow
When an API responds with `401 Unauthorized` (`code: "AUTHENTICATION_ERROR"`):
```http
POST /api/v1/auth/refresh
```
```json
{
  "refreshToken": "<stored_refresh_token>"
}
```
Update stored `accessToken` and `refreshToken` and replay the failed request.

---

## 3. Standard Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Quotation approved successfully",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Invalid workflow transition for QUOTATION: Cannot move from 'DRAFT' to 'ACCEPTED'.",
  "errors": [],
  "code": "INVALID_WORKFLOW_STATE"
}
```

### Standard Error Codes
* `VALIDATION_ERROR` (HTTP 400) - Missing/invalid fields
* `AUTHENTICATION_ERROR` (HTTP 401) - Missing, invalid, or expired JWT
* `AUTHORIZATION_ERROR` (HTTP 403) - Insufficient permissions or role
* `NOT_FOUND` (HTTP 404) - Resource not found
* `DUPLICATE` (HTTP 409) - Unique key collision
* `INVALID_WORKFLOW_STATE` (HTTP 422) - Illegal state transition
* `BUSINESS_RULE_ERROR` (HTTP 422) - Domain invariant violation
* `INTERNAL_SERVER_ERROR` (HTTP 500) - Unhandled error

---

## 4. Standard List Queries

All major entity lists support:
* `page`: integer (default 1)
* `limit`: integer (default 20, max 100)
* `search`: text query across primary fields
* `status`: status enum filter
* `sortBy`: field name (default `createdAt`)
* `sortOrder`: `asc` or `desc` (default `desc`)
* `startDate`: ISO 8601 date string
* `endDate`: ISO 8601 date string

---

## 5. Main Endpoint Groups

### A. Sales & Orders
| Method | Endpoint | Action |
| :--- | :--- | :--- |
| `GET` | `/api/v1/leads` | List Leads (supports search, status filter) |
| `POST` | `/api/v1/leads` | Create Lead |
| `POST` | `/api/v1/leads/:id/qualify` | Qualify Lead (links or registers Customer) |
| `POST` | `/api/v1/leads/:id/follow-ups` | Add follow-up record |
| `POST` | `/api/v1/leads/:id/convert-to-enquiry` | Convert Lead to Enquiry |
| `GET` | `/api/v1/quotations` | List Quotations |
| `POST` | `/api/v1/quotations` | Create Quotation (generates R0) |
| `POST` | `/api/v1/quotations/:id/submit` | Submit for manager approval |
| `POST` | `/api/v1/quotations/:id/approve` | Approve Quotation (Sales Manager) |
| `POST` | `/api/v1/quotations/:id/send` | Mark Quotation as Sent |
| `POST` | `/api/v1/quotations/:id/negotiate` | Record customer negotiation terms |
| `POST` | `/api/v1/quotations/:id/revise` | Create Revision (generates R1, R2...) |
| `POST` | `/api/v1/quotations/:id/accept` | Record customer acceptance |
| `POST` | `/api/v1/proforma-invoices` | Generate Proforma Invoice from accepted quote |
| `POST` | `/api/v1/customer-pos` | Record customer purchase order |
| `POST` | `/api/v1/customer-pos/:id/verify` | Run verification gate; auto-creates Sales Order if match |
| `GET` | `/api/v1/sales-orders` | List Sales Orders |
| `GET` | `/api/v1/sales-orders/:id/timeline` | Order timeline events |
| `GET` | `/api/v1/sales-orders/:id/traceability` | Full 360° business traceability chain |

### B. Finance & Payments
| Method | Endpoint | Action |
| :--- | :--- | :--- |
| `GET` | `/api/v1/payments` | List customer payments |
| `POST` | `/api/v1/payments` | Record payment |
| `POST` | `/api/v1/payments/:id/verify` | Verify payment (Accounts); triggers production release if advance met |
| `GET` | `/api/v1/receivables-summary` | Overall receivables and outstanding balances |
| `GET` | `/api/v1/payables-summary` | Vendor purchase commitments |
| `POST` | `/api/v1/three-way-match` | Perform 3-way match (Vendor PO + GRN + Invoice) |

### C. Production & Shopfloor
| Method | Endpoint | Action |
| :--- | :--- | :--- |
| `GET` | `/api/v1/boms` | List Bills of Materials |
| `POST` | `/api/v1/boms` | Create product BOM |
| `GET` | `/api/v1/production-orders` | List Production Orders |
| `POST` | `/api/v1/production-orders` | Create Production Order (requires released Sales Order) |
| `POST` | `/api/v1/production-orders/:id/request-materials` | Check inventory; triggers auto-PR if shortage |
| `POST` | `/api/v1/material-requests/:id/issue` | Store issue to shopfloor |
| `POST` | `/api/v1/production-orders/:id/advance-stage` | Advance through Fabrication ➔ Refrigeration ➔ Electrical ➔ Assembly ➔ Completed |

### D. Quality & Serialization
| Method | Endpoint | Action |
| :--- | :--- | :--- |
| `GET` | `/api/v1/inspections` | List QA testing inspections |
| `POST` | `/api/v1/inspections/:id/pass` | Record QA Pass; issues Calibration Certificate and Serial Number |
| `POST` | `/api/v1/inspections/:id/fail` | Record QA Fail; sends back for rework |
| `GET` | `/api/v1/serials/trace/:serialNumber` | End-to-end unit history |

### E. Logistics & Delivery
| Method | Endpoint | Action |
| :--- | :--- | :--- |
| `GET` | `/api/v1/finished-goods` | Warehouse finished goods |
| `POST` | `/api/v1/packing` | Create packing slip & checklist |
| `POST` | `/api/v1/final-invoices` | Create final tax invoice |
| `POST` | `/api/v1/dispatch` | Freight dispatch (LR & transporter) |
| `POST` | `/api/v1/dispatch/:dispatchId/pod` | Complete signed Proof of Delivery |

### F. Installation & Field Service
| Method | Endpoint | Action |
| :--- | :--- | :--- |
| `POST` | `/api/v1/installations` | Create installation record |
| `POST` | `/api/v1/installations/:id/commission` | Commission machine; activates 12-month warranty |
| `GET` | `/api/v1/warranties/check/:serialNumber` | Real-time warranty validation |
| `POST` | `/api/v1/service-tickets` | Log service complaint (auto checks warranty) |
| `POST` | `/api/v1/service-tickets/:id/assign` | Assign field service engineer |
| `POST` | `/api/v1/service-tickets/:id/diagnose` | Record diagnosis & findings |
| `POST` | `/api/v1/service-tickets/:id/spares` | Issue spare part for service |
| `POST` | `/api/v1/service-tickets/:id/repair` | Mark repair complete |
| `POST` | `/api/v1/service-tickets/:id/signoff` | Customer sign-off & ticket closure |
| `POST` | `/api/v1/rmas` | Create RMA return request |
| `POST` | `/api/v1/rmas/:id/approve` | Approve RMA |
| `POST` | `/api/v1/rmas/:id/resolve` | Resolve RMA (replace, repair, credit, refund) |

### G. Reports & Dashboards
| Method | Endpoint | Action |
| :--- | :--- | :--- |
| `GET` | `/api/v1/dashboard/metrics` | Unified executive dashboard KPI metrics |
| `GET` | `/api/v1/reports/sales` | Lead conversion, quotation acceptance, sales value |
| `GET` | `/api/v1/reports/production` | WIP stages, completion counts |
| `GET` | `/api/v1/reports/quality` | Pass rate, scrap rate, inspection totals |
| `GET` | `/api/v1/reports/service` | Open tickets, warranty vs chargeable breakdown |
