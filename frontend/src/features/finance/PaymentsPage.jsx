import React, { useState, useEffect, useCallback } from 'react';
import { paymentApi } from '../../services/api/paymentApi';
import { salesOrderApi } from '../../services/api/salesOrderApi';
import { useNotification } from '../../contexts/NotificationContext';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import DoubleBezelCard from '../../components/common/DoubleBezelCard';

export const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  // Modal
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState({
    salesOrder: '',
    amount: 672600,
    paymentType: 'ADVANCE',
    paymentMethod: 'NEFT',
    transactionReference: 'NEFT-HDFC-9988776655'
  });

  const { showToast } = useNotification();

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await paymentApi.getPayments({ search, page, limit: 10 });
      setPayments(res.data);
      setMeta(res.meta);
    } catch {
      showToast('Could not fetch payments', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, page, showToast]);

  useEffect(() => {
    fetchPayments();
    salesOrderApi.getSalesOrders({ limit: 50 }).then((res) => setSalesOrders(res.data || [])).catch(() => {});
  }, [fetchPayments]);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    try {
      const res = await paymentApi.createPayment(form);
      showToast(`Payment receipt inwarded: ${res.data.paymentReference}`, 'success');
      setCreateModal(false);
      fetchPayments();
    } catch (err) {
      showToast(err.message || 'Error recording payment', 'error');
    }
  };

  const handleVerify = async (payment) => {
    try {
      const res = await paymentApi.verifyPayment(payment._id);
      showToast(
        `Payment ${payment.paymentReference} verified! Production Release Gate unlocked for SO ${res.data.salesOrder?.salesOrderNumber || ''}`,
        'success'
      );
      fetchPayments();
    } catch (err) {
      showToast(err.message || 'Error verifying payment', 'error');
    }
  };

  const columns = [
    {
      title: 'Payment Reference',
      key: 'paymentReference',
      render: (val) => <span className="telemetry-code">{val}</span>
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (val) => val?.companyName || 'Institutional Client'
    },
    {
      title: 'Amount (₹)',
      key: 'amount',
      render: (val) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#10b981' }}>
          ₹{(val || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      title: 'Payment Type',
      key: 'paymentType',
      render: (val) => <span className="telemetry-code">{val}</span>
    },
    {
      title: 'Bank Txn Ref',
      key: 'transactionReference',
      render: (val) => <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{val}</span>
    },
    {
      title: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />
    },
    {
      title: 'Accounts Release Gate',
      key: '_id',
      render: (_, row) => (
        <div>
          {row.status === 'PENDING' ? (
            <button className="btn btn-sm btn-success" onClick={() => handleVerify(row)}>
              Verify & Release Gate ✓
            </button>
          ) : (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600 }}>
              VERIFIED BY ACCOUNTS
            </span>
          )}
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <DoubleBezelCard
        title="Payment Receipts & Financial Release Gates"
        subtitle="Verification of customer payments unlocking manufacturing orders and commercial milestones"
        action={
          <button className="btn btn-primary" onClick={() => setCreateModal(true)}>
            <span>➕</span> Inward Payment Receipt
          </button>
        }
      >
        <DataTable
          columns={columns}
          data={payments}
          loading={loading}
          pagination={meta}
          onPageChange={setPage}
          searchQuery={search}
          onSearchChange={setSearch}
        />
      </DoubleBezelCard>

      {/* Record Payment Modal */}
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="Inward Customer Payment Receipt"
      >
        <form onSubmit={handleRecordPayment}>
          <div className="form-group">
            <label>Link Target Sales Order</label>
            <select
              className="select-control"
              required
              value={form.salesOrder}
              onChange={(e) => {
                const soId = e.target.value;
                const so = salesOrders.find((s) => s._id === soId);
                setForm({
                  ...form,
                  salesOrder: soId,
                  amount: so?.advanceRequiredAmount || 672600
                });
              }}
            >
              <option value="">Choose Sales Order</option>
              {salesOrders.map((so) => (
                <option key={so._id} value={so._id}>
                  {so.salesOrderNumber} — {so.customer?.companyName} (Req Advance: ₹
                  {so.advanceRequiredAmount?.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>Amount Received (₹ INR)</label>
              <input
                type="number"
                className="input-control"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label>Payment Stage</label>
              <select
                className="select-control"
                value={form.paymentType}
                onChange={(e) => setForm({ ...form, paymentType: e.target.value })}
              >
                <option value="ADVANCE">Advance Payment (Production Gate)</option>
                <option value="PARTIAL">Progress / Interim Payment</option>
                <option value="BALANCE">Final Balance Payment</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>Payment Method</label>
              <select
                className="select-control"
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              >
                <option value="NEFT">NEFT / Electronic Transfer</option>
                <option value="RTGS">RTGS High-Value Transfer</option>
                <option value="IMPS">IMPS Instant Transfer</option>
                <option value="CHEQUE">Bank Cheque / DD</option>
                <option value="LETTER_OF_CREDIT">Letter of Credit (LC)</option>
              </select>
            </div>
            <div className="form-group">
              <label>UTR / Transaction Reference</label>
              <input
                type="text"
                className="input-control"
                required
                value={form.transactionReference}
                onChange={(e) => setForm({ ...form, transactionReference: e.target.value })}
                placeholder="NEFT-SBIN-99223344"
              />
            </div>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Once recorded, Accounts officers verify the UTR with bank records to officially unlock the Production Order.
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setCreateModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Record Inward Payment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PaymentsPage;
