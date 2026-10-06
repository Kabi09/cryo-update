import React, { useState, useEffect, useCallback } from 'react';
import { leadApi } from '../../services/api/leadApi';
import { useNotification } from '../../contexts/NotificationContext';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import DoubleBezelCard from '../../components/common/DoubleBezelCard';

export const LeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  // Modals state
  const [createModal, setCreateModal] = useState(false);
  const [followUpModal, setFollowUpModal] = useState(null);
  const [lostModal, setLostModal] = useState(null);

  // Forms
  const [createForm, setCreateForm] = useState({
    customerName: '',
    contactPerson: '',
    email: '',
    phone: '',
    requirement: '',
    source: 'WEBSITE',
    expectedValue: 1000000
  });

  const [followUpForm, setFollowUpForm] = useState({
    type: 'CALL',
    discussion: '',
    customerResponse: 'INTERESTED',
    nextFollowUpDate: ''
  });

  const [lostReason, setLostReason] = useState('');

  const { showToast } = useNotification();

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const res = await leadApi.getLeads({
        search,
        status: statusFilter || undefined,
        page,
        limit: 10
      });
      setLeads(res.data);
      setMeta(res.meta);
    } catch {
      showToast('Could not fetch leads', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, showToast]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      await leadApi.createLead(createForm);
      showToast('Lead captured successfully', 'success');
      setCreateModal(false);
      setCreateForm({
        customerName: '',
        contactPerson: '',
        email: '',
        phone: '',
        requirement: '',
        source: 'WEBSITE',
        expectedValue: 1000000
      });
      fetchLeads();
    } catch (err) {
      showToast(err.message || 'Error creating lead', 'error');
    }
  };

  const handleQualify = async (lead) => {
    try {
      await leadApi.qualifyLead(lead._id);
      showToast(`Lead ${lead.leadNumber} qualified. Customer profile linked/created.`, 'success');
      fetchLeads();
    } catch (err) {
      showToast(err.message || 'Error qualifying lead', 'error');
    }
  };

  const handleConvertToEnquiry = async (lead) => {
    try {
      await leadApi.convertToEnquiry(lead._id, {
        items: [
          {
            product: lead.product?._id || lead.product || undefined,
            quantity: lead.quantity || 1,
            targetPrice: lead.expectedValue || 1000000,
            specifications: lead.requirement || ''
          }
        ]
      });
      showToast(`Lead ${lead.leadNumber} converted to formal Enquiry`, 'success');
      fetchLeads();
    } catch (err) {
      showToast(err.message || 'Error converting to enquiry', 'error');
    }
  };

  const handleAddFollowUp = async (e) => {
    e.preventDefault();
    try {
      await leadApi.addFollowUp(followUpModal._id, followUpForm);
      showToast('Follow-up activity recorded', 'success');
      setFollowUpModal(null);
      setFollowUpForm({ type: 'CALL', discussion: '', customerResponse: 'INTERESTED', nextFollowUpDate: '' });
      fetchLeads();
    } catch (err) {
      showToast(err.message || 'Error adding follow-up', 'error');
    }
  };

  const handleMarkLost = async (e) => {
    e.preventDefault();
    try {
      await leadApi.markLeadLost(lostModal._id, lostReason);
      showToast(`Lead ${lostModal.leadNumber} marked lost`, 'info');
      setLostModal(null);
      setLostReason('');
      fetchLeads();
    } catch (err) {
      showToast(err.message || 'Error marking lost', 'error');
    }
  };

  const columns = [
    {
      title: 'Lead ID',
      key: 'leadNumber',
      render: (val) => <span className="telemetry-code">{val}</span>
    },
    {
      title: 'Customer / Institution',
      key: 'customerName',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{val}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {row.contactPerson} • {row.phone}
          </div>
        </div>
      )
    },
    {
      title: 'Equipment Requirement',
      key: 'requirement',
      render: (val) => (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {val ? (val.length > 50 ? `${val.substring(0, 50)}...` : val) : 'Standard Cold Storage'}
        </span>
      )
    },
    {
      title: 'Source',
      key: 'source',
      render: (val) => <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{val}</span>
    },
    {
      title: 'Est. Value',
      key: 'expectedValue',
      render: (val) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
          ₹{(val || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />
    },
    {
      title: 'Workflow Actions',
      key: '_id',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {row.status === 'NEW' && (
            <button
              className="btn btn-sm btn-primary"
              onClick={() => handleQualify(row)}
            >
              Qualify
            </button>
          )}

          {row.status === 'QUALIFIED' && (
            <button
              className="btn btn-sm btn-success"
              onClick={() => handleConvertToEnquiry(row)}
            >
              Convert to Enquiry →
            </button>
          )}

          {row.status !== 'CONVERTED' && row.status !== 'LOST' && (
            <>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => setFollowUpModal(row)}
              >
                Follow Up
              </button>
              <button
                className="btn btn-sm btn-outline"
                style={{ color: 'var(--color-danger)' }}
                onClick={() => setLostModal(row)}
              >
                Lost
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <DoubleBezelCard
        title="Commercial Sales Leads & Enquiries"
        subtitle="Inward inquiry qualification and customer onboarding funnel"
        action={
          <button className="btn btn-primary" onClick={() => setCreateModal(true)}>
            <span>➕</span> Capture New Lead
          </button>
        }
      >
        <DataTable
          columns={columns}
          data={leads}
          loading={loading}
          pagination={meta}
          onPageChange={setPage}
          searchQuery={search}
          onSearchChange={setSearch}
          filterComponent={
            <select
              className="select-control"
              style={{ width: '160px' }}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="CONTACTED">Contacted</option>
              <option value="FOLLOW_UP">Follow Up</option>
              <option value="CONVERTED">Converted</option>
              <option value="LOST">Lost</option>
            </select>
          }
        />
      </DoubleBezelCard>

      {/* Capture Lead Modal */}
      <Modal
        isOpen={createModal}
        onClose={() => setCreateModal(false)}
        title="Inward New Sales Lead"
      >
        <form onSubmit={handleCreateLead}>
          <div className="form-group">
            <label>Customer / Hospital / Lab Name</label>
            <input
              type="text"
              className="input-control"
              required
              value={createForm.customerName}
              onChange={(e) => setCreateForm({ ...createForm, customerName: e.target.value })}
              placeholder="e.g. Apollo Hospitals Bio-Repository"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>Contact Person</label>
              <input
                type="text"
                className="input-control"
                required
                value={createForm.contactPerson}
                onChange={(e) => setCreateForm({ ...createForm, contactPerson: e.target.value })}
                placeholder="Dr. R. Sharma"
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                className="input-control"
                required
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                placeholder="+91 9840011223"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="input-control"
                required
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="procurement@apollo.org"
              />
            </div>
            <div className="form-group">
              <label>Lead Source</label>
              <select
                className="select-control"
                value={createForm.source}
                onChange={(e) => setCreateForm({ ...createForm, source: e.target.value })}
              >
                <option value="WEBSITE">Direct Website</option>
                <option value="INDIAMART">IndiaMART Portal</option>
                <option value="PHONE">Direct Phone Call</option>
                <option value="EXHIBITION">Medical Exhibition</option>
                <option value="REFERRAL">Client Referral</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Specific Requirement / Chamber Specs</label>
            <textarea
              className="textarea-control"
              rows={3}
              required
              value={createForm.requirement}
              onChange={(e) => setCreateForm({ ...createForm, requirement: e.target.value })}
              placeholder="e.g., Two units of -80°C Ultra-Low Freezers 500L capacity with dual cascade refrigeration"
            />
          </div>

          <div className="form-group">
            <label>Estimated Value (₹ INR)</label>
            <input
              type="number"
              className="input-control"
              value={createForm.expectedValue}
              onChange={(e) => setCreateForm({ ...createForm, expectedValue: Number(e.target.value) })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setCreateModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save & Register Lead
            </button>
          </div>
        </form>
      </Modal>

      {/* Follow-up Activity Modal */}
      <Modal
        isOpen={!!followUpModal}
        onClose={() => setFollowUpModal(null)}
        title={`Log Follow-up: ${followUpModal?.customerName}`}
      >
        <form onSubmit={handleAddFollowUp}>
          <div className="form-group">
            <label>Interaction Type</label>
            <select
              className="select-control"
              value={followUpForm.type}
              onChange={(e) => setFollowUpForm({ ...followUpForm, type: e.target.value })}
            >
              <option value="CALL">Phone Call</option>
              <option value="MEETING">On-Site Meeting</option>
              <option value="EMAIL">Email Discussion</option>
              <option value="WHATSAPP">WhatsApp</option>
            </select>
          </div>

          <div className="form-group">
            <label>Customer Feedback / Discussion Summary</label>
            <textarea
              className="textarea-control"
              rows={3}
              required
              value={followUpForm.discussion}
              onChange={(e) => setFollowUpForm({ ...followUpForm, discussion: e.target.value })}
              placeholder="Client requested formal commercial quote with IQ/OQ validation..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>Customer Response</label>
              <select
                className="select-control"
                value={followUpForm.customerResponse}
                onChange={(e) => setFollowUpForm({ ...followUpForm, customerResponse: e.target.value })}
              >
                <option value="HIGHLY_INTERESTED">Highly Interested</option>
                <option value="INTERESTED">Interested</option>
                <option value="NEUTRAL">Neutral</option>
                <option value="PRICE_CONCERN">Price Concern</option>
              </select>
            </div>
            <div className="form-group">
              <label>Next Follow-up Date</label>
              <input
                type="date"
                className="input-control"
                value={followUpForm.nextFollowUpDate}
                onChange={(e) => setFollowUpForm({ ...followUpForm, nextFollowUpDate: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setFollowUpModal(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Log Follow-up
            </button>
          </div>
        </form>
      </Modal>

      {/* Mark Lost Modal */}
      <Modal
        isOpen={!!lostModal}
        onClose={() => setLostModal(null)}
        title={`Mark Lead Lost: ${lostModal?.leadNumber}`}
      >
        <form onSubmit={handleMarkLost}>
          <div className="form-group">
            <label>Reason for Loss</label>
            <textarea
              className="textarea-control"
              rows={3}
              required
              value={lostReason}
              onChange={(e) => setLostReason(e.target.value)}
              placeholder="e.g. Competitor undercut price or budget postponed..."
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setLostModal(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-danger">
              Confirm Mark Lost
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LeadsPage;
