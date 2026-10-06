# CRYO SCIENTIFIC SYSTEMS ERP
## FRONTEND MASTER BUILD PROMPT — MERN / React / Vite

---

## 0. ROLE OF THIS DOCUMENT

You are an **Agentic AI Senior Frontend Engineer + UI/UX Architect + ERP Product Engineer**.

Build the complete production-ready frontend for the Cryo Scientific Systems Pvt. Ltd. ERP.

The backend has already been implemented. Consume the backend APIs and build the complete frontend application.

This is **not a demo dashboard** and **not a collection of unrelated CRUD pages**.

The application represents one connected business system:

```text
LEAD
  ↓
ENQUIRY
  ↓
QUOTATION
  ↓
NEGOTIATION / REVISION
  ↓
PROFORMA INVOICE
  ↓
CUSTOMER PO
  ↓
PO VERIFICATION
  ↓
SALES ORDER
  ↓
ADVANCE PAYMENT GATE
  ↓
PRODUCTION ORDER
  ↓
BOM
  ↓
MATERIAL REQUEST
  ↓
STORE STOCK CHECK
  ├── FULL → ISSUE MATERIAL
  ├── PARTIAL → ISSUE AVAILABLE + PROCUREMENT
  └── NONE → PROCUREMENT
  ↓
PROCUREMENT
  ↓
RFQ
  ↓
VENDOR QUOTATION
  ↓
VENDOR PO
  ↓
GRN
  ↓
INVENTORY
  ↓
MANUFACTURING
  ├── FABRICATION
  ├── REFRIGERATION
  ├── ELECTRICAL
  ├── ASSEMBLY
  └── COMPLETED
  ↓
QA / TEMPERATURE DRAWDOWN TEST
  ├── PASS → SERIALIZATION
  └── FAIL → REWORK → RETEST / SCRAP
  ↓
SERIAL NUMBER + CALIBRATION CERTIFICATE
  ↓
FINISHED GOODS
  ↓
PACKING
  ↓
FINAL TAX INVOICE
  ↓
TALLY SYNC
  ↓
DISPATCH
  ↓
DELIVERY / POD
  ↓
INSTALLATION
  ↓
COMMISSIONING
  ↓
WARRANTY
  ↓
SERVICE
  ↓
RMA / REPAIR / REPLACEMENT / CREDIT / REFUND
```

---

# 1. ABSOLUTE INSTRUCTIONS

## 1.1 Read before coding

Before creating or modifying frontend code, understand these source documents completely:

1. `WORKFLOW(1).md`
2. `API.md`
3. `FRONTEND_INTEGRATION.md`
4. `RBAC.md`
5. `OPEN_BUSINESS_RULES.md`
6. `DATABASE(1).md`
7. `DEPLOYMENT(1).md`

If these files are available in the workspace, inspect them before implementation.

Do not invent business rules that are not present in the source documentation.

If documents conflict, verify against the actual running/backend route implementation. Do not silently hide the conflict. Record unresolved conflicts in:

```text
docs/FRONTEND_INTEGRATION_ISSUES.md
```

---

# 2. FRONTEND SCOPE

Build the complete frontend for all backend-supported areas:

- Login and authentication
- Token refresh
- Protected routes
- RBAC and permission-based UI
- Dashboard
- Sales
- Customers
- Leads
- Enquiries
- Quotations
- Negotiation
- Quotation revisions
- Proforma invoices
- Customer PO
- PO verification
- Sales orders
- Payments
- Receivables
- Payables
- Three-way match
- Production orders
- BOM
- Material requests
- Inventory/store
- Procurement
- Purchase requests
- RFQ
- Vendor quotations
- Vendor PO
- GRN
- Manufacturing
- QA
- Serialization
- Finished goods
- Packing
- Final invoice
- Tally sync status
- Dispatch
- Delivery/POD
- Installation
- Commissioning
- Warranty
- Service tickets
- Field engineers
- RMA
- Maintenance where backend supports it
- R&D where backend supports it
- Master data
- Approvals
- Notifications
- Audit trail
- Documents
- Reports
- Management dashboards
- Profile/settings where supported

Do not create fake screens for APIs that do not exist. Document backend gaps instead.

---

# 3. TECHNOLOGY REQUIREMENTS

Use:

- React
- Vite
- JavaScript only
- JSX only
- SCSS Modules
- React functional components
- React hooks
- React Router
- Axios or equivalent centralized HTTP client
- Context and/or Redux only where justified
- MUI Icons only for icons
- Google Fonts
- Inter as primary font
- CSS/SCSS for UI

Do NOT use:

- TypeScript
- `.tsx`
- Tailwind CSS
- Bootstrap
- Material UI component library as the visual design system
- random icon libraries
- giant monolithic components
- duplicated API logic
- hardcoded business permissions
- hardcoded workflow assumptions

MUI Icons are allowed for icons.

---

# 4. DESIGN DIRECTION

Create a modern enterprise ERP interface that is:

- professional
- clean
- modern
- Gen-Z friendly without becoming a consumer app
- manufacturing/enterprise appropriate
- information-dense but readable
- responsive
- accessible
- consistent

Use Inter.

Use restrained professional colors. Use color primarily for status, warnings, errors, success, approval state, priority and alerts.

Do not create a childish, overly colorful dashboard.

---

# 5. RESPONSIVE DESIGN

The ERP must work on:

- desktop
- laptop
- tablet
- mobile

Desktop is the primary ERP environment.

For mobile:

- sidebar becomes drawer
- tables become responsive cards or horizontally scrollable tables
- forms become one-column
- action groups wrap
- filters become collapsible
- detail sections stack
- timelines remain readable
- dialogs fit the viewport

Use CSS Grid, Flexbox, `clamp()`, `rem`, responsive breakpoints and container-aware layouts where useful.

Avoid excessive fixed widths.

---

# 6. APPLICATION SHELL

Create one common ERP shell:

```text
App
├── Authentication
│   └── Login
│
└── Protected ERP
    ├── Header
    ├── Sidebar
    ├── Breadcrumb
    ├── PageHeader
    ├── MainContent
    ├── NotificationCenter
    └── GlobalDialogs
```

Header:

- context/page information
- notifications
- profile
- role
- logout
- global search only if backend supports it

Sidebar visibility must depend on permissions.

Do not expose inaccessible modules simply to reject them after clicking.

---

# 7. ROUTING ARCHITECTURE

Use React Router.

Suggested route map:

