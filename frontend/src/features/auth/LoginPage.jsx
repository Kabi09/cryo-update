import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import DoubleBezelCard from '../../components/common/DoubleBezelCard';

const DEMO_ROLES = [
  { role: 'ADMIN', email: 'admin@cryo.com', title: 'Super Admin', desc: 'System governance & global overrides' },
  { role: 'SALES', email: 'sales@cryo.com', title: 'Sales Executive', desc: 'Leads, quotations & customer POs' },
  { role: 'SALES_MANAGER', email: 'salesmanager@cryo.com', title: 'Sales Manager', desc: 'Quotation approvals & PO verification' },
  { role: 'ACCOUNTS', email: 'accounts@cryo.com', title: 'Accounts Officer', desc: 'Payment verification & production release gate' },
  { role: 'PRODUCTION', email: 'production@cryo.com', title: 'Production Supv', desc: 'Shopfloor stage advancement & BOMs' },
  { role: 'STORE', email: 'store@cryo.com', title: 'Store Keeper', desc: 'Inventory issuance & warehouse transfers' },
  { role: 'QA', email: 'qa@cryo.com', title: 'QA Engineer', desc: 'Pull-down testing & serial numbers' },
  { role: 'DISPATCH', email: 'dispatch@cryo.com', title: 'Dispatch Executive', desc: 'Packing, tax invoices & POD tracking' },
  { role: 'SERVICE_ENGINEER', email: 'serviceengineer@cryo.com', title: 'Field Engineer', desc: 'Site commissioning & breakdown tickets' }
];

export const LoginPage = () => {
  const [email, setEmail] = useState('sales@cryo.com');
  const [password, setPassword] = useState('Password@123');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      showToast('Authentication successful', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message || 'Authentication failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password@123');
    setSubmitting(true);
    try {
      await login(demoEmail, 'Password@123');
      showToast(`Logged in as ${demoEmail}`, 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message || 'Quick login failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% 20%, #172554 0%, #080d19 70%)',
        padding: '24px'
      }}
    >
      <div style={{ width: '100%', maxWidth: '980px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'var(--accent-gradient)',
              fontSize: '1.75rem',
              color: '#ffffff',
              boxShadow: '0 0 30px rgba(6, 182, 212, 0.4)',
              marginBottom: '16px'
            }}
          >
            ❄
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>
            CRYO SCIENTIFIC SYSTEMS
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Enterprise Manufacturing ERP & Telemetry Platform — Chennai Factory
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
          {/* Main Credentials Form */}
          <DoubleBezelCard title="Sign In with Credentials" subtitle="Access authorized factory telemetry">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Corporate Email</label>
                <input
                  type="email"
                  className="input-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@cryo.com"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Security Password</label>
                <input
                  type="password"
                  className="input-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={submitting}
                style={{ marginTop: '8px' }}
              >
                {submitting ? 'Authenticating...' : 'Authenticate & Enter ERP →'}
              </button>

              <div
                style={{
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.775rem',
                  color: 'var(--text-muted)'
                }}
              >
                Default seed password for all test roles is: <strong style={{ color: 'var(--accent-cryo)' }}>Password@123</strong>
              </div>
            </form>
          </DoubleBezelCard>

          {/* Quick Demo Access Grid */}
          <DoubleBezelCard
            title="1-Click Developer Role Access"
            subtitle="Switch persona to test role-based permissions"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '340px', overflowY: 'auto' }}>
              {DEMO_ROLES.map((r) => (
                <div
                  key={r.email}
                  onClick={() => handleQuickLogin(r.email)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'var(--bg-surface-raised)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-cryo)';
                    e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.background = 'var(--bg-surface-raised)';
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      {r.title}
                    </div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{r.desc}</div>
                  </div>
                  <span className="telemetry-code" style={{ fontSize: '0.7rem' }}>
                    {r.role}
                  </span>
                </div>
              ))}
            </div>
          </DoubleBezelCard>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
