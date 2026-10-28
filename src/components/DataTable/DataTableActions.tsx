import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useImperativeHandle,
  forwardRef,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import type { RowAction } from '../../types/column.types';
import { renderActionIcon } from './ActionIcons';

export interface DataTableActionsProps<TData = any> {
  actions: RowAction<TData>[] | ((row: TData, index: number) => RowAction<TData>[]);
  row: TData;
  rowIndex: number;
  rowRef?: RefObject<HTMLElement | null>;
}

export interface DataTableActionsHandle {
  openAtCoords: (x: number, y: number) => void;
  openAtTrigger: () => void;
  close: () => void;
  toggle: () => void;
  isOpen: () => boolean;
}

export const DataTableActions = forwardRef(function DataTableActions<
  TData extends Record<string, any>
>(
  { actions, row, rowIndex, rowRef }: DataTableActionsProps<TData>,
  ref: React.ForwardedRef<DataTableActionsHandle>
): ReactNode {
  const [isOpen, setIsOpen] = useState(false);
  const [anchor, setAnchor] = useState<'trigger' | { x: number; y: number }>('trigger');
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    placement: 'top' | 'bottom';
    isReady: boolean;
  }>({
    top: 0,
    left: 0,
    placement: 'bottom',
    isReady: false,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Unique identifier for mutual exclusivity across rows
  const instanceId = useRef(
    `rdt-act-${Math.random().toString(36).substring(2, 9)}`
  ).current;

  const actionList: RowAction<TData>[] =
    typeof actions === 'function' ? actions(row, rowIndex) : actions;

  const visibleActions = actionList.filter((act) => {
    if (typeof act.hidden === 'function') return !act.hidden(row);
    return !act.hidden;
  });

  const openAtTrigger = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('rdt-close-all-actions', { detail: { id: instanceId } })
      );
    }

    if (triggerRef.current && typeof window !== 'undefined') {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const estimatedWidth = 180;
      const estimatedHeight = 160;
      const margin = 8;

      const spaceBelow = viewportHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;
      const openUpwards = spaceBelow < estimatedHeight + margin && spaceAbove > spaceBelow;

      const top = openUpwards
        ? Math.max(margin, triggerRect.top - estimatedHeight - 4)
        : Math.min(triggerRect.bottom + 4, viewportHeight - estimatedHeight - margin);

      let left = triggerRect.right - estimatedWidth;
      if (left < margin) left = triggerRect.left;
      left = Math.max(margin, Math.min(left, viewportWidth - estimatedWidth - margin));

      setAnchor('trigger');
      setCoords({
        top,
        left,
        placement: openUpwards ? 'top' : 'bottom',
        isReady: true,
      });
      setIsOpen(true);
    } else {
      setAnchor('trigger');
      setCoords((prev) => ({ ...prev, isReady: false }));
      setIsOpen(true);
    }
  };

  const openAtCoords = (x: number, y: number) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('rdt-close-all-actions', { detail: { id: instanceId } })
      );
    }

    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 768;
    const estimatedWidth = 180;
    const estimatedHeight = 160;
    const margin = 8;

    const spaceBelow = viewportHeight - y;
    const spaceAbove = y;
    const openUpwards = spaceBelow < estimatedHeight + margin && spaceAbove > spaceBelow;

    const top = openUpwards
      ? Math.max(margin, y - estimatedHeight)
      : Math.min(y, viewportHeight - estimatedHeight - margin);

    const spaceRight = viewportWidth - x;
    const left = spaceRight >= estimatedWidth + margin
      ? x
      : Math.max(margin, x - estimatedWidth);

    setAnchor({ x, y });
    setCoords({
      top,
      left,
      placement: openUpwards ? 'top' : 'bottom',
      isReady: true,
    });
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  const toggle = () => {
    if (isOpen) {
      close();
    } else {
      openAtTrigger();
    }
  };

  useImperativeHandle(ref, () => ({
    openAtCoords,
    openAtTrigger,
    close,
    toggle,
    isOpen: () => isOpen,
  }));

  // Coordinate close across multiple action dropdowns
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleCloseOthers = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.id !== instanceId) {
        setIsOpen(false);
      }
    };

    window.addEventListener('rdt-close-all-actions', handleCloseOthers);
    return () => {
      window.removeEventListener('rdt-close-all-actions', handleCloseOthers);
    };
  }, [instanceId]);

  // Position refinement with exact measurement
  useLayoutEffect(() => {
    if (!isOpen || typeof window === 'undefined') {
      return;
    }

    const updatePosition = () => {
      const menu = menuRef.current;
      if (!menu) return;

      const menuRect = menu.getBoundingClientRect();
      const menuWidth = menuRect.width || 180;
      const menuHeight = menuRect.height || 160;
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      const margin = 8;

      let top = 0;
      let left = 0;
      let placement: 'top' | 'bottom' = 'bottom';

      if (anchor === 'trigger' && triggerRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const spaceBelow = viewportHeight - triggerRect.bottom;
        const spaceAbove = triggerRect.top;

        // Open upwards if not enough space below and more space above
        if (spaceBelow < menuHeight + margin && spaceAbove > spaceBelow) {
          top = triggerRect.top - menuHeight - 4;
          placement = 'top';
        } else {
          top = triggerRect.bottom + 4;
          placement = 'bottom';
        }

        // Horizontal: right-align with trigger button
        left = triggerRect.right - menuWidth;
        if (left < margin) {
          left = triggerRect.left;
        }
      } else if (typeof anchor === 'object' && anchor !== null) {
        // Context Menu (Right-click at mouse coordinates)
        const cursorX = anchor.x;
        const cursorY = anchor.y;

        const spaceBelow = viewportHeight - cursorY;
        const spaceAbove = cursorY;

        // Vertical: downwards if space available, else flip upwards
        if (spaceBelow < menuHeight + margin && spaceAbove > spaceBelow) {
          top = cursorY - menuHeight;
          placement = 'top';
        } else {
          top = cursorY;
          placement = 'bottom';
        }

        // Horizontal: rightwards if space available, else flip leftwards
        const spaceRight = viewportWidth - cursorX;
        if (spaceRight >= menuWidth + margin) {
          left = cursorX;
        } else {
          left = cursorX - menuWidth;
        }
      }

      // Clamp coordinates within visible viewport boundaries
      top = Math.max(margin, Math.min(top, viewportHeight - menuHeight - margin));
      left = Math.max(margin, Math.min(left, viewportWidth - menuWidth - margin));

      setCoords({ top, left, placement, isReady: true });
    };

    updatePosition();
  }, [isOpen, anchor]);

  // Click outside, right-click outside, escape, and scroll dismissals
  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return;

    let isMounted = true;
    let listenerActive = false;

    const isInsideTarget = (target: Node | null) => {
      if (!target) return false;
      return (
        (containerRef.current && containerRef.current.contains(target)) ||
        (rowRef?.current && rowRef.current.contains(target)) ||
        (menuRef.current && menuRef.current.contains(target))
      );
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (!listenerActive) return;
      const target = event.target as Node;
      if (isInsideTarget(target)) {
        return;
      }
      setIsOpen(false);
    };

    const handleContextMenuOutside = (event: MouseEvent) => {
      if (!listenerActive) return;
      const target = event.target as Node;
      if (isInsideTarget(target)) {
        return;
      }
      setIsOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = (event: Event) => {
      // Dismiss if scroll originates outside the dropdown menu
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    // Activate outside listeners on next tick to avoid capturing the triggering event
    const timer = setTimeout(() => {
      if (isMounted) {
        listenerActive = true;
      }
    }, 10);

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('contextmenu', handleContextMenuOutside);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('contextmenu', handleContextMenuOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, rowRef]);

  if (!visibleActions.length) {
    return null;
  }

  const menuDropdown = isOpen ? (
    <div
      ref={menuRef}
      className={`rdt-actions-menu rdt-actions-menu-${coords.placement}`}
      role="menu"
      style={{
        position: 'fixed',
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        opacity: coords.isReady ? 1 : 0,
        pointerEvents: coords.isReady ? 'auto' : 'none',
        zIndex: 99999,
      }}
    >
      {visibleActions.map((action, idx) => {
        const isDisabled =
          typeof action.disabled === 'function' ? action.disabled(row) : action.disabled;

        const handleClick = (e: React.MouseEvent) => {
          e.stopPropagation();
          if (isDisabled) return;
          setIsOpen(false);
          action.onPress?.(row, rowIndex);
          action.onClick?.(row, rowIndex);
        };

        const colorClass = action.color ? `rdt-action-${action.color}` : '';
        const iconNode = renderActionIcon(action.icon);

        return (
          <button
            key={action.key || idx}
            type="button"
            role="menuitem"
            className={`rdt-action-item ${colorClass} ${isDisabled ? 'rdt-action-disabled' : ''}`}
            disabled={isDisabled}
            onClick={handleClick}
          >
            {iconNode && <span className="rdt-action-icon">{iconNode}</span>}
            <span className="rdt-action-label">{action.label}</span>
          </button>
        );
      })}
    </div>
  ) : null;

  return (
    <div className="rdt-actions-container" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`rdt-actions-trigger ${isOpen ? 'rdt-actions-trigger-active' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          openAtCoords(e.clientX, e.clientY);
        }}
        aria-label="Row actions"
        aria-expanded={isOpen}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="5" r="2.2" />
          <circle cx="12" cy="12" r="2.2" />
          <circle cx="12" cy="19" r="2.2" />
        </svg>
      </button>

      {typeof document !== 'undefined' && menuDropdown && createPortal(menuDropdown, document.body)}
    </div>
  );
}) as <TData extends Record<string, any>>(
  props: DataTableActionsProps<TData> & { ref?: React.Ref<DataTableActionsHandle> }
) => React.ReactElement | null;