```text
/login

/dashboard

/sales
/sales/leads
/sales/leads/:id
/sales/enquiries
/sales/enquiries/:id
/sales/quotations
/sales/quotations/:id
/sales/proforma-invoices
/sales/customer-pos
/sales/customer-pos/:id
/sales/orders
/sales/orders/:id

/finance
/finance/payments
/finance/receivables
/finance/payables
/finance/three-way-match

/production
/production/orders
/production/orders/:id
/production/boms
/production/material-requests

/inventory
/inventory/stock
/inventory/materials
/inventory/transfers
/inventory/adjustments

/procurement
/procurement/purchase-requests
/procurement/rfqs
/procurement/vendor-quotations
/procurement/vendor-pos
/procurement/grn

/manufacturing
/manufacturing/orders
/manufacturing/work-centers

/quality
/quality/inspections
/quality/serials
/quality/finished-goods

/logistics
/logistics/packing
/logistics/invoices
/logistics/dispatch
/logistics/delivery

/service
/service/installations
/service/commissioning
/service/warranties
/service/tickets
/service/rma

/maintenance
/maintenance/assets
/maintenance/work-orders

/rnd
/rnd/projects

/master-data
/master-data/customers
/master-data/products
/master-data/materials
/master-data/vendors
/master-data/warehouses
/master-data/work-centers
/master-data/transporters
/master-data/employees

/approvals
/notifications
/audit
/documents
/reports
/settings
/profile
```

Adjust route names to actual backend-supported entities where necessary.

---

# 8. AUTHENTICATION

Backend contract:

```http
POST /api/v1/auth/login
```

Example body:

```json
{
  "email": "sales@cryo.com",
  "password": "Password@123"
}
```

Response contains:

```text
user
 tokens.accessToken
 tokens.refreshToken
```

User contains:

```text
id
name
email
role
employeeId
department
designation
permissions
```

Flow:

```text
Login
 ↓
Store authenticated session
 ↓
Load user permissions
 ↓
Dashboard
```

All authenticated requests send:

```http
Authorization: Bearer <accessToken>
```

---

# 9. TOKEN REFRESH

When API returns `401` with `AUTHENTICATION_ERROR`, call:

```http
POST /api/v1/auth/refresh
```

```json
{
  "refreshToken": "<refresh_token>"
}
```

Then:

1. update access token
2. update refresh token if returned
3. retry failed request once
4. prevent infinite retries
5. if refresh fails, clear session
6. redirect to login

Implement this centrally in the HTTP client/interceptor.

---

# 10. API CLIENT

Create centralized services:

```text
src/services/api/
├── apiClient.js
├── authApi.js
├── leadApi.js
├── enquiryApi.js
├── quotationApi.js
├── proformaInvoiceApi.js
├── customerPoApi.js
├── salesOrderApi.js
├── paymentApi.js
├── financeApi.js
├── productionApi.js
├── bomApi.js
├── inventoryApi.js
├── procurementApi.js
├── qaApi.js
├── logisticsApi.js
├── serviceApi.js
├── rmaApi.js
├── dashboardApi.js
├── reportApi.js
├── masterDataApi.js
├── notificationApi.js
├── documentApi.js
└── auditApi.js
```

Do not call Axios directly from random components.

Components call services/hooks.

---

# 11. ENVIRONMENT

Development:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Production:

```env
VITE_API_BASE_URL=https://api.cryoscientific.com/api/v1
```

Never hardcode production URLs in components.

---

# 12. STANDARD API RESPONSE HANDLING

Success:

```json
{
  "success": true,
  "message": "Quotation approved successfully",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

Errors:

```text
400 VALIDATION_ERROR
401 AUTHENTICATION_ERROR
403 AUTHORIZATION_ERROR
404 NOT_FOUND
409 DUPLICATE
422 INVALID_WORKFLOW_STATE
422 BUSINESS_RULE_ERROR
500 INTERNAL_SERVER_ERROR
```

Handle errors centrally and display useful user messages.

Never expose raw stack traces.

---

# 13. GLOBAL UX STATES

Create reusable:

```text
ErrorBoundary
ApiError
PermissionDenied
NotFound
EmptyState
LoadingState
Skeleton
RetryState
```

Validation errors should become field-level messages.

Authorization errors should explain that the user lacks permission.

Workflow errors should explain that the current state does not allow the requested action.

Business rule errors should display the backend message.

---

# 14. RBAC

Backend is always the final authority.

Frontend permission checks are for UX.

Use:

```text
hasPermission(permission)
PermissionGuard
RoleGuard
ProtectedRoute
```

Example:

```jsx
<PermissionGuard permission="quotation.approve">
  <ApproveButton />
</PermissionGuard>
```

If permission is missing, do not render restricted actions unless a disabled explanation is intentionally useful.

Never hardcode a different permission system in frontend.

---

# 15. ROLES

Support the documented roles:

```text
ADMIN
SALES
SALES_MANAGER
ACCOUNTS
PURCHASE
STORE
PRODUCTION
QA
DISPATCH
SERVICE_MANAGER
SERVICE_ENGINEER
MANAGEMENT
R_AND_D
```

Use backend permissions rather than assuming role alone determines access.

---

# 16. DASHBOARD

Dashboard is a control center, not a transaction.

Backend:

```http
GET /api/v1/dashboard/metrics
```

Display relevant KPIs returned by backend, including where available:

```text
Total Leads
Open Quotations
Pending Approvals
Open Orders
Payment Pending
Production In Progress
Material Shortage
QA Pending
Ready for Dispatch
Deliveries
Open Service Tickets
```

Each useful KPI should drill down to the related module.

Do not use decorative charts with no business value.

Role visibility must respect permissions.

---

# 17. SALES — LEAD

Backend:

```http
GET /api/v1/leads
POST /api/v1/leads
POST /api/v1/leads/:id/qualify
POST /api/v1/leads/:id/follow-ups
POST /api/v1/leads/:id/convert-to-enquiry
```

Lead list should show:

- lead number
- customer/prospect
- requirement
- source
- salesperson
- status
- next follow-up
- created date
- actions

Lead detail:

```text
Lead Header
Customer/Prospect
Requirement
Contact Information
Activities
Follow-ups
Timeline
Documents
Related Enquiry
```

Workflow:

```text
NEW
 ↓
QUALIFIED
 ↓
FOLLOW-UP
 ↓
INTERESTED
 ↓
ENQUIRY
 ↓
CONVERTED
```

Possible ending:

```text
NOT INTERESTED
 ↓
LOST
```

Do not treat Lead as isolated CRUD. It is the first link in the business chain.

---

# 18. ENQUIRY

Enquiry represents the specific technical requirement after lead qualification.

Support backend fields for:

- customer
- lead
- product
- model
- quantity
- temperature requirement
- capacity
- specifications
- accessories
- installation requirements
- delivery expectations
- technical notes
- attachments

Link Enquiry to Quotation.

Do not invent mandatory fields if the backend schema does not require them.

---

# 19. QUOTATION

Backend:

```http
GET /api/v1/quotations
POST /api/v1/quotations
POST /api/v1/quotations/:id/submit
POST /api/v1/quotations/:id/approve
POST /api/v1/quotations/:id/send
POST /api/v1/quotations/:id/negotiate
POST /api/v1/quotations/:id/revise
POST /api/v1/quotations/:id/accept
```

Quotation is revision controlled:

```text
R0
 ↓
