import React from 'react';

export const PullDownChart = ({
  targetTemp = -80,
  currentTemp = -80.2,
  durationHours = 24,
  testStatus = 'PASSED',
  testId = 'QA-TEST-LOG'
}) => {
  // Generate a realistic exponential cooling pull-down curve points
  // From +25°C down to targetTemp (-80°C), then holding with micro-variations
  const width = 640;
  const height = 240;
  const padding = 45;

  const pointsCount = 40;
  const points = [];

  for (let i = 0; i <= pointsCount; i++) {
    const t = i / pointsCount; // 0 to 1
    // Exponential decay: T(t) = target + (25 - target) * exp(-5 * t) + noise
    const temp =
      targetTemp +
      (25 - targetTemp) * Math.exp(-4.5 * t) +
      (t > 0.5 ? (Math.sin(i * 1.5) * 0.4) : 0);

    const x = padding + t * (width - 2 * padding);
    // Map temp (+30°C to -90°C) to y
    const tempRange = 30 - (-90);
    const y = padding + ((30 - temp) / tempRange) * (height - 2 * padding);
    points.push({ x, y, temp: temp.toFixed(1), hour: (t * durationHours).toFixed(1) });
  }

  const pathD = points.reduce(
    (acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ''
  );

  const targetY = padding + ((30 - targetTemp) / 120) * (height - 2 * padding);

  return (
    <div
      style={{
        background: 'var(--bg-surface-raised)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '16px',
        position: 'relative'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="telemetry-code">{testId}</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Temperature Pull-down Telemetry Curve
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Setpoint: </span>
            <span className="temperature-gauge" style={{ fontSize: '0.85rem' }}>{targetTemp}°C</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Achieved: </span>
            <span
              className="temperature-gauge"
              style={{ fontSize: '1.1rem', color: testStatus === 'PASSED' ? '#38bdf8' : '#f43f5e' }}
            >
              {currentTemp}°C
            </span>
          </div>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="40%" stopColor="#06b6d4" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[20, 0, -20, -40, -60, -80].map((tVal) => {
          const yPos = padding + ((30 - tVal) / 120) * (height - 2 * padding);
          return (
            <g key={tVal}>
              <line
                x1={padding}
                y1={yPos}
                x2={width - padding}
                y2={yPos}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="4 4"
              />
              <text
                x={padding - 8}
                y={yPos + 4}
                fill="#64748b"
                fontSize="10"
                fontFamily="var(--font-mono)"
                textAnchor="end"
              >
                {tVal}°
              </text>
            </g>
          );
        })}

        {/* Target Setpoint dashed reference line */}
        <line
          x1={padding}
          y1={targetY}
          x2={width - padding}
          y2={targetY}
          stroke="#06b6d4"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          opacity="0.6"
        />

        {/* Gradient Area under curve */}
        <path
          d={`${pathD} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`}
          fill="url(#areaGradient)"
        />

        {/* Dynamic Temperature Curve */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#curveGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Active sensor point */}
        {points[points.length - 1] && (
          <g>
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r="6"
              fill="#38bdf8"
              opacity="0.8"
            />
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r="3"
              fill="#ffffff"
            />
          </g>
        )}
      </svg>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '6px',
          paddingLeft: '45px',
          paddingRight: '45px',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)'
        }}
      >
        <span>0.0h (Start)</span>
        <span>6.0h (Cascade)</span>
        <span>12.0h (-60°C Hold)</span>
        <span>{durationHours}.0h (Target Stabilization)</span>
      </div>
    </div>
  );
};

export default PullDownChart;
