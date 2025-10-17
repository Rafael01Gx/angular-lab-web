import { Status } from '../enums/status.enum';

export interface Querys {
  page?: number;
  limit?: number;
  status?: string;
  dataInicio?: string;
  dataFim?: string;
  // tipoAnalise?: string;
  // userName?:string;
}

export interface PaginatedResponse<T> {
  data: T;
  meta: PaginatedMeta;
}

export interface PaginatedMeta {
  total: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
}
