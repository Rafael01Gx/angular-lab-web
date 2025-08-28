// Interface para os elementos químicos
export interface ElementoQuimico {
  id?:number;
  elementName: string;
  simbolo: string;
}

// Interface para as amostras
export interface AmostraLabExterno {
  id?: number;
  amostraName: string;
  elementosAnalisados: number[];
}

export interface AmostraLabExternoFull {
  id?: number;
  amostraName: string;
  elementosAnalisados: ElementoQuimico[];
}


// Interface para o período
export interface Periodo {
  inicio: string;
  fim: string;
}

// Interface para as amostras dentro da remessa
export interface AmostraRemessa {
  id?: string;
  amostraName: string;
  subIdentificacao?: string | null;
  dataInicio: string;
  dataFim: string;
  elementosSolicitados: string[] ;
  elementosAnalisados?: string[] ;
  analiseConcluida?: boolean;
  remessaLabExternoId?: number;
}

// Interface para as remessas
export interface Remessa {
  id?: string;
  data: string;
  destinoId: string;
  destino?: Laboratorio;
  amostras: AmostraRemessa[];
}

// Interface para os laboratórios
export interface Laboratorio {
  id: string;
  nome: string;
  endereco?: Endereco;
  telefone?: string;
  email?: string;
}

export interface Endereco {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  pais: string;
}