Negotiation
 ↓
R1
 ↓
Negotiation
 ↓
R2
```

Never overwrite historical revisions.

Quotation detail should show:

```text
Quotation Header
Customer
Enquiry
Revision
Line Items
Quantity
Unit Price
Discount
Tax
Subtotal
Grand Total
Payment Terms
Delivery Terms
Warranty
Validity
Notes
Approval Status
Customer Status
Timeline
Documents
Revision History
```

Actions must be state-aware:

```text
Submit
Approve
Send
Negotiate
Revise
Accept
```

Only show actions permitted by current backend state and permission.

---

# 20. QUOTATION APPROVAL

Current source flow:

```text
Quotation
 ↓
Submit
 ↓
Sales Manager Approval
 ↓
Approved
 ↓
Send Customer
```

The source recommends, but does not confirm as final client policy, a possible dual-tier approval:

```text
< ₹10,00,000
→ single approval

> ₹25,00,000 or discount > 15%
→ Sales Manager + Management
```

Do not hardcode these thresholds.

Render the actual approval state returned by backend.

Show:

- current approval state
- pending approver
- approval history
- remarks where provided

---

# 21. NEGOTIATION / REVISION

Negotiation belongs to quotation history.

Flow:

```text
Customer Request
 ↓
Commercial/Technical Change
 ↓
Negotiation Record
 ↓
Revision Required?
 ↓
New Revision
 ↓
Approval
 ↓
Resend
```

Previous revision data must remain visible.

---

# 22. PROFORMA INVOICE

Backend:

```http
POST /api/v1/proforma-invoices
```

Generate from accepted quotation.

Display:

- PI number
- customer
- quotation
- items
- amounts
- tax
- advance/payment terms
- validity
- status
- document

Do not generate an unrelated PI manually if backend expects an accepted quotation.

---

# 23. CUSTOMER PO + VERIFICATION

Backend:

```http
POST /api/v1/customer-pos
POST /api/v1/customer-pos/:id/verify
```

PO screen must support:

- record PO
- attach PO document
- compare with quotation
- verify
- display mismatch
- display mismatch reason
- display hold status
- resolve mismatch where backend supports it

Workflow:

```text
Customer PO
 ↓
Compare with Quotation
 ↓
Match?
 ├── YES → Verify → Sales Order
 └── NO → MISMATCH_HOLD → Resolve
```

Configured price tolerance is currently 0% and is confirmed in the source. Do not implement a hidden tolerance.

---

# 24. SALES ORDER

Backend:

```http
GET /api/v1/sales-orders
GET /api/v1/sales-orders/:id/timeline
GET /api/v1/sales-orders/:id/traceability
```

Sales Order detail should show:

```text
Order Header
Customer
Quotation
PI
Customer PO
PO Verification
Payment Status
Production Status
Delivery Status
Overall Status
Timeline
Traceability
```

Build a 360-degree order page.

---

# 25. PAYMENT GATE

Backend:

```http
GET /api/v1/payments
POST /api/v1/payments
POST /api/v1/payments/:id/verify
```

Flow:

```text
Sales Order
 ↓
Payment Required
 ↓
Payment Recorded
 ↓
Accounts Verification
 ↓
Advance Requirement Met?
 ├── YES → Release to Production
 └── NO → Hold
```

The advance release percentage is configurable. The source lists a default of 30% but marks it pending client confirmation.

Never hardcode 30% in frontend business logic.

Government/custom payment terms may use different gates. Display the backend decision.

---

# 26. FINANCE

Build:

```text
Payments
Receivables
Payables
Three-Way Match
```

Documented endpoints:

```http
GET /api/v1/payments
POST /api/v1/payments
POST /api/v1/payments/:id/verify
GET /api/v1/receivables-summary
GET /api/v1/payables-summary
POST /api/v1/three-way-match
```

Important: verify the actual backend route because another backend API document may represent these routes under `/api/v1/finance/...`. Do not implement both blindly.

Three-way match UI:

```text
Vendor PO
+
GRN
+
Vendor Invoice
=
Match Result
```

Financial approval remains backend-controlled.

---

# 27. PRODUCTION

Backend:

```http
GET /api/v1/production-orders
POST /api/v1/production-orders
POST /api/v1/production-orders/:id/request-materials
POST /api/v1/production-orders/:id/advance-stage
```

Production Order requires a released Sales Order.

Detail should show:

```text
Production Order
Sales Order
Product
Quantity
BOM
Material Requirements
Material Availability
Stage
Work Center
WIP
Consumption
QA
Timeline
```

Stages:

```text
FABRICATION
 ↓
REFRIGERATION
 ↓
ELECTRICAL
 ↓
ASSEMBLY
 ↓
COMPLETED
```

Use a stepper/timeline. Do not permit arbitrary stage jumping from a generic dropdown.

---

# 28. BOM

Backend:

```http
GET /api/v1/boms
POST /api/v1/boms
```

BOM UI:

```text
Product
Version
Effective Date
Components
Quantity
Unit
Material
Optional/Required
Notes
```

Link BOM to production order.

---

# 29. MATERIAL REQUEST

Flow:

```text
Production Order
 ↓
Request Materials
 ↓
Store Checks Stock
```

Availability:

```text
FULL
PARTIAL
NONE
```

FULL:

```text
Issue Material
```

PARTIAL:

```text
Issue available
+
Procure shortage
```

NONE:

```text
Procurement
```

Backend is authoritative for final availability.

---

# 30. INVENTORY / STORE

Build supported pages for:

- stock overview
- material stock
- warehouse stock
- stock ledger
- material issue
- material return
- warehouse transfer
- stock adjustment
- low stock
- service spares

Important rules:

```text
Full stock → issue material
Partial stock → issue available + procure shortage
No stock → procurement
```

Negative inventory is prohibited.

If backend returns `422 BUSINESS_RULE_ERROR`, show the business message.

Stock adjustment should show:

```text
Reason
Requested By
Approval
Adjustment
Audit Trail
```

Warehouse transfer should show transfer and receiving history.

---

# 31. PROCUREMENT

Build:

```text
Purchase Requests
RFQs
Vendor Quotations
Vendor POs
GRN
```

Flow:

```text
Material Shortage
 ↓
Purchase Request
 ↓
RFQ
 ↓
Vendor Quotations
 ↓
Vendor Selection
 ↓
Vendor PO
 ↓
GRN
 ↓
