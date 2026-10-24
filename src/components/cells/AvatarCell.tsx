import React, { useState } from 'react';

export interface AvatarCellProps {
  avatar?: string | React.ReactNode;
  value?: any;
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}

export const AvatarCell: React.FC<AvatarCellProps> = ({
  avatar,
  value,
  title,
  description,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const primaryText = title ?? (value == null ? '' : String(value));

  // Generate initials from primaryText if string
  const initials = typeof primaryText === 'string' && primaryText.trim()
    ? primaryText
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const isImageUrl = typeof avatar === 'string' && (avatar.startsWith('http') || avatar.startsWith('/') || avatar.startsWith('data:'));

  return (
    <div className={`rdt-avatar-cell ${className}`}>
      <div className="rdt-avatar-wrapper">
        {isImageUrl && !imageError ? (
          <img
            src={avatar as string}
            alt={typeof primaryText === 'string' ? primaryText : 'Avatar'}
            className="rdt-avatar-img"
            onError={() => setImageError(true)}
          />
        ) : typeof avatar === 'object' && avatar !== null ? (
          <div className="rdt-avatar-custom">{avatar}</div>
        ) : (
          <div className="rdt-avatar-fallback">{initials}</div>
        )}
      </div>
      <div className="rdt-avatar-info">
        <div className="rdt-avatar-title">{primaryText}</div>
        {description && <div className="rdt-cell-description">{description}</div>}
      </div>
    </div>
  );
};
