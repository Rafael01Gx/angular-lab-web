import {FormFieldBase} from './form-field-base.interface';

export interface FormConfig {
  title: string;
  description: string;
  fields: FormFieldBase[];
}
