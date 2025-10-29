export interface ElementoQuimico {
  id?:number;
  elementName: string;
  simbolo: string;
}

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

export interface Periodo {
  inicio: string;
  fim: string;
}

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
export interface Remessa {
  id?: string;
  data: string;
  destinoId: string;
  destino?: Laboratorio;
  amostras: AmostraRemessa[];
}

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

export interface AmostraLabExternoFullUpload {
  id: number;
  amostraName: string;
  subIdentificacao: string;
  dataInicio: string;
  dataFim: string;
  elementosSolicitados: string[];
  elementosAnalisados: ElementoAnalisado[];
  analiseConcluida: number;
  createdAt: string;
  updatedAt: string;
  remessaLabExternoId: number;
}

export interface ElementoAnalisado {
  elemento: string;
  valor: string;
  unidade: string;
}
