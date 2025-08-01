import { ITipoAnalise } from './analysis-type.interface';

export interface IParameters {
  id?: number;
  descricao: string;
  unidadeMedida: string;
  unidadeResultado: string;
  casasDecimais: number;
  tipoAnalise?: ITipoAnalise;
  tipoAnaliseId?: number;
}
