import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import AppLayout from './components/layout/AppLayout';

// Feature Pages
import LoginPage from './features/auth/LoginPage';
import DashboardPage from './features/dashboard/DashboardPage';
import LeadsPage from './features/sales/LeadsPage';
import QuotationsPage from './features/sales/QuotationsPage';
import CustomerPOsPage from './features/sales/CustomerPOsPage';
import SalesOrdersPage from './features/sales/SalesOrdersPage';
import PaymentsPage from './features/finance/PaymentsPage';
import FinancePage from './features/finance/FinancePage';
import ProductionOrdersPage from './features/production/ProductionOrdersPage';
import BOMPage from './features/production/BOMPage';
import StockPage from './features/inventory/StockPage';
import ProcurementPage from './features/procurement/ProcurementPage';
import InspectionsPage from './features/quality/InspectionsPage';
import TraceabilityPage from './features/quality/TraceabilityPage';
import LogisticsPage from './features/logistics/LogisticsPage';
import ServicePage from './features/service/ServicePage';
import MasterDataPage from './features/masterData/MasterDataPage';
import AuditLogsPage from './features/governance/AuditLogsPage';
import ReportsPage from './features/governance/ReportsPage';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'var(--bg-app)',
          color: 'var(--accent-cryo)',
          fontFamily: 'var(--font-mono)'
        }}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>❄</div>
        <div style={{ letterSpacing: '0.12em', fontSize: '0.85rem', fontWeight: 600 }}>
          SYNCHRONIZING CRYO TELEMETRY BUS...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Auth Gateway */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Enterprise ERP Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/reports" element={<ReportsPage />} />

                {/* Commercial Lifecycle */}
                <Route path="/sales/leads" element={<LeadsPage />} />
                <Route path="/sales/enquiries" element={<LeadsPage />} />
                <Route path="/sales/quotations" element={<QuotationsPage />} />
                <Route path="/sales/proforma-invoices" element={<QuotationsPage />} />
                <Route path="/sales/customer-pos" element={<CustomerPOsPage />} />
                <Route path="/sales/orders" element={<SalesOrdersPage />} />

                {/* Finance & Accounts */}
                <Route path="/finance/payments" element={<PaymentsPage />} />
                <Route path="/finance/receivables" element={<FinancePage />} />
                <Route path="/finance/three-way-match" element={<FinancePage />} />
                <Route path="/finance/tally" element={<FinancePage />} />

                {/* Manufacturing & BOM */}
                <Route path="/production/orders" element={<ProductionOrdersPage />} />
                <Route path="/production/boms" element={<BOMPage />} />
                <Route path="/production/material-requests" element={<ProductionOrdersPage />} />

                {/* Warehouse & Inventory */}
                <Route path="/inventory/stock" element={<StockPage />} />
                <Route path="/inventory/stock-ledger" element={<StockPage />} />
                <Route path="/inventory/transfers" element={<StockPage />} />
                <Route path="/inventory/adjustments" element={<StockPage />} />

                {/* Procurement */}
                <Route path="/procurement/purchase-requests" element={<ProcurementPage />} />
                <Route path="/procurement/rfqs" element={<ProcurementPage />} />
                <Route path="/procurement/vendor-pos" element={<ProcurementPage />} />
                <Route path="/procurement/grn" element={<ProcurementPage />} />

                {/* Quality & Traceability */}
                <Route path="/quality/inspections" element={<InspectionsPage />} />
                <Route path="/quality/serials" element={<TraceabilityPage />} />
                <Route path="/quality/traceability" element={<TraceabilityPage />} />

                {/* Logistics & Dispatch */}
                <Route path="/logistics/finished-goods" element={<LogisticsPage />} />
                <Route path="/logistics/packing" element={<LogisticsPage />} />
                <Route path="/logistics/invoices" element={<LogisticsPage />} />
                <Route path="/logistics/dispatch" element={<LogisticsPage />} />

                {/* Field Operations & Reliability */}
                <Route path="/service/installations" element={<ServicePage />} />
                <Route path="/service/warranties" element={<ServicePage />} />
                <Route path="/service/tickets" element={<ServicePage />} />
                <Route path="/service/rma" element={<ServicePage />} />

                {/* Enterprise Master Data */}
                <Route path="/master-data/customers" element={<MasterDataPage />} />
                <Route path="/master-data/products" element={<MasterDataPage />} />
                <Route path="/master-data/materials" element={<MasterDataPage />} />
                <Route path="/master-data/vendors" element={<MasterDataPage />} />
                <Route path="/master-data/warehouses" element={<MasterDataPage />} />
                <Route path="/master-data/configurations" element={<MasterDataPage />} />

                {/* Governance & Compliance */}
                <Route path="/audit" element={<AuditLogsPage />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
