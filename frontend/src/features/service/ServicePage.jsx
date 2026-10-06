import React, { useState, useEffect } from 'react';
import DoubleBezelCard from '../../components/DoubleBezelCard';
import StatusBadge from '../../components/StatusBadge';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import PermissionGuard from '../../components/PermissionGuard';
import serviceApi from '../../services/api/serviceApi';
import masterDataApi from '../../services/api/masterDataApi';
import { useNotifications } from '../../contexts/NotificationContext';
import { 
  Build, 
  VerifiedUser, 
  ConfirmationNumber, 
  AssignmentReturn, 
  Add, 
  Search, 
  Engineering, 
  CheckCircle, 
  Hardware 
} from '@mui/icons-material';

const ServicePage = () => {
  const { showSuccess, showError } = useNotifications();
  const [activeTab, setActiveTab] = useState('installations'); // installations | warranties | tickets | rma

  // Data states
  const [installations, setInstallations] = useState([]);
  const [warranties, setWarranties] = useState([]);
  const [serviceTickets, setServiceTickets] = useState([]);
  const [rmas, setRMAs] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);

  // Warranty Lookup state
  const [lookupSerial, setLookupSerial] = useState('');
  const [warrantyLookupResult, setWarrantyLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);

  // Modals
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDiagnoseModalOpen, setIsDiagnoseModalOpen] = useState(false);
  const [isSparesModalOpen, setIsSparesModalOpen] = useState(false);
  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);
  const [isSignOffModalOpen, setIsSignOffModalOpen] = useState(false);
  const [isRmaModalOpen, setIsRmaModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedInstallation, setSelectedInstallation] = useState(null);

  // Form states
  const [commissionForm, setCommissionForm] = useState({
    signedByName: 'Dr. Suresh Babu',
    designation: 'Laboratory Operations Director',
    signatureUrl: 'https://cryo.internal/signatures/signoff_001.png'
  });

  const [ticketForm, setTicketForm] = useState({
    serialNumber: '',
    complaintDescription: 'Chamber temperature fluctuating between -65°C and -72°C during peak ambient load.',
    serviceLocation: 'CUSTOMER_SITE',
    priority: 'HIGH'
  });

  const [assignForm, setAssignForm] = useState({
    engineerId: ''
  });

  const [diagnoseForm, setDiagnoseForm] = useState({
    findings: 'Cascade condenser filter clogged with heavy particulate matter. Secondary stage suction pressure sub-nominal.',
    serviceLocation: 'CUSTOMER_SITE'
  });

  const [sparesForm, setSparesForm] = useState({
    materialId: '',
    quantity: 1,
    isChargeable: false
  });

  const [repairForm, setRepairForm] = useState({
    resolutionSummary: 'Condenser coils flushed, secondary stage sensor recalibrated to +/-0.1C accuracy.',
    testResult: 'PASS'
  });

  const [signOffForm, setSignOffForm] = useState({
    signedByName: 'Dr. Suresh Babu',
    satisfactionRating: 5
  });

  const [rmaForm, setRmaForm] = useState({
    serialNumber: '',
    reasonForReturn: 'Hermetic compressor internal winding failure requiring factory clean-room replacement.',
    shippingInstructions: 'Keep vertical during transit, maximum shock limit 15G.'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [instRes, warRes, tickRes, rmaRes, matRes] = await Promise.all([
        serviceApi.getInstallations({ limit: 50 }).catch(() => ({ data: { data: [] } })),
        serviceApi.getWarranties({ limit: 50 }).catch(() => ({ data: { data: [] } })),
        serviceApi.getServiceTickets({ limit: 50 }).catch(() => ({ data: { data: [] } })),
        serviceApi.getRMAs({ limit: 50 }).catch(() => ({ data: { data: [] } })),
        masterDataApi.getMaterials({ limit: 50 }).catch(() => ({ data: { data: [] } }))
      ]);

      const getData = (res) => (Array.isArray(res?.data) ? res.data : (res?.data?.data || []));

      setInstallations(getData(instRes));
      setWarranties(getData(warRes));
      setServiceTickets(getData(tickRes));
      setRMAs(getData(rmaRes));
      setMaterials(getData(matRes));
    } catch (err) {
      showError(err.message || 'Failed to load field service data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLookupWarranty = async (e) => {
    e.preventDefault();
    if (!lookupSerial.trim()) return;
    try {
      setLookupLoading(true);
      const res = await serviceApi.checkWarranty(lookupSerial.trim());
      setWarrantyLookupResult(res.data?.data || res.data);
    } catch (err) {
      showError(err.message || 'Warranty lookup failed');
    } finally {
      setLookupLoading(false);
    }
  };

  const handleCompleteCommissioning = async (e) => {
    e.preventDefault();
    try {
      await serviceApi.commissionInstallation(selectedInstallation._id, commissionForm);
      showSuccess('Commissioning verified. 12-Month Warranty activated automatically.');
      setIsCommissionModalOpen(false);
      setSelectedInstallation(null);
      loadData();
    } catch (err) {
      showError(err.message || 'Error executing commissioning sign-off');
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      await serviceApi.createServiceTicket(ticketForm);
      showSuccess('Service ticket logged. Warranty status evaluated.');
      setIsNewTicketModalOpen(false);
      loadData();
    } catch (err) {
      showError(err.message || 'Error logging service ticket');
    }
  };

  const handleAssignEngineer = async (e) => {
    e.preventDefault();
    try {
      await serviceApi.assignServiceTicket(selectedTicket._id, assignForm.engineerId);
      showSuccess('Field engineer assigned to ticket.');
      setIsAssignModalOpen(false);
      setSelectedTicket(null);
      loadData();
    } catch (err) {
      showError(err.message || 'Error assigning engineer');
    }
  };

  const handleRecordDiagnosis = async (e) => {
    e.preventDefault();
    try {
      await serviceApi.recordDiagnosis(selectedTicket._id, diagnoseForm);
      showSuccess('Technical diagnosis recorded.');
      setIsDiagnoseModalOpen(false);
      setSelectedTicket(null);
      loadData();
    } catch (err) {
      showError(err.message || 'Error recording diagnosis');
    }
  };

  const handleAddSpares = async (e) => {
    e.preventDefault();
    try {
      await serviceApi.addSpareParts(selectedTicket._id, sparesForm.materialId, sparesForm.quantity);
      showSuccess('Spare part deducted from warehouse inventory and assigned to ticket.');
      setIsSparesModalOpen(false);
      setSelectedTicket(null);
      loadData();
    } catch (err) {
      showError(err.message || 'Error allocating spare parts');
    }
  };

  const handleCompleteRepair = async (e) => {
    e.preventDefault();
    try {
      await serviceApi.completeRepair(selectedTicket._id, repairForm.resolutionSummary);
      showSuccess('Repair recorded. Machine tested and ready for customer sign-off.');
      setIsRepairModalOpen(false);
      setSelectedTicket(null);
      loadData();
    } catch (err) {
      showError(err.message || 'Error completing repair');
    }
  };

  const handleCustomerSignOff = async (e) => {
    e.preventDefault();
    try {
      await serviceApi.customerSignOff(selectedTicket._id, signOffForm);
      showSuccess('Customer sign-off logged. Ticket formally closed.');
      setIsSignOffModalOpen(false);
      setSelectedTicket(null);
      loadData();
    } catch (err) {
      showError(err.message || 'Error recording customer sign-off');
    }
  };

  const handleCreateRMA = async (e) => {
    e.preventDefault();
    try {
      await serviceApi.createRMA(rmaForm);
      showSuccess('RMA ticket registered. Awaiting factory return inspection.');
      setIsRmaModalOpen(false);
      loadData();
    } catch (err) {
      showError(err.message || 'Error creating RMA');
    }
  };

  const handleApproveRMA = async (id) => {
    try {
      await serviceApi.approveRMA(id);
      showSuccess('RMA approved for factory return transit.');
      loadData();
    } catch (err) {
      showError(err.message || 'Error approving RMA');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cryo)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
            <Engineering style={{ fontSize: '1.1rem' }} /> Field Operations & Reliability
          </div>
          <h1 style={{ margin: '4px 0 0', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Service, Commissioning & RMA Command
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Equipment commissioning checklists, 12-month warranty clock, breakdown workorders, and factory RMA returns.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <PermissionGuard permission="SERVICE_CREATE">
            <button className="btn btn-primary" onClick={() => setIsNewTicketModalOpen(true)}>
              <Add style={{ fontSize: '1rem', marginRight: '6px' }} /> Log Service Ticket
            </button>
          </PermissionGuard>

          <PermissionGuard permission="RMA_CREATE">
            <button className="btn btn-secondary" onClick={() => setIsRmaModalOpen(true)}>
              <AssignmentReturn style={{ fontSize: '1rem', marginRight: '6px' }} /> Request RMA
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <DoubleBezelCard>
          <div style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Installations Pending</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--warning)', marginTop: '4px' }}>
              {installations.filter(i => i.status === 'PENDING').length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Awaiting site commissioning</div>
          </div>
        </DoubleBezelCard>

        <DoubleBezelCard>
          <div style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Active Warranties</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)', marginTop: '4px' }}>
              {warranties.filter(w => w.status === 'ACTIVE').length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>12-Month coverage active</div>
          </div>
        </DoubleBezelCard>

        <DoubleBezelCard>
          <div style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Open Service Tickets</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--danger)', marginTop: '4px' }}>
              {serviceTickets.filter(t => t.status !== 'CLOSED').length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Under repair or diagnostic</div>
          </div>
        </DoubleBezelCard>

        <DoubleBezelCard>
          <div style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Factory RMA Returns</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cryo)', marginTop: '4px' }}>
              {rmas.filter(r => r.status !== 'CLOSED').length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Authorized depot returns</div>
          </div>
        </DoubleBezelCard>
      </div>

      {/* Serial Warranty Quick Lookup Bar */}
      <DoubleBezelCard>
        <div style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Real-Time Serial Number Warranty & SLA Verification
          </div>
          <form onSubmit={handleLookupWarranty} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Machine Serial Number (e.g. CRYO-SN-000001)..."
              value={lookupSerial}
              onChange={(e) => setLookupSerial(e.target.value)}
              style={{ flex: 1, fontFamily: 'var(--font-mono)' }}
            />
            <button type="submit" className="btn btn-primary" disabled={lookupLoading}>
              <Search style={{ fontSize: '1rem', marginRight: '6px' }} />
              {lookupLoading ? 'Checking...' : 'Check Warranty'}
            </button>
          </form>

          {warrantyLookupResult && (
            <div style={{ marginTop: '12px', padding: '12px', borderRadius: '4px', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <span style={{ fontWeight: 700, color: warrantyLookupResult.isValid ? 'var(--success)' : 'var(--danger)' }}>
                    {warrantyLookupResult.isValid ? '✓ COVERED UNDER ACTIVE WARRANTY' : '⚠ OUT OF WARRANTY / NOT FOUND'}
                  </span>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {warrantyLookupResult.message || `Days Remaining: ${warrantyLookupResult.daysRemaining} days`}
                  </div>
                </div>
                {warrantyLookupResult.startDate && (
                  <div style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    Valid: {new Date(warrantyLookupResult.startDate).toLocaleDateString()} ➔ {new Date(warrantyLookupResult.endDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DoubleBezelCard>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '16px' }}>
        {[
          { id: 'installations', label: 'Site Commissioning', count: installations.length },
          { id: 'warranties', label: 'Active Warranties', count: warranties.length },
          { id: 'tickets', label: 'Breakdown Tickets', count: serviceTickets.length },
          { id: 'rma', label: 'Factory RMA Bay', count: rmas.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              padding: '10px 16px',
              cursor: 'pointer',
              color: activeTab === tab.id ? 'var(--accent-cryo)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-cryo)' : '2px solid transparent',
              fontWeight: activeTab === tab.id ? 600 : 400,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.875rem'
            }}
          >
            {tab.label}
            <span style={{
              background: activeTab === tab.id ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '0.7rem',
              fontFamily: 'var(--font-mono)'
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'installations' && (
        <DoubleBezelCard>
          <div style={{ padding: '16px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Site Installation & Commissioning Queue</h3>
            <DataTable
              loading={loading}
              columns={[
                {
                  key: 'installationNumber',
                  header: 'Installation #',
                  render: (row) => (
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cryo)', fontWeight: 600 }}>
                      {row.installationNumber}
                    </span>
                  )
                },
                {
                  key: 'serialNumber',
                  header: 'Serial Number',
                  render: (row) => (
                    <span style={{ fontFamily: 'var(--font-mono)' }}>
                      {row.serialNumber?.serialNumber || 'CRYO-SN-000001'}
                    </span>
                  )
                },
                {
                  key: 'customer',
                  header: 'Customer',
                  render: (row) => row.customer?.companyName || 'Apex Research Institute'
                },
                {
                  key: 'engineer',
                  header: 'Assigned Engineer',
                  render: (row) => row.assignedEngineer?.name || 'Vikas Sharma (Field Senior)'
                },
                {
                  key: 'status',
                  header: 'Commissioning Status',
                  render: (row) => <StatusBadge status={row.status || 'PENDING'} />
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (row) => (
                    <div>
                      {row.status === 'PENDING' && (
                        <PermissionGuard permission="INSTALLATION_MANAGE">
                          <button
                            className="btn btn-primary"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            onClick={() => {
                              setSelectedInstallation(row);
                              setIsCommissionModalOpen(true);
                            }}
                          >
                            Sign-Off Commissioning
                          </button>
                        </PermissionGuard>
                      )}
                    </div>
                  )
                }
              ]}
              data={installations}
            />
          </div>
        </DoubleBezelCard>
      )}

      {activeTab === 'warranties' && (
        <DoubleBezelCard>
          <div style={{ padding: '16px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: 'var(--text-primary)' }}>12-Month Equipment Warranty Registry</h3>
            <DataTable
              loading={loading}
              columns={[
                {
                  key: 'serialNumber',
                  header: 'Machine Serial',
                  render: (row) => (
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cryo)', fontWeight: 600 }}>
                      {row.serialNumberString || row.serialNumber?.serialNumber}
                    </span>
                  )
                },
                {
                  key: 'customer',
                  header: 'Owner Organization',
                  render: (row) => row.customer?.companyName || 'Biocon Biologics'
                },
                {
                  key: 'startDate',
                  header: 'Warranty Start',
                  render: (row) => new Date(row.startDate).toLocaleDateString()
                },
                {
                  key: 'endDate',
                  header: 'Warranty Expiry',
                  render: (row) => new Date(row.endDate).toLocaleDateString()
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (row) => <StatusBadge status={row.status || 'ACTIVE'} />
                }
              ]}
              data={warranties}
            />
          </div>
        </DoubleBezelCard>
      )}

      {activeTab === 'tickets' && (
        <DoubleBezelCard>
          <div style={{ padding: '16px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Breakdown Service Workorders</h3>
            <DataTable
              loading={loading}
              columns={[
                {
                  key: 'ticketNumber',
                  header: 'Ticket ID',
                  render: (row) => (
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cryo)', fontWeight: 600 }}>
                      {row.ticketNumber}
                    </span>
                  )
                },
                {
                  key: 'customer',
                  header: 'Client',
                  render: (row) => row.customer?.companyName || 'National Centre for Biological Sciences'
                },
                {
                  key: 'complaint',
                  header: 'Complaint & Findings',
                  render: (row) => (
                    <div style={{ maxWidth: '300px' }}>
                      <div style={{ fontSize: '0.85rem' }}>{row.complaintDescription}</div>
                      {row.diagnosis?.findings && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          Diagnosis: {row.diagnosis.findings}
                        </div>
                      )}
                    </div>
                  )
                },
                {
                  key: 'warrantyFlag',
                  header: 'Coverage Type',
                  render: (row) => (
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: row.isUnderWarranty ? 'var(--success)' : 'var(--warning)',
                      fontWeight: 600
                    }}>
                      {row.isUnderWarranty ? 'WARRANTY (FREE)' : 'CHARGEABLE'}
                    </span>
                  )
                },
                {
                  key: 'status',
                  header: 'Ticket Stage',
                  render: (row) => <StatusBadge status={row.status || 'OPEN'} />
                },
                {
                  key: 'actions',
                  header: 'Workorder Actions',
                  render: (row) => (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {row.status === 'OPEN' && (
                        <PermissionGuard permission="SERVICE_ASSIGN">
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '3px 6px', fontSize: '0.7rem' }}
                            onClick={() => {
                              setSelectedTicket(row);
                              setIsAssignModalOpen(true);
                            }}
                          >
                            Assign Engineer
                          </button>
                        </PermissionGuard>
                      )}

                      {row.status === 'ASSIGNED' && (
                        <PermissionGuard permission="SERVICE_DIAGNOSE">
                          <button
                            className="btn btn-primary"
                            style={{ padding: '3px 6px', fontSize: '0.7rem' }}
                            onClick={() => {
                              setSelectedTicket(row);
                              setIsDiagnoseModalOpen(true);
                            }}
                          >
                            Log Diagnosis
                          </button>
                        </PermissionGuard>
                      )}

                      {(row.status === 'DIAGNOSED' || row.status === 'WAITING_FOR_PARTS') && (
                        <>
                          <PermissionGuard permission="SERVICE_RESOLVE">
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '3px 6px', fontSize: '0.7rem' }}
                              onClick={() => {
                                setSelectedTicket(row);
                                setIsSparesModalOpen(true);
                              }}
                            >
                              Add Spares
                            </button>
                            <button
                              className="btn btn-primary"
                              style={{ padding: '3px 6px', fontSize: '0.7rem' }}
                              onClick={() => {
                                setSelectedTicket(row);
                                setIsRepairModalOpen(true);
                              }}
                            >
                              Mark Repaired
                            </button>
                          </PermissionGuard>
                        </>
                      )}

                      {row.status === 'REPAIRED' && (
                        <PermissionGuard permission="SERVICE_CLOSE">
                          <button
                            className="btn btn-success"
                            style={{ padding: '3px 6px', fontSize: '0.7rem' }}
                            onClick={() => {
                              setSelectedTicket(row);
                              setIsSignOffModalOpen(true);
                            }}
                          >
                            Sign-Off & Close
                          </button>
                        </PermissionGuard>
                      )}
                    </div>
                  )
                }
              ]}
              data={serviceTickets}
            />
          </div>
        </DoubleBezelCard>
      )}

      {activeTab === 'rma' && (
        <DoubleBezelCard>
          <div style={{ padding: '16px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Factory Return Merchandise Authorization (RMA)</h3>
            <DataTable
              loading={loading}
              columns={[
                {
                  key: 'rmaNumber',
                  header: 'RMA Ticket #',
                  render: (row) => (
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cryo)', fontWeight: 600 }}>
                      {row.rmaNumber}
                    </span>
                  )
                },
                {
                  key: 'serialNumber',
                  header: 'Serial Unit',
                  render: (row) => (
                    <span style={{ fontFamily: 'var(--font-mono)' }}>
                      {row.serialNumber?.serialNumber || 'CRYO-SN-000001'}
                    </span>
                  )
                },
                {
                  key: 'reason',
                  header: 'Reason for Return',
                  render: (row) => row.reasonForReturn
                },
                {
                  key: 'status',
                  header: 'RMA Status',
                  render: (row) => <StatusBadge status={row.status || 'REQUESTED'} />
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (row) => (
                    <div>
                      {row.status === 'REQUESTED' && (
                        <PermissionGuard permission="RMA_APPROVE">
                          <button
                            className="btn btn-primary"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            onClick={() => handleApproveRMA(row._id)}
                          >
                            Approve RMA Return
                          </button>
                        </PermissionGuard>
                      )}
                    </div>
                  )
                }
              ]}
              data={rmas}
            />
          </div>
        </DoubleBezelCard>
      )}

      {/* COMMISSIONING MODAL */}
      <Modal
        isOpen={isCommissionModalOpen}
        onClose={() => setIsCommissionModalOpen(false)}
        title="Equipment Commissioning & Warranty Activation"
        subtitle={`Verify on-site pull-down test and activate warranty for ${selectedInstallation?.installationNumber}`}
      >
        <form onSubmit={handleCompleteCommissioning} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'rgba(34, 197, 94, 0.08)', padding: '12px', borderRadius: '4px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
            <div style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.85rem' }}>
              ✓ Warranty Activation Trigger Notice
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>
              Completing this checklist automatically provisions a 12-month standard warranty coverage period and updates serial genealogy.
            </div>
          </div>

          <div>
            <label className="label">Customer Sign-off Official Name *</label>
            <input
              type="text"
              className="form-control"
              value={commissionForm.signedByName}
              onChange={(e) => setCommissionForm({ ...commissionForm, signedByName: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Official Designation</label>
            <input
              type="text"
              className="form-control"
              value={commissionForm.designation}
              onChange={(e) => setCommissionForm({ ...commissionForm, designation: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCommissionModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-success">Activate 12-Month Warranty</button>
          </div>
        </form>
      </Modal>

      {/* NEW SERVICE TICKET MODAL */}
      <Modal
        isOpen={isNewTicketModalOpen}
        onClose={() => setIsNewTicketModalOpen(false)}
        title="Log Breakdown Service Ticket"
        subtitle="Automatic warranty coverage verification and complaint assignment."
      >
        <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="label">Serial Number Reference *</label>
            <select
              className="form-control"
              value={ticketForm.serialNumber}
              onChange={(e) => setTicketForm({ ...ticketForm, serialNumber: e.target.value })}
              required
            >
              <option value="">Select Equipment Serial...</option>
              {warranties.map(w => (
                <option key={w.serialNumber?._id || w._id} value={w.serialNumber?._id || w.serialNumber}>
                  {w.serialNumberString || w.serialNumber?.serialNumber} ({w.customer?.companyName || 'Client'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Complaint Description & Anomaly Details *</label>
            <textarea
              className="form-control"
              rows={3}
              value={ticketForm.complaintDescription}
              onChange={(e) => setTicketForm({ ...ticketForm, complaintDescription: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="label">Service Location</label>
              <select
                className="form-control"
                value={ticketForm.serviceLocation}
                onChange={(e) => setTicketForm({ ...ticketForm, serviceLocation: e.target.value })}
              >
                <option value="CUSTOMER_SITE">On-Site Service</option>
                <option value="FACTORY_RETURN">Factory Return (RMA)</option>
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select
                className="form-control"
                value={ticketForm.priority}
                onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
              >
                <option value="HIGH">High (SLA: 24h)</option>
                <option value="MEDIUM">Medium (SLA: 48h)</option>
                <option value="CRITICAL">Critical (SLA: 4h)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsNewTicketModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Log Service Workorder</button>
          </div>
        </form>
      </Modal>

      {/* ASSIGN ENGINEER MODAL */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Field Service Engineer"
        subtitle={`Dispatch engineer for ${selectedTicket?.ticketNumber}`}
      >
        <form onSubmit={handleAssignEngineer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="label">Field Engineer *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Vikas Sharma (Staff ID: ENG-104)"
              value={assignForm.engineerId}
              onChange={(e) => setAssignForm({ ...assignForm, engineerId: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAssignModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Dispatch & Assign</button>
          </div>
        </form>
      </Modal>

      {/* DIAGNOSE MODAL */}
      <Modal
        isOpen={isDiagnoseModalOpen}
        onClose={() => setIsDiagnoseModalOpen(false)}
        title="Record Technical Fault Diagnosis"
        subtitle={`Technical investigation notes for ${selectedTicket?.ticketNumber}`}
      >
        <form onSubmit={handleRecordDiagnosis} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="label">Diagnostic Findings *</label>
            <textarea
              className="form-control"
              rows={4}
              value={diagnoseForm.findings}
              onChange={(e) => setDiagnoseForm({ ...diagnoseForm, findings: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Service Location</label>
            <select
              className="form-control"
              value={diagnoseForm.serviceLocation}
              onChange={(e) => setDiagnoseForm({ ...diagnoseForm, serviceLocation: e.target.value })}
            >
              <option value="CUSTOMER_SITE">On-Site Field Repair</option>
              <option value="FACTORY_RETURN">Escalate to Factory RMA Return</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsDiagnoseModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Diagnosis</button>
          </div>
        </form>
      </Modal>

      {/* SPARES MODAL */}
      <Modal
        isOpen={isSparesModalOpen}
        onClose={() => setIsSparesModalOpen(false)}
        title="Allocate Replacement Spare Parts"
        subtitle={`Deduct spare part from warehouse stock for ${selectedTicket?.ticketNumber}`}
      >
        <form onSubmit={handleAddSpares} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="label">Spare Part Material *</label>
            <select
              className="form-control"
              value={sparesForm.materialId}
              onChange={(e) => setSparesForm({ ...sparesForm, materialId: e.target.value })}
              required
            >
              <option value="">Select Material...</option>
              {materials.map(m => (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.itemCode || m.unitOfMeasure})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="label">Quantity</label>
              <input
                type="number"
                min="1"
                className="form-control"
                value={sparesForm.quantity}
                onChange={(e) => setSparesForm({ ...sparesForm, quantity: Number(e.target.value) })}
                required
              />
            </div>
            <div>
              <label className="label">Billing</label>
              <select
                className="form-control"
                value={sparesForm.isChargeable}
                onChange={(e) => setSparesForm({ ...sparesForm, isChargeable: e.target.value === 'true' })}
              >
                <option value="false">Warranty Covered (₹0)</option>
                <option value="true">Chargeable to Customer</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsSparesModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Allocate Spare & Deduct Inventory</button>
          </div>
        </form>
      </Modal>

      {/* REPAIR COMPLETION MODAL */}
      <Modal
        isOpen={isRepairModalOpen}
        onClose={() => setIsRepairModalOpen(false)}
        title="Complete Repair & Post-Fix Validation"
        subtitle={`Confirm equipment operation for ${selectedTicket?.ticketNumber}`}
      >
        <form onSubmit={handleCompleteRepair} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="label">Resolution Summary *</label>
            <textarea
              className="form-control"
              rows={3}
              value={repairForm.resolutionSummary}
              onChange={(e) => setRepairForm({ ...repairForm, resolutionSummary: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Post-Repair Pull-down Test Result</label>
            <select
              className="form-control"
              value={repairForm.testResult}
              onChange={(e) => setRepairForm({ ...repairForm, testResult: e.target.value })}
            >
              <option value="PASS">PASS (Temperature stabilized at setpoint)</option>
              <option value="FAIL">FAIL (Secondary anomaly detected)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsRepairModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Confirm Repair Completed</button>
          </div>
        </form>
      </Modal>

      {/* SIGN OFF MODAL */}
      <Modal
        isOpen={isSignOffModalOpen}
        onClose={() => setIsSignOffModalOpen(false)}
        title="Customer Sign-off & Workorder Closure"
        subtitle={`Collect client satisfaction sign-off for ${selectedTicket?.ticketNumber}`}
      >
        <form onSubmit={handleCustomerSignOff} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="label">Customer Officer Signed Name *</label>
            <input
              type="text"
              className="form-control"
              value={signOffForm.signedByName}
              onChange={(e) => setSignOffForm({ ...signOffForm, signedByName: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Satisfaction Rating (1 to 5 Stars)</label>
            <select
              className="form-control"
              value={signOffForm.satisfactionRating}
              onChange={(e) => setSignOffForm({ ...signOffForm, satisfactionRating: Number(e.target.value) })}
            >
              <option value="5">★★★★★ - Excellent (Full resolution within SLA)</option>
              <option value="4">★★★★☆ - Good</option>
              <option value="3">★★★☆☆ - Satisfactory</option>
              <option value="2">★★☆☆☆ - Marginal</option>
              <option value="1">★☆☆☆☆ - Unsatisfactory</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsSignOffModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-success">Close Workorder</button>
          </div>
        </form>
      </Modal>

      {/* CREATE RMA MODAL */}
      <Modal
        isOpen={isRmaModalOpen}
        onClose={() => setIsRmaModalOpen(false)}
        title="Issue RMA (Return Material Authorization)"
        subtitle="Authorize customer to ship machine to factory clean-room repair bay."
      >
        <form onSubmit={handleCreateRMA} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="label">Serial Number Reference *</label>
            <select
              className="form-control"
              value={rmaForm.serialNumber}
              onChange={(e) => setRmaForm({ ...rmaForm, serialNumber: e.target.value })}
              required
            >
              <option value="">Select Serial Number...</option>
              {warranties.map(w => (
                <option key={w.serialNumber?._id || w._id} value={w.serialNumber?._id || w.serialNumber}>
                  {w.serialNumberString || w.serialNumber?.serialNumber} ({w.customer?.companyName || 'Client'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Return Reason *</label>
            <textarea
              className="form-control"
              rows={3}
              value={rmaForm.reasonForReturn}
              onChange={(e) => setRmaForm({ ...rmaForm, reasonForReturn: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Handling & Shipping Instructions</label>
            <input
              type="text"
              className="form-control"
              value={rmaForm.shippingInstructions}
              onChange={(e) => setRmaForm({ ...rmaForm, shippingInstructions: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsRmaModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Issue RMA Docket</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ServicePage;
