import React, { useState, useEffect } from 'react';
import DoubleBezelCard from '../../components/DoubleBezelCard';
import StatusBadge from '../../components/StatusBadge';
import governanceApi from '../../services/api/governanceApi';
import { useNotifications } from '../../contexts/NotificationContext';
import { 
  BarChart, 
  TrendingUp, 
  Speed, 
  Verified, 
  Engineering, 
  AccountBalanceWallet, 
  Refresh 
} from '@mui/icons-material';

const ReportsPage = () => {
  const { showError } = useNotifications();
  const [salesReport, setSalesReport] = useState(null);
  const [productionReport, setProductionReport] = useState(null);
  const [qualityReport, setQualityReport] = useState(null);
  const [serviceReport, setServiceReport] = useState(null);
  const [dashboardMetrics, setDashboardMetrics] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadAllReports = async () => {
    try {
      setLoading(true);
      const [salesRes, prodRes, qaRes, srvRes, dashRes] = await Promise.all([
        governanceApi.getSalesReport().catch(() => ({ data: { data: null } })),
        governanceApi.getProductionReport().catch(() => ({ data: { data: null } })),
        governanceApi.getQualityReport().catch(() => ({ data: { data: null } })),
        governanceApi.getServiceReport().catch(() => ({ data: { data: null } })),
        governanceApi.getDashboardMetrics().catch(() => ({ data: { data: null } }))
      ]);

      setSalesReport(salesRes.data?.data);
      setProductionReport(prodRes.data?.data);
      setQualityReport(qaRes.data?.data);
      setServiceReport(srvRes.data?.data);
      setDashboardMetrics(dashRes.data?.data);
    } catch (err) {
      showError(err.message || 'Failed to aggregate enterprise analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllReports();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cryo)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
            <BarChart style={{ fontSize: '1.1rem' }} /> Executive Intelligence
          </div>
          <h1 style={{ margin: '4px 0 0', fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Enterprise Reports & KPI Telemetry
          </h1>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Real-time multi-echelon analytics across Sales Conversion, Production Throughput, QA Pass Yields, and SLA Compliance.
          </p>
        </div>

        <div>
          <button className="btn btn-secondary" onClick={loadAllReports} disabled={loading}>
            <Refresh style={{ fontSize: '1rem', marginRight: '6px' }} />
            {loading ? 'Aggregating...' : 'Refresh Telemetry'}
          </button>
        </div>
      </div>

      {/* Financial & Revenue Highlights */}
      {dashboardMetrics?.sales && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <DoubleBezelCard>
            <div style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Total Booked Revenue</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-cryo)', marginTop: '4px' }}>
                ₹{(dashboardMetrics.sales.totalRevenue || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>All confirmed sales orders</div>
            </div>
          </DoubleBezelCard>

          <DoubleBezelCard>
            <div style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Collections Received</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)', marginTop: '4px' }}>
                ₹{(dashboardMetrics.sales.totalCollected || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Verified payments realized</div>
            </div>
          </DoubleBezelCard>

          <DoubleBezelCard>
            <div style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Outstanding Receivables</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--warning)', marginTop: '4px' }}>
                ₹{(dashboardMetrics.sales.outstandingReceivables || 0).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Pending client balances</div>
            </div>
          </DoubleBezelCard>

          <DoubleBezelCard>
            <div style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Active Shopfloor Jobs</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
                {dashboardMetrics.operations?.activeProductionJobs || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Across 4 fabrication bays</div>
            </div>
          </DoubleBezelCard>
        </div>
      )}

      {/* Grid of Report Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '20px' }}>
        {/* Sales Conversion Funnel */}
        <DoubleBezelCard>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <TrendingUp style={{ color: 'var(--accent-cryo)' }} />
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Sales Pipeline & Funnel Conversion</h3>
            </div>

            {salesReport ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span>Lead ➔ Enquiry Conversion Rate</span>
                    <strong style={{ color: 'var(--accent-cryo)', fontFamily: 'var(--font-mono)' }}>{salesReport.leads?.conversionRate || '0%'}</strong>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                    <div style={{ background: 'var(--accent-cryo)', height: '100%', width: salesReport.leads?.conversionRate || '0%' }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {salesReport.leads?.converted} converted out of {salesReport.leads?.total} total logged leads
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span>Quotation ➔ Customer Acceptance Rate</span>
                    <strong style={{ color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>{salesReport.quotations?.acceptanceRate || '0%'}</strong>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                    <div style={{ background: 'var(--success)', height: '100%', width: salesReport.quotations?.acceptanceRate || '0%' }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {salesReport.quotations?.accepted} accepted proposals of {salesReport.quotations?.total} active quotes
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Confirmed Orders Won</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{salesReport.salesOrders?.count || 0} Orders</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Cumulative Value</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>
                      ₹{(salesReport.salesOrders?.totalValue || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No sales funnel data available.</div>
            )}
          </div>
        </DoubleBezelCard>

        {/* Quality & Pull-Down Yield */}
        <DoubleBezelCard>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Verified style={{ color: 'var(--success)' }} />
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Quality Assurance & Pull-Down Yield</h3>
            </div>

            {qualityReport ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(34, 197, 94, 0.08)', padding: '14px', borderRadius: '4px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>FIRST-PASS QUALITY YIELD</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>
                      {qualityReport.passRate}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div>Stabilization Pass: <strong>{qualityReport.passed}</strong></div>
                    <div style={{ color: 'var(--danger)', marginTop: '2px' }}>Deviations / Failures: <strong>{qualityReport.failed}</strong></div>
                    <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>Scrapped: <strong>{qualityReport.scrapped}</strong></div>
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Units must complete mandatory 4-hour thermal stabilization at -80°C within +/- 1.0°C tolerance band to earn serial barcode issuance.
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No quality records available.</div>
            )}
          </div>
        </DoubleBezelCard>

        {/* Production Throughput */}
        <DoubleBezelCard>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Speed style={{ color: '#38bdf8' }} />
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Manufacturing Shopfloor Velocity</h3>
            </div>

            {productionReport ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '4px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PLANNED</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {productionReport.planned}
                  </div>
                </div>

                <div style={{ background: 'rgba(56, 189, 248, 0.05)', padding: '12px', borderRadius: '4px', textAlign: 'center', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#38bdf8' }}>IN PROGRESS</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
                    {productionReport.inProgress}
                  </div>
                </div>

                <div style={{ background: 'rgba(34, 197, 94, 0.05)', padding: '12px', borderRadius: '4px', textAlign: 'center', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>COMPLETED</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)', marginTop: '4px' }}>
                    {productionReport.completed}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No production statistics found.</div>
            )}
          </div>
        </DoubleBezelCard>

        {/* Field Service SLA */}
        <DoubleBezelCard>
          <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Engineering style={{ color: 'var(--warning)' }} />
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Customer Support & Field Service SLA</h3>
            </div>

            {serviceReport ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '12px', borderRadius: '4px', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>OPEN TICKETS</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--danger)', marginTop: '4px' }}>
                    {serviceReport.open}
                  </div>
                </div>

                <div style={{ background: 'rgba(234, 179, 8, 0.05)', padding: '12px', borderRadius: '4px', textAlign: 'center', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--warning)' }}>DIAGNOSING</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--warning)', marginTop: '4px' }}>
                    {serviceReport.inProgress}
                  </div>
                </div>

                <div style={{ background: 'rgba(34, 197, 94, 0.05)', padding: '12px', borderRadius: '4px', textAlign: 'center', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>RESOLVED</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--success)', marginTop: '4px' }}>
                    {serviceReport.closed}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No service ticket metrics found.</div>
            )}
          </div>
        </DoubleBezelCard>
      </div>
    </div>
  );
};

export default ReportsPage;
