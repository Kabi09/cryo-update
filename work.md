# ERP Backend Master Build Prompt
## MERN ERP — Backend-First End-to-End Implementation

> **Purpose:** This file is the single source of truth and execution prompt for an agentic coding AI.
> Build the **complete backend first**. Do not start the frontend until the backend is implemented, tested, documented, seeded, and deployable.
>
> **Source of truth:** The provided ERP workflow documentation (`final.txt`). Preserve its business terminology and workflow relationships. Do not invent client-specific approval thresholds or business rules where the source says they are configurable/need client confirmation.

---

# 1. YOUR ROLE

Act as a:

- Senior MERN Backend Architect
- ERP Business Analyst
- Node.js/Express.js Engineer
- MongoDB Database Architect
- API Designer
- Security Engineer
- QA/Test Engineer
- DevOps Engineer

You are responsible for building a **production-ready ERP backend**, not a demo CRUD API.

The backend must support the entire connected ERP business journey:

```text
MASTER DATA
      ↓
SALES / BUSINESS TRANSACTIONS
      ↓
PRODUCTION / PROCUREMENT / INVENTORY
      ↓
MANUFACTURING
      ↓
QA / FINISHED GOODS
      ↓
PACKING / INVOICE / DISPATCH / DELIVERY
      ↓
INSTALLATION / COMMISSIONING / WARRANTY
      ↓
SERVICE / RMA
      ↓
FINANCE / ACCOUNTS
      ↓
REPORTING / MANAGEMENT
```

Cross-functional controls operate across all modules:

```text
ROLES
PERMISSIONS
APPROVALS
NOTIFICATIONS
AUDIT TRAIL
DOCUMENTS
REPORTS
DASHBOARD
```

---

# 2. CRITICAL EXECUTION RULE

## BACKEND ONLY

For this task, build **ONLY the backend**.

Do NOT build:

- React
- Vite
- Next.js frontend
- frontend components
- frontend pages
- CSS
- frontend state management
- frontend routing

The frontend will be built in a separate phase after this backend is completely finished.

Before considering the backend complete, verify:

- database works
- authentication works
- authorization works
- every module has APIs
- request validation works
- status transitions work
- workflow relationships work
- exception paths work
- audit trail works
- notifications work
- document metadata works
- reports work
- seed data works
- API documentation exists
- tests pass
- production environment configuration exists
- deployment configuration exists
- health check works
- frontend integration contract is documented

---

# 3. TECHNOLOGY STACK

Use:

- Node.js
- Express.js
- MongoDB
- Mongoose
- JavaScript only
- REST API
- JWT authentication
- bcrypt/bcryptjs password hashing
- dotenv
- CORS
- Helmet
- rate limiting
- request validation
- centralized error handling
- structured logging
- MongoDB indexes
- transactions where business consistency requires them

Do NOT use TypeScript.

Do NOT use a frontend framework in this backend project.

Prefer a clean modular architecture that can scale to a large ERP.

---

# 4. BACKEND PROJECT STRUCTURE

Create a professional structure similar to:

```text
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   ├── validators/
│   ├── utils/
│   ├── constants/
│   ├── permissions/
│   ├── workflows/
│   ├── jobs/
│   ├── notifications/
│   ├── documents/
│   ├── reports/
│   ├── seeders/
│   ├── integrations/
│   ├── app.js
│   └── server.js
├── tests/
├── scripts/
├── docs/
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── work.md
```

You may improve the structure if there is a strong architectural reason, but keep it modular and understandable.

---

# 5. CORE DATABASE PRINCIPLE

The ERP is one connected system.

Never design isolated CRUD records where a transaction loses its origin.

Preserve relationships such as:

```text
LEAD
 ↓
ENQUIRY
 ↓
QUOTATION
 ↓
QUOTATION REVISION
 ↓
PROFORMA
 ↓
CUSTOMER PO
 ↓
SALES ORDER
 ↓
PAYMENT
 ↓
PRODUCTION ORDER
 ↓
BOM
 ↓
MATERIAL REQUEST
 ↓
MATERIAL ISSUE / PURCHASE REQUEST
 ↓
VENDOR PO
 ↓
GRN
 ↓
INVENTORY
 ↓
PRODUCTION
 ↓
QA
 ↓
SERIAL NUMBER
 ↓
FINISHED GOODS
 ↓
PACKING
 ↓
INVOICE
 ↓
DISPATCH
 ↓
SHIPMENT
 ↓
DELIVERY
 ↓
POD
 ↓
INSTALLATION
 ↓
COMMISSIONING
 ↓
WARRANTY
 ↓
SERVICE
 ↓
RMA / RETURN
```

Every downstream record must be able to trace back to the appropriate upstream transaction.

---

# 6. MAIN MODULES TO IMPLEMENT

Implement backend support for all of these.

## Sales

1. Lead
2. Follow-up
3. Enquiry
4. Customer
5. Quotation
6. Quotation Revision
7. Negotiation
8. Proforma Invoice
9. Customer PO
10. PO Verification
11. Sales Order
12. Customer Payment

## Production

13. Production Order
14. BOM
15. BOM Version
16. Material Request
17. Material Issue
18. Production Operations
19. WIP
20. Material Consumption
21. Production Completion

## Procurement

22. Purchase Request
23. RFQ
24. Vendor Quotation
25. Vendor Comparison
26. Vendor Selection
27. Vendor PO
28. Vendor Delivery
29. GRN
30. Vendor Invoice / payable reference

## Inventory

31. Item / Material
32. Stock
33. Stock Ledger
34. Warehouse
35. Warehouse Transfer
36. Material Receipt
37. Material Issue
38. Stock Adjustment
39. Low Stock
40. Stock Consumption
41. Unused Material Return

## Manufacturing

42. Fabrication
43. Refrigeration
44. Electrical
45. Assembly
46. Production WIP
47. Production Completion

