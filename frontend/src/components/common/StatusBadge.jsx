import React from 'react';

const STATUS_CLASS_MAP = {
  // Positive / Cleared
  PASSED: 'status-success',
  QUALIFIED: 'status-success',
  APPROVED: 'status-success',
  ACCEPTED: 'status-success',
  VERIFIED: 'status-success',
  COMPLETED: 'status-success',
  DELIVERED: 'status-success',
  RESOLVED: 'status-success',
  CLOSED: 'status-success',
  ACTIVE: 'status-success',
  RELEASED_TO_PRODUCTION: 'status-success',

  // Warnings / Pending / In-progress
  PENDING: 'status-warning',
  PENDING_APPROVAL: 'status-warning',
  PENDING_VERIFICATION: 'status-warning',
  IN_PROGRESS: 'status-warning',
  NEGOTIATION: 'status-warning',
  MISMATCH_HOLD: 'status-warning',
  COMMISSIONING: 'status-warning',
  SENT: 'status-info',
  CONVERTED: 'status-info',
  CONFIRMED: 'status-info',
  PACKED: 'status-info',
  DISPATCHED: 'status-info',
  IN_TRANSIT: 'status-info',
  REVISION: 'status-info',

  // Negative / Danger
  FAILED: 'status-danger',
  REJECTED: 'status-danger',
  CANCELLED: 'status-danger',
  LOST: 'status-danger',
  EXPIRED: 'status-danger',
  DAMAGED: 'status-danger',
  OUT_OF_WARRANTY: 'status-danger',

  // Neutral
  NEW: 'status-neutral',
  DRAFT: 'status-neutral',
  RECEIVED: 'status-neutral',
  PLANNED: 'status-neutral'
};

export const StatusBadge = ({ status, pulse = true, className = '' }) => {
  if (!status) return null;
  const statusStr = String(status).toUpperCase();
  const themeClass = STATUS_CLASS_MAP[statusStr] || 'status-neutral';

  return (
    <span className={`status-badge ${themeClass} ${className}`}>
      {pulse && <span className="pulse-dot" />}
      {statusStr.replace(/_/g, ' ')}
    </span>
  );
};

export default StatusBadge;
