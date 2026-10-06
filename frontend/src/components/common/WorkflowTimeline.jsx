import React from 'react';

export const WorkflowTimeline = ({ steps = [], currentStepIndex = 0 }) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        padding: '16px 0',
        overflowX: 'auto',
        gap: '8px'
      }}
    >
      {steps.map((step, idx) => {
        const isPast = idx < currentStepIndex;
        const isCurrent = idx === currentStepIndex;

        return (
          <React.Fragment key={step.key || idx}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '120px',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                  background: isPast
                    ? 'var(--color-success)'
                    : isCurrent
                    ? 'var(--accent-gradient)'
                    : 'var(--bg-surface-raised)',
                  color: isPast || isCurrent ? '#ffffff' : 'var(--text-muted)',
                  border: isCurrent
                    ? '2px solid #38bdf8'
                    : isPast
                    ? '2px solid #10b981'
                    : '1px solid var(--border-subtle)',
                  boxShadow: isCurrent ? '0 0 12px rgba(6, 182, 212, 0.4)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                {isPast ? '✓' : idx + 1}
              </div>
              <span
                style={{
                  marginTop: '8px',
                  fontSize: '0.775rem',
                  fontWeight: isCurrent ? 600 : 500,
                  color: isCurrent
                    ? 'var(--accent-cryo)'
                    : isPast
                    ? 'var(--text-primary)'
                    : 'var(--text-muted)',
                  whiteSpace: 'nowrap'
                }}
              >
                {step.label}
              </span>
              {step.date && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {step.date}
                </span>
              )}
            </div>

            {idx < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: '2px',
                  minWidth: '40px',
                  background: isPast
                    ? 'var(--color-success)'
                    : 'var(--border-subtle)',
                  transition: 'background 0.3s ease'
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default WorkflowTimeline;
