# Database Architecture & Schema Specification
## Cryo Scientific Systems Pvt. Ltd. — ERP Backend

---

### 1. Database Overview
- **Database Engine**: MongoDB (v6.0+)
- **ODM**: Mongoose (v8.0+)
- **Schema Design Pattern**: Hybrid normalized-embedded schema. Normalized across high-value business entities for strict transactional consistency; embedded sub-documents for immutable history (status audit trail, line items, follow-ups).
- **Primary Database Name**: `cryo_erp_db`

---

### 2. Entity Relational Mapping (High Level)

```
[Lead] ──> [Enquiry] ──> [Quotation (Revisions)] ──> [CustomerPO] ──> [SalesOrder]
                                                                          │
  ┌───────────────────────────────┬───────────────────────────────────────┤
  ▼                               ▼                                       ▼
[Payment (Advance Gate)]     [BOM (Active)]                       [ProductionOrder]
                                  │                                       │
                                  ▼                                       ▼
                       [MaterialRequisition]                     [Stages (FAB->REF->ELE->ASM)]
                                  │                                       │
                                  ▼                                       ▼
                       [StockLedger / Inventory]                 [QAInspection]
                                                                          │
                                                                          ▼
                                                                  [SerialNumber]
                                                                          │
  ┌───────────────────────────────────────────────────────────────────────┤
  ▼                               ▼                                       ▼
[PackingList] ──> [FinalInvoice] ──> [Dispatch / POD Delivery]    [Installation / Warranty]
                                                                          │
                                                                          ▼
                                                                [ServiceTicket / RMA]
```

---

### 3. Collection Specifications

#### 3.1 Security & System Governance
- `users`: User identity, hashed passwords (bcrypt, salt rounds 10), role mapping, security lockout (`lockUntil`, `failedLoginAttempts`).
- `roles`: Role definitions and aggregated permissions arrays.
- `permissions`: Granular permission registry (`module.action`).
- `sequences`: Atomic sequence generators ensuring gapless unique identifiers (e.g., `SO-000001`, `CRYO-SN-000001`).
- `audit_logs`: Immutable security and operation audit trail recording `req.user`, IP, before/after snapshots, action verb, timestamp.
- `notifications`: In-app event alerts, priority levels (`LOW`, `NORMAL`, `HIGH`, `CRITICAL`), read status.
- `configurations`: Runtime-configurable business rules (e.g., `ADVANCE_PAYMENT_RELEASE_PCT: 30`, `DEFAULT_WARRANTY_MONTHS: 12`).

#### 3.2 Master Data Collections
- `customers`: Customer entity, billing/shipping addresses, GSTIN, PAN, contact persons, credit limit.
- `products`: Finished equipment models (e.g., Ultra-Low Temperature Freezer `-80°C`, Blood Bank Refrigerator `+4°C`), active BOM reference, warranty terms.
- `materials`: Raw materials, refrigeration components (compressors, copper tubing, controllers, PUF chemical), reorder thresholds, inventory valuation costs.
- `vendors`: Supplier directory, GSTIN, payment terms, approved materials catalogue.
- `warehouses`: Storage locations (`WH-CHN-01` Factory Main, `WH-NGP-01` Regional Depots).
- `work_centers`: Shopfloor manufacturing work centers (`WC-FAB`, `WC-REF`, `WC-ELE`, `WC-ASM`, `WC-QAT`).
- `transporters`: Logistics partners and transporter IDs.

#### 3.3 Sales & Commercial Collections
- `leads`: Inward commercial enquiries from web, Indiamart, phone, exhibition. Follow-up array, qualification status, customer auto-linkage.
- `enquiries`: Technical requirement capture with target pricing and cooling chamber specifications.
- `quotations`: Commercial proposals with strict revision control (`QT-000001-R0`, `QT-000001-R1`), line items, payment terms, discounts, manager approval workflow.
- `proforma_invoices`: Pre-commercial invoices detailing advance payment requirements (e.g., 30% advance required).
- `customer_pos`: Customer Purchase Orders inwards, commercial verification against quotation terms, discrepancy detection and resolution.
- `sales_orders`: Confirmed factory sales order with advance payment lock gate (`isReleasedToProduction: false` until advance payment is verified).

