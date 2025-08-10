// Interface para os elementos químicos
export interface ElementoQuimico {
  id: string;
  element_name: string;
}

// Interface para as amostras
export interface Amostra {
  id: string;
  amostra_name: string;
  elementos_analisados: string[];
}

// Interface para o período
export interface Periodo {
  inicio: string;
  fim: string;
}

// Interface para as amostras dentro da remessa
export interface AmostraRemessa {
  id: string;
  amostra_name: string;
  sub_identificacao?: string;
  periodo: Periodo;
  elementos_analisados: string[];
}

// Interface para os laboratórios
export interface Laboratorio {
  id: string;
  nome: string;
}

// Interface para as remessas
export interface Remessa {
  id: string;
  data: string;
  destino: string; // ID do laboratório
  amostras: AmostraRemessa[];
}
