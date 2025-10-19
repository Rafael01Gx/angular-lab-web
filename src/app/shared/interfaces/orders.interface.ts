import { IAmostra } from "./amostra.interface";
import { IUser } from "./user.interface";
import {Status} from '../enums/status.enum';

export interface IOrders {
  id?: string;
  numeroOs?: string;
  solicitanteId?: string;
  solicitante?: IUser;
  amostras: IAmostra[];
  status?: Status;
  dataRecepcao?: string;
  prazoInicioFim?: string;
  progresso?: number;
  observacao?: string;
  revisorId?: string;
  revisor?:IUser;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface AtualizarStatus{
  status: Status;
  observacao?: string;
}
export interface IOrderStatistics {
  total: number,
  porStatus: {
    status: Status,
    count: number,
  }[],
  porMes: { month: string; count: number }[]
}