#### 3.4 Finance Collections
- `payments`: Customer payment inwards (NEFT, RTGS, Cheque, LC), financial verification gate, accounts receivable reconciliation.

#### 3.5 Production & Shopfloor Collections
- `boms`: Bill of Materials structure specifying components, consumption quantities, scrap allowances, active versioning.
- `production_orders`: Shopfloor manufacturing orders tracking stage progression (`FABRICATION` ➔ `REFRIGERATION` ➔ `ELECTRICAL` ➔ `ASSEMBLY` ➔ `COMPLETED`).
- `material_requests`: Material requisitions raised by production supervisors to issue stock against active production orders.

#### 3.6 Inventory & Stores Collections
- `inventories`: Real-time warehouse inventory balancing `quantityOnHand`, `quantityReserved`, and `quantityAvailable`.
- `stock_ledgers`: Immutable double-entry inventory ledger tracking every inward, issue, transfer, and audit adjustment.

#### 3.7 Procurement Collections
- `purchase_requests`: Internal requisitions triggered by low stock or production shortages.
- `rfqs`: Requests for Quotation broadcast to approved vendors.
- `vendor_quotations`: Supplier bids inwarded with commercial terms.
- `vendor_pos`: Formal Purchase Orders issued to suppliers with tax and payment terms.
- `grns`: Goods Receipt Notes tracking consignment receipt, physical inspection, and automated stock ledger posting.

#### 3.8 Quality & Serialization Collections
- `qa_inspections`: Low-temperature pull-down curve testing (-80°C stabilization tests, electrical safety checks, vacuum hold).
- `serial_numbers`: Unique physical equipment identifiers (`CRYO-SN-000001`) with full lifecycle genealogy.
- `finished_goods`: QA-cleared warehouse stock available for dispatch.

#### 3.9 Logistics & Field Collections
- `packings`: Crating and packing checklists ensuring accessories, manuals, and sensor cables are crated.
- `final_invoices`: Commercial GST tax invoices with Tally Prime synchronization state.
- `dispatches`: Logistics dispatch notes with vehicle numbers, transporter, and e-Way bill references.
- `deliveries`: Transit milestones and signed Proof of Delivery (POD) image capture.
- `installations`: Site readiness inspection and on-site technician commissioning checklist.
- `warranties`: Equipment warranty registration with start/end dates and service contract type.
- `service_tickets`: Customer breakdown or calibration requests, technician assignment, spare part consumption.
- `rmas`: Return Material Authorizations for factory repair or warranty unit replacement.

---

### 4. Indexing Strategy & Performance Guarantees

All critical search and relational foreign keys are indexed:
1. **Unique Indexes**:
   - `User.email`
   - `Role.name`
   - `Sequence.key`
   - `Configuration.key`
   - `Customer.customerId`
   - `Product.productCode`
   - `Material.materialCode`
   - `Vendor.vendorId`
   - `Lead.leadNumber`
   - `Quotation.revisionCode`
   - `CustomerPO.poNumber`
   - `SalesOrder.salesOrderNumber`
   - `ProductionOrder.productionOrderNumber`
   - `SerialNumber.serialNumber`
   - `FinalInvoice.invoiceNumber`
2. **Compound Indexes**:
   - `Inventory`: `{ material: 1, warehouse: 1 }` (Unique compound index)
   - `Quotation`: `{ quotationNumber: 1, revisionNumber: 1 }`
   - `StockLedger`: `{ material: 1, warehouse: 1, createdAt: -1 }`
   - `ServiceTicket`: `{ serialNumber: 1, status: 1 }`
3. **Foreign Key Indexes**:
   - All `ObjectId` references (e.g., `salesOrder`, `customer`, `quotation`, `productionOrder`) are indexed for fast lookup during aggregation and populates.
