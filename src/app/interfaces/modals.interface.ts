import { IAnalysisSettings } from "./analysis-settings.interface";

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

export interface AnalysisSettingsModal {
data?: IAnalysisSettings;
isEditMode: boolean;
}