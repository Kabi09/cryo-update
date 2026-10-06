import React, { useState, useEffect, useCallback } from 'react';
import { bomApi } from '../../services/api/productionApi';
import { masterDataApi } from '../../services/api/masterDataApi';
import { useNotification } from '../../contexts/NotificationContext';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import DoubleBezelCard from '../../components/common/DoubleBezelCard';

export const BOMPage = () => {
  const [boms, setBoms] = useState([]);
  const [products, setProducts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [detailModal, setDetailModal] = useState(null);

  const { showToast } = useNotification();

  const fetchBOMs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bomApi.getBOMs({ search });
      setBoms(res.data);
    } catch {
      showToast('Could not fetch BOMs', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, showToast]);

  useEffect(() => {
    fetchBOMs();
    masterDataApi.getProducts({ limit: 50 }).then((res) => setProducts(res.data || [])).catch(() => {});
    masterDataApi.getMaterials({ limit: 50 }).then((res) => setMaterials(res.data || [])).catch(() => {});
  }, [fetchBOMs]);

  const columns = [
    {
      title: 'BOM Version Code',
      key: 'versionCode',
      render: (val) => <span className="telemetry-code">{val}</span>
    },
    {
      title: 'Target Product Model',
      key: 'product',
      render: (val) => (
        <div>
          <strong style={{ color: '#ffffff' }}>{val?.name || 'Ultra-Low Freezer'}</strong>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{val?.modelNumber}</div>
        </div>
      )
    },
    {
      title: 'Version No',
      key: 'version',
      render: (val) => <span style={{ fontFamily: 'var(--font-mono)' }}>v{val}.0</span>
    },
    {
      title: 'Components Count',
      key: 'components',
      render: (components) => (
        <span style={{ fontSize: '0.85rem' }}>{components?.length || 0} Materials</span>
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
        <button className="btn btn-sm btn-outline" onClick={() => setDetailModal(row)}>
          Inspect Components →
        </button>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <DoubleBezelCard
        title="Bills of Materials (BOM) Architecture"
        subtitle="Standard engineering structures for refrigeration components, compressors, copper piping, and PUF insulation"
      >
        <DataTable
          columns={columns}
          data={boms}
          loading={loading}
          searchQuery={search}
          onSearchChange={setSearch}
        />
      </DoubleBezelCard>

      {/* Inspect BOM Components Modal */}
      <Modal
        isOpen={!!detailModal}
        onClose={() => setDetailModal(null)}
        title={`BOM Components: ${detailModal?.versionCode}`}
        size="lg"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Product: </span>
              <strong>{detailModal?.product?.name}</strong>
            </div>
            <StatusBadge status={detailModal?.status} />
          </div>

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
                  <th style={{ padding: '8px 12px', textAlign: 'left' }}>Component Material Name</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>Quantity</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>Unit (UOM)</th>
                </tr>
              </thead>
              <tbody>
                {(detailModal?.components || []).map((comp, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '8px 12px' }}>{comp.materialName || comp.material?.name}</td>
                    <td style={{ padding: '8px 12px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                      {comp.quantity}
                    </td>
                    <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                      <span className="telemetry-code" style={{ fontSize: '0.75rem' }}>{comp.unitOfMeasure}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BOMPage;
