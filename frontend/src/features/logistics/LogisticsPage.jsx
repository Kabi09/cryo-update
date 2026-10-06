import React, { useState, useEffect } from 'react';
import DoubleBezelCard from '../../components/DoubleBezelCard';
import StatusBadge from '../../components/StatusBadge';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import PermissionGuard from '../../components/PermissionGuard';
import logisticsApi from '../../services/api/logisticsApi';
import salesOrderApi from '../../services/api/salesOrderApi';
import { useNotifications } from '../../contexts/NotificationContext';
import { 
  LocalShipping, 
  Inventory2, 
  ReceiptLong, 
  AssignmentTurnedIn, 
  Add, 
  CheckCircle, 
  WarningAmber, 
  AltRoute, 
  QrCode2 
} from '@mui/icons-material';

const LogisticsPage = () => {
  const { showSuccess, showError } = useNotifications();
  const [activeTab, setActiveTab] = useState('finishedGoods'); // finishedGoods | packing | dispatch | deliveries
  
  // Data states
  const [finishedGoods, setFinishedGoods] = useState([]);
  const [packings, setPackings] = useState([]);
  const [finalInvoices, setFinalInvoices] = useState([]);
  const [dispatches, setDispatches] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [isPackingModalOpen, setIsPackingModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isPodModalOpen, setIsPodModalOpen] = useState(false);
  const [isFailureModalOpen, setIsFailureModalOpen] = useState(false);
  const [selectedDispatch, setSelectedDispatch] = useState(null);

  // Form states
  const [packingForm, setPackingForm] = useState({
    salesOrder: '',
    serialNumbers: [],
    packagingType: 'WOODEN_CRATE',
    grossWeightKg: 250,
    dimensions: '1000 x 950 x 2100 mm',
    operationManualIncluded: true,
    calibrationCertificateIncluded: true,
    powerCordIncluded: true,
    keysIncluded: true,
    warrantyCardIncluded: true,
    remarks: ''
  });

  const [invoiceForm, setInvoiceForm] = useState({
    salesOrderId: '',
    paymentTerms: 'Payment due within 30 days',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [dispatchForm, setDispatchForm] = useState({
    salesOrder: '',
    finalInvoice: '',
    packing: '',
    serialNumbers: [],
    transporterName: 'VRL Cryo Logistics',
    trackingNumber: 'LR-2026-9901',
    vehicleNumber: 'KA-01-EA-4491',
    driverPhone: '+91 98450 12345',
    eWayBillNumber: '341098234891'
  });

  const [podForm, setPodForm] = useState({
    receivedBy: '',
    remarks: 'Goods received in sealed condition with temperature data logger intact.'
  });

  const [failureForm, setFailureForm] = useState({
    reason: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [fgRes, packRes, invRes, dispRes, delRes, soRes] = await Promise.all([
        logisticsApi.getFinishedGoods({ limit: 50 }).catch(() => ({ data: { data: [] } })),
        logisticsApi.getPackings({ limit: 50 }).catch(() => ({ data: { data: [] } })),
        logisticsApi.getFinalInvoices({ limit: 50 }).catch(() => ({ data: { data: [] } })),
        logisticsApi.getDispatches({ limit: 50 }).catch(() => ({ data: { data: [] } })),
        logisticsApi.getDeliveries({ limit: 50 }).catch(() => ({ data: { data: [] } })),
        salesOrderApi.getSalesOrders({ limit: 50 }).catch(() => ({ data: { data: [] } }))
      ]);

      setFinishedGoods(fgRes.data?.data || []);
      setPackings(packRes.data?.data || []);
      setFinalInvoices(invRes.data?.data || []);
      setDispatches(dispRes.data?.data || []);
      setDeliveries(delRes.data?.data || []);
      setSalesOrders(soRes.data?.data || []);
    } catch (err) {
      showError(err.message || 'Failed to load logistics telemetry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers
  const handleCreatePacking = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        salesOrder: packingForm.salesOrder,
        serialNumbers: Array.isArray(packingForm.serialNumbers) ? packingForm.serialNumbers : [packingForm.serialNumbers],
        packagingType: packingForm.packagingType,
        grossWeightKg: Number(packingForm.grossWeightKg),
        dimensions: packingForm.dimensions,
        checklist: {
          operationManualIncluded: packingForm.operationManualIncluded,
          calibrationCertificateIncluded: packingForm.calibrationCertificateIncluded,
          powerCordIncluded: packingForm.powerCordIncluded,
          keysIncluded: packingForm.keysIncluded,
          warrantyCardIncluded: packingForm.warrantyCardIncluded
        },
        remarks: packingForm.remarks
      };
      await logisticsApi.createPacking(payload);
      showSuccess('Crating & packing checklist verified. Slip issued.');
      setIsPackingModalOpen(false);
      loadData();
    } catch (err) {
      showError(err.message || 'Error creating packing record');
    }
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      await logisticsApi.createFinalInvoice(invoiceForm);
      showSuccess('Final GST Tax Invoice generated successfully.');
      setIsInvoiceModalOpen(false);
      loadData();
    } catch (err) {
      showError(err.message || 'Error generating final invoice');
    }
  };

  const handleCreateDispatch = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...dispatchForm,
        serialNumbers: Array.isArray(dispatchForm.serialNumbers) ? dispatchForm.serialNumbers : [dispatchForm.serialNumbers]
      };
      await logisticsApi.createDispatch(payload);
      showSuccess('Dispatch docket registered and goods marked In-Transit.');
      setIsDispatchModalOpen(false);
      loadData();
    } catch (err) {
      showError(err.message || 'Error registering dispatch');
    }
  };

  const handleCompletePOD = async (e) => {
    e.preventDefault();
    try {
      await logisticsApi.updatePOD(selectedDispatch._id, podForm);
      showSuccess('Proof of Delivery (POD) confirmed. Status updated to DELIVERED.');
      setIsPodModalOpen(false);
      setSelectedDispatch(null);
      loadData();
    } catch (err) {
      showError(err.message || 'Error recording POD confirmation');
    }
  };

  const handleReportFailure = async (e) => {
    e.preventDefault();
    try {
      await logisticsApi.reportDeliveryFailure(selectedDispatch._id, failureForm.reason);
      showSuccess('Delivery failure recorded for investigation.');
      setIsFailureModalOpen(false);
      setSelectedDispatch(null);
      loadData();
    } catch (err) {
      showError(err.message || 'Error reporting delivery failure');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cryo)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
            <LocalShipping style={{ fontSize: '1.1rem' }} /> Dispatch & Distribution Division
          </div>
          <h1 style={{ margin: '4px 0 0', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Logistics, Crating & POD Hub
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Finished goods dispatch gates, crating verification checklists, GST commercial invoicing, and delivery tracking.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <PermissionGuard permission="PACKING_MANAGE">
            <button className="btn btn-secondary" onClick={() => setIsPackingModalOpen(true)}>
              <Inventory2 style={{ fontSize: '1rem', marginRight: '6px' }} /> New Packing Slip
            </button>
          </PermissionGuard>

          <PermissionGuard permission="FINANCE_MANAGE">
            <button className="btn btn-secondary" onClick={() => setIsInvoiceModalOpen(true)}>
              <ReceiptLong style={{ fontSize: '1rem', marginRight: '6px' }} /> Final GST Invoice
            </button>
          </PermissionGuard>

          <PermissionGuard permission="DISPATCH_CREATE">
            <button className="btn btn-primary" onClick={() => setIsDispatchModalOpen(true)}>
              <Add style={{ fontSize: '1rem', marginRight: '6px' }} /> Create Dispatch
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <DoubleBezelCard>
          <div style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Finished Goods in Bay</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cryo)', marginTop: '4px' }}>
              {finishedGoods.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>QA Verified & Ready for Crating</div>
          </div>
        </DoubleBezelCard>

        <DoubleBezelCard>
          <div style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Packings Slips Issued</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--warning)', marginTop: '4px' }}>
              {packings.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Pre-shipment verification passed</div>
          </div>
        </DoubleBezelCard>

        <DoubleBezelCard>
          <div style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Active In-Transit Dispatches</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
              {dispatches.filter(d => d.status === 'DISPATCHED').length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>With LR & e-Way documentation</div>
          </div>
        </DoubleBezelCard>

        <DoubleBezelCard>
          <div style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>POD Confirmations</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)', marginTop: '4px' }}>
              {deliveries.filter(d => d.status === 'DELIVERED').length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Customer accepted & stamped</div>
          </div>
        </DoubleBezelCard>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', gap: '16px' }}>
        {[
          { id: 'finishedGoods', label: 'Finished Goods Bay', count: finishedGoods.length },
          { id: 'packing', label: 'Packing & Crating Slips', count: packings.length },
          { id: 'finalInvoices', label: 'Commercial Tax Invoices', count: finalInvoices.length },
          { id: 'dispatch', label: 'Dispatches & Shipments', count: dispatches.length },
          { id: 'deliveries', label: 'POD Delivery Receipts', count: deliveries.length }
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
      {activeTab === 'finishedGoods' && (
        <DoubleBezelCard>
          <div style={{ padding: '16px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Finished Goods Inventory (Pre-Dispatch Staging)</h3>
            <DataTable
              loading={loading}
              columns={[
                {
                  key: 'serialNumber',
                  header: 'Serial Number',
                  render: (row) => (
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cryo)', fontWeight: 600 }}>
                      {row.serialNumber?.serialNumber || row.serialNumberString || 'CRYO-FG-001'}
                    </span>
                  )
                },
                {
                  key: 'product',
                  header: 'Product Model',
                  render: (row) => row.product?.name || row.product?.modelNumber || 'Ultra-Low Freezer (-86°C)'
                },
                {
                  key: 'warehouse',
                  header: 'Storage Location',
                  render: (row) => row.warehouse?.name || 'Chennai Dispatch Bay - Bay 3'
                },
                {
                  key: 'status',
                  header: 'Release Status',
                  render: (row) => <StatusBadge status={row.status || 'RELEASED'} />
                },
                {
                  key: 'date',
                  header: 'Passed QA Date',
                  render: (row) => new Date(row.createdAt).toLocaleDateString()
                }
              ]}
              data={finishedGoods}
            />
          </div>
        </DoubleBezelCard>
      )}

      {activeTab === 'packing' && (
        <DoubleBezelCard>
          <div style={{ padding: '16px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Crating & Packing Registry</h3>
            <DataTable
              loading={loading}
              columns={[
                {
                  key: 'packingNumber',
                  header: 'Slip Number',
                  render: (row) => (
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cryo)', fontWeight: 600 }}>
                      {row.packingNumber}
                    </span>
                  )
                },
                {
                  key: 'salesOrder',
                  header: 'Sales Order Ref',
                  render: (row) => (
                    <span style={{ fontFamily: 'var(--font-mono)' }}>
                      {row.salesOrder?.orderNumber || 'SO-2026-0001'}
                    </span>
                  )
                },
                {
                  key: 'customer',
                  header: 'Customer',
                  render: (row) => row.customer?.companyName || 'Biocon Biologics Ltd'
                },
                {
                  key: 'packagingType',
                  header: 'Enclosure Spec',
                  render: (row) => (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {row.packagingType} ({row.grossWeightKg || 250} kg)
                    </span>
                  )
                },
                {
                  key: 'checklist',
                  header: 'Checklist Compliance',
                  render: (row) => (
                    <div style={{ display: 'flex', gap: '4px', fontSize: '0.75rem' }}>
                      <span title="Manual" style={{ color: row.checklist?.operationManualIncluded ? 'var(--success)' : 'var(--text-muted)' }}>[DOCS]</span>
                      <span title="Calibration" style={{ color: row.checklist?.calibrationCertificateIncluded ? 'var(--success)' : 'var(--text-muted)' }}>[CALIB]</span>
                      <span title="Warranty Card" style={{ color: row.checklist?.warrantyCardIncluded ? 'var(--success)' : 'var(--text-muted)' }}>[WARRANTY]</span>
                    </div>
                  )
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (row) => <StatusBadge status={row.status || 'PACKED'} />
                }
              ]}
              data={packings}
            />
          </div>
        </DoubleBezelCard>
      )}

      {activeTab === 'finalInvoices' && (
        <DoubleBezelCard>
          <div style={{ padding: '16px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Commercial GST Tax Invoices</h3>
            <DataTable
              loading={loading}
              columns={[
                {
                  key: 'invoiceNumber',
                  header: 'Tax Invoice Number',
                  render: (row) => (
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cryo)', fontWeight: 600 }}>
                      {row.invoiceNumber}
                    </span>
                  )
                },
                {
                  key: 'customer',
                  header: 'Billed Customer',
                  render: (row) => row.customer?.companyName || 'Apollo Research Foundation'
                },
                {
                  key: 'salesOrder',
                  header: 'Sales Order Ref',
                  render: (row) => row.salesOrder?.orderNumber || 'SO-2026-0001'
                },
                {
                  key: 'grandTotal',
                  header: 'Grand Total (INR)',
                  render: (row) => (
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--success)' }}>
                      ₹{row.grandTotal?.toLocaleString('en-IN') || '0'}
                    </span>
                  )
                },
                {
                  key: 'status',
                  header: 'Tax Status',
                  render: (row) => <StatusBadge status={row.status || 'ISSUED'} />
                },
                {
                  key: 'dueDate',
                  header: 'Due Date',
                  render: (row) => new Date(row.dueDate).toLocaleDateString()
                }
              ]}
              data={finalInvoices}
            />
          </div>
        </DoubleBezelCard>
      )}

      {activeTab === 'dispatch' && (
        <DoubleBezelCard>
          <div style={{ padding: '16px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Outward Dispatches & Consignments</h3>
            <DataTable
              loading={loading}
              columns={[
                {
                  key: 'dispatchNumber',
                  header: 'Dispatch Docket',
                  render: (row) => (
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cryo)', fontWeight: 600 }}>
                      {row.dispatchNumber}
                    </span>
                  )
                },
                {
                  key: 'customer',
                  header: 'Destination Customer',
                  render: (row) => row.customer?.companyName || 'Serum Institute of India'
                },
                {
                  key: 'transporter',
                  header: 'Transporter & LR',
                  render: (row) => (
                    <div>
                      <div style={{ fontWeight: 600 }}>{row.transporterName || 'Direct Logistics'}</div>
                      <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        LR: {row.trackingNumber} | Veh: {row.vehicleNumber || 'N/A'}
                      </div>
                    </div>
                  )
                },
                {
                  key: 'eWayBill',
                  header: 'e-Way Bill No',
                  render: (row) => (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                      {row.eWayBillNumber || '341098234891'}
                    </span>
                  )
                },
                {
                  key: 'status',
                  header: 'Dispatch State',
                  render: (row) => <StatusBadge status={row.status || 'DISPATCHED'} />
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  render: (row) => (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {row.status === 'DISPATCHED' && (
                        <>
                          <PermissionGuard permission="DELIVERY_UPDATE">
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                              onClick={() => {
                                setSelectedDispatch(row);
                                setIsPodModalOpen(true);
                              }}
                            >
                              Confirm POD
                            </button>
                            <button
                              className="btn btn-danger"
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                              onClick={() => {
                                setSelectedDispatch(row);
                                setIsFailureModalOpen(true);
                              }}
                            >
                              Flag Failed
                            </button>
                          </PermissionGuard>
                        </>
                      )}
                    </div>
                  )
                }
              ]}
              data={dispatches}
            />
          </div>
        </DoubleBezelCard>
      )}

      {activeTab === 'deliveries' && (
        <DoubleBezelCard>
          <div style={{ padding: '16px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Delivery Confirmations & POD Proofs</h3>
            <DataTable
              loading={loading}
              columns={[
                {
                  key: 'deliveryNumber',
                  header: 'Delivery Receipt #',
                  render: (row) => (
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cryo)', fontWeight: 600 }}>
                      {row.deliveryNumber}
                    </span>
                  )
                },
                {
                  key: 'customer',
                  header: 'Customer Entity',
                  render: (row) => row.customer?.companyName || 'Customer Facility'
                },
                {
                  key: 'receivedBy',
                  header: 'Received & Stamped By',
                  render: (row) => (
                    <div>
                      <div style={{ fontWeight: 600 }}>{row.podDetails?.receivedBy || 'Store Manager'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{row.podDetails?.remarks}</div>
                    </div>
                  )
                },
                {
                  key: 'status',
                  header: 'Confirmation Status',
                  render: (row) => <StatusBadge status={row.status || 'DELIVERED'} />
                },
                {
                  key: 'date',
                  header: 'Delivered On',
                  render: (row) => new Date(row.createdAt).toLocaleDateString()
                }
              ]}
              data={deliveries}
            />
          </div>
        </DoubleBezelCard>
      )}

      {/* CREATE PACKING MODAL */}
      <Modal
        isOpen={isPackingModalOpen}
        onClose={() => setIsPackingModalOpen(false)}
        title="Issue Crating & Packing Slip"
        subtitle="Verify crating compliance, dimensional specs, and essential document inclusions."
      >
        <form onSubmit={handleCreatePacking} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="label">Sales Order Reference *</label>
            <select
              className="form-control"
              value={packingForm.salesOrder}
              onChange={(e) => setPackingForm({ ...packingForm, salesOrder: e.target.value })}
              required
            >
              <option value="">Select Sales Order...</option>
              {salesOrders.map(so => (
                <option key={so._id} value={so._id}>
                  {so.orderNumber} - {so.customer?.companyName || 'Client'} (₹{so.grandTotal?.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Finished Goods Serial Number *</label>
            <select
              className="form-control"
              value={packingForm.serialNumbers[0] || ''}
              onChange={(e) => setPackingForm({ ...packingForm, serialNumbers: [e.target.value] })}
              required
            >
              <option value="">Select Finished Serial...</option>
              {finishedGoods.map(fg => (
                <option key={fg._id} value={fg.serialNumber?._id || fg._id}>
                  {fg.serialNumber?.serialNumber || fg.serialNumberString || fg._id} ({fg.product?.name || 'Unit'})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="label">Packaging Type</label>
              <select
                className="form-control"
                value={packingForm.packagingType}
                onChange={(e) => setPackingForm({ ...packingForm, packagingType: e.target.value })}
              >
                <option value="WOODEN_CRATE">Reinforced Wooden Crate</option>
                <option value="CORRUGATED_BOX">Double-wall Corrugated Box</option>
                <option value="HEAVY_DUTY_PALLET">Heavy-Duty Pallet with Shrinkwrap</option>
                <option value="CUSTOM_CONTAINER">Custom Climate-Shield Container</option>
              </select>
            </div>
            <div>
              <label className="label">Gross Weight (kg)</label>
              <input
                type="number"
                className="form-control"
                value={packingForm.grossWeightKg}
                onChange={(e) => setPackingForm({ ...packingForm, grossWeightKg: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Package Dimensions</label>
            <input
              type="text"
              className="form-control"
              value={packingForm.dimensions}
              onChange={(e) => setPackingForm({ ...packingForm, dimensions: e.target.value })}
            />
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-cryo)', marginBottom: '8px' }}>
              Enclosure Mandatory Checklist:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="checkbox"
                  checked={packingForm.operationManualIncluded}
                  onChange={(e) => setPackingForm({ ...packingForm, operationManualIncluded: e.target.checked })}
                />
                Operation Manual
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="checkbox"
                  checked={packingForm.calibrationCertificateIncluded}
                  onChange={(e) => setPackingForm({ ...packingForm, calibrationCertificateIncluded: e.target.checked })}
                />
                Calibration Certificate
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="checkbox"
                  checked={packingForm.powerCordIncluded}
                  onChange={(e) => setPackingForm({ ...packingForm, powerCordIncluded: e.target.checked })}
                />
                Heavy-Duty Power Cord
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="checkbox"
                  checked={packingForm.warrantyCardIncluded}
                  onChange={(e) => setPackingForm({ ...packingForm, warrantyCardIncluded: e.target.checked })}
                />
                Warranty Card (12 Mo)
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsPackingModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Verify & Create Packing Slip</button>
          </div>
        </form>
      </Modal>

      {/* CREATE FINAL INVOICE MODAL */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Generate Commercial GST Tax Invoice"
        subtitle="Produces official tax invoice referencing Sales Order and serial assignments."
      >
        <form onSubmit={handleCreateInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="label">Sales Order Reference *</label>
            <select
              className="form-control"
              value={invoiceForm.salesOrderId}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, salesOrderId: e.target.value })}
              required
            >
              <option value="">Select Sales Order...</option>
              {salesOrders.map(so => (
                <option key={so._id} value={so._id}>
                  {so.orderNumber} - {so.customer?.companyName || 'Client'} (₹{so.grandTotal?.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Payment Terms</label>
            <input
              type="text"
              className="form-control"
              value={invoiceForm.paymentTerms}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, paymentTerms: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Invoice Due Date</label>
            <input
              type="date"
              className="form-control"
              value={invoiceForm.dueDate}
              onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsInvoiceModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Generate Tax Invoice</button>
          </div>
        </form>
      </Modal>

      {/* CREATE DISPATCH MODAL */}
      <Modal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        title="Dispatch Outward Consignment"
        subtitle="Generate outbound shipping docket with Transporter, LR number, and e-Way bill."
      >
        <form onSubmit={handleCreateDispatch} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="label">Sales Order *</label>
            <select
              className="form-control"
              value={dispatchForm.salesOrder}
              onChange={(e) => setDispatchForm({ ...dispatchForm, salesOrder: e.target.value })}
              required
            >
              <option value="">Select Sales Order...</option>
              {salesOrders.map(so => (
                <option key={so._id} value={so._id}>
                  {so.orderNumber} - {so.customer?.companyName}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="label">Final Tax Invoice Ref *</label>
              <select
                className="form-control"
                value={dispatchForm.finalInvoice}
                onChange={(e) => setDispatchForm({ ...dispatchForm, finalInvoice: e.target.value })}
                required
              >
                <option value="">Select Invoice...</option>
                {finalInvoices.map(inv => (
                  <option key={inv._id} value={inv._id}>
                    {inv.invoiceNumber} (₹{inv.grandTotal?.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Packing Slip Ref *</label>
              <select
                className="form-control"
                value={dispatchForm.packing}
                onChange={(e) => setDispatchForm({ ...dispatchForm, packing: e.target.value })}
                required
              >
                <option value="">Select Packing Slip...</option>
                {packings.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.packingNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Serial Unit Assigned *</label>
            <select
              className="form-control"
              value={dispatchForm.serialNumbers[0] || ''}
              onChange={(e) => setDispatchForm({ ...dispatchForm, serialNumbers: [e.target.value] })}
              required
            >
              <option value="">Select Serial Number...</option>
              {finishedGoods.map(fg => (
                <option key={fg._id} value={fg.serialNumber?._id || fg._id}>
                  {fg.serialNumber?.serialNumber || fg.serialNumberString || fg._id}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label className="label">Transporter Name *</label>
              <input
                type="text"
                className="form-control"
                value={dispatchForm.transporterName}
                onChange={(e) => setDispatchForm({ ...dispatchForm, transporterName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Lorry Receipt (LR) / Tracking # *</label>
              <input
                type="text"
                className="form-control"
                value={dispatchForm.trackingNumber}
                onChange={(e) => setDispatchForm({ ...dispatchForm, trackingNumber: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label className="label">Vehicle Number</label>
              <input
                type="text"
                className="form-control"
                value={dispatchForm.vehicleNumber}
                onChange={(e) => setDispatchForm({ ...dispatchForm, vehicleNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Driver Contact</label>
              <input
                type="text"
                className="form-control"
                value={dispatchForm.driverPhone}
                onChange={(e) => setDispatchForm({ ...dispatchForm, driverPhone: e.target.value })}
              />
            </div>
            <div>
              <label className="label">e-Way Bill #</label>
              <input
                type="text"
                className="form-control"
                value={dispatchForm.eWayBillNumber}
                onChange={(e) => setDispatchForm({ ...dispatchForm, eWayBillNumber: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsDispatchModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Register Dispatch Docket</button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM POD MODAL */}
      <Modal
        isOpen={isPodModalOpen}
        onClose={() => setIsPodModalOpen(false)}
        title="Confirm Proof of Delivery (POD)"
        subtitle={`Record receiver credentials for ${selectedDispatch?.dispatchNumber}`}
      >
        <form onSubmit={handleCompletePOD} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="label">Received By (Officer Name / Title) *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Dr. Rajesh Kumar - Lab In-Charge"
              value={podForm.receivedBy}
              onChange={(e) => setPodForm({ ...podForm, receivedBy: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Inspection & Handover Remarks</label>
            <textarea
              className="form-control"
              rows={3}
              value={podForm.remarks}
              onChange={(e) => setPodForm({ ...podForm, remarks: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsPodModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-success">Verify & Stamp POD</button>
          </div>
        </form>
      </Modal>

      {/* DELIVERY FAILURE MODAL */}
      <Modal
        isOpen={isFailureModalOpen}
        onClose={() => setIsFailureModalOpen(false)}
        title="Log Delivery Failure Attempt"
        subtitle={`Flag exception for ${selectedDispatch?.dispatchNumber}`}
      >
        <form onSubmit={handleReportFailure} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="label">Reason for Delivery Exception *</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="e.g. Consignee facility gate locked / unauthorized recipient."
              value={failureForm.reason}
              onChange={(e) => setFailureForm({ ...failureForm, reason: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsFailureModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-danger">Log Delivery Failure</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LogisticsPage;
