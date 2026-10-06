import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import styles from './AppLayout.module.scss';

// All 13 seed accounts for instant developer role switching
const DEV_USERS = [
  { role: 'ADMIN', email: 'admin@cryo.com', label: 'Super Admin' },
  { role: 'SALES', email: 'sales@cryo.com', label: 'Sales Exec' },
  { role: 'SALES_MANAGER', email: 'salesmanager@cryo.com', label: 'Sales Manager' },
  { role: 'ACCOUNTS', email: 'accounts@cryo.com', label: 'Accounts Officer' },
  { role: 'PURCHASE', email: 'purchase@cryo.com', label: 'Purchase Officer' },
  { role: 'STORE', email: 'store@cryo.com', label: 'Store Keeper' },
  { role: 'PRODUCTION', email: 'production@cryo.com', label: 'Production Supv' },
  { role: 'QA', email: 'qa@cryo.com', label: 'QA Engineer' },
  { role: 'DISPATCH', email: 'dispatch@cryo.com', label: 'Dispatch Exec' },
  { role: 'SERVICE_MANAGER', email: 'servicemanager@cryo.com', label: 'Service Manager' },
  { role: 'SERVICE_ENGINEER', email: 'serviceengineer@cryo.com', label: 'Field Engineer' },
  { role: 'MANAGEMENT', email: 'management@cryo.com', label: 'Managing Dir' },
  { role: 'R_AND_D', email: 'rnd@cryo.com', label: 'R&D Lead' }
];

