import { ITipoAnalise } from './analysis-type.interface';
import { IOrders } from './orders.interface';
import { IUser } from './user.interface';
import {Status} from '../enums/status.enum';

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
  resultados:{[key:string]:{}};
  analistas: IUser[];
  revisor: IUser;
  status: Status ;
  progresso: number;
  prazoInicioFim: string;
  dataRecepcao: Date;
  createdAt: Date;
  updatedAt: Date;
}
