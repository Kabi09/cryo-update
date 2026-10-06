import React, { useState, useEffect, useCallback } from 'react';
import { procurementApi } from '../../services/api/procurementApi';
import { masterDataApi } from '../../services/api/masterDataApi';
import { useNotification } from '../../contexts/NotificationContext';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import DoubleBezelCard from '../../components/common/DoubleBezelCard';

export const ProcurementPage = () => {
  const [activeTab, setActiveTab] = useState('PO'); // 'PR', 'RFQ', 'PO', 'GRN'
  const [data, setData] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createPOModal, setCreatePOModal] = useState(false);
  const [createGRNModal, setCreateGRNModal] = useState(false);

  const [poForm, setPOForm] = useState({
    vendor: '',
    items: [{ material: '', materialName: 'Danfoss SC18G Compressor', quantity: 4, unitPrice: 45000, taxPercent: 18 }]
  });

  const [grnForm, setGRNForm] = useState({
    vendorPo: '',
    vendorDeliveryChallanNumber: 'DC/2026/0991',
    items: [{ material: '', receivedQuantity: 4, acceptedQuantity: 4, rejectedQuantity: 0, remarks: 'Verified intact' }]
  });

  const { showToast } = useNotification();

  const fetchProcurement = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'PO') {
        const res = await procurementApi.getVendorPOs();
        setData(res.data);
      } else if (activeTab === 'PR') {
        const res = await procurementApi.getPurchaseRequests();
        setData(res.data);
      } else if (activeTab === 'RFQ') {
        const res = await procurementApi.getRFQs();
        setData(res.data);
      } else {
        const res = await procurementApi.getGRNs();
        setData(res.data);
      }
    } catch {
      showToast('Could not load procurement records', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, showToast]);

  useEffect(() => {
    fetchProcurement();
    masterDataApi.getVendors({ limit: 50 }).then((res) => setVendors(res.data || [])).catch(() => {});
    masterDataApi.getMaterials({ limit: 50 }).then((res) => setMaterials(res.data || [])).catch(() => {});
  }, [fetchProcurement]);

  const handleCreatePO = async (e) => {
    e.preventDefault();
    try {
      const res = await procurementApi.createVendorPO(poForm);
      showToast(`Vendor Purchase Order ${res.data.poNumber} issued!`, 'success');
      setCreatePOModal(false);
      fetchProcurement();
    } catch (err) {
      showToast(err.message || 'Error creating Vendor PO', 'error');
    }
  };

  const handleCreateGRN = async (e) => {
    e.preventDefault();
    try {
      const res = await procurementApi.createGRN(grnForm);
      showToast(`GRN ${res.data.grnNumber} posted! Material inwarded into warehouse inventory.`, 'success');
      setCreateGRNModal(false);
      fetchProcurement();
    } catch (err) {
      showToast(err.message || 'Error posting GRN', 'error');
    }
  };

  const poColumns = [
    {
      title: 'Vendor PO Number',
      key: 'poNumber',
      render: (val) => <span className="telemetry-code">{val}</span>
    },
    {
      title: 'Supplier / Vendor',
      key: 'vendor',
      render: (v) => <strong style={{ color: '#ffffff' }}>{v?.companyName || 'Approved Supplier'}</strong>
    },
    {
      title: 'Items',
      key: 'items',
      render: (items) => <span>{items?.length || 1} material items</span>
    },
    {
      title: 'Total Amount (₹)',
      key: 'grandTotal',
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
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Tabs & Action Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn ${activeTab === 'PO' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('PO')}
          >
            📤 Vendor Purchase Orders
          </button>
          <button
            className={`btn ${activeTab === 'GRN' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('GRN')}
          >
            📥 Goods Receipt Notes (GRN)
          </button>
          <button
            className={`btn ${activeTab === 'PR' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('PR')}
          >
            📝 Purchase Requisitions
          </button>
          <button
            className={`btn ${activeTab === 'RFQ' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('RFQ')}
          >
            💬 RFQs & Supplier Bids
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {activeTab === 'PO' && (
            <button className="btn btn-primary" onClick={() => setCreatePOModal(true)}>
              <span>➕</span> Issue Vendor PO
            </button>
          )}
          {activeTab === 'GRN' && (
            <button className="btn btn-primary" onClick={() => setCreateGRNModal(true)}>
              <span>📥</span> Inward Material Consignment (GRN)
            </button>
          )}
        </div>
      </div>

      <DoubleBezelCard
        title={
          activeTab === 'PO'
            ? 'Vendor Purchase Orders & Procurement Contracts'
            : activeTab === 'GRN'
            ? 'Goods Receipt Notes (GRN) & Physical Warehouse Inwards'
            : activeTab === 'PR'
            ? 'Internal Purchase Requisitions'
            : 'Requests for Quotation (RFQ) & Commercial Bidding'
        }
        subtitle="Sourcing precision refrigeration parts, compressors, RTD sensors, and chemicals"
      >
        <DataTable columns={poColumns} data={data} loading={loading} />
      </DoubleBezelCard>

      {/* Issue Vendor PO Modal */}
      <Modal
        isOpen={createPOModal}
        onClose={() => setCreatePOModal(false)}
        title="Issue Purchase Order to Supplier"
        size="lg"
      >
        <form onSubmit={handleCreatePO}>
          <div className="form-group">
            <label>Select Approved Vendor</label>
            <select
              className="select-control"
              required
              value={poForm.vendor}
              onChange={(e) => setPOForm({ ...poForm, vendor: e.target.value })}
            >
              <option value="">Choose Supplier</option>
              {vendors.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.companyName} ({v.vendorId || v.contactPerson})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px' }}>
            <div className="form-group">
              <label>Raw Material Part</label>
              <select
                className="select-control"
                required
                value={poForm.items[0].material}
                onChange={(e) => {
                  const mId = e.target.value;
                  const m = materials.find((x) => x._id === mId);
                  const items = [...poForm.items];
                  items[0].material = mId;
                  items[0].materialName = m?.name || 'Raw Material';
                  setPOForm({ ...poForm, items });
                }}
              >
                <option value="">Select Material</option>
                {materials.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.materialCode} — {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                className="input-control"
                required
                value={poForm.items[0].quantity}
                onChange={(e) => {
                  const items = [...poForm.items];
                  items[0].quantity = Number(e.target.value);
                  setPOForm({ ...poForm, items });
                }}
              />
            </div>
            <div className="form-group">
              <label>Rate / Unit (₹)</label>
              <input
                type="number"
                className="input-control"
                required
                value={poForm.items[0].unitPrice}
                onChange={(e) => {
                  const items = [...poForm.items];
                  items[0].unitPrice = Number(e.target.value);
                  setPOForm({ ...poForm, items });
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setCreatePOModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Issue Vendor PO
            </button>
          </div>
        </form>
      </Modal>

      {/* Inward GRN Modal */}
      <Modal
        isOpen={createGRNModal}
        onClose={() => setCreateGRNModal(false)}
        title="Inward Goods Receipt Note (GRN)"
      >
        <form onSubmit={handleCreateGRN}>
          <div className="form-group">
            <label>Vendor Delivery Challan / Invoice No</label>
            <input
              type="text"
              className="input-control"
              required
              value={grnForm.vendorDeliveryChallanNumber}
              onChange={(e) => setGRNForm({ ...grnForm, vendorDeliveryChallanNumber: e.target.value })}
              placeholder="e.g. DANFOSS/DC/9981"
            />
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Completing the GRN automatically verifies materials against the Vendor PO and increments real-time warehouse inventory in the Stock Ledger.
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setCreateGRNModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm Consignment Inward
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProcurementPage;
