export interface FormFieldBase {
  label: string;
  formControlName: string;
  type: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  errorMessages?: {[key: string]: string[]};
  validators?: any[];
  asyncValidators?: any[];
  width?: string;
}
