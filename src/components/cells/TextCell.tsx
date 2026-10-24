import React, { useState } from 'react';

export interface TextCellProps {
  value: any;
  description?: React.ReactNode;
  copy?: boolean;
  className?: string;
}

export const TextCell: React.FC<TextCellProps> = ({
  value,
  description,
  copy = false,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const displayValue = value == null ? '—' : String(value);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value != null && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(String(value));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`rdt-text-cell ${className}`}>
      <div className="rdt-text-cell-main">
        <span className="rdt-text-cell-value">{displayValue}</span>
        {copy && value != null && (
          <button
            type="button"
            className="rdt-copy-btn"
            onClick={handleCopy}
            title={copied ? 'Copied!' : 'Copy to clipboard'}
            aria-label="Copy to clipboard"
          >
            {copied ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
            )}
          </button>
        )}
      </div>
      {description && <div className="rdt-cell-description">{description}</div>}
    </div>
  );
};
