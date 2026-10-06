# Cryo Scientific Systems ERP — Complete Business Workflow Specification

## 1. System Philosophy

The Cryo Scientific Systems ERP is a centralized, state-driven enterprise web backend designed to track cryogenic and medical refrigeration equipment across its entire lifecycle:
`Lead` ➔ `Enquiry` ➔ `Quotation` ➔ `Negotiation & Revision` ➔ `Proforma Invoice` ➔ `Customer PO` ➔ `PO Verification` ➔ `Sales Order` ➔ `Advance Payment Gate` ➔ `Production Order` ➔ `BOM & Material Staging` ➔ `Inventory & Procurement` ➔ `Shopfloor Assembly` ➔ `QA Temperature Drawdown Testing` ➔ `Serialization & Certificate` ➔ `Finished Goods` ➔ `Packing` ➔ `Final Invoicing (Tally Sync)` ➔ `Dispatch & Freight` ➔ `Delivery & POD` ➔ `Installation & Commissioning` ➔ `Warranty Activation` ➔ `Field Service & RMA`.

---

## 2. Four System Architecture Layers

### Layer A — Master Data
Static, reusable records referenced across all transactions:
- **Customer Master**: Company, contact persons, billing/shipping addresses, GST/PAN, payment terms.
- **Product Master**: Model numbers, standard specifications (e.g. -86°C cascade refrigeration, 500L), pricing, warranty duration, active BOM link.
- **Material Master**: Raw components and spares (compressors, RTD PT100 sensors, digital controllers, copper tubes, PUF insulation).
- **Vendor Master**: Suppliers, contact info, ratings, supplied categories.
- **Warehouse Master**: Multi-warehouse storage locations (e.g. Chennai Main Factory, Nagapattinam DC).
- **Work Center Master**: Factory work centers (Fabrication, Refrigeration, Electrical, Mechanical Assembly, QA Bay).
- **Transporter Master**: Carrier partners and tracking URL templates.

### Layer B — Main Business Workflow
The linear progression of commercial customer orders:
1. **Lead**: Capture customer requirement, qualify, link existing or register new customer.
2. **Enquiry**: Technical specifications confirmation.
3. **Quotation**: Revision-controlled pricing (R0, R1, R2), manager approvals, customer negotiation.
4. **Acceptance & Proforma Invoice**: Customer acceptance locked; advance payment terms formalized.
5. **Customer PO & Verification Gate**: Verification comparing PO terms with quotation.
6. **Sales Order**: Internal order generation.
7. **Payment Gate**: Advance receipt verification before releasing to production planning.
8. **Production Order & BOM**: Manufacturing job, BOM component calculation.
9. **Material Request & Store Check**: Stock availability evaluation (Full, Partial, None).
10. **Procurement Loop**: Automated Purchase Requests for shortages, RFQ, Vendor Quotations, Vendor PO, GRN with QA.
11. **Production Stages**: Sequential manufacturing: `FABRICATION` ➔ `REFRIGERATION` ➔ `ELECTRICAL` ➔ `ASSEMBLY` ➔ `COMPLETED`.
12. **QA Testing Bay**: Strict drawdown temperature testing (-80°C hold, power consumption, safety alarms).
13. **Serialization & Certificate**: Generation of unique unit Serial Number and Calibration Certificate.
14. **Packing & Final Invoicing**: Protective wooden crate packing, GST invoice generation, Tally sync.
15. **Dispatch & POD**: Carrier LR assignment, transport tracking, Proof of Delivery (POD) signed sign-off.
16. **Commissioning & Warranty**: On-site startup verification, 12-month warranty activation.
17. **Service & RMA**: Warranty complaint resolution, engineer dispatch, spare parts consumption, customer closure.

### Layer C — Exception Workflows
Contingencies handled without data corruption:
- **PO Mismatch**: Placed on `MISMATCH_HOLD`, reason logged, notification dispatched to Sales Manager.
- **Material Shortage**: Generates linked `PurchaseRequest`, initiates procurement cycle without stalling unrelated jobs.
- **QA Failure**: Unit marked `FAILED`, sent to `REWORK_IN_PROGRESS`, retested; unrecoverable units marked `SCRAPPED`.
- **Delivery Failure**: Marked `FAILED_ATTEMPT`, rescheduling or factory return logged.
- **RMA (Customer Return)**: Structured evaluation (`REPAIR_RETURN`, `REPLACEMENT`, `CREDIT_NOTE`, `REFUND`).

### Layer D — Cross-Functional Governance
- **Role-Based Access Control (RBAC)**: Enforced via permissions on every endpoint.
- **Immutable Audit Trail**: Captures user, action, module, entity, before/after states, IP, and remarks.
- **Notifications**: Automated in-app notification dispatches for critical milestones and approval gates.
- **Management Dashboards & Reports**: Real-time sales pipeline, WIP operations, quality metrics, and receivables.
