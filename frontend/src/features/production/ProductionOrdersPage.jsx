import React, { useState, useEffect, useCallback } from 'react';
import { productionApi } from '../../services/api/productionApi';
import { useNotification } from '../../contexts/NotificationContext';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import DoubleBezelCard from '../../components/common/DoubleBezelCard';

const STAGES = ['PLANNED', 'FABRICATION', 'REFRIGERATION', 'ELECTRICAL', 'ASSEMBLY', 'COMPLETED'];

export const ProductionOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState(null);

  // Modals
  const [advanceModal, setAdvanceModal] = useState(null);
  const [materialModal, setMaterialModal] = useState(null);
  const [nextStage, setNextStage] = useState('REFRIGERATION');

  const { showToast } = useNotification();

  const fetchProductionOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productionApi.getProductionOrders({ search, page, limit: 10 });
      setOrders(res.data);
      setMeta(res.meta);
    } catch {
      showToast('Could not fetch production orders', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, page, showToast]);

  useEffect(() => {
    fetchProductionOrders();
  }, [fetchProductionOrders]);

  const handleAdvanceStage = async (e) => {
    e.preventDefault();
    try {
      const res = await productionApi.advanceStage(advanceModal._id, { nextStage });
      showToast(
        `Production Order advanced to ${nextStage}. ${
          nextStage === 'COMPLETED' ? 'Routed automatically to QA Pull-down Testing Bay!' : ''
        }`,
        'success'
      );
      setAdvanceModal(null);
      fetchProductionOrders();
    } catch (err) {
      showToast(err.message || 'Error advancing stage', 'error');
    }
  };

  const handleRequestMaterials = async (order) => {
    try {
      const res = await productionApi.requestMaterials(order._id);
      showToast(`Material Requisition ${res.data.materialRequestNumber} issued to Store!`, 'success');
      fetchProductionOrders();
    } catch (err) {
      showToast(err.message || 'Error requesting materials', 'error');
    }
  };

  const columns = [
    {
      title: 'Production Order',
      key: 'productionOrderNumber',
      render: (val) => <span className="telemetry-code">{val}</span>
    },
    {
      title: 'Product / Model',
      key: 'product',
      render: (val) => (
        <div>
          <strong style={{ color: '#ffffff' }}>{val?.name || 'Ultra-Low Freezer'}</strong>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{val?.modelNumber || 'CRYO-500L'}</div>
        </div>
      )
    },
    {
      title: 'Active BOM',
      key: 'bomVersionCode',
      render: (val) => <span className="telemetry-code">{val || 'BOM-CRYO-V1'}</span>
    },
    {
      title: 'Current Stage',
      key: 'currentStage',
      render: (val) => {
        const stageColors = {
          FABRICATION: '#f59e0b',
          REFRIGERATION: '#06b6d4',
          ELECTRICAL: '#38bdf8',
          ASSEMBLY: '#818cf8',
          COMPLETED: '#10b981'
        };
        return (
          <span
            style={{
              padding: '3px 10px',
              borderRadius: '4px',
              fontSize: '0.775rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: stageColors[val] || '#94a3b8',
              border: `1px solid ${stageColors[val] || '#94a3b8'}40`
            }}
          >
            {val || 'PLANNED'}
          </span>
        );
      }
    },
    {
      title: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />
    },
    {
      title: 'Shopfloor Actions',
      key: '_id',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '6px' }}>
          {row.status !== 'COMPLETED' && (
            <>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => {
                  setAdvanceModal(row);
                  const currentIdx = STAGES.indexOf(row.currentStage);
                  const nextIdx = currentIdx < STAGES.length - 1 ? currentIdx + 1 : currentIdx;
                  setNextStage(STAGES[nextIdx]);
                }}
              >
                Advance Stage →
              </button>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => handleRequestMaterials(row)}
              >
                Requisition BOM
              </button>
            </>
          )}

          {row.status === 'COMPLETED' && (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', fontWeight: 600 }}>
              ✓ QA TEST READY
            </span>
          )}
        </div>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <DoubleBezelCard
        title="Manufacturing & Shopfloor Stage Progression"
        subtitle="Tracking physical fabrication, refrigeration brazing, electrical wiring, and assembly milestones"
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

      {/* Advance Stage Modal */}
      <Modal
        isOpen={!!advanceModal}
        onClose={() => setAdvanceModal(null)}
        title={`Advance Stage: ${advanceModal?.productionOrderNumber}`}
      >
        <form onSubmit={handleAdvanceStage}>
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current Work Center Stage: </span>
            <span className="telemetry-code" style={{ fontSize: '0.9rem' }}>
              {advanceModal?.currentStage || 'PLANNED'}
            </span>
          </div>

          <div className="form-group">
            <label>Select Next Target Manufacturing Stage</label>
            <select
              className="select-control"
              value={nextStage}
              onChange={(e) => setNextStage(e.target.value)}
            >
              <option value="FABRICATION">1. FABRICATION (Cabinet sheet metal, CNC bend, PUF injection)</option>
              <option value="REFRIGERATION">2. REFRIGERATION (Cascade compressor, copper lines, vacuum pull)</option>
              <option value="ELECTRICAL">3. ELECTRICAL (Microcontroller PCB, PT100 RTD sensor harness)</option>
              <option value="ASSEMBLY">4. ASSEMBLY (Door thermal gasket, heated ports, outer paneling)</option>
              <option value="COMPLETED">5. COMPLETED (Transmit to Low-Temp QA Testing Bay)</option>
            </select>
          </div>

          <div
            style={{
              padding: '12px',
              background: 'rgba(6, 182, 212, 0.08)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)'
            }}
          >
            Selecting <strong>COMPLETED</strong> automatically generates an inspection order in the Quality Assurance module with target -80°C pull-down verification!
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setAdvanceModal(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Confirm Stage Handover
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductionOrdersPage;