## Quality

48. QA Inspection
49. QA Test
50. QA Pass
51. QA Fail
52. Rework
53. Retest
54. Scrap
55. Certificate
56. Serial Number

## Finished Goods / Dispatch

57. Finished Goods
58. Packing
59. Final Invoice
60. Dispatch
61. Transporter
62. Shipment
63. Tracking
64. Delivery
65. POD

## Installation / Warranty

66. Installation
67. Commissioning
68. Customer Sign-off
69. Warranty

## Service

70. Service Ticket
71. Warranty Check
72. Service Assignment
73. Engineer Job
74. Diagnosis
75. Spare Parts
76. Repair
77. Service Testing
78. Service Closure

## RMA

79. RMA Request
80. RMA Approval
81. Product Return
82. RMA Inspection
83. Repair
84. Replacement
85. Credit
86. Refund
87. Re-dispatch
88. RMA Closure

## Finance / Accounts

89. Customer Payment
90. Payment Verification
91. Receivables
92. Vendor Payables
93. Vendor Invoice
94. 3-Way Match
95. Credit Note
96. Debit Note
97. Refund
98. Financial Adjustment
99. Tally Sync status/reference

## Maintenance

100. Equipment
101. Maintenance Plan
102. Preventive Maintenance
103. Breakdown
104. Maintenance Task
105. Maintenance Material Request
106. Maintenance History

## Master Data

107. Customer Master
108. Product Master
109. Material Master
110. Vendor Master
111. Employee
112. User
113. Role
114. Permission
115. Warehouse
116. Work Center
117. Tax
118. Payment Terms
119. Delivery Terms
120. Warranty Terms
121. Transporter

## R&D

122. R&D Project
123. R&D Requirement
124. R&D Material Request
125. R&D Approval
126. R&D Work
127. R&D Testing
128. R&D Result
129. R&D Status

## Cross-functional

130. Approval
131. Notification
132. Audit Trail
133. Document Metadata
134. Comments / Activities
135. Timeline
136. Dashboard metrics
137. Reports
138. Analytics

---

# 7. USER ROLES

Implement RBAC.

Initial roles:

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

Do not rely only on frontend hiding buttons.

Every protected backend endpoint must verify permission.

Permission examples:

```text
lead.view
lead.create
lead.update
lead.delete
lead.convert

quotation.view
quotation.create
quotation.update
quotation.submit
quotation.approve
quotation.reject
quotation.send

payment.view
payment.create
payment.verify
payment.refund

production.view
production.create
production.update
production.release

inventory.view
inventory.issue
inventory.receive
inventory.adjust
inventory.transfer

procurement.create
procurement.approve
procurement.rfq
procurement.vendorSelect
procurement.poApprove

qa.inspect
qa.pass
qa.fail
qa.retest

service.view
service.create
service.assign
service.close

rma.create
rma.approve
rma.inspect
rma.close

reports.view
audit.view
settings.manage
```

Make permissions data-driven so they can be changed without rewriting controllers.

---

# 8. AUTHENTICATION

Implement:

```text
POST /api/v1/auth/login
POST /api/v1/auth/register
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
POST /api/v1/auth/change-password
```

Use secure password hashing.

JWT must contain enough information for authorization but never contain sensitive data unnecessarily.

Implement:

- access token
- refresh token strategy
- password hashing
- account status
- failed login protection/rate limiting
- authorization middleware
- role middleware
- permission middleware

Never store plain-text passwords.

---

# 9. API STANDARD

Base URL:

```text
/api/v1
```

Use consistent REST conventions.

Example:

```text
GET    /api/v1/leads
POST   /api/v1/leads
GET    /api/v1/leads/:id
PATCH  /api/v1/leads/:id
DELETE /api/v1/leads/:id
POST   /api/v1/leads/:id/qualify
POST   /api/v1/leads/:id/follow-ups
POST   /api/v1/leads/:id/convert-to-enquiry
```

Do NOT create random inconsistent endpoint naming.

For actions that cause workflow transitions, use explicit action endpoints where appropriate:

```text
POST /:id/submit
POST /:id/approve
POST /:id/reject
POST /:id/send
POST /:id/cancel
POST /:id/verify
POST /:id/complete
```

---

# 10. API RESPONSE FORMAT

Use a consistent response structure.

Success:

```json
{
  "success": true,
  "message": "Quotation approved successfully",
  "data": {},
  "meta": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Quotation cannot be approved in its current status",
  "errors": [],
  "code": "INVALID_WORKFLOW_STATE"
}
```

Never expose stack traces in production.

---

# 11. PAGINATION

List endpoints must support:

```text
?page=1
&limit=20
&search=
&status=
&sortBy=
&sortOrder=
```

Return pagination metadata:

```json
{
  "page": 1,
  "limit": 20,
  "total": 125,
  "totalPages": 7
}
```

Implement filtering and sorting consistently.

---

# 12. VALIDATION

Every create/update/action endpoint must validate input.

Validate:

- required fields
- types
- enums
- numbers
- dates
- references
- quantities
- monetary values
- status transitions
- duplicate business numbers
- permission
- business rules

Never trust frontend validation.

---

# 13. BUSINESS NUMBER GENERATION

Implement server-side unique document numbering.

Examples:

```text
LEAD-000001
ENQ-000001
QT-000001
PI-000001
CPO-000001
SO-000001
PROD-000001
BOM-000001
MR-000001
PR-000001
RFQ-000001
VQ-000001
VPO-000001
GRN-000001
MI-000001
QA-000001
INV-000001
PACK-000001
DISP-000001
SHIP-000001
DEL-000001
POD-000001
SRV-000001
RMA-000001
```

Use a safe counter/sequence mechanism so concurrent requests cannot create duplicate numbers.

---

# 14. LEAD WORKFLOW

Implement:

