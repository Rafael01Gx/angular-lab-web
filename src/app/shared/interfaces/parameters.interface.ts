import { ITipoAnalise } from './analysis-type.interface';

export interface IParameters {
  id?: number;
  descricao: string;
  subDescricao: string;
  unidadeResultado: string;
  casasDecimais: number;
  tipoAnalise?: ITipoAnalise;
  tipoAnaliseId?: number;
}
