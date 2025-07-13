import { IAmostra } from "./amostra.interface";
import { IUser } from "./user.interface";

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