```text
NEW LEAD
 ↓
QUALIFICATION
 ↓
EXISTING CUSTOMER?
 ├── YES → LINK CUSTOMER
 └── NO  → CREATE CUSTOMER
 ↓
ASSIGN SALES PERSON
 ↓
FOLLOW-UP
 ↓
CUSTOMER RESPONSE
 ├── INTERESTED → ENQUIRY
 ├── NEED MORE TIME → FOLLOW-UP AGAIN
 ├── NO RESPONSE → NEXT FOLLOW-UP
 └── NOT INTERESTED → LOST
```

Required API examples:

```text
POST /leads
GET /leads
GET /leads/:id
PATCH /leads/:id
POST /leads/:id/qualify
POST /leads/:id/follow-ups
GET /leads/:id/follow-ups
POST /leads/:id/convert-to-enquiry
POST /leads/:id/mark-lost
```

Do not delete the lead after conversion.

Maintain its complete history.

---

# 15. ENQUIRY → QUOTATION

Implement:

```text
ENQUIRY
 ↓
REQUIREMENT CONFIRMATION
 ↓
PRODUCT / SPECIFICATION
 ↓
QUANTITY
 ↓
DELIVERY
 ↓
WARRANTY
 ↓
PAYMENT TERMS
 ↓
CREATE QUOTATION
 ↓
DRAFT
 ↓
SUBMIT FOR APPROVAL
 ↓
APPROVED / REJECTED
 ↓
SEND CUSTOMER
 ↓
CUSTOMER RESPONSE
 ├── NEGOTIATION → REVISION → APPROVAL → SEND AGAIN
 ├── ACCEPTED → CUSTOMER ACCEPTANCE
 └── REJECTED → CLOSED / LOST
```

Quotation revisions must preserve previous versions.

Never overwrite a commercial revision that has historical significance.

Example:

```text
QT-000001-R1
QT-000001-R2
QT-000001-R3
```

Only the accepted revision becomes the final accepted commercial version.

---

# 16. PROFORMA → CUSTOMER PO → SALES ORDER

Implement:

```text
ACCEPTED QUOTATION
 ↓
PROFORMA INVOICE
 ↓
PI APPROVAL
 ↓
SEND CUSTOMER
 ↓
CUSTOMER PO RECEIVED
 ↓
PO VERIFICATION
```

Compare:

- customer
- product
- quantity
- price
- tax
- delivery
- payment terms
- warranty
- other agreed commercial conditions

If matched:

```text
VERIFIED
 ↓
SALES ORDER
```

If mismatched:

```text
MISMATCH
 ↓
HOLD
 ↓
REASON
 ↓
NOTIFY
 ↓
CORRECTION / AUTHORIZED RESOLUTION
 ↓
RE-VERIFY
```

Do not automatically approve a mismatched PO.

---

# 17. PAYMENT WORKFLOW

Support:

```text
PENDING
PARTIAL
RECEIVED
VERIFIED
FAILED
REVERSED
OVERPAYMENT
SHORT PAYMENT
REFUND
```

Payment release rules must be configurable.

Do not hard-code:

```text
"30% payment is always required"
```

The system must support client-configured payment rules.

Payment verification can release downstream actions when the configured business rule permits it.

---

# 18. SALES ORDER → PRODUCTION

Implement:

```text
SALES ORDER CONFIRMED
 ↓
PRODUCTION RELEASE
 ↓
PRODUCTION ORDER
 ↓
BOM VERSION
 ↓
CALCULATE MATERIAL REQUIREMENTS
 ↓
MATERIAL REQUEST
 ↓
STORE STOCK CHECK
```

Production Order must retain references to:

```text
Sales Order
Customer
Product
Quantity
Required Date
BOM Version
```

---

# 19. BOM

Support BOM versioning.

Example:

```text
BOM-FREEZER-80-V1
BOM-FREEZER-80-V2
```

Production Order must store the exact BOM version used.

Never silently replace historical BOM data.

Calculate required material quantity:

```text
BOM Quantity × Production Quantity
```

---

# 20. MATERIAL REQUEST + STOCK CHECK

For every material:

```text
REQUIRED
AVAILABLE
SHORTAGE
```

Decision:

```text
FULL
 ↓
ISSUE ALL

PARTIAL
 ↓
ISSUE AVAILABLE
 ↓
PROCURE SHORTAGE

NONE
 ↓
PROCUREMENT
```

The backend must calculate this rather than relying on frontend calculations.

---

# 21. PROCUREMENT WORKFLOW

Implement:

```text
PURCHASE REQUEST
 ↓
APPROVAL
 ↓
RFQ
 ↓
SEND TO VENDORS
 ↓
VENDOR QUOTATIONS
 ↓
VENDOR COMPARISON
 ↓
VENDOR SELECTION
 ↓
VENDOR PO
 ↓
VENDOR PO APPROVAL
 ↓
SEND VENDOR
 ↓
DELIVERY
 ↓
GRN
 ↓
INVENTORY
```

Vendor comparison must support:

- price
- quality
- delivery
- warranty
- payment terms
- vendor rating

Do not automatically select the cheapest vendor.

Store selection reason.

---

# 22. GRN

GRN must track:

```text
Ordered Quantity
Received Quantity
Accepted Quantity
Rejected Quantity
Damaged Quantity
Warehouse
Inspection
Vendor
Vendor PO
```

Support partial delivery.

Example:

```text
Vendor PO = 10
First GRN = 6
Pending = 4

Second GRN = 4
Pending = 0
```

Do not close the Vendor PO until its receipt rules are satisfied.

---

# 23. INVENTORY

Implement a proper stock ledger.

Never simply change:

```text
stock.quantity = 100
```

without recording the transaction.

Track:

```text
RECEIPT
ISSUE
TRANSFER
CONSUMPTION
RETURN
ADJUSTMENT
```

Every stock-changing transaction must generate a stock ledger entry.

