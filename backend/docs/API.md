# API Specification Reference
## Cryo Scientific Systems Pvt. Ltd. — ERP Backend

---

### 1. Base URL & Protocol
- **Base URL**: `/api/v1`
- **Protocol**: HTTPS (TLS 1.3)
- **Data Format**: `application/json`
- **Authentication**: JWT Bearer Token in `Authorization: Bearer <access_token>`

---

### 2. Standard Response Envelope
All API endpoints return responses structured with the standard envelope:

#### Success Response (200 / 201)
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 105,
    "totalPages": 6
  }
}
```

#### Error Response (4xx / 5xx)
```json
{
  "success": false,
  "statusCode": 400,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation error",
    "details": [
      { "field": "email", "message": "email is required" }
    ]
  }
}
```

---

### 3. Route Index

#### 3.1 Authentication (`/api/v1/auth`)
| Method | Endpoint | Permission | Description |
|---|---|---|---|
| POST | `/login` | Public | Authenticate with email & password; returns tokens & permissions |
| POST | `/refresh` | Public | Exchange refresh token for fresh access token |
| POST | `/logout` | Authenticated | Invalidate refresh token |
| GET | `/me` | Authenticated | Retrieve authenticated user profile & permissions |
| POST | `/change-password` | Authenticated | Change current password |
| POST | `/register` | `users.manage` | Admin endpoint to register new system users |

#### 3.2 Master Data (`/api/v1/master`)
| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/customers` | `master.view` | List customers with pagination & search |
| POST | `/customers` | `master.manage` | Create customer profile |
| GET | `/customers/:id` | `master.view` | Customer details |
| PUT | `/customers/:id` | `master.manage` | Update customer |
| GET | `/products` | `master.view` | List manufactured refrigeration products |
| POST | `/products` | `master.manage` | Create product model SKU |
| GET | `/products/:id` | `master.view` | Product detail with active BOM |
| PUT | `/products/:id` | `master.manage` | Update product specs |
| GET | `/materials` | `master.view` | List raw materials, parts & consumables |
| POST | `/materials` | `master.manage` | Create material code |
| GET | `/vendors` | `master.view` | List approved suppliers & vendors |
| POST | `/vendors` | `master.manage` | Register new vendor |
| GET | `/warehouses` | `master.view` | List storage facilities & warehouses |
| POST | `/warehouses` | `master.manage` | Create new warehouse |
| GET | `/work-centers` | `master.view` | List shopfloor work centers |
| GET | `/transporters` | `master.view` | List logistics partners |
| GET | `/configurations` | `settings.manage` | List business configuration parameters |
| PUT | `/configurations/:key` | `settings.manage` | Update business configuration |