Inventory
```

If backend automatically creates a Purchase Request from shortage, show the relationship.

Do not create duplicate procurement records.

---

# 32. GRN

GRN must distinguish:

```text
Received
Accepted
Rejected
Damaged
```

Display, where supported:

```text
Vendor
Vendor PO
Material
Ordered Qty
Received Qty
Accepted Qty
Rejected Qty
Damaged Qty
Warehouse
QA Status
```

Do not assume received quantity is automatically usable stock.

---

# 33. MANUFACTURING

Represent actual production stages and WIP.

Work centers include documented examples such as:

```text
Fabrication
Refrigeration
Electrical
Mechanical Assembly
QA Bay
```

For each stage show available backend data for:

- status
- assigned operator
- start time
- end time
- work center
- notes
- WIP
- consumption

---

# 34. QA

Backend:

```http
GET /api/v1/inspections
POST /api/v1/inspections/:id/pass
POST /api/v1/inspections/:id/fail
```

QA is a critical gate.

Source workflow includes:

- temperature drawdown
- temperature hold
- power consumption
- safety alarms
- data logger evidence

Configured test duration:

```text
PULLDOWN_TEST_DURATION_HOURS = 24
```

Do not implement QA pass/fail business logic independently in frontend.

Display backend state and results.

---

# 35. QA FAILURE

Flow:

```text
QA
 ↓
FAIL
 ↓
REWORK_IN_PROGRESS
 ↓
RETEST
 ├── PASS
 └── FAIL
      ↓
   SCRAPPED
```

Failed/rework/scrapped states must be highly visible.

---

# 36. SERIALIZATION

Backend:

```http
GET /api/v1/serials/trace/:serialNumber
```

Successful QA can issue a Serial Number and Calibration Certificate.

Configured prefix:

```text
CRYO-SN
```

Serial trace page should show available relationships:

```text
Serial Number
Product
Sales Order
Production Order
BOM
Material Consumption
Production Stages
QA
Certificate
Packing
Invoice
Dispatch
Delivery
Installation
Warranty
Service
RMA
```

This is one of the most important ERP screens.

---

# 37. FINISHED GOODS

Backend:

```http
GET /api/v1/finished-goods
```

Show:

- serial
- product
- warehouse
- status
- QA status
- packing status
- invoice status
- dispatch status

Provide navigation to packing where permitted.

---

# 38. PACKING

Backend:

```http
POST /api/v1/packing
```

Workflow:

```text
Finished Goods
 ↓
Packing Checklist
 ↓
Protective Packaging
 ↓
Wooden Crate
 ↓
Ready for Invoice / Dispatch
```

Do not permit UI actions that backend would reject.

---

# 39. FINAL INVOICE + TALLY

Backend:

```http
POST /api/v1/final-invoices
```

Display:

- invoice number
- customer
- GST
- items
- serial numbers where applicable
- tax
- totals
- payment status
- Tally status

Configured Tally export format is:

```text
XML
```

Do not recreate accounting calculations in frontend.

---

# 40. DISPATCH

Backend:

```http
POST /api/v1/dispatch
```

Display:

```text
Invoice
Packing
Finished Goods
Transporter
LR Number
Dispatch Date
Tracking
Destination
Freight
Documents
```

Use actual backend fields.

---

# 41. DELIVERY / POD

Backend:

```http
POST /api/v1/dispatch/:dispatchId/pod
```

Flow:

```text
Delivery
 ↓
Proof of Delivery
 ↓
Customer Sign-off
 ↓
Delivered
```

Capture only fields supported by backend.

---

# 42. INSTALLATION

Backend:

```http
POST /api/v1/installations
POST /api/v1/installations/:id/commission
```

Flow:

```text
Dispatch
 ↓
Site
 ↓
Installation
 ↓
Verification
 ↓
Commissioning
```

---

# 43. COMMISSIONING + WARRANTY

Commissioning activates warranty.

Backend:

```http
POST /api/v1/installations/:id/commission
GET /api/v1/warranties/check/:serialNumber
```

Default warranty is 12 months and is confirmed in source configuration.

The source describes the warranty timing as from commissioning or 15 months from dispatch, whichever occurs first. Do not independently override backend warranty dates.

Display:

```text
Warranty Status
Start Date
End Date
Remaining Days
Covered?
```

---

# 44. SERVICE

Backend:

```http
POST /api/v1/service-tickets
POST /api/v1/service-tickets/:id/assign
POST /api/v1/service-tickets/:id/diagnose
POST /api/v1/service-tickets/:id/spares
POST /api/v1/service-tickets/:id/repair
POST /api/v1/service-tickets/:id/signoff
```

Flow:

```text
Customer Complaint
 ↓
Warranty Check
 ↓
Service Ticket
 ↓
Assign Engineer
 ↓
Diagnosis
 ↓
Repair
 ↓
Spare Consumption if required
 ↓
Customer Sign-off
 ↓
Close
```

Service detail should show customer, serial, product, warranty, complaint, priority, engineer, diagnosis, spares, repair, visit history, sign-off, documents and timeline where supported.

---

# 45. RMA

Backend:

```http
POST /api/v1/rmas
POST /api/v1/rmas/:id/approve
POST /api/v1/rmas/:id/resolve
```

Resolution options:

```text
REPAIR_RETURN
REPLACEMENT
CREDIT_NOTE
REFUND
```

Flow:

```text
Customer Return
 ↓
RMA
 ↓
Evaluation
 ↓
Approval
 ↓
Resolution
```

Show relationships to Customer, Sales Order, Invoice, Serial, Warranty and Service Ticket where available.

---

# 46. MAINTENANCE + R&D

Build maintenance and R&D only to the extent supported by actual backend APIs/models.

Maintenance may include:

- assets
- preventive maintenance
- schedules
- work orders
- service history
- downtime
- costs

R&D should remain an internal operational area and should not be inserted into the normal customer lifecycle unless backend workflow requires it.

Never create fake APIs to make these screens appear complete.

---

# 47. MASTER DATA

Build reusable pages for supported master entities:

```text
Customers
Products
Materials
Vendors
Warehouses
Work Centers
Transporters
Employees / Users
```

Support backend-supported operations:

```text
List
Search
Filter
Create
View
Edit
Activate / Deactivate
```

Do not expose destructive actions without permission.

---

# 48. COMMON LIST PAGE

Every major list follows:

```text
Page Header
 ↓
KPI / Summary if useful
 ↓
Search + Filters
 ↓
Table
 ↓
Pagination
```

Standard filters:

```text
Search
Status
Date Range
Owner
Department
Warehouse
Priority
```

Only show relevant filters.

Backend supports standard query concepts:

```text
page
limit
search
status
sortBy
sortOrder
startDate
endDate
```

Defaults:

```text
page = 1
limit = 20
sortBy = createdAt
sortOrder = desc
```

Maximum limit is 100.

---

# 49. TABLE UX

Tables need:

- loading state
- empty state
- error state
- pagination
- sorting
- row actions
- responsive behavior
- status badges
- permission-based actions

Avoid excessive action buttons.

Use View/Edit/More where appropriate, with workflow actions on detail pages.

---

# 50. DETAIL PAGE STANDARD

Every transaction detail page should use:

```text
Header
Status
Primary Actions
Summary
Related Information
Workflow
Timeline
Documents
Audit
Related Transactions
```

Example:

```text
Quotation QT-0001
[APPROVED]

Customer: ABC Hospital
Value: ₹XX