Support:

```text
Warehouse A
 ↓
TRANSFER
 ↓
Warehouse B
```

Track both sides of the transfer.

---

# 24. STOCK ADJUSTMENT

Never allow silent stock adjustment.

Workflow:

```text
STOCK VARIANCE
 ↓
ADJUSTMENT REQUEST
 ↓
REASON
 ↓
APPROVAL
 ↓
ADJUST STOCK
 ↓
AUDIT TRAIL
```

---

# 25. PRODUCTION WORKFLOW

Production operations:

```text
READY
 ↓
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

Track:

- operation
- assigned employee
- work center
- start time
- end time
- status
- WIP
- material consumption
- remarks

Production must not blindly proceed when required materials are unavailable.

---

# 26. QA WORKFLOW

Implement:

```text
PRODUCTION COMPLETED
 ↓
QA INSPECTION
 ↓
TEST
 ├── PASS
 │    ↓
 │ SERIAL NUMBER
 │    ↓
 │ FINISHED GOODS
 │
 └── FAIL
      ↓
    REWORK
      ↓
    RETEST
      ↓
   PASS / FAIL
```

Support:

- test parameters
- actual values
- pass/fail
- inspector
- date
- remarks
- certificate
- rework
- scrap

Do not allow failed goods to automatically enter finished-goods stock.

---

# 27. SERIAL NUMBER TRACEABILITY

Each serialized finished product must be traceable through:

```text
Serial Number
 ↓
Production Order
 ↓
BOM
 ↓
Material Consumption
 ↓
QA
 ↓
Finished Goods
 ↓
Packing
 ↓
Invoice
 ↓
Dispatch
 ↓
Shipment
 ↓
Delivery
 ↓
POD
 ↓
Installation
 ↓
Commissioning
 ↓
Warranty
 ↓
Service
```

This is critical.

---

# 28. PACKING / INVOICE / DISPATCH

Implement:

```text
QA PASS
 ↓
FINISHED GOODS
 ↓
PACKING
 ↓
FINAL INVOICE
 ↓
DISPATCH READY
 ↓
LOGISTICS
 ↓
SHIPMENT
```

Final invoice must reference the Sales Order and relevant commercial records.

Do not create unrelated invoice records disconnected from the order.

---

# 29. LOGISTICS

Implement:

```text
DISPATCH READY
 ↓
SELECT TRANSPORTER
 ↓
SHIPMENT
 ↓
TRACKING
 ↓
DISPATCH
 ↓
IN TRANSIT
 ↓
OUT FOR DELIVERY
 ↓
DELIVERED
 ↓
POD
```

Support delivery failure.

Possible exception:

```text
DELIVERY FAILURE
 ↓
REATTEMPT
OR
RETURN
```

---

# 30. POD

POD should support:

- received by
- date/time
- signature metadata
- photo/document metadata
- remarks
- delivery status

POD completion updates the delivery record.

---

# 31. INSTALLATION / COMMISSIONING

Implement:

```text
DELIVERED
 ↓
INSTALLATION
 ↓
COMMISSIONING
 ↓
CUSTOMER SIGN-OFF
 ↓
WARRANTY START
```

Installation should reference the delivered serialized equipment.

---

# 32. WARRANTY

Warranty must be tied to:

- customer
- Sales Order
- serial number
- product
- installation/commissioning
- warranty terms
- start date
- end date

Do not create generic warranty records disconnected from serial/product history.

---

# 33. SERVICE WORKFLOW

Implement:

```text
CUSTOMER COMPLAINT
 ↓
SERVICE TICKET
 ↓
WARRANTY CHECK
 ↓
ASSIGN ENGINEER
 ↓
DIAGNOSIS
 ↓
SPARE PART REQUIRED?
 ├── NO → REPAIR
 └── YES
       ↓
   STOCK CHECK
       ↓
   ISSUE / PROCUREMENT
       ↓
      REPAIR
 ↓
TESTING
 ↓
PASS?
 ├── YES → SERVICE CLOSED
 └── NO  → REPAIR AGAIN
```

Support:

- warranty service
- chargeable service
- engineer assignment
- diagnosis
- spare usage
- service report
- customer sign-off
- closure

Service spare shortages must reuse the normal procurement workflow.

---

# 34. RMA / CUSTOMER RETURN

Implement:

```text
CUSTOMER RETURN REQUEST
 ↓
RMA APPROVAL
 ↓
PRODUCT RETURN
 ↓
INSPECTION
 ├── REPAIR
 ├── REPLACE
 ├── CREDIT
 └── REFUND
```

Repair:

```text
REPAIR
 ↓
RETEST
 ↓
PASS
 ↓
REDISPATCH
 ↓
CUSTOMER
 ↓
SIGN-OFF
 ↓
RMA CLOSED
```

Replacement must preserve serial-number traceability.

---

# 35. FINANCE / ACCOUNTS

Support:

- customer payments
- payment verification
- receivables
- vendor payables
- vendor invoices
- 3-way matching
- credit notes
- debit notes
- refunds
- financial adjustments
- Tally synchronization status/reference

3-way match:

```text
VENDOR PO
   +
GRN
   +
VENDOR INVOICE
   ↓
3-WAY MATCH
   ↓
APPROVE / HOLD
```

Refund:

```text
REFUND REQUEST
 ↓
ACCOUNTS APPROVAL
 ↓
REFUND
 ↓
CUSTOMER BALANCE UPDATED
```

---

# 36. TALLY INTEGRATION

Create an integration-ready architecture.

Do not fake successful Tally synchronization.

Store:

```text
syncStatus
syncAttemptedAt
syncedAt
externalReference
syncError
```

Support states such as:

```text
PENDING
SYNCING
SYNCED
FAILED
RETRY
```

If actual Tally API credentials/integration details are unavailable, implement a clean adapter/interface and mock/test integration without claiming live synchronization.

---

# 37. MAINTENANCE

Implement:

```text
EQUIPMENT
 ↓
