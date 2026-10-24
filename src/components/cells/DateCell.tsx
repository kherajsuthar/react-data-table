import React from 'react';

export interface DateCellProps {
  value: string | number | Date | null | undefined;
  format?: 'date' | 'time' | 'datetime' | 'relative';
  options?: Intl.DateTimeFormatOptions;
  locale?: string;
  description?: React.ReactNode;
  className?: string;
}

export const DateCell: React.FC<DateCellProps> = ({
  value,
  format = 'date',
  options,
  locale = 'en-US',
  description,
  className = '',
}) => {
  if (value == null) {
    return <span className="rdt-text-muted">—</span>;
  }

  const dateObj = value instanceof Date ? value : new Date(value);

  if (isNaN(dateObj.getTime())) {
    return <span className={`rdt-date-cell ${className}`}>{String(value)}</span>;
  }

  let formatted = '';

  if (format === 'relative') {
    formatted = getRelativeTimeString(dateObj);
  } else if (options) {
    formatted = new Intl.DateTimeFormat(locale, options).format(dateObj);
  } else if (format === 'datetime') {
    formatted = new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(dateObj);
  } else if (format === 'time') {
    formatted = new Intl.DateTimeFormat(locale, {
      timeStyle: 'short',
    }).format(dateObj);
  } else {
    // Default 'date'
    formatted = new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
    }).format(dateObj);
  }

  return (
    <div className={`rdt-date-cell ${className}`}>
      <span className="rdt-date-main">{formatted}</span>
      {description && <div className="rdt-cell-description">{description}</div>}
    </div>
  );
};

function getRelativeTimeString(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.round((date.getTime() - now.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  const absDiff = Math.abs(diffInSeconds);
  if (absDiff < 60) return rtf.format(diffInSeconds, 'second');
  if (absDiff < 3600) return rtf.format(Math.round(diffInSeconds / 60), 'minute');
  if (absDiff < 86400) return rtf.format(Math.round(diffInSeconds / 3600), 'hour');
  if (absDiff < 2592000) return rtf.format(Math.round(diffInSeconds / 86400), 'day');
  if (absDiff < 31536000) return rtf.format(Math.round(diffInSeconds / 2592000), 'month');
  return rtf.format(Math.round(diffInSeconds / 31536000), 'year');
}
