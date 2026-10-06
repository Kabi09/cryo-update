import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { governanceApi } from '../../services/api/governanceApi';
import { useAuth } from '../../contexts/AuthContext';
import DoubleBezelCard from '../../components/common/DoubleBezelCard';
import PullDownChart from '../../components/common/PullDownChart';

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await governanceApi.getDashboardMetrics();
        setMetrics(res.data);
      } catch (err) {
        console.error('Could not load dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const kpis = [
    {
      title: 'Active Leads & Enquiries',
      value: metrics ? (metrics.leads?.new || 0) + (metrics.leads?.qualified || 0) : '...',
      sub: `${metrics?.leads?.converted || 0} Converted`,
      icon: '🎯',
      color: '#38bdf8',
      link: '/sales/leads'
    },
    {
      title: 'Commercial Quotations',
      value: metrics ? (metrics.quotations?.pendingApproval || 0) + (metrics.quotations?.accepted || 0) : '...',
      sub: `${metrics?.quotations?.pendingApproval || 0} Pending Approval`,
      icon: '💼',
      color: '#06b6d4',
      link: '/sales/quotations'
    },
    {
      title: 'Orders in Production',
      value: metrics?.production?.inProgress || 0,
      sub: `${metrics?.production?.completed || 0} Stage Completed`,
      icon: '⚙️',
      color: '#10b981',
      link: '/production/orders'
    },
    {
      title: 'QA Testing Bay',
      value: metrics?.qa?.pendingInspection || 0,
      sub: `${metrics?.qa?.passed || 0} Units Certified`,
      icon: '❄️',
      color: '#f59e0b',
      link: '/quality/inspections'
    },
    {
      title: 'Ready for Dispatch',
      value: metrics?.logistics?.readyForDispatch || 0,
      sub: 'Awaiting Transporter / POD',
      icon: '🚛',
      color: '#818cf8',
      link: '/logistics/dispatch'
    },
    {
      title: 'Open Field Incidents',
      value: metrics?.service?.openTickets || 0,
      sub: 'Warranty Validated Units',
      icon: '🎫',
      color: '#f43f5e',
      link: '/service/tickets'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 28px',
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(2, 132, 199, 0.05) 100%)',
          border: '1px solid var(--border-active)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-subtle)',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="telemetry-code">PLANT 01 — CHENNAI</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-cryo)', fontWeight: 600 }}>
              PRECISION CRYOGENICS OPERATIONAL
            </span>
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 700, color: '#ffffff' }}>
            Welcome back, {user?.name}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Monitoring medical refrigeration manufacturing, quality pull-down curves, and customer lifecycle.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className="btn btn-outline" onClick={() => navigate('/quality/traceability')}>
            <span>🔗</span> Trace Serial Number
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/sales/leads')}>
            <span>➕</span> Capture Inward Lead
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px'
        }}
      >
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="double-bezel"
            onClick={() => navigate(kpi.link)}
            style={{ cursor: 'pointer' }}
          >
            <div className="inner-core" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {kpi.title}
                </span>
                <span
                  style={{
                    fontSize: '1.25rem',
                    background: 'rgba(255,255,255,0.05)',
                    padding: '6px',
                    borderRadius: '8px'
                  }}
                >
                  {kpi.icon}
                </span>
              </div>
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  fontFamily: 'var(--font-mono)',
                  margin: '8px 0 4px 0'
                }}
              >
                {kpi.value}
              </div>
              <div style={{ fontSize: '0.75rem', color: kpi.color, fontWeight: 500 }}>
                {kpi.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Telemetry Chamber & Quick Action Stepper */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '24px'
        }}
      >
        {/* Real-time Pull-down Telemetry Curve Widget */}
        <DoubleBezelCard
          title="Active QA Pull-down Testing Bay"
          subtitle="Real-time temperature drawdown curve: Model CRYO-ULT-500L (-80°C)"
          action={
            <button
              className="btn btn-sm btn-outline"
              onClick={() => navigate('/quality/inspections')}
            >
              Bay 04 Details →
            </button>
          }
        >
          <PullDownChart
            targetTemp={-80}
            currentTemp={-80.4}
            durationHours={24}
            testStatus="PASSED"
            testId="QA-BAY-04 / SN-CRYO-000101"
          />
        </DoubleBezelCard>

        {/* Manufacturing & Commercial Pipeline Overview */}
        <DoubleBezelCard
          title="Connected Business Workflow Gates"
          subtitle="Unified cross-departmental lifecycle enforcement"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'var(--bg-surface-raised)',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                  1. Advance Payment Release Gate
                </div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Production orders locked until Accounts verifies 30% advance receipt
                </div>
              </div>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => navigate('/finance/payments')}
              >
                Verify Advance
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'var(--bg-surface-raised)',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                  2. Shopfloor Stage Progression
                </div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Fabrication ➔ Refrigeration ➔ Electrical ➔ Assembly ➔ Inspection
                </div>
              </div>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => navigate('/production/orders')}
              >
                Advance Stage
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'var(--bg-surface-raised)',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                  3. Serialization & Warranty Activation
                </div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Unique Serial barcode issued upon QA pass; Warranty auto-activated at commissioning
                </div>
              </div>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => navigate('/quality/traceability')}
              >
                Trace Unit
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'var(--bg-surface-raised)',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                  4. Tally Prime Commercial Sync
                </div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  GST Tax Invoices exported automatically in XML ledger format
                </div>
              </div>
              <button
                className="btn btn-sm btn-outline"
                onClick={() => navigate('/finance/tally')}
              >
                View Sync Logs
              </button>
            </div>
          </div>
        </DoubleBezelCard>
      </div>
    </div>
  );
};

export default DashboardPage;