MAINTENANCE PLAN
 ├── PREVENTIVE
 └── BREAKDOWN
       ↓
    INSPECTION
       ↓
    DIAGNOSIS
       ↓
MATERIAL REQUIRED?
 ├── NO → REPAIR
 └── YES
      ↓
 STOCK CHECK
 ├── AVAILABLE → ISSUE
 └── NOT AVAILABLE → PROCUREMENT
      ↓
    REPAIR
      ↓
   TESTING
      ↓
PASS?
 ├── YES → CLOSE
 └── NO → REPAIR AGAIN
```

Maintain maintenance history.

---

# 38. R&D

The source provides less detailed R&D workflow than the other modules.

Implement only the supported structure without pretending that unconfirmed client rules are finalized:

```text
R&D PROJECT
 ↓
REQUIREMENT
 ↓
MATERIAL REQUEST
 ↓
APPROVAL
 ↓
PROCUREMENT / INVENTORY
 ↓
R&D WORK
 ↓
TESTING
 ↓
RESULT
 ↓
PROJECT STATUS
 ↓
MANAGEMENT APPROVAL
```

Keep configurable fields for future client confirmation.

---

# 39. MASTER DATA

Implement CRUD + activation/deactivation + search/filter for:

```text
Customer
Product
Material
Vendor
Employee
User
Role
Permission
Warehouse
Work Center
Tax
Payment Terms
Delivery Terms
Warranty Terms
Transporter
```

Do not hard-delete referenced master records.

Use:

```text
ACTIVE
INACTIVE
```

where appropriate.

---

# 40. DOCUMENT MANAGEMENT

Documents can be attached to:

- Lead
- Enquiry
- Quotation
- PI
- Customer PO
- Sales Order
- Production Order
- Vendor PO
- GRN
- QA
- Invoice
- Dispatch
- POD
- Installation
- Service
- RMA
- Finance

Store document metadata:

```text
filename
mimeType
size
storageProvider
storageKey/url
uploadedBy
uploadedAt
entityType
entityId
```

Do not hard-code a storage provider if credentials are unavailable.

Create an abstraction so local storage/cloud storage can be configured.

---

# 41. NOTIFICATIONS

Implement a reusable notification system.

Events include:

```text
Quotation Approval Required
Material Shortage
Payment Received
Payment Verification Required
QA Failure
Service Assignment
PO Mismatch
RMA Approval
Vendor PO Approval
```

Notification fields:

```text
recipient
type
title
message
entityType
entityId
read
createdAt
```

---

# 42. AUDIT TRAIL

This is mandatory.

Record:

```text
user
role
action
module
entityType
entityId
before
after
timestamp
IP
userAgent
remarks
```

Examples:

```text
Quotation approved
Payment verified
Stock adjusted
Vendor PO approved
PO mismatch resolved
QA failed
RMA approved
```

Never silently modify important business history.

---

# 43. APPROVAL ENGINE

Build a reusable approval mechanism.

Examples:

```text
Quotation
Vendor PO
Stock Adjustment
Refund
RMA
R&D Project
```

Approval structure should support:

```text
PENDING
APPROVED
REJECTED
RETURNED
CANCELLED
```

Approval thresholds must be configurable.

Do not invent exact client thresholds.

---

# 44. WORKFLOW STATE ENGINE

Do not allow arbitrary status updates.

Example:

```text
Quotation:

DRAFT
 ↓
PENDING_APPROVAL
 ↓
APPROVED
 ↓
SENT
 ↓
NEGOTIATION
 ↓
REVISION
 ↓
PENDING_APPROVAL
 ↓
SENT
 ↓
ACCEPTED
```

Reject invalid transitions at backend level.

Create reusable workflow/state validation utilities.

---

# 45. TRANSACTION CONSISTENCY

Use MongoDB transactions where multiple related writes must succeed/fail together.

Examples:

- approving payment + updating release state
- material issue + stock ledger
- GRN + stock receipt
- stock adjustment + ledger + audit
- production consumption + inventory
- invoice/payment financial updates

Prevent duplicate operations through idempotency/business-number checks where appropriate.

---

# 46. REPORTS & ANALYTICS API

Implement backend report endpoints.

Sales:

```text
Lead Conversion
Quotation Report
Quotation Pending
Sales Order Report
Sales Value
Customer-wise Sales
Pending Orders
```

Finance:

```text
Receivables
Payables
Collection
Payments
Outstanding
Credit Notes
Debit Notes
Refunds
```

Production:

```text
Production Orders
Production Status
WIP
Material Consumption
Completed Production
Pending Production
```

Inventory:

```text
Current Stock
Stock Movement
Low Stock
Material Issue
Material Receipt
Warehouse Transfer
Stock Adjustment
```

Procurement:

```text
Purchase Requests
RFQs
Vendor Quotations
Vendor Comparison
Vendor POs
GRN
Pending Purchases
Vendor Performance
```

Quality:

```text
QA Pending
QA Passed
QA Failed
Rework
Scrap
Certificates
```

Service:

```text
Open Tickets
Engineer Jobs
Completed Services
Pending Services
Warranty Services
Chargeable Services
Spare Usage
Service History
```

Management dashboard:

```text
Total Sales
Pending Sales Orders
Purchase Value
Pending POs
Current Stock Value
Low Stock
Production Status
Service Pending
Receivables
Payables
R&D Projects Pending Approval
```

---

# 47. SEARCH / FILTER / SORT

All major list APIs must support appropriate:

- search
- status filter
- date range
- customer
- vendor
- employee
- assigned user
- warehouse
- priority
- pagination
- sorting

Do not implement filtering differently in every module.

Create reusable query utilities.

---

# 48. API DOCUMENTATION

Create complete API documentation.

Preferred:

```text
OpenAPI / Swagger
```

Document every endpoint with:

- method
- URL
- authentication
- role/permission
- parameters
- request body
- response
- error responses
- status transitions
- example request
- example response

Also create:

```text
docs/API.md
docs/WORKFLOW.md
docs/DATABASE.md
docs/RBAC.md
docs/DEPLOYMENT.md
docs/INTEGRATION.md
```

---

# 49. REQUEST BODY DOCUMENTATION

For EVERY create/update/action API, document exact JSON request bodies.

Example:

```json
POST /api/v1/leads

