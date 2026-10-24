import React, { useState, useRef, useEffect } from 'react';
import type { RowAction } from '../../types/column.types';

export interface DataTableActionsProps<TData = any> {
  actions: RowAction<TData>[] | ((row: TData, index: number) => RowAction<TData>[]);
  row: TData;
  rowIndex: number;
}

export const DataTableActions = <TData extends Record<string, any>>({
  actions,
  row,
  rowIndex,
}: DataTableActionsProps<TData>): React.ReactNode => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const actionList: RowAction<TData>[] = typeof actions === 'function' ? actions(row, rowIndex) : actions;

  const visibleActions = actionList.filter((act) => {
    if (typeof act.hidden === 'function') return !act.hidden(row);
    return !act.hidden;
  });

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  if (!visibleActions.length) {
    return null;
  }

  return (
    <div className="rdt-actions-container" ref={containerRef}>
      <button
        type="button"
        className="rdt-actions-trigger"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        aria-label="Row actions"
        aria-expanded={isOpen}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>

      {isOpen && (
        <div className="rdt-actions-menu" role="menu">
          {visibleActions.map((action, idx) => {
            const isDisabled = typeof action.disabled === 'function' ? action.disabled(row) : action.disabled;

            const handleClick = (e: React.MouseEvent) => {
              e.stopPropagation();
              if (isDisabled) return;
              setIsOpen(false);
              action.onPress?.(row, rowIndex);
              action.onClick?.(row, rowIndex);
            };

            const colorClass = action.color ? `rdt-action-${action.color}` : '';

            return (
              <button
                key={action.key || idx}
                type="button"
                role="menuitem"
                className={`rdt-action-item ${colorClass} ${isDisabled ? 'rdt-action-disabled' : ''}`}
                disabled={isDisabled}
                onClick={handleClick}
              >
                {action.icon && <span className="rdt-action-icon">{action.icon}</span>}
                <span className="rdt-action-label">{action.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
