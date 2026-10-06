import React, { useState, useEffect, useCallback } from 'react';
import { customerPoApi } from '../../services/api/customerPoApi';
import { quotationApi } from '../../services/api/quotationApi';
import { useNotification } from '../../contexts/NotificationContext';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import DoubleBezelCard from '../../components/common/DoubleBezelCard';

export const CustomerPOsPage = () => {
  const [pos, setPos] = useState([]);
  const [acceptedQuotes, setAcceptedQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  // Modals
  const [createModal, setCreateModal] = useState(false);
  const [verifyModal, setVerifyModal] = useState(null);
  const [resolveModal, setResolveModal] = useState(null);

  const [createForm, setCreateForm] = useState({
    quotation: '',
    customerPoReference: 'APOLLO/PO/2026/001',
    customerPoDate: new Date().toISOString().split('T')[0]
  });

  const [resolutionNotes, setResolutionNotes] = useState('');

  const { showToast } = useNotification();

  const fetchPOs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await customerPoApi.getCustomerPOs({ search, page, limit: 10 });
      setPos(res.data);
      setMeta(res.meta);
    } catch {
      showToast('Could not fetch customer POs', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, page, showToast]);

  useEffect(() => {
    fetchPOs();
    quotationApi
      .getQuotations({ limit: 50 })
      .then((res) => {
        const accepted = (res.data || []).filter(
          (q) => q.status === 'ACCEPTED' || q.status === 'APPROVED'
        );
        setAcceptedQuotes(accepted);
      })
      .catch(() => {});
  }, [fetchPOs]);

  const handleInwardPO = async (e) => {
    e.preventDefault();
    try {
      const res = await customerPoApi.createCustomerPO(createForm);
      showToast(`Customer PO inwarded: ${res.data.poNumber}`, 'success');
      setCreateModal(false);
      fetchPOs();
    } catch (err) {
      showToast(err.message || 'Error inwarding PO', 'error');
    }
  };

  const handleVerifyPO = async (po) => {
    try {
      const res = await customerPoApi.verifyCustomerPO(po._id, { discrepancies: [] });
      showToast(
        `PO verified! Internal Sales Order ${res.data.salesOrder.salesOrderNumber} created automatically.`,
        'success'
      );
      fetchPOs();
    } catch (err) {
      showToast(err.message || 'Error verifying PO', 'error');
    }
  };

  const handleHoldMismatch = async (po) => {
    try {
      await customerPoApi.verifyCustomerPO(po._id, {
        discrepancies: [{ field: 'pricing', expectedValue: '1000000', receivedValue: '900000', remarks: 'Unapproved discount in PO' }],
        holdReason: 'PO total price does not match accepted quotation'
      });
      showToast('Customer PO placed on commercial MISMATCH HOLD', 'warning');
      fetchPOs();
    } catch (err) {
      showToast(err.message || 'Error holding PO', 'error');
    }
  };

  const handleResolveMismatch = async (e) => {
    e.preventDefault();
    try {
      const res = await customerPoApi.resolveMismatch(resolveModal._id, { resolutionNotes });
      showToast(`Mismatch resolved! Created Sales Order ${res.data.salesOrder?.salesOrderNumber}`, 'success');
      setResolveModal(null);
      setResolutionNotes('');
      fetchPOs();
    } catch (err) {
      showToast(err.message || 'Error resolving mismatch', 'error');
    }
  };

  const columns = [
    {
      title: 'Internal PO Code',
      key: 'poNumber',
      render: (val) => <span className="telemetry-code">{val}</span>
    },
    {
      title: 'Customer PO Ref',
      key: 'customerPoReference',
      render: (val) => <strong style={{ color: '#ffffff' }}>{val}</strong>
    },
    {
      title: 'PO Date',
      key: 'customerPoDate',
      render: (val) => (val ? new Date(val).toLocaleDateString() : 'N/A')
    },
    {
      title: 'Total Amount',
      key: 'totalAmount',
      render: (val) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
          ₹{(val || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      title: 'Linked Sales Order',
      key: 'salesOrder',
      render: (val) => (val ? <span className="telemetry-code">{val.salesOrderNumber || val}</span> : 'Pending Verification')
    },
    {
      title: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />
    },
    {
      title: 'Verification Actions',
      key: '_id',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          {row.status === 'RECEIVED' && (
            <>
              <button className="btn btn-sm btn-success" onClick={() => handleVerifyPO(row)}>
                Verify & Create SO →
              </button>
              <button
                className="btn btn-sm btn-outline"
                style={{ color: 'var(--color-warning)' }}
                onClick={() => handleHoldMismatch(row)}
              >
                Hold Mismatch
              </button>
            </>
          )}

          {row.status === 'MISMATCH_HOLD' && (
            <button className="btn btn-sm btn-primary" onClick={() => setResolveModal(row)}>
              Resolve Discrepancy
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <DoubleBezelCard
        title="Customer Purchase Orders & Commercial Verification"
        subtitle="Verification against quotation terms and automatic generation of internal Sales Orders"
        action={
          <button className="btn btn-primary" onClick={() => setCreateModal(true)}>
            <span>➕</span> Inward Customer PO
          </button>
        }
      >
        <DataTable
          columns={columns}
          data={pos}
          loading={loading}
          pagination={meta}
          onPageChange={setPage}
          searchQuery={search}
          onSearchChange={setSearch}
        />
      </DoubleBezelCard>

      {/* Inward Customer PO Modal */}
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="Inward Customer Purchase Order"
      >
        <form onSubmit={handleInwardPO}>
          <div className="form-group">
            <label>Link Accepted Quotation</label>
            <select
              className="select-control"
              required
              value={createForm.quotation}
              onChange={(e) => setCreateForm({ ...createForm, quotation: e.target.value })}
            >
              <option value="">Select accepted quote</option>
              {acceptedQuotes.map((q) => (
                <option key={q._id} value={q._id}>
                  {q.revisionCode} — {q.customer?.companyName || 'Client'} (₹{q.grandTotal?.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>Customer PO Number / Reference</label>
              <input
                type="text"
                className="input-control"
                required
                value={createForm.customerPoReference}
                onChange={(e) => setCreateForm({ ...createForm, customerPoReference: e.target.value })}
                placeholder="e.g. HOSP/PO/2026/091"
              />
            </div>
            <div className="form-group">
              <label>PO Date</label>
              <input
                type="date"
                className="input-control"
                required
                value={createForm.customerPoDate}
                onChange={(e) => setCreateForm({ ...createForm, customerPoDate: e.target.value })}
              />
            </div>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Note: Commercial verification will compare PO line items, taxes, and prices against the linked quotation.
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setCreateModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Register Customer PO
            </button>
          </div>
        </form>
      </Modal>

      {/* Resolve Mismatch Modal */}
      <Modal
        isOpen={!!resolveModal}
        onClose={() => setResolveModal(null)}
        title={`Resolve PO Mismatch: ${resolveModal?.customerPoReference}`}
      >
        <form onSubmit={handleResolveMismatch}>
          <div className="form-group">
            <label>Resolution Justification / Manager Override Notes</label>
            <textarea
              className="textarea-control"
              rows={3}
              required
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g., Commercial deviation approved by Management due to special bulk concession..."
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setResolveModal(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Override & Release Sales Order
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CustomerPOsPage;