{
  "source": "WEBSITE",
  "leadType": "NEW_CUSTOMER",
  "customerId": null,
  "customerName": "ABC Hospital",
  "contactPerson": "Dr. Kumar",
  "phone": "9876543210",
  "email": "abc@hospital.com",
  "requirement": "80C_DEEP_FREEZER",
  "quantity": 2,
  "expectedValue": 800000,
  "expectedDate": "2026-10-20",
  "priority": "HIGH",
  "assignedTo": "USER_ID",
  "remarks": "Customer requires quotation urgently"
}
```

Do this for every module.

---

# 50. DATABASE INDEXING

Create indexes for important fields.

Examples:

```text
documentNumber
status
customerId
vendorId
salesOrderId
productionOrderId
quotationId
assignedTo
createdAt
updatedAt
serialNumber
sku
warehouseId
```

Use compound indexes where appropriate.

Avoid unbounded collection scans on major ERP lists.

---

# 51. SEED DATA

Create a complete development seed script.

Seed:

### Users

At minimum:

```text
admin
sales
salesmanager
accounts
purchase
store
production
qa
dispatch
servicemanager
serviceengineer
management
rnd
```

Use safe development passwords and clearly document them.

### Master Data

Create:

- sample customers
- sample products
- materials
- vendors
- warehouses
- tax
- payment terms
- delivery terms
- warranty terms
- transporters
- work centers

### Demo Workflow

Create linked sample data demonstrating:

```text
Lead
 ↓
Enquiry
 ↓
Quotation
 ↓
Revision
 ↓
Accepted Quotation
 ↓
PI
 ↓
Customer PO
 ↓
Sales Order
 ↓
Production Order
 ↓
BOM
 ↓
Material Request
 ↓
Procurement
 ↓
Vendor PO
 ↓
GRN
 ↓
Inventory
 ↓
Production
 ↓
QA
 ↓
Serial
 ↓
Finished Goods
```

---

# 52. TESTING

Write automated backend tests.

At minimum test:

## Authentication

- login
- invalid login
- password hashing
- protected route
- role permission

## Lead

- create
- qualify
- follow-up
- convert
- lost

## Quotation

- create
- submit
- approve
- reject
- revise
- send
- accept
- reject

## PO

- create
- verify matched
- mismatch
- hold
- reverify

## Payment

- create
- partial
- verify
- failure
- refund

## Inventory

- full stock
- partial stock
- no stock
- issue
- receipt
- transfer
- adjustment

## Procurement

- PR
- RFQ
- vendor quotation
- comparison
- selection
- vendor PO
- GRN
- partial GRN

## Production

- production order
- BOM
- material readiness
- operations
- completion

## QA

- pass
- fail
- rework
- retest
- serial creation

## Service

- ticket
- warranty check
- assignment
- repair
- closure

## RMA

- approval
- inspection
- repair
- replacement
- refund
- closure

## Security

- unauthorized access
- forbidden role
- invalid status transition
- invalid reference
- duplicate operation

---

# 53. END-TO-END INTEGRATION TEST

Create at least one full automated business-flow test:

```text
CREATE LEAD
 ↓
QUALIFY
 ↓
CREATE/LINK CUSTOMER
 ↓
FOLLOW-UP
 ↓
CONVERT TO ENQUIRY
 ↓
CREATE QUOTATION
 ↓
APPROVE
 ↓
SEND
 ↓
NEGOTIATE
 ↓
CREATE REVISION
 ↓
APPROVE REVISION
 ↓
SEND AGAIN
 ↓
CUSTOMER ACCEPTS
 ↓
CREATE PI
 ↓
CUSTOMER PO
 ↓
PO VERIFY
 ↓
SALES ORDER
 ↓
PAYMENT
 ↓
PRODUCTION RELEASE
 ↓
PRODUCTION ORDER
 ↓
BOM
 ↓
MATERIAL REQUEST
 ↓
STOCK CHECK
 ↓
PROCUREMENT SHORTAGE
 ↓
RFQ
 ↓
VENDOR QUOTATION
 ↓
VENDOR SELECTION
 ↓
VENDOR PO
 ↓
GRN
 ↓
INVENTORY
 ↓
MATERIAL ISSUE
 ↓
PRODUCTION
 ↓
QA PASS
 ↓
SERIAL
 ↓
FINISHED GOODS
```

The test must verify that references remain connected.

---

# 54. SECURITY REQUIREMENTS

Implement:

- Helmet
- CORS configuration
- rate limiting
- input validation
- authorization
- password hashing
- JWT security
- secure error responses
- environment variables
- no secrets committed
- request size limits
- basic abuse protection
- audit logging

Never expose:

- passwords
- password hashes
- refresh tokens
- private credentials
- API secrets

in normal API responses.

---

# 55. ENVIRONMENT CONFIGURATION

Create `.env.example`.

Include appropriate placeholders for:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=
JWT_REFRESH_EXPIRES_IN=
CORS_ORIGIN=
APP_URL=

STORAGE_PROVIDER=
STORAGE_BUCKET=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=

EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASSWORD=

TALLY_BASE_URL=
TALLY_API_KEY=
```

Do not put real credentials into source code.

---

# 56. DEPLOYMENT

Prepare backend for production deployment.

The deployment documentation must explain:

