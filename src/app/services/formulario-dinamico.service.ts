import {inject, Injectable} from '@angular/core';
import {AbstractControlOptions, FormBuilder, FormGroup} from '@angular/forms';
import {FormConfig} from '../shared/interfaces/form-config.interface';
import {ToastrService} from './toastr.service';

@Injectable({
  providedIn: 'root'
})
export class FormularioDinamicoService {
  #fb= inject(FormBuilder);
  #toastr = inject(ToastrService);
  #formConfigs: { [key: string]: Function } ={};


  registerFormConfig(formName:string, config: Function) {
    this.#formConfigs[formName] = config;
  }

  getFormConfig(formKey: string, ...args: any[]): FormConfig {
   if (!this.#formConfigs[formKey]){
     this.#toastr.error("Erro ao criar formulário!")
     throw new Error(`Configuração de formulário inválida: ${formKey}`);
   }
   return this.#formConfigs[formKey](...args);
  }

  createForm(config: FormConfig, formOptions?: AbstractControlOptions): FormGroup {
    const formControls:{ [key: string]: any} = {};

    config.fields.forEach(field => {
      formControls[field.formControlName] = ['', field.validators, field.asyncValidators]
    });
    return this.#fb.group(formControls, formOptions);
  }
}
