export interface AmostraAnaliseExternaQuery {
  analiseConcluida?: boolean;
  dataInicio?: string;
  dataFim?: string;
  amostraName?: string;
  labExternoId?: number;
  page?: number;
  limit?: number;
}

export interface ElementoResultado {
  elemento: string;
  valor: string;
  unidade: string;
}


export interface AmostraAnaliseExterna {
  id: number;
  amostraName: string;
  subIdentificacao: string;
  dataInicio: string;
  dataFim: string;
  elementosSolicitados: string[];
  elementosAnalisados: ElementoResultado[] | null;
  analiseConcluida: boolean;
  createdAt: string;
  updatedAt: string;
  remessaLabExternoId: number;
  RemessaLabExterno: {
    data: string;
    destino: {
      id: number;
      nome: string;
      endereco?: string;
      telefone?: string;
      email?: string;
    };
  };
}

export interface LaboratorioDashboard {
  id: number;
  nome: string;
  totalAmostras: number;
  amostrasCompletas: number;
  amostrasIncompletas: number;
  taxaConclusao: number;
}

export interface RemessaStatsDashboard {
  remessaId: number;
  data: string;
  laboratorio: string;
  totalAmostras: number;
  amostrasCompletas: number;
  amostrasIncompletas: number;
  taxaConclusao: number;
}

export interface labsExtFiltrosAnalyticsQuery {
  laboratorioId?: number;
  dataInicio?: Date | string;
  dataFim?: Date | string;
  analiseConcluida?: boolean;
}

export interface DashboardCompleto {
  estatisticas: IDetalhesEstatisticas;
  amostras: AmostraAnaliseExterna[];
}

interface IEstatisticaPorLaboratorio {
  laboratorioId: number;
  laboratorioNome: string;
  totalAmostras: number;
  amostrasCompletas: number;
  amostrasIncompletas: number;
  taxaConclusao: number; 
}
interface IEstatisticaPorRemessa {
  remessaId: number;
  data: string;
  laboratorioNome: string;
  totalAmostras: number;
  amostrasCompletas: number;
  amostrasIncompletas: number;
  taxaConclusao: number;
}

interface IEstatisticaGeral {
  totalAmostras: number;
  amostrasCompletas: number;
  amostrasIncompletas: number;
  percentualConclusao: number;
  totalLaboratorios: number;
  totalRemessas: number;
  mediaElementosPorAmostra: number;
}
interface IDetalhesEstatisticas {
  geral: IEstatisticaGeral;
  porLaboratorio: IEstatisticaPorLaboratorio[];
  porRemessa: IEstatisticaPorRemessa[];
}


export interface SalvarResultadosDto {
  elementosAnalisados: ElementoResultado[];
  analiseConcluida: boolean;
}
