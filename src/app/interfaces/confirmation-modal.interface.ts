export interface ConfirmationModalConfig {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  icon?: string;
  itemName?: string;
  showItemName?: boolean;
}
