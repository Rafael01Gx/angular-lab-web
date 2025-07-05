import { ITipoAnalise } from './settings.interface';

export interface IParameters {
  id?: number;
  unidadeMedida: string;
  descricao: string;
  tipoAnalise?: ITipoAnalise;
  tipoAnaliseId?: number;
}