[Send] [Revise] [Accept]

Overview
Items
Approval
Negotiation
Revision History
Documents
Timeline
Audit
```

---

# 51. STATUS SYSTEM

Create reusable status components.

Possible backend-driven display statuses include:

```text
Draft
Pending
Approved
Rejected
Sent
Accepted
On Hold
Mismatch Hold
Released
In Progress
Completed
Failed
Rework
Scrapped
Ready
Dispatched
Delivered
Warranty Active
Open
Closed
```

Do not invent enums when backend provides exact values.

Map backend values to display labels centrally.

---

# 52. WORKFLOW STEPPER

Create reusable:

```text
WorkflowStepper
WorkflowTimeline
WorkflowStatus
```

Example:

```text
Lead
 ✓
Enquiry
 ✓
Quotation
 ✓
PO
 ✓
Sales Order
 ✓
Payment
 ●
Production
 ○
QA
 ○
Dispatch
 ○
Installation
 ○
Warranty
 ○
Service
```

Current state must be obvious.

---

# 53. TRACEABILITY

Create reusable `TraceabilityChain`.

For a Sales Order:

```text
Lead
 ↓
Enquiry
 ↓
Quotation
 ↓
PI
 ↓
Customer PO
 ↓
Sales Order
 ↓
Payment
 ↓
Production
 ↓
BOM
 ↓
Material
 ↓
QA
 ↓
Serial
 ↓
Packing
 ↓
Invoice
 ↓
Dispatch
 ↓
Delivery
 ↓
Installation
 ↓
Warranty
 ↓
Service
```

Each node should navigate to the related record where available.

---

# 54. TIMELINE

Create reusable timeline:

```text
Date
Time
User
Action
Status
Remarks
```

Use actual backend timeline/audit data.

Do not expose sensitive audit information without permission.

---

# 55. APPROVAL CENTER

If backend supports centralized approval data, build:

```text
Pending Approvals
Approved
Rejected
My Requests
```

Show:

```text
Module
Record
Amount
Requested By
Requested Date
Current Approver
Priority
Status
```

Approval actions require permissions.

---

# 56. NOTIFICATIONS

Build:

```text
NotificationBell
NotificationPanel
NotificationsPage
```

Notifications may concern:

- quotation approval
- PO mismatch
- payment verification
- material shortage
- procurement
- QA failure
- dispatch
- service assignment
- RMA
- approvals

Navigate to related entity when backend supplies a reference.

---

# 57. AUDIT TRAIL

Audit is immutable.

Where authorized show:

```text
User
Action
Module
Entity
Before
After
IP
Timestamp
Remarks
```

Never create an edit/delete action for audit records.

---

# 58. DOCUMENTS

Create reusable attachment/view/download UI if backend supports documents.

Possible documents:

```text
Quotation PDF
Customer PO
PI
Calibration Certificate
Invoice
Packing Document
LR
POD
Service Documents
RMA Documents
```

Use backend document IDs/URLs. Never expose storage secrets.

---

# 59. REPORTS

Known documented report endpoints:

```http
GET /api/v1/reports/sales
GET /api/v1/reports/production
GET /api/v1/reports/quality
GET /api/v1/reports/service
```

Sales:

- lead conversion
- quotation acceptance
- sales value

Production:

- WIP
- stage counts
- completion

Quality:

- pass rate
- scrap rate
- inspection totals

Service:

- open tickets
- warranty vs chargeable

Do not fabricate metrics not returned by backend.

---

# 60. FORMS

Create reusable:

```text
FormField
TextInput
Select
DatePicker
NumberInput
Textarea
SearchSelect
FileUpload
LineItemEditor
FormSection
FormActions
```

Support:

- initial values
- validation
- backend validation errors
- loading
- disabled state
- unsaved-change warning where needed
- success feedback

Never lose entered data after validation errors.

---

# 61. LINE ITEMS

Quotation, invoice, BOM and procurement documents may use line items.

Create reusable `LineItemTable`.

Support actual backend fields for:

- item
- quantity
- unit
- price
- discount
- tax
- subtotal
- total

Do not duplicate line-item logic.

---

# 62. MODALS / DRAWERS

Use modals for:

- confirmations
- approvals
- rejection remarks
- quick actions
- small forms

Use full pages/drawers for complex ERP forms.

---

# 63. CONFIRMATION UX

Require confirmation for dangerous operations such as:

```text
Cancel
Reject
Scrap
Stock Adjustment
Refund
RMA Resolution
Delete if backend supports it
```

Explain what will happen and which record is affected.

---

# 64. LOADING / DUPLICATE SUBMISSION

Every page must have loading/error/empty states.

Action buttons must show pending state and prevent duplicate clicks.

Do not assume an API call succeeded until the response returns successfully.

---

# 65. TOASTS

Use one consistent toast/notification system.

Success example:

```text
Quotation submitted successfully.
```

Error example:

```text
Unable to submit quotation. Please review the highlighted fields.
```

Never show raw Axios errors.

---

# 66. ACCESSIBILITY

Support:

- keyboard navigation
- visible focus
- labels
- aria attributes
- sufficient contrast
- semantic HTML
- accessible errors
- accessible dialogs
- accessible tables

Do not make color the only status indicator.

---

# 67. PROJECT STRUCTURE

Use a scalable structure such as:

```text
src/
├── app/
│   ├── App.jsx
│   ├── routes.jsx
│   └── providers/
├── assets/
├── components/
│   ├── common/
│   ├── layout/
│   ├── forms/
│   ├── tables/
│   ├── workflow/
│   ├── timeline/
│   ├── documents/
│   └── charts/
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── sales/
│   ├── finance/
│   ├── production/
│   ├── inventory/
│   ├── procurement/
│   ├── quality/
│   ├── logistics/
│   ├── service/
│   ├── maintenance/
│   ├── rnd/
│   ├── masterData/
│   ├── approvals/
│   ├── notifications/
│   ├── audit/
│   ├── documents/
│   └── reports/
├── hooks/
├── services/
│   └── api/
├── utils/
├── constants/
├── permissions/
├── contexts/
├── styles/
└── main.jsx
```

Feature ownership should remain clear.

---

# 68. COMPONENT RULE

Prefer:

```text
One component
+
One JSX file
+
One SCSS module
```

Avoid 1000-line components.

Example:

```text
QuotationDetails/
├── QuotationDetails.jsx
├── QuotationDetails.module.scss
├── QuotationHeader.jsx
├── QuotationItems.jsx
├── QuotationApproval.jsx
├── QuotationNegotiation.jsx
├── QuotationRevisionHistory.jsx
├── QuotationTimeline.jsx
└── QuotationDocuments.jsx
```

---

# 69. SCSS

Use SCSS Modules.

Centralize design tokens where useful:

```scss
:root {
  --font-family: "Inter", sans-serif;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
}
```

Do not scatter random style values.

---

# 70. STATE MANAGEMENT

Use local state for local UI.

Use global state for application-wide state such as:

```text
Authentication
User
Permissions
Notifications if needed
Global settings if needed
```

Do not duplicate server data across unrelated global stores.

If Redux already exists, organize it by feature.

---

# 71. URL STATE

Use URL query parameters for list filters where useful:

```text
?page=1
&search=freezer
&status=APPROVED
&sortBy=createdAt
&sortOrder=desc
```

This improves refresh, sharing and browser navigation.

---

# 72. FORM VALIDATION

Frontend validation is for UX only.

Backend validation is authoritative.

Always display backend validation errors.

Never assume frontend validation makes an operation valid.

---

# 73. BUSINESS RULES — NEVER HARD-CODE CLIENT-CHANGEABLE VALUES

Known source configuration includes:

```text
ADVANCE_PAYMENT_RELEASE_PCT = 30
DEFAULT_WARRANTY_MONTHS = 12
AUTO_PO_VERIFY_PRICE_TOLERANCE_PCT = 0
PULLDOWN_TEST_DURATION_HOURS = 24
REORDER_AUTO_PR_ENABLED = true
CREDIT_LIMIT_ENFORCEMENT = WARN
SERIAL_NUMBER_PREFIX = CRYO-SN
TALLY_EXPORT_FORMAT = XML
```

Pending client confirmation:

```text
ADVANCE_PAYMENT_RELEASE_PCT
REORDER_AUTO_PR_ENABLED
CREDIT_LIMIT_ENFORCEMENT
```

Therefore:

- do not hardcode pending business rules in UI logic
- use backend state/configuration when available
- display backend decisions
- allow future configuration without frontend redesign

---

# 74. PAYMENT TERM EXCEPTION

The source supports customer-specific/custom payment terms.

Do not force every customer through one fixed advance percentage.

Display actual backend payment terms and gate status.

---

# 75. CREDIT LIMIT

Current source configuration is `WARN`, pending client confirmation.

Frontend should display a backend warning/block state.

Do not independently block quotation conversion.

---

# 76. NEGATIVE INVENTORY

Strict rule:

```text
quantityAvailable >= requestedQuantity
```

No negative inventory.

Frontend may prevent an obvious invalid submission, but backend remains authoritative.

---

# 77. WORKFLOW ACTION VISIBILITY

Every action is determined by:

```text
Current Status
+
Permission
+
Backend-supported transition
```

Example:

```text
Quotation = DRAFT
Permission = quotation.submit
→ show Submit
```

If quotation is already APPROVED, do not show Submit/Approve unless backend explicitly permits that transition.

---

# 78. NO FAKE SUCCESS

For every state-changing request:

1. wait for backend response
2. display backend message
3. refresh affected record
4. refresh affected list/summary
5. update timeline/status
6. update related data where required

Do not set status locally before backend confirmation.

---

# 79. RELATED DATA REFRESH

Example:

```text
Payment verified
 ↓
