# Configurable Business Rules & Open Decision Points
## Cryo Scientific Systems Pvt. Ltd. — ERP Backend

---

### 1. Principle of Architectural Flexibility
In enterprise manufacturing ERP deployments, hardcoding business assumptions leads to expensive code modifications during factory rollout. Cryo Scientific Systems ERP addresses this by storing business parameters in the `configurations` collection with runtime database lookups, default fallbacks, and explicit flags (`isClientConfirmed: false`) marking items that require client confirmation.

---

### 2. Configured Business Parameters

| Key | Default Value | Category | Client Confirmed? | Business Context & Rationale |
|---|---|---|---|---|
| `ADVANCE_PAYMENT_RELEASE_PCT` | `30` | `FINANCE` | ❌ Pending Client Confirmation | The minimum percentage of advance payment required before a Sales Order is automatically or manually released to production. Standard manufacturing default is 30%, but government hospital tenders may operate on 0% advance with LC/bank guarantees. |
| `DEFAULT_WARRANTY_MONTHS` | `12` | `SALES` | ✅ Confirmed | Standard warranty duration for scientific refrigeration units from the date of commissioning or 15 months from dispatch (whichever occurs first). |
| `AUTO_PO_VERIFY_PRICE_TOLERANCE_PCT` | `0` | `SALES` | ✅ Confirmed | Deviation tolerance allowed between Quotation line items and inwarded Customer Purchase Order. Kept at 0% (strict matching required; any deviation triggers a commercial hold). |
| `PULLDOWN_TEST_DURATION_HOURS` | `24` | `QA` | ✅ Confirmed | Mandatory duration for continuous data-logger temperature recording at -80°C / -40°C prior to QA clearance. |
| `REORDER_AUTO_PR_ENABLED` | `true` | `PROCUREMENT` | ❌ Pending Client Confirmation | Whether dropping below raw material `reorderLevel` automatically raises a draft Purchase Request or requires manual storekeeper initiation. |
| `CREDIT_LIMIT_ENFORCEMENT` | `WARN` | `FINANCE` | ❌ Pending Client Confirmation | Whether exceeding customer credit limits hard-blocks quotation conversion (`STRICT`) or logs a managerial warning (`WARN`). |
| `SERIAL_NUMBER_PREFIX` | `CRYO-SN` | `GENERAL` | ✅ Confirmed | Standard prefix for finished unit barcode and serial number generation. |
| `TALLY_EXPORT_FORMAT` | `XML` | `FINANCE` | ✅ Confirmed | Export schema for Tally Prime integration (XML ledger voucher format). |

---

### 3. Open Architectural Decision Points Awaiting Client Confirmation

#### 3.1 Government Tender vs. Commercial Customer Payment Gates
- **Observation**: Private hospitals and bio-banks typically pay 30% advance on PO, 60% before dispatch, and 10% after commissioning. Government institutions (e.g., AIIMS, ICMR) often pay 100% post-delivery after IQ/OQ validation.
- **Implementation**: The backend supports customer-level override via `paymentTerms: 'CUSTOM'` or `ADVANCE_PAYMENT_RELEASE_PCT` configuration, allowing accounts officers to release orders with 0% advance where contractually authorized.

#### 3.2 Dual-Tier Quotation Approval Threshold
- **Current Setup**: All quotations require `SALES_MANAGER` approval before being sent to customers.
- **Recommended Client Enhancement**: Single approval for quotations under ₹10,00,000; dual approval (`SALES_MANAGER` + `MANAGEMENT`) for bids exceeding ₹25,00,000 or discounts above 15%.
- **Status**: The backend permission check and state machine support approval escalation; threshold parameters can be added to the `configurations` collection without schema redesign.

#### 3.3 Negative Inventory Prevention
- **Current Setup**: Strict zero-tolerance (`quantityAvailable >= requestedQuantity`). An inventory issue or transfer is rejected with a `422 BUSINESS_RULE_ERROR` if stock is insufficient.
- **Status**: Production validated. No un-inwarded material can be consumed on the shopfloor, guaranteeing strict material costing accuracy.