```text
Developer Machine
      ↓
Git Repository
      ↓
Production Server
      ↓
Node.js Backend
      ↓
PM2
      ↓
Nginx
      ↓
HTTPS
      ↓
MongoDB Atlas / Production MongoDB
```

Support deployment to a typical Linux server such as AWS EC2.

Create:

- production start command
- PM2 ecosystem configuration
- Nginx reverse proxy example
- environment setup instructions
- MongoDB setup instructions
- health check
- restart procedure
- logs
- backup guidance
- migration/seed guidance

Do not hard-code cloud-specific credentials.

---

# 57. HEALTH / SYSTEM APIs

Implement:

```text
GET /api/v1/health
GET /api/v1/health/db
GET /api/v1/system/version
```

Example:

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "version": "1.0.0"
  }
}
```

---

# 58. ERROR HANDLING

Implement centralized error handling.

Support:

```text
VALIDATION_ERROR
AUTHENTICATION_ERROR
AUTHORIZATION_ERROR
NOT_FOUND
DUPLICATE
INVALID_WORKFLOW_STATE
BUSINESS_RULE_ERROR
DATABASE_ERROR
INTEGRATION_ERROR
INTERNAL_SERVER_ERROR
```

Do not scatter inconsistent error handling throughout controllers.

---

# 59. SERVICE LAYER

Do not put the entire business workflow inside route files.

Prefer:

```text
Route
 ↓
Controller
 ↓
Service
 ↓
Model / Repository
 ↓
Database
```

Complex business logic belongs in services/workflow handlers.

Example:

```text
quotationService.approveQuotation()
quotationService.createRevision()
inventoryService.issueMaterial()
procurementService.createPurchaseRequest()
productionService.releaseProduction()
qaService.completeInspection()
paymentService.verifyPayment()
```

---

# 60. DO NOT BUILD DUMB CRUD

This is an ERP.

The backend must enforce business relationships.

Bad:

```text
POST /production-orders
```

and simply save whatever JSON arrives.

Correct:

```text
Sales Order must exist
↓
Payment/release rule checked
↓
Product exists
↓
BOM version exists
↓
Production Order created
↓
Audit entry
↓
Notification if required
```

Business logic belongs in backend services.

---

# 61. STATUS HISTORY

For important transactional records, maintain status history.

Example:

```json
{
  "status": "APPROVED",
  "changedBy": "USER_ID",
  "changedAt": "2026-10-06T10:00:00Z",
  "remarks": "Approved by Sales Manager"
}
```

Do this for important modules.

---

# 62. TIMELINE / ACTIVITY HISTORY

Every major transaction should expose a timeline.

Example:

```text
06 Oct — Lead Created
06 Oct — Lead Qualified
07 Oct — Follow-up Added
08 Oct — Customer Interested
08 Oct — Enquiry Created
08 Oct — Quotation Created
08 Oct — Quotation Approved
09 Oct — Quotation Sent
10 Oct — Customer Accepted
```

Timeline must be generated from real events/audit/activity records.

---

# 63. CLIENT-CONFIGURABLE RULES

Where the source says a rule needs client confirmation, do NOT invent it.

Examples:

- payment release percentage
- approval thresholds
- discount thresholds
- override policy
- procurement approval hierarchy
- production release conditions
- exact R&D approval rules

Implement configurable settings where practical.

Document unresolved client decisions in:

```text
docs/OPEN_BUSINESS_RULES.md
```

---

# 64. IMPORTANT EXCEPTION WORKFLOWS

The backend must support:

```text
PO Mismatch
Payment Failure
Payment Reversal
Short Payment
Overpayment
Material Shortage
Partial Stock
No Stock
QA Failure
Rework
Scrap
Delivery Failure
Installation Failure
RMA
Replacement
Refund
Credit Note
Debit Note
Stock Adjustment
Warehouse Transfer
Vendor Return
```

Exceptions must not corrupt the main transaction history.

---

# 65. TRACEABILITY REQUIREMENT

For any major record, provide an API to retrieve its related business chain.

Example:

```text
GET /api/v1/sales-orders/:id/timeline
GET /api/v1/sales-orders/:id/traceability
```

Response should make it possible to trace:

```text
Lead
Enquiry
Quotation
Accepted Revision
PI
Customer PO
Sales Order
Payment
Production
Materials
Procurement
GRN
QA
Serial
Packing
Invoice
Dispatch
Delivery
Installation
Warranty
Service
RMA
```

Only return relationships that actually exist.

---

# 66. DOCUMENT GENERATION

Backend should be architected so that later the frontend can request:

```text
Quotation PDF
Proforma PDF
Purchase Order PDF
Sales Order PDF
Invoice PDF
GRN PDF
QA Certificate
Packing List
Dispatch Document
Service Report
RMA Document
```

If PDF generation is implemented now, keep it modular.

If a client-specific template is unavailable, create a clean generic template and clearly document that it is replaceable.

---

# 67. FRONTEND CONTRACT

At backend completion create:

```text
docs/FRONTEND_INTEGRATION.md
```

It must contain:

- base URL
- authentication flow
- refresh-token flow
- all endpoint groups
- request bodies
- response examples
- status enums
- role permissions
- error codes
- pagination format
- filters
- file upload behavior
- workflow action endpoints
- dashboard APIs
- report APIs

This document will be the primary input for the frontend phase.

---

# 68. WORKFLOW DOCUMENT

Create/update:

```text
docs/WORKFLOW.md
```

Document the complete connected workflow:

```text
LEAD
 ↓
FOLLOW-UP
 ↓
ENQUIRY
 ↓
QUOTATION
 ↓
NEGOTIATION / REVISION
 ↓
CUSTOMER ACCEPTANCE
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
PRODUCTION ORDER
 ↓
BOM
 ↓
MATERIAL REQUEST
 ↓
STOCK CHECK
 ↓
MATERIAL ISSUE / PROCUREMENT
 ↓