#### 3.3 Sales Workflow (`/api/v1`)
| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/leads` | `lead.view` | List sales leads |
| POST | `/leads` | `lead.create` | Inward new sales lead |
| GET | `/leads/:id` | `lead.view` | Lead details & follow-up logs |
| PUT | `/leads/:id` | `lead.update` | Edit lead |
| POST | `/leads/:id/qualify` | `lead.qualify` | Qualify lead & auto-link/create customer |
| POST | `/leads/:id/follow-up` | `lead.update` | Append customer communication log |
| POST | `/leads/:id/convert-to-enquiry`| `lead.convert` | Convert lead to technical enquiry |
| POST | `/leads/:id/lost` | `lead.update` | Mark lead as lost with reason |
| GET | `/enquiries` | `enquiry.view` | List customer enquiries |
| POST | `/enquiries` | `enquiry.create` | Record customer enquiry |
| GET | `/quotations` | `quotation.view` | List commercial quotations |
| POST | `/quotations` | `quotation.create` | Draft quotation (Rev 0) |
| GET | `/quotations/:id` | `quotation.view` | Quotation detail with revisions |
| POST | `/quotations/:id/submit` | `quotation.submit` | Submit quotation for manager approval |
| POST | `/quotations/:id/approve` | `quotation.approve` | Sales Manager commercial approval |
| POST | `/quotations/:id/reject` | `quotation.reject` | Sales Manager rejection |
| POST | `/quotations/:id/send` | `quotation.send` | Record quotation sent to customer |
| POST | `/quotations/:id/negotiate` | `quotation.update` | Record price/spec negotiation notes |
| POST | `/quotations/:id/revise` | `quotation.revise` | Create next revision (e.g., R1, R2) |
| POST | `/quotations/:id/accept` | `quotation.accept` | Record customer acceptance |
| POST | `/proforma-invoices` | `quotation.create` | Generate PI from accepted quotation |
| GET | `/customer-pos` | `customer_po.view` | List received customer POs |
| POST | `/customer-pos` | `customer_po.create`| Inward customer PO |
| POST | `/customer-pos/:id/verify` | `customer_po.verify`| Verify PO terms & auto-create internal SO |
| POST | `/customer-pos/:id/resolve-mismatch`| `customer_po.verify`| Resolve price/term discrepancy |
| GET | `/sales-orders` | `sales_order.view` | List internal Sales Orders |
| GET | `/sales-orders/:id` | `sales_order.view` | Sales Order detail |
| POST | `/sales-orders/:id/cancel`| `sales_order.cancel`| Cancel Sales Order |
| GET | `/sales-orders/:id/timeline`| `sales_order.view` | Lifecycle event timeline |
| GET | `/sales-orders/:id/traceability`| `sales_order.view` | Cross-module traceability graph |

#### 3.4 Finance & Payments (`/api/v1`)
| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/payments` | `payment.view` | List customer payments |
| POST | `/payments` | `payment.create` | Inward payment receipt |
| GET | `/payments/:id` | `payment.view` | Payment details |
| POST | `/payments/:id/verify` | `payment.verify` | Verify payment & trigger production release gate |
| GET | `/finance/receivables-summary`| `finance.view` | Accounts receivable aging summary |
| GET | `/finance/payables-summary`| `finance.view` | Accounts payable summary |
| GET | `/finance/three-way-match/:vpoId`| `finance.view` | 3-way match validation (PO vs GRN vs Invoice) |
| POST | `/finance/tally/sync-invoice/:id`| `finance.manage` | Trigger XML export sync to Tally Prime |

#### 3.5 Production & Shopfloor (`/api/v1`)
| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/boms` | `bom.view` | List Bills of Materials |
| POST | `/boms` | `bom.create` | Define BOM structure |
| GET | `/boms/:id` | `bom.view` | BOM detail with component tree |
| POST | `/boms/:id/approve` | `bom.approve` | Approve BOM version |
| GET | `/production-orders` | `production.view` | List shop floor production orders |
| POST | `/production-orders` | `production.create`| Create production order from released SO |
| GET | `/production-orders/:id`| `production.view` | Production order progress & stage tracking |
| POST | `/production-orders/:id/release`| `production.release`| Release order to shop floor |
| POST | `/production-orders/:id/request-materials`| `production.update`| Generate material issue requisition |
| POST | `/production-orders/:id/advance-stage`| `production.update`| Advance stage (Fabrication ➔ Refrigeration ➔ Electrical ➔ Assembly ➔ Completed) |
| POST | `/material-requests/:id/issue`| `inventory.issue` | Storekeeper issue raw materials |

#### 3.6 Inventory & Stores (`/api/v1`)
| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/stock` | `inventory.view` | Real-time stock levels by warehouse & material |
| GET | `/stock-ledger` | `inventory.view` | Complete stock movement audit log |
| GET | `/stock/low-stock` | `inventory.view` | Materials below reorder thresholds |
| POST | `/transfer` | `inventory.transfer`| Transfer material stock between warehouses |
| POST | `/adjust` | `inventory.adjust` | Adjust physical count discrepancy with reason |

