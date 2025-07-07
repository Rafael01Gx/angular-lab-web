import { ITipoAnalise } from "./analysis-type.interface";
import { IParameters } from "./parameters.interface";

export interface IAnalysisSettings {
  id?: number;
  nomeDescricao: string;
  tipoAnaliseId?: number;
  tipoAnalise?: ITipoAnalise;
  parametros: IParameters[];
  createdAt?: Date;
  updatedAt?: Date;
}
