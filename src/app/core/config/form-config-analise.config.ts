import {FormConfig} from '../../shared/interfaces/form-config.interface';
import {FormFieldBase} from '../../shared/interfaces/form-field-base.interface';
import {Validators} from '@angular/forms';
import {AnaliseForm, ParametrosForm} from '../../shared/interfaces/form-analise.interface';

export function formConfigAnalise(data: AnaliseForm): FormConfig {
  const fields: FormFieldBase[] = [];
  data.parametros.forEach(p => {
    const validators = [Validators.required,Validators.minLength(1)]
    const field: FormFieldBase = {
      label: `${p.descricao} ${p.subDescricao || ""}`,
      type:'text',
      formControlName: `id${p.id}`,
      placeholder: '',
      required: true,
      unidadeResultado: p.unidadeResultado ,
      mask: p.casasDecimais >= 1 ? `separator.${p.casasDecimais}` : '',
      errorMessages: {
        required: `${p.descricao+p.subDescricao} é obrigatório`,
      },
      validators
    }
    fields.push(field);
  })
  return {
    title: data.nomeDescricao,
    description: data.tipoAnalise.tipo,
    fields: fields
  }
}

export function formConfigEditarResultado(resultado: Record<string,ParametrosForm>): FormConfig {
  const fields: FormFieldBase[] = [];
  const data: ParametrosForm[] = Object.values(resultado);
  data.forEach(p => {
    const validators = [Validators.required,Validators.minLength(1)]
    const field: FormFieldBase = {
      label: `${p.descricao} ${p.subDescricao || ""}`,
      type:'text',
      formControlName: `id${p.id}`,
      placeholder: '',
      value: p.valor || "",
      required: true,
      unidadeResultado: p.unidadeResultado ,
      mask: p.casasDecimais >= 1 ? `separator.${p.casasDecimais}` : '',
      errorMessages: {
        required: `${p.descricao+p.subDescricao} é obrigatório`,
      },
      validators
    }
    fields.push(field);
  })
  return {
    title: "Editar Análise",
    description: "",
    fields: fields
  }
}
