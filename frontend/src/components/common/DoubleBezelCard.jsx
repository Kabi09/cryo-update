import React from 'react';

export const DoubleBezelCard = ({
  title,
  subtitle,
  badge,
  action,
  children,
  className = '',
  innerStyle = {},
  style = {}
}) => {
  return (
    <div className={`double-bezel ${className}`} style={style}>
      <div className="inner-core" style={innerStyle}>
        {(title || badge || action) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '1px solid var(--border-subtle)',
              flexWrap: 'wrap',
              gap: '8px'
            }}
          >
            <div>
              {title && (
                <h3
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {title}
                  {badge}
                </h3>
              )}
              {subtitle && (
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    marginTop: '2px'
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>
            {action && <div>{action}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default DoubleBezelCard;
