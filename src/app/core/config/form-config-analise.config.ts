import {FormConfig} from '../../shared/interfaces/form-config.interface';
import {FormFieldBase} from '../../shared/interfaces/form-field-base.interface';

export function formConfigAnalise(data: AnaliseForm): FormConfig {
  const fields: FormFieldBase[] = [];
  data.parametros.forEach(p => {
    const field: FormFieldBase = {
      label: `${p.descricao} ${p.subDescricao || ""}`,
      type: 'text',
      formControlName: `input+${p.id}`,
      required:true,
      placeholder: `x ${p.subDescricao || ""}`,
    }
  })
  return {
    title: data.nomeDescricao,
    description: data.tipoAnalise.tipo,
    fields: fields
  }
}

interface AnaliseForm {
  id: number;
  nomeDescricao: string;
  tipoAnaliseId: number;
  tipoAnalise: {
    id: number;
    tipo: string;
    classe: string;
  },
  parametros:
    {
      "id": 4,
      "descricao": string;
      "subDescricao": string;
      "unidadeResultado": string;
      "casasDecimais": number;
    }[];
}
