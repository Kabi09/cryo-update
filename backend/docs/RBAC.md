# Role-Based Access Control (RBAC) Specification
## Cryo Scientific Systems Pvt. Ltd. — ERP Backend

---

### 1. Architectural Principles
Cryo Scientific Systems ERP enforces strict, zero-trust role-based access control with granular permission checks on every single business endpoint.

- **Role Hierarchy**: 13 discrete functional enterprise roles.
- **Granular Permissions**: 60+ discrete permission codes across 14 functional modules.
- **Enforcement Layer**: Express middleware (`requirePermission(...)`) evaluating the authenticated user's assigned role and optional custom permission overrides.
- **Audit Coupling**: All authorized actions and attempted violations are logged with actor ID, IP address, timestamp, and target entity metadata.

---

### 2. Standard Enterprise Roles

| Role Code | Role Name | Primary Responsibilities |
|---|---|---|
| `ADMIN` | Super Administrator | System configuration, user management, global override permissions |
| `SALES` | Sales Executive | Lead capture, customer follow-up, quotation drafting, customer PO receipt |
| `SALES_MANAGER` | Sales Manager | Quotation commercial approval, customer PO verification, lead assignment |
| `ACCOUNTS` | Finance & Accounts Officer | Advance/stage payment verification, finance release gate, Tally sync |
| `PURCHASE` | Procurement Officer | Purchase Requisition review, RFQ floatation, Vendor PO issuance |
| `STORE` | Store Keeper | Raw material inventory, GRN posting, material issues to shop floor, transfers |
| `PRODUCTION` | Production Supervisor | Production planning, stage advancement (Fabrication ➔ Refrigeration ➔ Assembly) |
| `QA` | Quality Assurance Engineer | Pull-down testing, QA certificate generation, Serial Number issuance |
| `DISPATCH` | Logistics & Dispatch Officer | Unit packing, final commercial invoice, dispatch notes, transporter POD tracking |
| `SERVICE_MANAGER` | Service Manager | Warranty claims review, ticket dispatching, RMA replacement approval |
| `SERVICE_ENGINEER` | Field Service Engineer | On-site equipment commissioning, warranty inspection, field repair tickets |
| `MANAGEMENT` | Managing Director / Board | Executive KPI dashboards, complete cross-departmental read-only reports |
| `R_AND_D` | R&D Scientist / Engineer | Prototype design, experimental BOM validation, R&D project tracking |

---

### 3. Comprehensive Permission Matrix

