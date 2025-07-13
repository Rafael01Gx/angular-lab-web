import { ITipoAnalise } from './analysis-type.interface';
import { IOrders } from './orders.interface';
import { IUser } from './user.interface';

export interface IAmostra {
  id: string;
  numeroOs: string;
  ordemServico: IOrders;
  nomeAmostra: string;
  dataAmostra: string;
  ensaiosSolicitados: ITipoAnalise[];
  amostraTipo?: string;
  userId: string;
  user: IUser;
  resultados: {};
  analistas: IUser[];
  status: 'Create'| 'Em Analise'| 'Finalizado' ;
  progresso: number;
  prazoInicioFim: string;
  dataRecepcao: Date;
  createdAt: Date;
  updatedAt: Date;
}
