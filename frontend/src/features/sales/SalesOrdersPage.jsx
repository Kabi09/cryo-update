import React, { useState, useEffect, useCallback } from 'react';
import { salesOrderApi } from '../../services/api/salesOrderApi';
import { useNotification } from '../../contexts/NotificationContext';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import DoubleBezelCard from '../../components/common/DoubleBezelCard';
import WorkflowTimeline from '../../components/common/WorkflowTimeline';

export const SalesOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  // Detail Modal
  const [detailModal, setDetailModal] = useState(null);
  const [timeline, setTimeline] = useState([]);

  const { showToast } = useNotification();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await salesOrderApi.getSalesOrders({ search, page, limit: 10 });
      setOrders(res.data);
      setMeta(res.meta);
    } catch {
      showToast('Could not fetch sales orders', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, page, showToast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOpenDetail = async (order) => {
    setDetailModal(order);
    try {
      const res = await salesOrderApi.getTimeline(order._id);
      setTimeline(res.data || []);
    } catch {
      setTimeline([]);
    }
  };

  const columns = [
    {
      title: 'Sales Order No',
      key: 'salesOrderNumber',
      render: (val) => <span className="telemetry-code">{val}</span>
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (val) => (
        <div>
          <strong style={{ color: '#ffffff' }}>{val?.companyName || 'Institutional Client'}</strong>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{val?.email}</div>
        </div>
      )
    },
    {
      title: 'Grand Total',
      key: 'grandTotal',
      render: (val) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
          ₹{(val || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      title: 'Advance Gate Status',
      key: 'advancePaid',
      render: (paid, row) => (
        <div>
          {paid ? (
            <span style={{ color: 'var(--color-success)', fontWeight: 600, fontSize: '0.8rem' }}>
              ✓ ADVANCE VERIFIED
            </span>
          ) : (
            <span style={{ color: 'var(--color-warning)', fontWeight: 600, fontSize: '0.8rem' }}>
              ⏳ AWAITING ADVANCE (₹{(row.advanceRequiredAmount || 0).toLocaleString('en-IN')})
            </span>
          )}
        </div>
      )
    },
    {
      title: 'Production Status',
      key: 'isReleasedToProduction',
      render: (released) => (
        <span
          className={`status-badge ${released ? 'status-success' : 'status-warning'}`}
          style={{ fontSize: '0.725rem' }}
        >
          <span className="pulse-dot" />
          {released ? 'RELEASED TO PRODUCTION' : 'PRODUCTION LOCKED'}
        </span>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />
    },
    {
      title: 'Action',
      key: '_id',
      render: (_, row) => (
        <button className="btn btn-sm btn-outline" onClick={() => handleOpenDetail(row)}>
          Inspect Order →
        </button>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <DoubleBezelCard
        title="Internal Sales Orders & Production Release Gates"
        subtitle="Commercial orders linked to factory manufacturing, BOM requisitions, and billing"
      >
        <DataTable
          columns={columns}
          data={orders}
          loading={loading}
          pagination={meta}
          onPageChange={setPage}
          searchQuery={search}
          onSearchChange={setSearch}
        />
      </DoubleBezelCard>

      {/* Order Detail & Timeline Modal */}
      <Modal
        isOpen={!!detailModal}
        onClose={() => setDetailModal(null)}
        title={`Sales Order: ${detailModal?.salesOrderNumber}`}
        size="lg"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Gate Alert Box */}
          <div
            style={{
              padding: '16px',
              borderRadius: '8px',
              border: `1px solid ${
                detailModal?.isReleasedToProduction ? 'var(--color-success-border)' : 'var(--color-warning-border)'
              }`,
              background: detailModal?.isReleasedToProduction ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div>
              <strong
                style={{
                  color: detailModal?.isReleasedToProduction ? 'var(--color-success)' : 'var(--color-warning)',
                  fontSize: '0.95rem'
                }}
              >
                {detailModal?.isReleasedToProduction
                  ? '✓ Production Release Gate: AUTHORIZED'
                  : '⚠️ Production Release Gate: LOCKED'}
              </strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {detailModal?.isReleasedToProduction
                  ? 'Accounts has verified the required advance payment. Shopfloor supervisors can plan manufacturing.'
                  : `Order requires advance payment of ₹${detailModal?.advanceRequiredAmount?.toLocaleString(
                      'en-IN'
                    )} before production orders can be initialized.`}
              </p>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
              Order Line Items & Manufactured Units
            </h4>
            <div
              style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                overflow: 'hidden',
                background: 'var(--bg-surface-raised)'
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left' }}>Item / Model</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>Quantity</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Unit Price (₹)</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {(detailModal?.items || []).map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '8px 12px' }}>{item.productName}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                        ₹{item.unitPrice?.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        ₹{item.lineTotal?.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Stepper */}
          <div>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>
              Complete Lifecycle Workflow Stepper
            </h4>
            <WorkflowTimeline
              steps={[
                { label: 'Customer PO', date: 'Verified' },
                { label: 'Advance Payment', date: detailModal?.advancePaid ? 'Received' : 'Pending' },
                { label: 'Production Order', date: detailModal?.isReleasedToProduction ? 'Released' : 'Locked' },
                { label: 'Pull-down QA', date: 'Pending' },
                { label: 'Dispatch & POD', date: 'Pending' }
              ]}
              currentStepIndex={detailModal?.isReleasedToProduction ? 2 : 1}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SalesOrdersPage;
