import { IAmostra } from "./amostra.interface";
import { IUser } from "./user.interface";
import {Status} from '../enums/status.enum';

export interface IOrders {
  id?: string;
  numeroOs?: string;
  solicitanteId?: string;
  solicitante?: IUser;
  amostras: IAmostra[];
  status?: string;
  dataRecepcao?: string;
  prazoInicioFim?: string;
  progresso?: string;
  observacao?: string;
  revisorId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface AtualizarStatus{
  status: string;
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