#### 3.7 Procurement (`/api/v1`)
| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/purchase-requests` | `procurement.view` | List purchase requisitions |
| POST | `/purchase-requests` | `procurement.create`| Create Purchase Request |
| POST | `/purchase-requests/:id/approve`| `procurement.approve`| Approve PR |
| GET | `/rfqs` | `procurement.view` | List Requests for Quotation |
| POST | `/rfqs` | `procurement.rfq` | Issue RFQ to vendors |
| POST | `/vendor-quotations` | `procurement.create`| Inward vendor quotation |
| POST | `/rfqs/:id/select-vendor`| `procurement.vendorSelect`| Commercial comparative evaluation |
| GET | `/vendor-pos` | `procurement.view` | List Purchase Orders to vendors |
| POST | `/vendor-pos` | `procurement.poCreate`| Generate Vendor PO |
| POST | `/vendor-pos/:id/approve`| `procurement.poApprove`| Approve Vendor PO |
| GET | `/grns` | `grn.view` | List Goods Receipt Notes |
| POST | `/grns` | `grn.create` | Inward consignment & update warehouse stock |

#### 3.8 Quality Assurance & Serialization (`/api/v1`)
| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/inspections` | `qa.view` | List pull-down testing orders |
| GET | `/inspections/:id` | `qa.view` | Test parameters, sensor curves |
| POST | `/inspections/:id/pass` | `qa.pass` | Pass unit & auto-generate Serial Number |
| POST | `/inspections/:id/fail` | `qa.fail` | Fail unit with defect non-conformance |
| POST | `/inspections/:id/retest` | `qa.retest` | Retest reworked unit |
| GET | `/serials` | `serial.view` | List manufactured unit serial numbers |
| GET | `/serials/trace/:serialNumber`| `serial.view` | End-to-end unit genealogy trace |

#### 3.9 Logistics & Dispatch (`/api/v1`)
| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/finished-goods` | `packing.view` | List QA-passed inventory awaiting dispatch |
| POST | `/packing-lists` | `packing.manage` | Generate packing checklist |
| POST | `/packing-lists/:id/complete`| `packing.manage`| Confirm unit crated & packed |
| POST | `/final-invoices` | `dispatch.create` | Generate GST tax invoice |
| GET | `/dispatches` | `dispatch.view` | List dispatches |
| POST | `/dispatches` | `dispatch.create` | Inward dispatch with vehicle & e-Way bill |
| POST | `/deliveries/:id/pod` | `delivery.update` | Upload Proof of Delivery (POD) & mark delivered |
| POST | `/deliveries/:id/failed` | `delivery.update` | Record transit failure / damage |

#### 3.10 Field Service & Warranty (`/api/v1`)
| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/installations` | `service.view` | List on-site installations |
| POST | `/installations/:id/commission`| `service.update`| Commission unit & auto-activate warranty |
| GET | `/warranties/check/:serialNumber`| `warranty.view`| Validate serial warranty validity |
| GET | `/service-tickets` | `service.view` | List customer breakdown tickets |
| POST | `/service-tickets` | `service.create` | Log service incident ticket |
| POST | `/service-tickets/:id/assign`| `service.assign` | Assign service technician |
| POST | `/service-tickets/:id/update-work`| `service.update`| Log on-site diagnostics & consumed spares |
| POST | `/service-tickets/:id/resolve`| `service.update` | Mark resolved with resolution summary |
| POST | `/service-tickets/:id/close`| `service.close` | Customer signoff & close ticket |
| POST | `/rmas` | `rma.create` | Raise Return Material Authorization |
| POST | `/rmas/:id/approve` | `rma.approve` | Approve replacement unit dispatch |

#### 3.11 Governance, Audit & Reports (`/api/v1`)
| Method | Endpoint | Permission | Description |
|---|---|---|---|
| GET | `/notifications` | Authenticated | List in-app alerts & reminders |
| POST | `/notifications/:id/read`| Authenticated | Mark notification read |
| GET | `/audit-logs` | `audit.view` | Query chronological audit logs |
| GET | `/reports/sales-funnel` | `reports.view` | Conversion metrics (Lead ➔ SO) |
| GET | `/reports/production-efficiency`| `reports.view`| Stage throughput & bottlenecks |
| GET | `/reports/service-sla` | `reports.view` | Mean time to resolve (MTTR) & SLA compliance |
| GET | `/reports/dashboard-metrics`| `reports.view` | Real-time executive KPI summary |
| GET | `/health` | Public | Liveness check |
| GET | `/health/db` | Public | MongoDB connection state |
| GET | `/system/version` | Public | API semantic version & build info |
