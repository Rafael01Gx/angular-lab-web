export interface AnaliseForm {
  id: number;
  nomeDescricao: string;
  tipoAnaliseId: number;
  tipoAnalise: {
    id: number;
    tipo: string;
    classe: string;
  },
  parametros:ParametrosForm[];
}

export interface ParametrosForm {
  id: number,
  descricao: string;
  subDescricao: string;
  unidadeResultado: string;
  casasDecimais: number;
  valor?: string;
}
