import React, { useState, useEffect } from 'react';
import DoubleBezelCard from '../../components/DoubleBezelCard';
import StatusBadge from '../../components/StatusBadge';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import governanceApi from '../../services/api/governanceApi';
import { useNotifications } from '../../contexts/NotificationContext';
import { 
  Policy, 
  HistoryToggleOff, 
  Search, 
  Visibility, 
  LockClock, 
  Fingerprint, 
  Code 
} from '@mui/icons-material';

const AuditLogsPage = () => {
  const { showError } = useNotifications();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchDoc, setSearchDoc] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const params = { limit: 100 };
      if (searchDoc) params.search = searchDoc;
      if (moduleFilter !== 'ALL') params.module = moduleFilter;

      const res = await governanceApi.getAuditLogs(params);
      setLogs(Array.isArray(res?.data) ? res.data : (res?.data?.data || []));
    } catch (err) {
      showError(err.message || 'Failed to load security audit trail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [moduleFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadAuditLogs();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cryo)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
            <Policy style={{ fontSize: '1.1rem' }} /> Enterprise Governance & Integrity
          </div>
          <h1 style={{ margin: '4px 0 0', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            System Audit Trail & Compliance Ledger
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Immutable, write-once audit log capturing every entity mutation, approval, state change, and operator session.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(6, 182, 212, 0.08)', borderRadius: '4px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
          <LockClock style={{ color: 'var(--accent-cryo)', fontSize: '1.2rem' }} />
          <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
            IMMUTABLE SECURITY LEDGER: ACTIVE
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <DoubleBezelCard>
        <div style={{ padding: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '260px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by Document Number (e.g. SO-2026-0001, PR-001)..."
              value={searchDoc}
              onChange={(e) => setSearchDoc(e.target.value)}
              style={{ fontFamily: 'var(--font-mono)' }}
            />
            <button type="submit" className="btn btn-primary">
              <Search style={{ fontSize: '1rem' }} />
            </button>
          </form>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>MODULE:</span>
            <select
              className="form-control"
              style={{ width: 'auto' }}
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
            >
              <option value="ALL">All Modules</option>
              <option value="SALES">Sales & Quotations</option>
              <option value="FINANCE">Finance & Payments</option>
              <option value="PRODUCTION">Production Shopfloor</option>
              <option value="INVENTORY">Inventory & Warehouse</option>
              <option value="PROCUREMENT">Procurement & PO</option>
              <option value="QA">Quality & Pull-Down</option>
              <option value="DISPATCH">Logistics & Dispatch</option>
              <option value="SERVICE">Field Service & RMA</option>
            </select>
          </div>
        </div>
      </DoubleBezelCard>

      {/* Audit Log Table */}
      <DoubleBezelCard>
        <div style={{ padding: '16px' }}>
          <DataTable
            loading={loading}
            columns={[
              {
                key: 'timestamp',
                header: 'Timestamp (UTC)',
                render: (row) => (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {new Date(row.createdAt).toISOString().replace('T', ' ').substring(0, 19)}
                  </span>
                )
              },
              {
                key: 'action',
                header: 'Action / Event',
                render: (row) => (
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--accent-cryo)',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    background: 'rgba(6, 182, 212, 0.08)',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {row.action}
                  </span>
                )
              },
              {
                key: 'module',
                header: 'Module & Entity',
                render: (row) => (
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{row.module}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                      ({row.entityType})
                    </span>
                  </div>
                )
              },
              {
                key: 'documentNumber',
                header: 'Document #',
                render: (row) => (
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    {row.documentNumber || '-'}
                  </span>
                )
              },
              {
                key: 'actor',
                header: 'Operator & Role',
                render: (row) => (
                  <div>
                    <div style={{ fontSize: '0.85rem' }}>{row.user?.name || row.userEmail || 'System Process'}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {row.user?.role || row.role || 'CORE_ENGINE'}
                    </div>
                  </div>
                )
              },
              {
                key: 'remarks',
                header: 'Summary / Remarks',
                render: (row) => (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.remarks || '-'}
                  </div>
                )
              },
              {
                key: 'details',
                header: 'Diff Inspection',
                render: (row) => (
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                    onClick={() => {
                      setSelectedLog(row);
                      setIsDetailModalOpen(true);
                    }}
                  >
                    <Visibility style={{ fontSize: '0.9rem', marginRight: '4px' }} /> Inspect
                  </button>
                )
              }
            ]}
            data={logs}
          />
        </div>
      </DoubleBezelCard>

      {/* INSPECT LOG MODAL */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Audit Mutation Inspection & State Snapshot"
        subtitle={`Audit Record ${selectedLog?._id} | Action: ${selectedLog?.action}`}
      >
        {selectedLog && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
              <div><strong>Document Number:</strong> <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cryo)' }}>{selectedLog.documentNumber || 'N/A'}</span></div>
              <div><strong>Entity Type:</strong> {selectedLog.entityType} ({selectedLog.entityId})</div>
              <div><strong>Operator:</strong> {selectedLog.user?.name || selectedLog.userEmail} ({selectedLog.user?.role || selectedLog.role})</div>
              <div><strong>IP Address:</strong> <span style={{ fontFamily: 'var(--font-mono)' }}>{selectedLog.ip || '127.0.0.1'}</span></div>
              <div style={{ gridColumn: 'span 2' }}><strong>Remarks:</strong> {selectedLog.remarks || 'Standard workflow transition'}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--warning)', marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>
                  STATE BEFORE MUTATION:
                </div>
                <pre style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  padding: '12px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color)',
                  maxHeight: '250px',
                  overflow: 'auto',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-secondary)'
                }}>
                  {selectedLog.before ? JSON.stringify(selectedLog.before, null, 2) : 'null (Entity creation event)'}
                </pre>
              </div>

              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--success)', marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>
                  STATE AFTER MUTATION:
                </div>
                <pre style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  padding: '12px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color)',
                  maxHeight: '250px',
                  overflow: 'auto',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#6ee7b7'
                }}>
                  {selectedLog.after ? JSON.stringify(selectedLog.after, null, 2) : 'null'}
                </pre>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsDetailModalOpen(false)}>
                Close Inspector
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuditLogsPage;