| Module | Permission Code | Description | Authorized Roles |
|---|---|---|---|
| **Auth & Users** | `users.view` | View user profiles and directory | ADMIN, MANAGEMENT |
| | `users.manage` | Create, update, or deactivate users | ADMIN |
| **Settings** | `settings.manage` | Edit system-wide business rules & configuration | ADMIN |
| **Audit & Logs** | `audit.view` | Inspect immutable audit logs & trail | ADMIN, MANAGEMENT |
| **Reports** | `reports.view` | Access operational and financial reports | ADMIN, SALES_MANAGER, ACCOUNTS, MANAGEMENT |
| **Master Data** | `master.view` | Read products, materials, customers, warehouses | ADMIN, SALES, SALES_MANAGER, ACCOUNTS, PURCHASE, STORE, PRODUCTION, QA, DISPATCH, SERVICE_MANAGER, SERVICE_ENGINEER, MANAGEMENT, R_AND_D |
| | `master.manage` | Create/edit master records | ADMIN |
| **Leads** | `lead.view` | View commercial leads | ADMIN, SALES, SALES_MANAGER, MANAGEMENT |
| | `lead.create` | Create new incoming lead | ADMIN, SALES, SALES_MANAGER |
| | `lead.update` | Edit lead details and log follow-ups | ADMIN, SALES, SALES_MANAGER |
| | `lead.qualify` | Qualify lead and link customer | ADMIN, SALES, SALES_MANAGER |
| | `lead.convert` | Convert qualified lead to formal Enquiry | ADMIN, SALES, SALES_MANAGER |
| | `lead.assign` | Reassign lead to specific sales executive | ADMIN, SALES_MANAGER |
| **Enquiries** | `enquiry.view` | View customer enquiries | ADMIN, SALES, SALES_MANAGER, MANAGEMENT |
| | `enquiry.create` | Record customer enquiry | ADMIN, SALES, SALES_MANAGER |
| | `enquiry.update` | Modify enquiry items and specs | ADMIN, SALES, SALES_MANAGER |
| **Quotations** | `quotation.view` | View commercial quotations | ADMIN, SALES, SALES_MANAGER, ACCOUNTS, MANAGEMENT |
| | `quotation.create` | Draft new quotation (Rev 0) | ADMIN, SALES, SALES_MANAGER |
| | `quotation.update` | Modify draft quotation terms | ADMIN, SALES, SALES_MANAGER |
| | `quotation.submit` | Submit quotation for manager approval | ADMIN, SALES, SALES_MANAGER |
| | `quotation.approve` | Formally approve quotation terms & discounts | ADMIN, SALES_MANAGER |
| | `quotation.reject` | Reject draft quotation with reason | ADMIN, SALES_MANAGER |
| | `quotation.send` | Record sending quotation to client | ADMIN, SALES, SALES_MANAGER |
| | `quotation.revise` | Increment revision (R0 ➔ R1) upon negotiation | ADMIN, SALES, SALES_MANAGER |
| | `quotation.accept` | Record customer acceptance of quotation | ADMIN, SALES, SALES_MANAGER |
| **Customer PO** | `customer_po.view` | View customer purchase orders | ADMIN, SALES, SALES_MANAGER, ACCOUNTS, MANAGEMENT |
| | `customer_po.create` | Inward received customer PO | ADMIN, SALES, SALES_MANAGER |
| | `customer_po.verify` | Verify PO against quotation prices & terms | ADMIN, SALES_MANAGER |
| **Sales Orders** | `sales_order.view` | View confirmed Sales Orders | ADMIN, SALES, SALES_MANAGER, ACCOUNTS, PRODUCTION, MANAGEMENT |
| | `sales_order.create` | Create or generate internal Sales Order | ADMIN, SALES_MANAGER |
| | `sales_order.confirm` | Confirm Sales Order | ADMIN, SALES_MANAGER |
| | `sales_order.cancel` | Cancel Sales Order with reason | ADMIN, SALES_MANAGER |
| **Finance** | `payment.view` | View incoming and verified payments | ADMIN, ACCOUNTS, MANAGEMENT |
| | `payment.create` | Record client payment transaction | ADMIN, ACCOUNTS |
| | `payment.verify` | Verify NEFT/RTGS transaction & trigger release | ADMIN, ACCOUNTS |
| | `payment.refund` | Issue payment refund | ADMIN, ACCOUNTS |
| | `finance.view` | View financial summaries and 3-way match | ADMIN, ACCOUNTS, MANAGEMENT |
| | `finance.manage` | Manage credit limits, Tally sync triggers | ADMIN, ACCOUNTS |
| **BOM** | `bom.view` | View Bill of Materials | ADMIN, PRODUCTION, PURCHASE, R_AND_D, MANAGEMENT |
| | `bom.create` | Create BOM version | ADMIN, PRODUCTION, R_AND_D |
| | `bom.update` | Update draft BOM version | ADMIN, PRODUCTION, R_AND_D |
| | `bom.approve` | Approve BOM version for production | ADMIN, PRODUCTION |
| **Production** | `production.view` | View production orders and stage progress | ADMIN, PRODUCTION, MANAGEMENT |
| | `production.create` | Plan new Production Order from released SO | ADMIN, PRODUCTION |
| | `production.release` | Release production order to shop floor | ADMIN, PRODUCTION |
| | `production.update` | Advance manufacturing stages (FAB ➔ REF ➔ ELE ➔ ASM) | ADMIN, PRODUCTION |
| **Inventory** | `inventory.view` | Inspect stock levels across warehouses | ADMIN, STORE, PURCHASE, PRODUCTION, MANAGEMENT |
| | `inventory.issue` | Issue raw materials against Material Request | ADMIN, STORE |
| | `inventory.receive` | Receive materials into inventory | ADMIN, STORE |
| | `inventory.adjust` | Adjust stock variance from physical count | ADMIN, STORE |
| | `inventory.transfer` | Transfer stock between physical warehouses | ADMIN, STORE |
| **Procurement** | `procurement.view` | View purchase requisitions and vendor orders | ADMIN, PURCHASE, STORE, MANAGEMENT |
| | `procurement.create` | Create Purchase Request | ADMIN, PURCHASE, STORE |
| | `procurement.approve` | Approve Purchase Request | ADMIN, PURCHASE |
| | `procurement.rfq` | Issue RFQ to vendors | ADMIN, PURCHASE |
| | `procurement.vendorSelect` | Compare vendor quotes and select vendor | ADMIN, PURCHASE |
| | `procurement.poCreate` | Issue Vendor Purchase Order | ADMIN, PURCHASE |
| | `procurement.poApprove` | Approve high-value Vendor PO | ADMIN, PURCHASE |
| | `grn.create` | Inward vendor consignment (GRN) | ADMIN, STORE |
| | `grn.view` | View GRN details and inspection logs | ADMIN, STORE, PURCHASE, ACCOUNTS |
| **QA** | `qa.view` | View inspection orders and test logs | ADMIN, QA, PRODUCTION, MANAGEMENT |
| | `qa.inspect` | Record pull-down test parameters & curve | ADMIN, QA |
| | `qa.pass` | Pass unit inspection and issue Serial Number | ADMIN, QA |
| | `qa.fail` | Fail unit inspection with defect report | ADMIN, QA |
| | `qa.retest` | Retest reworked unit | ADMIN, QA |
| | `serial.view` | View serial number master & end-to-end trace | ADMIN, QA, DISPATCH, SERVICE_ENGINEER, MANAGEMENT |
| | `serial.manage` | Update serial equipment status | ADMIN, QA |
| **Logistics** | `packing.view` | View packing lists | ADMIN, DISPATCH, MANAGEMENT |
| | `packing.manage` | Create packing lists, mark packed | ADMIN, DISPATCH |
| | `dispatch.view` | View dispatch records and e-Way bills | ADMIN, DISPATCH, MANAGEMENT |
| | `dispatch.create` | Generate commercial invoice & dispatch order | ADMIN, DISPATCH |
| | `delivery.update` | Record shipment delivery & upload signed POD | ADMIN, DISPATCH |
| **Field Service** | `service.view` | View installations, tickets, and warranties | ADMIN, SERVICE_MANAGER, SERVICE_ENGINEER, MANAGEMENT |
| | `service.create` | Create new service incident ticket | ADMIN, SERVICE_MANAGER, SERVICE_ENGINEER |
| | `service.update` | Update ticket diagnosis and consume spares | ADMIN, SERVICE_MANAGER, SERVICE_ENGINEER |
| | `service.assign` | Assign field engineer to ticket | ADMIN, SERVICE_MANAGER |
| | `service.close` | Close resolved service ticket with customer signoff | ADMIN, SERVICE_MANAGER |
| | `warranty.view` | Validate equipment serial warranty status | ADMIN, SERVICE_MANAGER, SERVICE_ENGINEER, MANAGEMENT |
| | `warranty.manage` | Register warranty upon commissioning | ADMIN, SERVICE_MANAGER |
| | `rma.view` | View Return Material Authorizations | ADMIN, SERVICE_MANAGER, SERVICE_ENGINEER |
| | `rma.create` | Raise RMA for factory repair/replacement | ADMIN, SERVICE_ENGINEER, SERVICE_MANAGER |
| | `rma.approve` | Approve RMA receipt and replacement unit | ADMIN, SERVICE_MANAGER |
| **R&D** | `rnd.view` | View R&D projects and experiments | ADMIN, R_AND_D, MANAGEMENT |
| | `rnd.manage` | Create R&D projects and record milestone tests | ADMIN, R_AND_D |
