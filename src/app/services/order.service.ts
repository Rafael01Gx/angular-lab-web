import {catchError, Observable, of, tap, throwError} from 'rxjs';
import {inject, Injectable, signal} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {IOrders, IOrderStatistics} from '../shared/interfaces/orders.interface';
import {IAmostra} from '../shared/interfaces/amostra.interface';
import {ToastrService} from './toastr.service';
import {PaginatedResponse, Querys} from '../shared/interfaces/querys.interface';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  #apiUrl = `${environment.apiURL}/ordem-servico`;
  #http = inject(HttpClient);
  #toastr = inject(ToastrService);
  #ordens = signal<IOrders[]>([]);

  handleSetError(err: HttpErrorResponse): Observable<never> {
    this.#toastr.error(err.error.message);
    return throwError(() => new Error(err.error.message));
  }

  handleGetError(err: HttpErrorResponse): Observable<any> {
    this.#toastr.error(err.error.message);
    return of([]);
  }

  findAll(query?: Querys): Observable<IOrders[]> {
    return this.#http.get<IOrders[]>(`${this.#apiUrl}?${query?.status}`, {
      withCredentials: true,
    }).pipe(tap((ordens) => this.#ordens.set(ordens)), catchError(this.handleGetError.bind(this)));
  }

  findByFilters(query?: Querys): Observable<PaginatedResponse<IOrders[]>> {
    let params= new HttpParams()
      if (query) {
    if (query.status) params = params.append('status', query.status.toString());
    if (query.limit) params = params.append('limit', query.limit.toString());
    if (query.page) params = params.append('page', query.page.toString());
    if (query.dataInicio) params = params.append('dataInicio', query.dataInicio.toString());
    if (query.dataFim) params = params.append('dataFim', query.dataFim.toString());
    if (query.solicitante) params = params.append('solicitante', query.solicitante.toString());
    if (query.concluidas) params = params.append('concluidas', query.concluidas.toString());
    if (query.progresso) params = params.append('progresso', query.progresso.toString());
  }
    return this.#http.get<PaginatedResponse<IOrders[]>>(`${this.#apiUrl}/filter`, {params,
      withCredentials: true,
    }).pipe(tap((res) => this.#ordens.set(res.data)), catchError(this.handleGetError.bind(this)));
  }

  findAllByUser(query?: Querys): Observable<IOrders[]> {
    return this.#http.get<IOrders[]>(`${this.#apiUrl}/user?${query?.status}`, {
      withCredentials: true,
    }).pipe(tap((ordens) => this.#ordens.set(ordens)), catchError(this.handleGetError.bind(this)));
  }

  create(amostras: Partial<IAmostra[]>): Observable<IOrders> {
    return this.#http.post<IOrders>(`${this.#apiUrl}`, {amostras}, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  update(id: number | string, body: Partial<IOrders>): Observable<IOrders> {
    return this.#http.patch<IOrders>(`${this.#apiUrl}/${id}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  updateRecepcaoAgendamento(id: number | string, body: Partial<IOrders>): Observable<IOrders> {
    return this.#http.patch<IOrders>(`${this.#apiUrl}/agendar/${id}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  delete(id: number): Observable<any> {
    return this.#http.delete(`${this.#apiUrl}/${id}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  obterOrdensCache(): IOrders[] {
    return this.#ordens();
  }

  buscarEstatisticas(): Observable<IOrderStatistics>{
    return this.#http.get<IOrderStatistics>(`${this.#apiUrl}/estatisticas`,{withCredentials: true})
      .pipe(
        catchError(error => {
          console.error('Erro ao buscar estatísticas:', error);
          return of({
            total: 0,
            porStatus: [],
            porMes: []
          });
        })
      );
  }
}