export const AppLayout = () => {
  const { user, logout, login, hasPermission } = useAuth();
  const { unreadCount, notifications, fetchNotifications, markAsRead, showToast } = useNotification();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifDropdown, setNotifDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Close mobile drawer on route transition
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleRoleSwitch = async (e) => {
    const selectedEmail = e.target.value;
    try {
      await login(selectedEmail, 'Password@123');
      showToast(`Switched active session to ${selectedEmail}`, 'info');
      navigate('/dashboard');
    } catch {
      showToast('Could not switch user', 'error');
    }
  };

  const navGroups = [
    {
      title: 'Command',
      items: [
        { label: 'Executive Dashboard', path: '/dashboard', icon: '⚡' },
        { label: 'Business Reports', path: '/reports', icon: '📊', perm: 'reports.view' }
      ]
    },
    {
      title: 'Commercial',
      items: [
        { label: 'Sales Leads', path: '/sales/leads', icon: '🎯', perm: 'lead.view' },
        { label: 'Technical Enquiries', path: '/sales/enquiries', icon: '📋', perm: 'enquiry.view' },
        { label: 'Quotations', path: '/sales/quotations', icon: '💼', perm: 'quotation.view' },
        { label: 'Proforma Invoices', path: '/sales/proforma-invoices', icon: '📄', perm: 'quotation.view' },
        { label: 'Customer POs', path: '/sales/customer-pos', icon: '📑', perm: 'customer_po.view' },
        { label: 'Sales Orders', path: '/sales/orders', icon: '📦', perm: 'sales_order.view' }
      ]
    },
    {
      title: 'Finance',
      items: [
        { label: 'Payment Receipts', path: '/finance/payments', icon: '💳', perm: 'payment.view' },
        { label: 'Receivables & Payables', path: '/finance/receivables', icon: '📈', perm: 'finance.view' },
        { label: '3-Way Match Audit', path: '/finance/three-way-match', icon: '⚖️', perm: 'finance.view' },
        { label: 'Tally Prime Sync', path: '/finance/tally', icon: '🔄', perm: 'finance.manage' }
      ]
    },
    {
      title: 'Manufacturing',
      items: [
        { label: 'Production Orders', path: '/production/orders', icon: '⚙️', perm: 'production.view' },
        { label: 'Bills of Materials (BOM)', path: '/production/boms', icon: '📐', perm: 'bom.view' },
        { label: 'Material Requests', path: '/production/material-requests', icon: '📝', perm: 'production.view' }
      ]
    },
    {
      title: 'Inventory & Stores',
      items: [
        { label: 'Warehouse Stock', path: '/inventory/stock', icon: '🏭', perm: 'inventory.view' },
        { label: 'Stock Movements Ledger', path: '/inventory/stock-ledger', icon: '📜', perm: 'inventory.view' },
        { label: 'Warehouse Transfers', path: '/inventory/transfers', icon: '🚚', perm: 'inventory.transfer' },
        { label: 'Physical Adjustments', path: '/inventory/adjustments', icon: '⚖️', perm: 'inventory.adjust' }
      ]
    },
    {
      title: 'Procurement',
      items: [
        { label: 'Purchase Requests', path: '/procurement/purchase-requests', icon: '📥', perm: 'procurement.view' },
        { label: 'RFQs & Bids', path: '/procurement/rfqs', icon: '💬', perm: 'procurement.view' },
        { label: 'Vendor POs', path: '/procurement/vendor-pos', icon: '📤', perm: 'procurement.view' },
        { label: 'Goods Receipt Notes (GRN)', path: '/procurement/grn', icon: '📥', perm: 'grn.view' }
      ]
    },
    {
      title: 'Quality & Traceability',
      items: [
        { label: 'Pull-down Inspections', path: '/quality/inspections', icon: '❄️', perm: 'qa.view' },
        { label: 'Serial Numbers', path: '/quality/serials', icon: '🏷️', perm: 'serial.view' },
        { label: 'End-to-End Genealogy', path: '/quality/traceability', icon: '🔗', perm: 'serial.view' }
      ]
    },
    {
      title: 'Logistics',
      items: [
        { label: 'Finished Goods', path: '/logistics/finished-goods', icon: '📦', perm: 'packing.view' },
        { label: 'Packing Lists', path: '/logistics/packing', icon: '📦', perm: 'packing.view' },
        { label: 'Final Tax Invoices', path: '/logistics/invoices', icon: '🧾', perm: 'dispatch.view' },
        { label: 'Dispatches & POD', path: '/logistics/dispatch', icon: '🚛', perm: 'dispatch.view' }
      ]
    },
    {
      title: 'Field Service',
      items: [
        { label: 'Site Commissioning', path: '/service/installations', icon: '🛠️', perm: 'service.view' },
        { label: 'Warranty Validation', path: '/service/warranties', icon: '🛡️', perm: 'warranty.view' },
        { label: 'Service Tickets', path: '/service/tickets', icon: '🎫', perm: 'service.view' },
        { label: 'RMA Replacements', path: '/service/rma', icon: '🔁', perm: 'rma.view' }
      ]
    },
    {
      title: 'System & Masters',
      items: [
        { label: 'Customers', path: '/master-data/customers', icon: '👥', perm: 'master.view' },
        { label: 'Products & Models', path: '/master-data/products', icon: '🧊', perm: 'master.view' },
        { label: 'Raw Materials', path: '/master-data/materials', icon: '🔩', perm: 'master.view' },
        { label: 'Suppliers / Vendors', path: '/master-data/vendors', icon: '🤝', perm: 'master.view' },
        { label: 'Warehouses', path: '/master-data/warehouses', icon: '🏢', perm: 'master.view' },
        { label: 'System Configuration', path: '/master-data/configurations', icon: '🔧', perm: 'settings.manage' },
        { label: 'Security Audit Trail', path: '/audit', icon: '🔒', perm: 'audit.view' }
      ]
    }
  ];

  return (
    <div className={styles.appShell}>
      {/* Mobile Backdrop Overlay */}
      <div
        className={`${styles.overlay} ${mobileOpen ? styles.mobileOpen : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar Navigation */}
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.brand}>
          <div className={styles.brandLogo}>❄</div>
          <div className={styles.brandText}>
            <span className={styles.brandName}>CRYO SCIENTIFIC</span>
            <span className={styles.brandSub}>ERP Telemetry v1.0</span>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          {navGroups.map((grp) => {
            // Filter out items user doesn't have permission to see
            const visibleItems = grp.items.filter((item) => !item.perm || hasPermission(item.perm));
            if (visibleItems.length === 0) return null;

            return (
              <div key={grp.title} className={styles.navGroup}>
                <span className={styles.groupTitle}>{grp.title}</span>
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `${styles.navItem} ${isActive ? styles.active : ''}`
                    }
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <button
            className="btn btn-outline btn-sm"
            style={{ width: '100%' }}
            onClick={logout}
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className={styles.mainContainer}>
        {/* Top Header */}
        <header className={styles.topHeader}>
          <div className={styles.headerLeft}>
            <button
              className={styles.menuToggle}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              ☰
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="telemetry-code">CHENNAI FACTORY</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>|</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                System Ready
              </span>
            </div>
          </div>

          <div className={styles.headerRight}>
            {/* Developer Role Switcher */}
            <div className={styles.roleSwitcher}>
              <span style={{ color: 'var(--text-muted)' }}>Role Switcher:</span>
              <select value={user?.email || ''} onChange={handleRoleSwitch}>
                {DEV_USERS.map((u) => (
                  <option key={u.email} value={u.email}>
                    {u.label} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Notification Bell with unread counter */}
            <div style={{ position: 'relative' }}>
              <button
                className={styles.notificationBell}
                onClick={() => setNotifDropdown(!notifDropdown)}
              >
                🔔
                {unreadCount > 0 && <span className={styles.badgeCount}>{unreadCount}</span>}
              </button>

              {/* Notification Popover */}
              {notifDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '45px',
                    width: '320px',
                    background: 'var(--bg-surface-raised)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-elevation)',
                    zIndex: 100,
                    padding: '12px',
                    maxHeight: '400px',
                    overflowY: 'auto'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid var(--border-subtle)',
                      paddingBottom: '8px',
                      marginBottom: '8px'
                    }}
                  >
                    <strong style={{ fontSize: '0.85rem' }}>Notifications ({unreadCount})</strong>
                    <button
                      className="btn btn-sm btn-outline"
                      style={{ fontSize: '0.7rem' }}
                      onClick={() => setNotifDropdown(false)}
                    >
                      Close
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
                      No unread alerts
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        style={{
                          padding: '8px',
                          borderBottom: '1px solid var(--border-subtle)',
                          fontSize: '0.8rem',
                          background: n.isRead ? 'transparent' : 'rgba(6, 182, 212, 0.05)',
                          borderRadius: '4px',
                          marginBottom: '4px'
                        }}
                      >
                        <div style={{ fontWeight: 600, color: 'var(--accent-cryo)' }}>{n.title}</div>
                        <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{n.message}</div>
                        {!n.isRead && (
                          <button
                            onClick={() => markAsRead(n._id)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--color-info)',
                              fontSize: '0.7rem',
                              cursor: 'pointer',
                              marginTop: '4px',
                              padding: 0
                            }}
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className={styles.userMenu}>
              <div className={styles.avatar}>{user?.name?.charAt(0) || 'U'}</div>
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user?.name || 'Authorized User'}</span>
                <span className={styles.userRole}>{user?.role || 'STAFF'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className={styles.pageContent}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
