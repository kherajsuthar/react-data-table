import React from 'react';
import type { BadgeVariant } from '../../types/column.types';

export interface BadgeCellProps {
  value: any;
  variant?: BadgeVariant;
  color?: string;
  dot?: boolean;
  label?: string;
  description?: React.ReactNode;
  className?: string;
}

export const BadgeCell: React.FC<BadgeCellProps> = ({
  value,
  variant = 'neutral',
  color,
  dot = false,
  label,
  description,
  className = '',
}) => {
  const displayLabel = label ?? (value == null ? '—' : String(value));

  const customStyle: React.CSSProperties = color
    ? {
        backgroundColor: `${color}18`,
        color: color,
        borderColor: `${color}40`,
      }
    : {};

  return (
    <div className={`rdt-badge-cell ${className}`}>
      <span className={`rdt-badge rdt-badge-${variant}`} style={customStyle}>
        {dot && (
          <span
            className="rdt-badge-dot"
            style={color ? { backgroundColor: color } : undefined}
          />
        )}
        <span className="rdt-badge-text">{displayLabel}</span>
      </span>
      {description && <div className="rdt-cell-description">{description}</div>}
    </div>
  );
};