Sales Order payment status
 ↓
Production release status
 ↓
Dashboard metric
```

Avoid stale ERP information.

---

# 80. OPTIMISTIC UPDATES

Avoid optimistic updates for critical ERP transitions unless rollback is guaranteed.

Prefer server-confirmed updates for:

- approval
- payment verification
- stock issue
- production stage
- QA pass/fail
- dispatch
- commissioning
- RMA resolution

---

# 81. DATA INTEGRITY

Prevent accidental duplicates:

- disable submit while pending
- prevent double-click
- avoid duplicate POST after refresh
- use backend IDs
- refresh from server after mutation

Backend remains the final protection.

---

# 82. MULTI-USER ERP

Assume multiple departments operate simultaneously.

Examples:

```text
Sales Manager approves quotation
Accounts verifies payment
Store issues material
Production advances stage
QA completes inspection
```

Re-fetch after critical mutations.

Do not depend on stale browser state.

---

# 83. ROLE-AWARE DASHBOARD

Examples:

Sales:

```text
Leads
Quotations
Pending Approvals
Sales Value
```

Production:

```text
Production Orders
Material Shortage
WIP
QA Pending
```

Accounts:

```text
Receivables
Payments
Payables
Three-Way Match
```

Management:

```text
Company-wide KPIs
```

Visibility must follow backend permissions.

---

# 84. COMMON ERP COMPONENTS

Create and reuse:

```text
PageHeader
Breadcrumbs
DataTable
Pagination
SearchBar
FilterBar
StatusBadge
PriorityBadge
KpiCard
EmptyState
ErrorState
LoadingState
ConfirmDialog
FormSection
FormActions
Modal
Drawer
Timeline
WorkflowStepper
ApprovalPanel
DocumentList
DocumentViewer
ActivityFeed
PermissionGuard
ProtectedRoute
```

---

# 85. MENU STRUCTURE

Suggested navigation:

```text
Dashboard

Sales
  Leads
  Enquiries
  Quotations
  Proforma Invoices
  Customer POs
  Sales Orders

Finance
  Payments
  Receivables
  Payables
  Three-Way Match

Production
  Production Orders
  BOM
  Material Requests

Inventory
  Stock
  Material Issue
  Transfers
  Adjustments
  Low Stock

Procurement
  Purchase Requests
  RFQs
  Vendor Quotations
  Vendor POs
  GRN

Quality
  Inspections
  Serial Numbers
  Finished Goods

Logistics
  Packing
  Invoices
  Dispatch
  Delivery / POD

Service
  Installations
  Commissioning
  Warranty
  Service Tickets
  RMA

Maintenance
R&D
Master Data
Approvals
Notifications
Reports
Audit
Settings
```

Only expose modules/actions allowed by permissions.

---

# 86. PAGE TITLES + BREADCRUMBS

Use meaningful browser titles:

```text
Dashboard | Cryo ERP
Leads | Cryo ERP
Quotation QT-0001 | Cryo ERP
Production Order PO-0001 | Cryo ERP
```

Breadcrumbs should use business context:

```text
Sales / Quotations / QT-000001
```

---

# 87. FILTERS + PAGINATION + SORTING

Use server-side:

```text
page
limit
search
status
sortBy
sortOrder
startDate
endDate
```

Use backend metadata:

```json
{
  "page": 1,
  "limit": 20,
  "total": 45,
  "totalPages": 3
}
```

Do not calculate totals from partial client-side lists.

Search should be debounced, approximately 300–500ms where appropriate.

---

# 88. FILE / DOCUMENT HANDLING

If backend provides upload/download APIs, integrate those APIs.

Do not put storage credentials in Vite env.

Do not invent document URLs.

---

# 89. FRONTEND SECURITY

Never put in frontend:

- database credentials
- JWT secrets
- private API keys
- Cloudinary secret
- Tally secret
- backend credentials

Only public frontend configuration belongs in Vite environment variables.

---

# 90. ROUTE SECURITY

`/login` is public.

All ERP pages require authentication unless backend explicitly documents otherwise.

Use protected routes and permission checks.

---

# 91. LOGOUT

Logout must:

1. clear session
2. clear tokens according to documented strategy
3. clear user state
4. clear sensitive cached data
5. redirect to login

---

# 92. API CONTRACT VERIFICATION

Before wiring each module:

1. inspect actual backend route
2. inspect method
3. inspect request body
4. inspect response body
5. inspect status values
6. inspect permission
7. inspect error behavior
8. implement frontend

Do not guess request fields.

---

# 93. IMPORTANT DOCUMENTED API INCONSISTENCY

The frontend integration documentation lists finance routes as:

```text
/api/v1/receivables-summary
/api/v1/payables-summary
/api/v1/three-way-match
```

A separate API documentation version may represent finance endpoints under:

```text
/api/v1/finance/...
```

Verify the actual backend implementation before connecting these pages.

Do not implement both variants blindly.

Also verify any differences involving:

```text
follow-up / follow-ups

