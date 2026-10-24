export type TableVariant = 'default' | 'bordered' | 'minimal' | 'striped' | 'modern';

export type TableSize = 'sm' | 'md' | 'lg';

export type TableLayout = 'table' | 'compact' | 'card' | 'auto';

export interface VariantProps {
  variant?: TableVariant;
  size?: TableSize;
  layout?: TableLayout;
  hoverable?: boolean;
}
