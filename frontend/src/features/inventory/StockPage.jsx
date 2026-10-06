import React, { useState, useEffect, useCallback } from 'react';
import { inventoryApi } from '../../services/api/inventoryApi';
import { masterDataApi } from '../../services/api/masterDataApi';
import { useNotification } from '../../contexts/NotificationContext';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import DoubleBezelCard from '../../components/common/DoubleBezelCard';

export const StockPage = () => {
  const [activeTab, setActiveTab] = useState('STOCK'); // 'STOCK' or 'LEDGER'
  const [stocks, setStocks] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [transferModal, setTransferModal] = useState(false);
  const [adjustModal, setAdjustModal] = useState(false);

  const [transferForm, setTransferForm] = useState({
    fromWarehouseId: '',
    toWarehouseId: '',
    materialId: '',
    quantity: 1,
    remarks: 'Routine factory stock balancing'
  });

  const [adjustForm, setAdjustForm] = useState({
    warehouseId: '',
    materialId: '',
    actualPhysicalQuantity: 10,
    reason: 'Monthly cycle physical audit count'
  });

  const { showToast } = useNotification();

  const fetchStockData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'STOCK') {
        const res = await inventoryApi.getStock();
        setStocks(res.data);
      } else {
        const res = await inventoryApi.getStockLedger({ limit: 30 });
        setLedger(res.data);
      }
    } catch {
      showToast('Could not fetch inventory records', 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, showToast]);

  useEffect(() => {
    fetchStockData();
    masterDataApi.getWarehouses({ limit: 20 }).then((res) => {
      setWarehouses(res.data || []);
      if (res.data?.length >= 2) {
        setTransferForm((f) => ({
          ...f,
          fromWarehouseId: res.data[0]._id,
          toWarehouseId: res.data[1]._id
        }));
        setAdjustForm((f) => ({ ...f, warehouseId: res.data[0]._id }));
      }
    }).catch(() => {});

    masterDataApi.getMaterials({ limit: 50 }).then((res) => {
      setMaterials(res.data || []);
      if (res.data?.length > 0) {
        setTransferForm((f) => ({ ...f, materialId: res.data[0]._id }));
        setAdjustForm((f) => ({ ...f, materialId: res.data[0]._id }));
      }
    }).catch(() => {});
  }, [fetchStockData]);

  const handleTransfer = async (e) => {
    e.preventDefault();
    try {
      await inventoryApi.transferStock(transferForm);
      showToast('Inter-warehouse stock transfer posted to ledger successfully!', 'success');
      setTransferModal(false);
      fetchStockData();
    } catch (err) {
      showToast(err.message || 'Error transferring stock', 'error');
    }
  };

  const handleAdjust = async (e) => {
    e.preventDefault();
    try {
      await inventoryApi.adjustStock(adjustForm);
      showToast('Physical count variance adjusted and audited!', 'success');
      setAdjustModal(false);
      fetchStockData();
    } catch (err) {
      showToast(err.message || 'Error adjusting stock', 'error');
    }
  };

  const stockColumns = [
    {
      title: 'Material Code',
      key: 'material',
      render: (m) => <span className="telemetry-code">{m?.materialCode || 'MAT'}</span>
    },
    {
      title: 'Material Name',
      key: 'material',
      render: (m) => (
        <div>
          <strong style={{ color: '#ffffff' }}>{m?.name}</strong>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Part: {m?.partNumber || 'STD'} • Category: {m?.category}
          </div>
        </div>
      )
    },
    {
      title: 'Warehouse',
      key: 'warehouse',
      render: (w) => (
        <span style={{ fontSize: '0.85rem' }}>{w?.name || 'Chennai Factory Main'}</span>
      )
    },
    {
      title: 'On Hand',
      key: 'quantityOnHand',
      render: (val, row) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
          {val} {row.material?.unitOfMeasure}
        </span>
      )
    },
    {
      title: 'Reserved',
      key: 'quantityReserved',
      render: (val, row) => (
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
          {val} {row.material?.unitOfMeasure}
        </span>
      )
    },
    {
      title: 'Available Balance',
      key: 'quantityAvailable',
      render: (val, row) => {
        const isLow = row.material?.reorderLevel && val <= row.material.reorderLevel;
        return (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: isLow ? '#f43f5e' : '#10b981',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {isLow && <span>⚠️</span>}
            {val} {row.material?.unitOfMeasure}
            {isLow && <span style={{ fontSize: '0.7rem' }}>(Low Stock)</span>}
          </span>
        );
      }
    }
  ];

  const ledgerColumns = [
    {
      title: 'Txn Type',
      key: 'transactionType',
      render: (type) => {
        const isPos = type === 'RECEIPT' || type === 'TRANSFER_IN';
        return (
          <span
            className="telemetry-code"
            style={{ color: isPos ? '#10b981' : '#f43f5e' }}
          >
            {type}
          </span>
        );
      }
    },
    {
      title: 'Material',
      key: 'material',
      render: (m) => m?.name || 'Raw Material'
    },
    {
      title: 'Quantity Shift',
      key: 'quantity',
      render: (qty) => (
        <strong style={{ fontFamily: 'var(--font-mono)', color: qty > 0 ? '#10b981' : '#f43f5e' }}>
          {qty > 0 ? `+${qty}` : qty}
        </strong>
      )
    },
    {
      title: 'Balance After',
      key: 'balanceAfter',
      render: (bal) => <span style={{ fontFamily: 'var(--font-mono)' }}>{bal}</span>
    },
    {
      title: 'Reference / Source',
      key: 'referenceType',
      render: (ref, row) => (
        <div>
          <span style={{ fontSize: '0.8rem' }}>{ref}</span>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{row.referenceNumber}</div>
        </div>
      )
    },
    {
      title: 'Timestamp',
      key: 'createdAt',
      render: (d) => <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(d).toLocaleString()}</span>
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header with Navigation Tabs & Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn ${activeTab === 'STOCK' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('STOCK')}
          >
            🏭 Current Warehouse Stock
          </button>
          <button
            className={`btn ${activeTab === 'LEDGER' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('LEDGER')}
          >
            📜 Double-Entry Stock Ledger
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-outline" onClick={() => setAdjustModal(true)}>
            ⚖️ Physical Count Adjustment
          </button>
          <button className="btn btn-primary" onClick={() => setTransferModal(true)}>
            🚚 Warehouse Transfer
          </button>
        </div>
      </div>

      {activeTab === 'STOCK' ? (
        <DoubleBezelCard
          title="Multi-Warehouse Inventory Balances"
          subtitle="Real-time available quantities, reserved allocations, and automated reorder alerts"
        >
          <DataTable columns={stockColumns} data={stocks} loading={loading} />
        </DoubleBezelCard>
      ) : (
        <DoubleBezelCard
          title="Immutable Double-Entry Stock Movement Ledger"
          subtitle="Complete audit trail tracking every inward, material issue, warehouse transfer, and adjustment"
        >
          <DataTable columns={ledgerColumns} data={ledger} loading={loading} />
        </DoubleBezelCard>
      )}

      {/* Warehouse Transfer Modal */}
      <Modal
        isOpen={transferModal}
        onClose={() => setTransferModal(false)}
        title="Inter-Warehouse Stock Transfer"
      >
        <form onSubmit={handleTransfer}>
          <div className="form-group">
            <label>Select Material</label>
            <select
              className="select-control"
              required
              value={transferForm.materialId}
              onChange={(e) => setTransferForm({ ...transferForm, materialId: e.target.value })}
            >
              {materials.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.materialCode} — {m.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>Source Warehouse (Origin)</label>
              <select
                className="select-control"
                required
                value={transferForm.fromWarehouseId}
                onChange={(e) => setTransferForm({ ...transferForm, fromWarehouseId: e.target.value })}
              >
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Destination Warehouse (Target)</label>
              <select
                className="select-control"
                required
                value={transferForm.toWarehouseId}
                onChange={(e) => setTransferForm({ ...transferForm, toWarehouseId: e.target.value })}
              >
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Transfer Quantity</label>
            <input
              type="number"
              className="input-control"
              min="1"
              required
              value={transferForm.quantity}
              onChange={(e) => setTransferForm({ ...transferForm, quantity: Number(e.target.value) })}
            />
          </div>

          <div className="form-group">
            <label>Transfer Notes / Gate Pass Reference</label>
            <input
              type="text"
              className="input-control"
              value={transferForm.remarks}
              onChange={(e) => setTransferForm({ ...transferForm, remarks: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setTransferModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Execute Transfer
            </button>
          </div>
        </form>
      </Modal>

      {/* Physical Count Adjustment Modal */}
      <Modal
        isOpen={adjustModal}
        onClose={() => setAdjustModal(false)}
        title="Physical Audit Stock Variance Adjustment"
      >
        <form onSubmit={handleAdjust}>
          <div className="form-group">
            <label>Audit Warehouse</label>
            <select
              className="select-control"
              required
              value={adjustForm.warehouseId}
              onChange={(e) => setAdjustForm({ ...adjustForm, warehouseId: e.target.value })}
            >
              {warehouses.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Select Material</label>
            <select
              className="select-control"
              required
              value={adjustForm.materialId}
              onChange={(e) => setAdjustForm({ ...adjustForm, materialId: e.target.value })}
            >
              {materials.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.materialCode} — {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Verified Actual Physical Count</label>
            <input
              type="number"
              className="input-control"
              min="0"
              required
              value={adjustForm.actualPhysicalQuantity}
              onChange={(e) => setAdjustForm({ ...adjustForm, actualPhysicalQuantity: Number(e.target.value) })}
            />
          </div>

          <div className="form-group">
            <label>Audit Reason / Discrepancy Justification</label>
            <textarea
              className="textarea-control"
              rows={3}
              required
              value={adjustForm.reason}
              onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
              placeholder="e.g. Periodic stock cycle count reconciliation..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setAdjustModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Audit Adjust & Post
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StockPage;
