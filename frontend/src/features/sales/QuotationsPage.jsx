import React, { useState, useEffect, useCallback } from 'react';
import { quotationApi } from '../../services/api/quotationApi';
import { proformaInvoiceApi } from '../../services/api/proformaInvoiceApi';
import { masterDataApi } from '../../services/api/masterDataApi';
import { useNotification } from '../../contexts/NotificationContext';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import DoubleBezelCard from '../../components/common/DoubleBezelCard';

export const QuotationsPage = () => {
  const [quotations, setQuotations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  // Modals
  const [createModal, setCreateModal] = useState(false);
  const [negotiateModal, setNegotiateModal] = useState(null);
  const [reviseModal, setReviseModal] = useState(null);
  const [acceptModal, setAcceptModal] = useState(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    customerId: '',
    validityDays: 30,
    paymentTerms: '30% Advance, 60% before dispatch, 10% after commissioning',
    items: [
      {
        product: '',
        productName: '-80°C Ultra-Low Temperature Freezer 500L',
        quantity: 1,
        unitPrice: 1000000,
        discountPercent: 0,
        taxPercent: 18
      }
    ]
  });

  const [negotiateForm, setNegotiateForm] = useState({
    customerMessage: '',
    counterOfferPrice: 950000
  });

  const [reviseItems, setReviseItems] = useState([]);
  const [acceptedPerson, setAcceptedPerson] = useState('Procurement Director');

  const { showToast } = useNotification();

  const fetchQuotations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await quotationApi.getQuotations({ search, page, limit: 10 });
      setQuotations(res.data);
      setMeta(res.meta);
    } catch {
      showToast('Could not fetch quotations', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, page, showToast]);

  useEffect(() => {
    fetchQuotations();
    // Preload customers & products for quotation builder
    masterDataApi.getCustomers({ limit: 50 }).then((res) => {
      const custs = res.data || [];
      setCustomers(custs);
      if (custs.length > 0) {
        setCreateForm((f) => ({ ...f, customerId: f.customerId || custs[0]._id }));
      }
    }).catch(() => {});

    masterDataApi.getProducts({ limit: 50 }).then((res) => {
      const prods = res.data || [];
      setProducts(prods);
      if (prods.length > 0) {
        setCreateForm((f) => ({
          ...f,
          items: f.items.map((it, idx) =>
            idx === 0
              ? { ...it, product: it.product || prods[0]._id, productName: it.productName || prods[0].name, unitPrice: prods[0].standardPrice || it.unitPrice }
              : it
          )
        }));
      }
    }).catch(() => {});
  }, [fetchQuotations]);

  const handleCreateQuotation = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        customer: createForm.customerId || customers[0]?._id,
        validityDays: createForm.validityDays,
        paymentTerms: createForm.paymentTerms,
        items: createForm.items
      };
      await quotationApi.createQuotation(payload);
      showToast('Draft quotation created (Revision R0)', 'success');
      setCreateModal(false);
      fetchQuotations();
    } catch (err) {
      showToast(err.message || 'Error creating quotation', 'error');
    }
  };

  const handleSubmit = async (quote) => {
    try {
      await quotationApi.submitQuotation(quote._id);
      showToast(`Quotation ${quote.revisionCode} submitted for Sales Manager approval`, 'success');
      fetchQuotations();
    } catch (err) {
      showToast(err.message || 'Error submitting quote', 'error');
    }
  };

  const handleApprove = async (quote) => {
    try {
      await quotationApi.approveQuotation(quote._id);
      showToast(`Quotation ${quote.revisionCode} approved by Sales Manager`, 'success');
      fetchQuotations();
    } catch (err) {
      showToast(err.message || 'Error approving quote', 'error');
    }
  };

  const handleSend = async (quote) => {
    try {
      await quotationApi.sendQuotation(quote._id, { sentVia: 'EMAIL' });
      showToast(`Quotation ${quote.revisionCode} dispatched to client`, 'success');
      fetchQuotations();
    } catch (err) {
      showToast(err.message || 'Error sending quote', 'error');
    }
  };

  const handleNegotiate = async (e) => {
    e.preventDefault();
    try {
      await quotationApi.negotiateQuotation(negotiateModal._id, negotiateForm);
      showToast('Client negotiation logged', 'info');
      setNegotiateModal(null);
      fetchQuotations();
    } catch (err) {
      showToast(err.message || 'Error logging negotiation', 'error');
    }
  };

  const handleRevise = async (e) => {
    e.preventDefault();
    try {
      const res = await quotationApi.reviseQuotation(reviseModal._id, { items: reviseItems });
      showToast(`New revision created: ${res.data.revisionCode}`, 'success');
      setReviseModal(null);
      fetchQuotations();
    } catch (err) {
      showToast(err.message || 'Error revising quotation', 'error');
    }
  };

  const handleAccept = async (e) => {
    e.preventDefault();
    try {
      await quotationApi.acceptQuotation(acceptModal._id, { acceptedByCustomerPerson: acceptedPerson });
      showToast(`Quotation ${acceptModal.revisionCode} accepted by customer!`, 'success');
      setAcceptModal(null);
      fetchQuotations();
    } catch (err) {
      showToast(err.message || 'Error accepting quotation', 'error');
    }
  };

  const handleGeneratePI = async (quote) => {
    try {
      const res = await proformaInvoiceApi.createProformaInvoice({
        quotationId: quote._id,
        advancePercent: 30
      });
      showToast(`Proforma Invoice ${res.data.piNumber} generated (30% advance required)`, 'success');
      fetchQuotations();
    } catch (err) {
      showToast(err.message || 'Error generating PI', 'error');
    }
  };

  const columns = [
    {
      title: 'Revision Code',
      key: 'revisionCode',
      render: (val, row) => (
        <div>
          <span className="telemetry-code">{val}</span>
          {row.isLatestRevision && (
            <span style={{ marginLeft: '6px', fontSize: '0.65rem', color: 'var(--color-info)' }}>
              ● LATEST
            </span>
          )}
        </div>
      )
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (val) => val?.companyName || val?.name || 'Institutional Client'
    },
    {
      title: 'Grand Total (₹)',
      key: 'grandTotal',
      render: (val) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
          ₹{(val || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      title: 'Items',
      key: 'items',
      render: (items) => (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {items?.length || 1} line item(s)
        </span>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />
    },
    {
      title: 'Actions',
      key: '_id',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {row.status === 'DRAFT' && (
            <button className="btn btn-sm btn-primary" onClick={() => handleSubmit(row)}>
              Submit for Approval
            </button>
          )}

          {row.status === 'PENDING_APPROVAL' && (
            <button className="btn btn-sm btn-success" onClick={() => handleApprove(row)}>
              Approve (Manager)
            </button>
          )}

          {row.status === 'APPROVED' && (
            <button className="btn btn-sm btn-primary" onClick={() => handleSend(row)}>
              Send to Customer →
            </button>
          )}

          {row.status === 'SENT' && (
            <button className="btn btn-sm btn-secondary" onClick={() => setNegotiateModal(row)}>
              Log Negotiation
            </button>
          )}

          {row.status === 'NEGOTIATION' && (
            <>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => {
                  setReviseModal(row);
                  setReviseItems(row.items || []);
                }}
              >
                Create Revision →
              </button>
              <button className="btn btn-sm btn-success" onClick={() => setAcceptModal(row)}>
                Accept Quote
              </button>
            </>
          )}

          {row.status === 'ACCEPTED' && (
            <button className="btn btn-sm btn-outline" onClick={() => handleGeneratePI(row)}>
              Generate Proforma (PI)
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <DoubleBezelCard
        title="Commercial Quotations & Revisions"
        subtitle="Multi-revision quotes with manager approval gates and margin tracking"
        action={
          <button className="btn btn-primary" onClick={() => setCreateModal(true)}>
            <span>➕</span> Draft Quotation (R0)
          </button>
        }
      >
        <DataTable
          columns={columns}
          data={quotations}
          loading={loading}
          pagination={meta}
          onPageChange={setPage}
          searchQuery={search}
          onSearchChange={setSearch}
        />
      </DoubleBezelCard>

      {/* Create Draft Quotation Modal */}
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="Draft Commercial Quotation (R0)"
        size="lg"
      >
        <form onSubmit={handleCreateQuotation}>
          <div className="form-group">
            <label>Select Target Customer</label>
            <select
              className="select-control"
              value={createForm.customerId}
              onChange={(e) => setCreateForm({ ...createForm, customerId: e.target.value })}
            >
              <option value="">Choose registered customer</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.companyName} ({c.customerId || c.email})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>Quote Validity (Days)</label>
              <input
                type="number"
                className="input-control"
                value={createForm.validityDays}
                onChange={(e) => setCreateForm({ ...createForm, validityDays: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label>Commercial Payment Terms</label>
              <input
                type="text"
                className="input-control"
                value={createForm.paymentTerms}
                onChange={(e) => setCreateForm({ ...createForm, paymentTerms: e.target.value })}
              />
            </div>
          </div>

          <div style={{ margin: '16px 0', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '8px' }}>Line Item Configuration</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '8px' }}>
              <div className="form-group">
                <label>Equipment Model</label>
                <input
                  type="text"
                  className="input-control"
                  value={createForm.items[0].productName}
                  onChange={(e) => {
                    const items = [...createForm.items];
                    items[0].productName = e.target.value;
                    setCreateForm({ ...createForm, items });
                  }}
                />
              </div>
              <div className="form-group">
                <label>Qty</label>
                <input
                  type="number"
                  className="input-control"
                  value={createForm.items[0].quantity}
                  onChange={(e) => {
                    const items = [...createForm.items];
                    items[0].quantity = Number(e.target.value);
                    setCreateForm({ ...createForm, items });
                  }}
                />
              </div>
              <div className="form-group">
                <label>Unit Price (₹)</label>
                <input
                  type="number"
                  className="input-control"
                  value={createForm.items[0].unitPrice}
                  onChange={(e) => {
                    const items = [...createForm.items];
                    items[0].unitPrice = Number(e.target.value);
                    setCreateForm({ ...createForm, items });
                  }}
                />
              </div>
              <div className="form-group">
                <label>GST Tax (%)</label>
                <input
                  type="number"
                  className="input-control"
                  value={createForm.items[0].taxPercent}
                  onChange={(e) => {
                    const items = [...createForm.items];
                    items[0].taxPercent = Number(e.target.value);
                    setCreateForm({ ...createForm, items });
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setCreateModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Quotation (R0)
            </button>
          </div>
        </form>
      </Modal>

      {/* Negotiation Modal */}
      <Modal
        isOpen={!!negotiateModal}
        onClose={() => setNegotiateModal(null)}
        title={`Record Negotiation: ${negotiateModal?.revisionCode}`}
      >
        <form onSubmit={handleNegotiate}>
          <div className="form-group">
            <label>Customer Counter Offer / Discussion Points</label>
            <textarea
              className="textarea-control"
              rows={3}
              required
              value={negotiateForm.customerMessage}
              onChange={(e) => setNegotiateForm({ ...negotiateForm, customerMessage: e.target.value })}
              placeholder="Client requested a 5% price concession for 2-unit bulk purchase..."
            />
          </div>
          <div className="form-group">
            <label>Proposed Counter Price (₹)</label>
            <input
              type="number"
              className="input-control"
              value={negotiateForm.counterOfferPrice}
              onChange={(e) => setNegotiateForm({ ...negotiateForm, counterOfferPrice: Number(e.target.value) })}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setNegotiateModal(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Log Negotiation
            </button>
          </div>
        </form>
      </Modal>

      {/* Revise Modal */}
      <Modal
        isOpen={!!reviseModal}
        onClose={() => setReviseModal(null)}
        title={`Create Revision: ${reviseModal?.quotationNumber}`}
      >
        <form onSubmit={handleRevise}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Advancing quotation revision. Historical revisions will be preserved immutably.
          </p>
          {reviseItems.map((item, idx) => (
            <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px' }}>
              <div className="form-group">
                <label>Model</label>
                <input type="text" className="input-control" value={item.productName} disabled />
              </div>
              <div className="form-group">
                <label>Qty</label>
                <input
                  type="number"
                  className="input-control"
                  value={item.quantity}
                  onChange={(e) => {
                    const newItems = [...reviseItems];
                    newItems[idx].quantity = Number(e.target.value);
                    setReviseItems(newItems);
                  }}
                />
              </div>
              <div className="form-group">
                <label>Negotiated Price (₹)</label>
                <input
                  type="number"
                  className="input-control"
                  value={item.unitPrice}
                  onChange={(e) => {
                    const newItems = [...reviseItems];
                    newItems[idx].unitPrice = Number(e.target.value);
                    setReviseItems(newItems);
                  }}
                />
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setReviseModal(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Revision
            </button>
          </div>
        </form>
      </Modal>

      {/* Customer Accept Modal */}
      <Modal
        isOpen={!!acceptModal}
        onClose={() => setAcceptModal(null)}
        title={`Confirm Customer Acceptance: ${acceptModal?.revisionCode}`}
      >
        <form onSubmit={handleAccept}>
          <div className="form-group">
            <label>Accepted by Customer Authority / Person</label>
            <input
              type="text"
              className="input-control"
              required
              value={acceptedPerson}
              onChange={(e) => setAcceptedPerson(e.target.value)}
              placeholder="e.g., Dr. R. Kumar, Purchase Director"
            />
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Accepting the quotation allows generation of Proforma Invoices and Customer PO inwards.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setAcceptModal(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-success">
              Confirm Acceptance
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default QuotationsPage;
