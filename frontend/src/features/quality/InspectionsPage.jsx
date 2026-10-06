import React, { useState, useEffect, useCallback } from 'react';
import { qaApi } from '../../services/api/qaApi';
import { useNotification } from '../../contexts/NotificationContext';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import DoubleBezelCard from '../../components/common/DoubleBezelCard';
import PullDownChart from '../../components/common/PullDownChart';

export const InspectionsPage = () => {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInspection, setSelectedInspection] = useState(null);

  // Pass Modal
  const [passModal, setPassModal] = useState(null);
  const [failModal, setFailModal] = useState(null);

  const [passForm, setPassForm] = useState({
    pullDownTimeHours: 24,
    achievedTemperature: -80.4,
    remarks: 'Full 24-hour stabilization hold verified within ±0.5°C'
  });

  const [failReason, setFailReason] = useState('Refrigeration cascade pressure leak detected');

  const { showToast } = useNotification();

  const fetchInspections = useCallback(async () => {
    setLoading(true);
    try {
      const res = await qaApi.getInspections();
      setInspections(res.data);
      if (res.data?.length > 0 && !selectedInspection) {
        setSelectedInspection(res.data[0]);
      }
    } catch {
      showToast('Could not fetch inspections', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedInspection, showToast]);

  useEffect(() => {
    fetchInspections();
  }, [fetchInspections]);

  const handlePass = async (e) => {
    e.preventDefault();
    try {
      const res = await qaApi.passInspection(passModal._id, passForm);
      showToast(
        `Inspection PASSED! Unit serialized with permanent barcode: ${res.data.serialNumber?.serialNumber}`,
        'success'
      );
      setPassModal(null);
      fetchInspections();
    } catch (err) {
      showToast(err.message || 'Error passing inspection', 'error');
    }
  };

  const handleFail = async (e) => {
    e.preventDefault();
    try {
      await qaApi.failInspection(failModal._id, { defectReason: failReason });
      showToast('Inspection marked FAILED. Defect report routed for rework.', 'warning');
      setFailModal(null);
      fetchInspections();
    } catch (err) {
      showToast(err.message || 'Error recording failure', 'error');
    }
  };

  const columns = [
    {
      title: 'Inspection ID',
      key: 'inspectionNumber',
      render: (val) => <span className="telemetry-code">{val}</span>
    },
    {
      title: 'Product / Model',
      key: 'product',
      render: (p) => (
        <div>
          <strong style={{ color: '#ffffff' }}>{p?.name}</strong>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p?.modelNumber}</div>
        </div>
      )
    },
    {
      title: 'Target Setpoint',
      key: 'targetTemperature',
      render: (val) => (
        <span className="temperature-gauge" style={{ fontSize: '0.9rem' }}>
          {val || -80}°C
        </span>
      )
    },
    {
      title: 'Serial Number',
      key: 'issuedSerialNumber',
      render: (sn) => (
        sn ? <span className="telemetry-code" style={{ color: '#10b981' }}>{sn.serialNumber || sn}</span> : 'Pending Certification'
      )
    },
    {
      title: 'Result',
      key: 'result',
      render: (res) => <StatusBadge status={res} />
    },
    {
      title: 'Actions',
      key: '_id',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            className="btn btn-sm btn-outline"
            onClick={() => setSelectedInspection(row)}
          >
            Telemetry Chart
          </button>

          {row.result === 'PENDING' && (
            <>
              <button className="btn btn-sm btn-success" onClick={() => setPassModal(row)}>
                Pass & Issue Serial ✓
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => setFailModal(row)}
              >
                Fail
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Selected Inspection Pull-down Telemetry Curve */}
      {selectedInspection && (
        <DoubleBezelCard
          title={`Low-Temperature Pull-down Telemetry: ${selectedInspection.inspectionNumber}`}
          subtitle={`Continuous sensor logging for unit ${selectedInspection.product?.modelNumber || 'CRYO-500L'}`}
        >
          <PullDownChart
            targetTemp={selectedInspection.targetTemperature || -80}
            currentTemp={selectedInspection.achievedTemperature || -80.4}
            durationHours={selectedInspection.pullDownTimeHours || 24}
            testStatus={selectedInspection.result}
            testId={selectedInspection.inspectionNumber}
          />
        </DoubleBezelCard>
      )}

      {/* Inspections Table */}
      <DoubleBezelCard
        title="Quality Assurance Inspections & Serialization"
        subtitle="Verification of refrigeration pull-down curves, thermal hold, and permanent serial number issuance"
      >
        <DataTable columns={columns} data={inspections} loading={loading} />
      </DoubleBezelCard>

      {/* Pass Inspection Modal */}
      <Modal
        isOpen={!!passModal}
        onClose={() => setPassModal(null)}
        title={`Pass Unit & Issue Serial Number: ${passModal?.inspectionNumber}`}
      >
        <form onSubmit={handlePass}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>Continuous Pull-down Duration (Hours)</label>
              <input
                type="number"
                className="input-control"
                required
                value={passForm.pullDownTimeHours}
                onChange={(e) => setPassForm({ ...passForm, pullDownTimeHours: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label>Stabilized Chamber Temperature (°C)</label>
              <input
                type="number"
                step="0.1"
                className="input-control"
                required
                value={passForm.achievedTemperature}
                onChange={(e) => setPassForm({ ...passForm, achievedTemperature: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>QA Calibration & Testing Certificate Remarks</label>
            <textarea
              className="textarea-control"
              rows={3}
              required
              value={passForm.remarks}
              onChange={(e) => setPassForm({ ...passForm, remarks: e.target.value })}
            />
          </div>

          <div
            style={{
              padding: '12px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid var(--color-success-border)',
              borderRadius: '8px',
              fontSize: '0.8rem',
              color: 'var(--color-success)'
            }}
          >
            Passing this inspection certifies the unit for clinical/medical deployment and automatically generates a unique physical Serial Number (e.g. CRYO-SN-000001).
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setPassModal(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-success">
              Authorize Pass & Serial Number
            </button>
          </div>
        </form>
      </Modal>

      {/* Fail Inspection Modal */}
      <Modal
        isOpen={!!failModal}
        onClose={() => setFailModal(null)}
        title={`Fail QA Inspection: ${failModal?.inspectionNumber}`}
      >
        <form onSubmit={handleFail}>
          <div className="form-group">
            <label>Defect Non-Conformance Report</label>
            <textarea
              className="textarea-control"
              rows={3}
              required
              value={failReason}
              onChange={(e) => setFailReason(e.target.value)}
              placeholder="e.g. Pull-down exceeded maximum time allowance..."
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setFailModal(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-danger">
              Confirm Non-Conformance
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InspectionsPage;
