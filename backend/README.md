# Cryo Scientific Systems — Enterprise ERP Backend

Production-ready enterprise ERP backend engineered for **Cryo Scientific Systems Pvt. Ltd.**, Chennai. Built to manage mission-critical manufacturing workflows for medical and scientific refrigeration equipment (Ultra-Low Temperature Freezers `-80°C`, Blood Bank Refrigerators `+4°C`, Plasma Freezers `-40°C`, Plant Growth Chambers).

---

## 1. Technology Stack
- **Runtime**: Node.js v20.x
- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose v8.x)
- **Language**: Pure JavaScript (ES2022 / CommonJS) — *Zero TypeScript*
- **Authentication**: JWT (Access Token + Rotating Refresh Token) with bcrypt password hashing
- **Security**: Helmet, CORS, express-rate-limit, input validation
- **Logging & Audit**: Winston structured JSON logs, database-backed immutable AuditLog
- **Testing**: Jest + Supertest (End-to-End integration test suite)

---

## 2. Key Business Capabilities Implemented
1. **End-to-End Traceability**: Full genealogy chain linking Lead ➔ Enquiry ➔ Quotation ➔ Customer PO ➔ Sales Order ➔ Production Order ➔ Shopfloor Work Centers ➔ Pull-down QA Inspection ➔ Serial Number ➔ Finished Goods ➔ Packing ➔ Tax Invoice ➔ Dispatch ➔ POD Delivery ➔ On-site Commissioning ➔ 12-Month Warranty ➔ Field Service Tickets ➔ RMA.
2. **State Machine Governance**: Strict transition rules preventing status bypass (e.g. Sales Orders cannot proceed to production until the advance payment gate is verified).
3. **Zero-Trust RBAC**: 13 discrete enterprise roles with 60+ granular permissions.
4. **Multi-Warehouse Inventory & Double-Entry Ledger**: Real-time stock reservation, low-stock alerts, warehouse transfers, and variance adjustments.
5. **Configurable Business Rules**: Dynamic configuration parameters (advance release percentage, warranty duration, price tolerances) stored in the database.
6. **External ERP Interoperability**: Tally Prime integration adapters and 3-way match validation.

---

## 3. Quick Start & Setup

### 3.1 Prerequisites
- Node.js v18+ or v20+
- MongoDB v6.0+ running locally on `localhost:27017` or via MongoDB Atlas

### 3.2 Installation
```bash
cd backend
npm install
```

### 3.3 Environment Setup
Copy the sample environment file and configure variables:
```bash
cp .env.example .env
```

### 3.4 Seed Database
The seeding script initializes all 60+ permissions, 13 system roles, 13 functional test users, master data (warehouses, work centers, materials, products, BOM), and a complete linked demo workflow:
```bash
npm run seed
```

#### Seeded Test Credentials (Password: `Password@123` for all)
- **Admin**: `admin@cryo.com`
- **Sales Executive**: `sales@cryo.com`
- **Sales Manager**: `salesmanager@cryo.com`
- **Accounts Officer**: `accounts@cryo.com`
- **Purchase Officer**: `purchase@cryo.com`
- **Store Keeper**: `store@cryo.com`
- **Production Supervisor**: `production@cryo.com`
- **QA Engineer**: `qa@cryo.com`
- **Dispatch Executive**: `dispatch@cryo.com`
- **Service Manager**: `servicemanager@cryo.com`
- **Field Service Engineer**: `serviceengineer@cryo.com`
- **Managing Director**: `management@cryo.com`
- **R&D Lead Scientist**: `rnd@cryo.com`

---

## 4. Running the Backend

### Development Mode (with hot-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Production Mode via PM2 Cluster
```bash
pm2 start ecosystem.config.js --env production
```

---

## 5. Running the Test Suite
The automated Jest suite covers authentication, sales workflow, inventory transfers, QA pull-down tests, field service warranties, and a 14-step end-to-end commercial-to-service integration lifecycle:
```bash
npm test
```

---

## 6. Directory Layout
```
backend/
├── docs/
│   ├── WORKFLOW.md              # 4-Tier Business & System Architecture
│   ├── FRONTEND_INTEGRATION.md  # API Contract & Schema Guide for Frontend Engineers
│   ├── API.md                   # Complete Endpoint Listing & Payload Reference
│   ├── DATABASE.md              # Data Models, Indexes & Relational Mapping
│   ├── RBAC.md                  # 13 Roles to Granular Permissions Matrix
│   ├── DEPLOYMENT.md            # PM2, Nginx, SSL, MongoDB Cluster Guide
│   └── OPEN_BUSINESS_RULES.md   # Configurable Rules & Decision Points
├── src/
│   ├── config/                  # DB connection, env config, winston logger
│   ├── constants/               # Roles, permissions, canonical statuses, error codes
│   ├── controllers/             # HTTP controllers for all 14 modules
│   ├── middlewares/             # JWT auth, RBAC permissions, error handler, rate limiter
│   ├── models/                  # 30+ Mongoose schemas with validation and indexes
│   ├── notifications/           # Event notification engine
│   ├── routes/                  # Express route routers
│   ├── seeders/                 # Database initialization and demo order fixture
│   ├── services/                # Business logic, state transitions, transactions
│   ├── utils/                   # API response, error formatting, sequences, audit logger
│   ├── workflows/               # Workflow state machine transition validators
│   ├── app.js                   # Express application setup and middleware wiring
│   └── server.js                # Server entry point and graceful shutdown
├── tests/                       # Jest & Supertest test suites
├── ecosystem.config.js          # PM2 cluster configuration
├── nginx.conf.example           # Nginx reverse proxy template
├── package.json
└── README.md
```
