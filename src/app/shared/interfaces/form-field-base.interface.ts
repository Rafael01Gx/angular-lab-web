export interface FormFieldBase {
  label: string;
  formControlName: string;
  type: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  unidadeResultado:string;
  value?:string;
  errorMessages?: {[key: string]: string};
  validators?: any[];
  asyncValidators?: any[];
  mask?: string;
  width?: string;
}
