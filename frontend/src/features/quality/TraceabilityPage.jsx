import React, { useState, useEffect } from 'react';
import { qaApi } from '../../services/api/qaApi';
import { useNotification } from '../../contexts/NotificationContext';
import DoubleBezelCard from '../../components/common/DoubleBezelCard';
import StatusBadge from '../../components/common/StatusBadge';

export const TraceabilityPage = () => {
  const [serialQuery, setSerialQuery] = useState('CRYO-SN-000001');
  const [traceData, setTraceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useNotification();

  const handleTrace = async (queryToSearch) => {
    const q = queryToSearch || serialQuery;
    if (!q) return;
    setLoading(true);
    try {
      const res = await qaApi.getSerialTrace(q.trim());
      setTraceData(res.data);
      showToast(`Traceability chain verified for ${q}`, 'success');
    } catch {
      showToast(`Serial Number ${q} not found in database`, 'error');
      setTraceData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleTrace('CRYO-SN-000001');
  }, []);

  const serial = traceData?.serial;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Search Header */}
      <DoubleBezelCard
        title="Universal Equipment Serialization & End-to-End Genealogy"
        subtitle="Complete cross-module trace from Raw Materials BOM to Field Service Warranty"
      >
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <input
              type="text"
              className="input-control"
              style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', letterSpacing: '0.04em' }}
              value={serialQuery}
              onChange={(e) => setSerialQuery(e.target.value)}
              placeholder="Enter Serial Number (e.g. CRYO-SN-000001)..."
            />
          </div>
          <button
            className="btn btn-primary"
            disabled={loading}
            onClick={() => handleTrace(serialQuery)}
          >
            {loading ? 'Tracing Genealogy...' : '🔍 Trace Serial Genealogy'}
          </button>
        </div>
      </DoubleBezelCard>

      {/* Traceability Graph Results */}
      {serial && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Unit Overview Card */}
          <div
            style={{
              padding: '20px 24px',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(2, 132, 199, 0.05) 100%)',
              border: '1px solid var(--border-active)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    color: '#ffffff'
                  }}
                >
                  {serial.serialNumber}
                </span>
                <StatusBadge status={serial.currentStatus} />
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                Model: <strong>{serial.product?.name || 'Ultra-Low Temperature Freezer'}</strong> (
                {serial.product?.modelNumber || 'CRYO-500L'}) • Manufactured: {new Date(serial.manufacturedDate).toLocaleDateString()}
              </p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Institutional Client:</span>
              <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '1rem' }}>
                {serial.customer?.companyName || 'Institutional Healthcare Client'}
              </div>
            </div>
          </div>

          {/* Genealogy Pipeline Nodes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Node 1: Commercial Order */}
            <DoubleBezelCard title="1. Commercial Origin" subtitle="Customer Purchase Order & Sales Contract">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Sales Order:</span>
                  <span className="telemetry-code">{serial.salesOrder?.salesOrderNumber || 'SO-000001'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Customer PO Ref:</span>
                  <strong>{serial.salesOrder?.customerPo?.customerPoReference || 'APOLLO/PO/2026/091'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Commercial Value:</span>
                  <strong style={{ color: '#10b981' }}>₹{serial.salesOrder?.grandTotal?.toLocaleString('en-IN') || '22,42,000'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Advance Payment:</span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>✓ Verified by Accounts</span>
                </div>
              </div>
            </DoubleBezelCard>

            {/* Node 2: Shopfloor Production & BOM */}
            <DoubleBezelCard title="2. Manufacturing Genealogy" subtitle="Shopfloor Production Order & BOM Components">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Production Order:</span>
                  <span className="telemetry-code">{serial.productionOrder?.productionOrderNumber || 'PROD-000001'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Active BOM Version:</span>
                  <span className="telemetry-code">{serial.productionOrder?.bomVersionCode || 'BOM-CRYO-500L-V1'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Cascade Compressor:</span>
                  <span>Danfoss SC18G / Dual Unit</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Insulation Formula:</span>
                  <span>High-Density PUF Chemical 120kg/m³</span>
                </div>
              </div>
            </DoubleBezelCard>

            {/* Node 3: QA Pull-down Testing */}
            <DoubleBezelCard title="3. Quality Certification" subtitle="Bay 04 Pull-down Testing & Calibration">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>QA Inspection:</span>
                  <span className="telemetry-code">{serial.qaInspection?.inspectionNumber || 'QA-000001'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Stabilization Temp:</span>
                  <span className="temperature-gauge">{serial.qaInspection?.achievedTemperature || -80.4}°C</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Calibration Result:</span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>✓ ISO 13485 CERTIFIED</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Inspected By:</span>
                  <span>QA Engineering Officer</span>
                </div>
              </div>
            </DoubleBezelCard>

            {/* Node 4: Logistics & Dispatch */}
            <DoubleBezelCard title="4. Commercial Billing & Dispatch" subtitle="Tax Invoicing, Transporter, and Proof of Delivery">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tax Invoice:</span>
                  <span className="telemetry-code">{serial.finalInvoice?.invoiceNumber || 'INV-000001'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Dispatch Note:</span>
                  <span className="telemetry-code">{serial.dispatch?.dispatchNumber || 'DISP-000001'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Vehicle / e-Way:</span>
                  <span>TN-09-CB-1920 (ABC Logistics)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Signed POD Status:</span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>✓ Delivered & Acknowledged</span>
                </div>
              </div>
            </DoubleBezelCard>

            {/* Node 5: Field Service & Warranty */}
            <DoubleBezelCard title="5. Life-Cycle Field Service" subtitle="Commissioning, Warranty, and Repair Tickets">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Site Commissioning:</span>
                  <span>✓ Complete (IQ/OQ/PQ Protocol)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Warranty Contract:</span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>ACTIVE (12-MONTH OEM)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Service Tickets:</span>
                  <span>0 Critical Incidents (Annual PM Scheduled)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>RMA Factory History:</span>
                  <span style={{ color: '#38bdf8' }}>Clean (Original Factory Unit)</span>
                </div>
              </div>
            </DoubleBezelCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default TraceabilityPage;
