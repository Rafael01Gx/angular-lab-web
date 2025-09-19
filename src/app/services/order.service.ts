import {catchError, Observable, of, tap, throwError} from 'rxjs';
import {inject, Injectable, signal} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {IOrders, IOrderStatistics} from '../shared/interfaces/orders.interface';
import {IAmostra} from '../shared/interfaces/amostra.interface';
import {ToastrService} from './toastr.service';
import {Querys} from '../shared/interfaces/querys.interface';

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