dispatch / dispatches

delivery / POD

service

RMA
```

Document the final resolved contract in:

```text
docs/FRONTEND_INTEGRATION_ISSUES.md
```

---

# 94. BACKEND GAP TRACKING

If frontend discovers:

```text
missing endpoint
missing response field
wrong route
missing permission
missing entity
```

create:

```text
docs/FRONTEND_BACKEND_GAPS.md
```

Use:

```md
## Issue

### Frontend Need

### Expected Backend Contract

### Actual Backend Contract

### Impact

### Recommended Backend Change
```

Do not silently mock missing production data.

---

# 95. NO MOCK DATA IN FINAL BUILD

Mock data is allowed temporarily for UI development only.

Before completion remove:

- fake API responses
- fake KPI numbers
- fake statuses
- fake permissions
- hardcoded records

Production screens must use real backend data.

---

# 96. TRACEABILITY-FIRST UX

For every important transaction, users should be able to answer:

```text
Where did this record come from?
What happened to it?
Who changed it?
What is its current status?
What is the next allowed action?
What related records exist?
```

Design detail pages around these questions.

---

# 97. BUSINESS WORKFLOW EXCEPTIONS

Support backend-driven exception states.

## PO mismatch

```text
PO
 ↓
MISMATCH_HOLD
 ↓
Reason
 ↓
Resolution
```

## Material shortage

```text
Material Request
 ↓
Shortage
 ↓
Purchase Request
 ↓
Procurement
```

## QA failure

```text
QA FAIL
 ↓
REWORK
 ↓
RETEST
```

## Scrap

```text
QA FAIL
 ↓
Unrecoverable
 ↓
SCRAP
```

## Delivery failure

```text
FAILED_ATTEMPT
 ↓
Reschedule / Factory Return
```

## RMA

```text
RMA
 ↓
Approve
 ↓
Repair / Replacement / Credit / Refund
```

Do not force exception states back into normal success paths.

---

# 98. END-TO-END WORKFLOW TEST

At least one complete test path must be executed against the real backend:

```text
Create Lead
 ↓
Qualify
 ↓
Convert to Enquiry
 ↓
Create Quotation
 ↓
Submit
 ↓
Approve
 ↓
Send
 ↓
Negotiate if needed
 ↓
Revise if needed
 ↓
Accept
 ↓
Generate PI
 ↓
Record Customer PO
 ↓
Verify PO
 ↓
Sales Order
 ↓
Record Payment
 ↓
Verify Payment
 ↓
Release Production
 ↓
Production Order
 ↓
BOM
 ↓
Request Materials
 ↓
Stock Check
 ↓
Issue / Procurement
 ↓
Production Stages
 ↓
QA
 ↓
Pass
 ↓
Serial
 ↓
Certificate
 ↓
Finished Goods
 ↓
Packing
 ↓
Final Invoice
 ↓
Tally Sync
 ↓
Dispatch
 ↓
POD
 ↓
Installation
 ↓
Commissioning
 ↓
Warranty
 ↓
Service Ticket
 ↓
Engineer
 ↓
Diagnosis
 ↓
Repair
 ↓
Customer Sign-off
```

Test exception branches separately.

---

# 99. ROLE TESTING

Test at minimum:

```text
ADMIN
SALES
SALES_MANAGER
ACCOUNTS
PURCHASE
STORE
PRODUCTION
QA
DISPATCH
SERVICE_MANAGER
SERVICE_ENGINEER
MANAGEMENT
R_AND_D
```

Verify:

- visible menu
- visible actions
- route access
- API authorization
- forbidden action UX

---

# 100. EXCEPTION TESTING

Test:

```text
PO mismatch
Payment failure / insufficient payment
Material shortage
Negative stock attempt
QA failure
Rework
Scrap
Delivery failure
RMA
Repair
Replacement
Credit
Refund
Stock adjustment
Warehouse transfer
Vendor return where supported
```

---

# 101. PERFORMANCE

Optimize where useful:

- route-level lazy loading
- image loading
- API request deduplication
- server-side pagination
- debounce
- memoization where justified

Do not over-engineer.

---

# 102. BROWSER NAVIGATION

Support:

```text
Back
Forward
Refresh
Deep Link
Direct URL
```

Refreshing a detail URL must not break the application.

---

# 103. DOCUMENTATION TO CREATE

Create and maintain:

```text
docs/
├── FRONTEND_ARCHITECTURE.md
├── FRONTEND_INTEGRATION_ISSUES.md
├── FRONTEND_BACKEND_GAPS.md
├── ROUTE_MAP.md
├── RBAC_UI_MATRIX.md
└── E2E_TEST_RESULTS.md
```

`ROUTE_MAP.md` should document:

```text
Frontend Route
Backend Endpoint(s)
Permission
Role Visibility
```

`RBAC_UI_MATRIX.md` should be based on actual backend permissions, not invented permissions.

---

# 104. BUILD ORDER

Build in this order.

## Phase 1 — Foundation

```text
Vite
Routing
SCSS
Theme
Layout
HTTP client
Authentication
RBAC
Error handling
```

## Phase 2 — Dashboard

```text
Dashboard
Navigation
KPIs
```

## Phase 3 — Sales

```text
Lead
Enquiry
Quotation
Negotiation
Revision
PI
Customer PO
Verification
Sales Order
```

## Phase 4 — Finance

```text
Payments
Verification
Receivables
Payables
Three-way match
```

## Phase 5 — Production

```text
BOM
Production Orders
Material Requests
```

## Phase 6 — Inventory + Procurement

```text
Inventory
Issue
Transfers
Adjustments
Purchase Request
RFQ
Vendor Quotation
Vendor PO
GRN
```

## Phase 7 — Manufacturing + QA

```text
Manufacturing
QA
Serialization
Certificates
Finished Goods
```

## Phase 8 — Logistics

```text
Packing
Final Invoice
Tally status
Dispatch
POD
```

## Phase 9 — Service

```text
Installation
Commissioning
Warranty
Service
RMA
```

## Phase 10 — Governance

```text
Approvals
Notifications
Audit
Documents
Reports
```

## Phase 11 — QA

```text
RBAC testing
Workflow testing
Exception testing
Responsive testing
API error testing
End-to-end testing
```

---

# 105. IMPLEMENTATION STRATEGY

Do not build every page independently.

First build shared platform infrastructure.

Then build one vertical slice:

```text
Lead
 ↓