MANUFACTURING
 ↓
QA
 ↓
SERIAL
 ↓
FINISHED GOODS
 ↓
PACKING
 ↓
INVOICE
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
SERVICE / RMA
```

Also document all exception branches.

---

# 69. FINAL BACKEND CHECKLIST

Before declaring completion, verify all of the following:

```text
[ ] Project structure created
[ ] package.json created
[ ] Environment configuration created
[ ] MongoDB connection working
[ ] Authentication complete
[ ] RBAC complete
[ ] Permission middleware complete
[ ] All major models created
[ ] Relationships created
[ ] Indexes created
[ ] Business number generation complete
[ ] Validation complete
[ ] Lead APIs complete
[ ] Enquiry APIs complete
[ ] Quotation APIs complete
[ ] Revision APIs complete
[ ] PI APIs complete
[ ] Customer PO APIs complete
[ ] PO verification complete
[ ] Sales Order APIs complete
[ ] Payment APIs complete
[ ] Production APIs complete
[ ] BOM APIs complete
[ ] Material Request APIs complete
[ ] Inventory APIs complete
[ ] Procurement APIs complete
[ ] RFQ APIs complete
[ ] Vendor quotation APIs complete
[ ] Vendor selection APIs complete
[ ] Vendor PO APIs complete
[ ] GRN APIs complete
[ ] Manufacturing APIs complete
[ ] QA APIs complete
[ ] Serial APIs complete
[ ] Finished Goods APIs complete
[ ] Packing APIs complete
[ ] Invoice APIs complete
[ ] Dispatch APIs complete
[ ] Logistics APIs complete
[ ] Delivery APIs complete
[ ] POD APIs complete
[ ] Installation APIs complete
[ ] Commissioning APIs complete
[ ] Warranty APIs complete
[ ] Service APIs complete
[ ] RMA APIs complete
[ ] Finance APIs complete
[ ] Maintenance APIs complete
[ ] R&D APIs complete
[ ] Master Data APIs complete
[ ] Approval engine complete
[ ] Notifications complete
[ ] Audit trail complete
[ ] Documents complete
[ ] Reports complete
[ ] Dashboard APIs complete
[ ] Exception workflows complete
[ ] Timeline complete
[ ] Traceability complete
[ ] Swagger/OpenAPI complete
[ ] Seed script complete
[ ] Unit tests complete
[ ] Integration tests complete
[ ] End-to-end workflow test complete
[ ] Health check complete
[ ] Production configuration complete
[ ] PM2 configuration complete
[ ] Nginx documentation complete
[ ] Deployment documentation complete
[ ] Frontend integration documentation complete
[ ] No hard-coded secrets
[ ] No fake successful integrations
[ ] No broken references
[ ] No invalid workflow transitions
```

---

# 70. FINAL EXECUTION INSTRUCTION TO THE AGENTIC AI

Do not merely generate files.

Actually implement the backend.

Follow this order:

```text
1. Read this entire work.md
        ↓
2. Understand the complete ERP workflow
        ↓
3. Inspect the existing repository
        ↓
4. Decide architecture
        ↓
5. Create backend foundation
        ↓
6. Create database models
        ↓
7. Create authentication/RBAC
        ↓
8. Implement master data
        ↓
9. Implement Sales workflow
        ↓
10. Implement Finance/payment gates
        ↓
11. Implement Production
        ↓
12. Implement Inventory
        ↓
13. Implement Procurement
        ↓
14. Implement Manufacturing
        ↓
15. Implement QA/Serial
        ↓
16. Implement Packing/Invoice/Dispatch
        ↓
17. Implement Logistics/Delivery/POD
        ↓
18. Implement Installation/Commissioning/Warranty
        ↓
19. Implement Service
        ↓
20. Implement RMA
        ↓
21. Implement Maintenance
        ↓
22. Implement R&D
        ↓
23. Implement cross-functional controls
        ↓
24. Implement reports/dashboard
        ↓
25. Seed realistic linked data
        ↓
26. Test each module
        ↓
27. Test complete end-to-end workflow
        ↓
28. Fix all failures
        ↓
29. Generate API documentation
        ↓
30. Generate deployment documentation
        ↓
31. Verify production readiness
```

Do not stop after creating schemas.

Do not stop after creating controllers.

Do not leave TODO placeholders for core ERP functionality.

If a feature cannot be implemented because client-specific information is genuinely missing, implement the configurable architecture and document the exact missing business decision in `docs/OPEN_BUSINESS_RULES.md`.

Do not invent business rules.

---

# 71. COMPLETION GATE

You may declare:

```text
BACKEND COMPLETE
```

ONLY when:

1. The server starts successfully.
2. MongoDB connects successfully.
3. Authentication works.
4. RBAC works.
5. APIs work.
6. Validation works.
7. Workflow transitions work.
8. Business relationships are preserved.
9. Inventory calculations are correct.
10. Procurement shortage flow works.
11. QA pass/fail flow works.
12. Serial traceability works.
13. Payment rules are configurable.
14. Exceptions are handled.
15. Audit trail works.
16. Notifications work.
17. Reports work.
18. Seed data works.
19. Tests pass.
20. End-to-end workflow test passes.
21. API documentation is complete.
22. Deployment documentation is complete.
23. Frontend integration contract is complete.

---

# 72. AFTER BACKEND COMPLETION

STOP.

Do NOT build the React frontend in this task.

Instead, produce a final completion report containing:

```text
Backend Status
Architecture
Database Models
API Modules
Authentication
RBAC
Workflow Implementation
Exception Handling
Tests
Seed Credentials
Environment Variables
Deployment Instructions
API Documentation Location
Frontend Integration Documentation Location
Open Business Rules
Known Limitations
```

Then wait for the next instruction.

The next phase will use the completed backend and this `work.md` as the source of truth to build the frontend.
