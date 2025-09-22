export interface AnaliseForm {
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