Enquiry
 ↓
Quotation
 ↓
Approval
 ↓
Acceptance
```

Verify it against backend.

Then continue:

```text
PI
 ↓
PO
 ↓
Sales Order
 ↓
Payment
```

Then production and downstream modules.

This preserves the connected ERP workflow.

---

# 106. DEFINITION OF DONE — PAGE

A page is complete only when:

- route works
- permission works
- API integration works
- loading state works
- empty state works
- error state works
- validation works
- action permissions work
- responsive layout works
- navigation works
- list/detail relationship works
- no fake data remains
- browser refresh/deep link works

---

# 107. DEFINITION OF DONE — MODULE

A module is complete only when supported operations include:

- list
- detail
- create if supported
- edit if supported
- filters
- pagination
- permissions
- workflow actions
- related records
- timeline where available
- errors
- loading
- responsive UI
- API contract verification
- documentation

---

# 108. DEFINITION OF DONE — ERP

The frontend is complete only when the supported complete lifecycle works:

```text
Authentication
✓

RBAC
✓

Dashboard
✓

Lead
✓

Enquiry
✓

Quotation
✓

Negotiation
✓

Revision
✓

PI
✓

Customer PO
✓

PO Verification
✓

Sales Order
✓

Payment
✓

Production
✓

BOM
✓

Material Request
✓

Inventory
✓

Procurement
✓

Manufacturing
✓

QA
✓

Serialization
✓

Finished Goods
✓

Packing
✓

Invoice
✓

Dispatch
✓

POD
✓

Installation
✓

Commissioning
✓

Warranty
✓

Service
✓

RMA
✓

Approvals
✓

Notifications
✓

Audit
✓

Documents
✓

Reports
✓
```

Only mark a module complete when its backend-supported behavior has actually been integrated.

---

# 109. FINAL VERIFICATION CHECKLIST

## Architecture

- [ ] Vite works
- [ ] React works
- [ ] JavaScript/JSX only
- [ ] SCSS Modules
- [ ] No Tailwind
- [ ] No Bootstrap
- [ ] MUI Icons only
- [ ] Inter font
- [ ] Responsive

## Authentication

- [ ] Login
- [ ] Access token
- [ ] Refresh token
- [ ] 401 refresh
- [ ] Logout
- [ ] Protected routes

## RBAC

- [ ] Permission guard
- [ ] Role handling
- [ ] Menu filtering
- [ ] Action filtering
- [ ] Backend remains authority

## Sales

- [ ] Lead
- [ ] Enquiry
- [ ] Quotation
- [ ] Approval
- [ ] Negotiation
- [ ] Revision
- [ ] Acceptance
- [ ] PI
- [ ] Customer PO
- [ ] Verification
- [ ] Sales Order

## Finance

- [ ] Payments
- [ ] Payment verification
- [ ] Receivables
- [ ] Payables
- [ ] Three-way match

## Production

- [ ] BOM
- [ ] Production order
- [ ] Material request
- [ ] Production stages

## Inventory

- [ ] Stock
- [ ] Issue
- [ ] Return
- [ ] Transfer
- [ ] Adjustment
- [ ] Low stock
- [ ] Negative inventory protection

## Procurement

- [ ] Purchase request
- [ ] RFQ
- [ ] Vendor quotation
- [ ] Vendor PO
- [ ] GRN

## QA

- [ ] Inspection
- [ ] Pass
- [ ] Fail
- [ ] Rework
- [ ] Scrap
- [ ] Serial
- [ ] Certificate

## Logistics

- [ ] Finished goods
- [ ] Packing
- [ ] Invoice
- [ ] Tally status
- [ ] Dispatch
- [ ] POD

## Service

- [ ] Installation
- [ ] Commissioning
- [ ] Warranty
- [ ] Ticket
- [ ] Assignment
- [ ] Diagnosis
- [ ] Spare
- [ ] Repair
- [ ] Signoff
- [ ] RMA

## Governance

- [ ] Approvals
- [ ] Notifications
- [ ] Audit
- [ ] Documents
- [ ] Reports

## Quality

- [ ] No fake production data
- [ ] No fake API success
- [ ] No broken routes
- [ ] No console errors
- [ ] No unauthorized actions
- [ ] No hardcoded business thresholds
- [ ] No broken refresh/deep links
- [ ] Responsive desktop/tablet/mobile
- [ ] Complete end-to-end workflow tested

---

# 110. MOST IMPORTANT PRINCIPLE

Build the frontend around the **business workflow**, not around database collections.

Bad:

```text
Leads page
Quotations page
Production page
Inventory page
Service page
```

Good:

```text
CUSTOMER OPPORTUNITY
        ↓
LEAD
        ↓
ENQUIRY
        ↓
QUOTATION
        ↓
NEGOTIATION
        ↓
ACCEPTANCE
        ↓
PROFORMA
        ↓
CUSTOMER PO
        ↓
PO VERIFICATION
        ↓
SALES ORDER
        ↓
PAYMENT
        ↓
PRODUCTION
        ↓
MATERIALS
        ↓
PROCUREMENT
        ↓
MANUFACTURING
        ↓
QA
        ↓
SERIAL
        ↓
PACKING
        ↓
INVOICE
        ↓
DISPATCH
        ↓
DELIVERY
        ↓
INSTALLATION
        ↓
COMMISSIONING
        ↓
WARRANTY
        ↓
SERVICE
        ↓
RMA
```

Every important record must expose where it came from and where it goes next.

The UI must make this relationship obvious to users.

---

# 111. FINAL COMMAND TO THE AGENTIC AI

Now execute the following sequence:

1. Read this entire `FRONTEND_MASTER_PROMPT.md`.
2. Read all available backend documentation.
3. Inspect the actual backend route/controller/service implementation if available.
4. Inspect the existing frontend project if available.
5. Create the frontend architecture.
6. Create shared layout, authentication, RBAC and API infrastructure.
7. Implement modules in the prescribed order.
8. Integrate every supported page with the real backend.
9. Resolve and document API contract inconsistencies.
10. Implement loading, error, empty, permission and responsive states.
11. Implement connected workflow navigation and traceability.
12. Test every major workflow.
13. Test exception workflows.
14. Test all documented roles.
15. Remove all production mock data.
16. Fix console/runtime errors.
17. Run the production build.
18. Verify direct routes and deep links.
19. Verify responsive behavior.
20. Update frontend documentation.
21. Do not declare completion until the complete supported ERP lifecycle works end-to-end.

**Do not build a fake ERP UI. Build the actual connected Cryo Scientific Systems ERP frontend.**
