import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ToastrService } from './toastr.service';
import { catchError, Observable, of, throwError } from 'rxjs';
import { API_ROUTES } from '../core/constants/routes.constant';
import {
  AmostraAnaliseExterna,
  AmostraAnaliseExternaQuery,
  DashboardCompleto,
  labsExtFiltrosAnalyticsQuery
} from '../shared/interfaces/amostra-analise-externa.interfaces';
import { PaginatedResponse } from '../shared/interfaces/querys.interface';
import { AmostraLabExternoFullUpload } from '../shared/interfaces/laboratorios-externos.interfaces';

const { AMOSTRAS_ANALISE_EXTERNA } = API_ROUTES;

@Injectable({
  providedIn: 'root',
})
export class AmostraLabExternoService {
  #apiUrl = `${environment.apiURL}/${AMOSTRAS_ANALISE_EXTERNA.BASE}`;
  #http = inject(HttpClient);
  #toastr = inject(ToastrService);

  handleSetError(err: HttpErrorResponse): Observable<never> {
    this.#toastr.error(err.error.message);
    return throwError(() => new Error(err.error.message));
  }

  handleGetError(err: HttpErrorResponse): Observable<any> {
    this.#toastr.error(err.error.message);
    return of([]);
  }

  findAll(filtros: AmostraAnaliseExternaQuery): Observable<PaginatedResponse<AmostraAnaliseExterna[]>> {
    const querys = this.queryConstructor(filtros)
    return this.#http.get<PaginatedResponse<AmostraAnaliseExterna[]>>(`${this.#apiUrl}/${AMOSTRAS_ANALISE_EXTERNA.GET.FIND_ALL}?${querys}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleGetError.bind(this)));
  }
  findAllWithResults(filtros: AmostraAnaliseExternaQuery): Observable<PaginatedResponse<AmostraAnaliseExterna[]>> {
    const querys = this.queryConstructor(filtros)
    return this.#http.get<PaginatedResponse<AmostraAnaliseExterna[]>>(`${this.#apiUrl}/${AMOSTRAS_ANALISE_EXTERNA.GET.FIND_ALL_WITH_RESULTS}?${querys}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleGetError.bind(this)));
  }

  update(id: number, body: AmostraAnaliseExterna): Observable<AmostraAnaliseExterna> {
    return this.#http.patch<AmostraAnaliseExterna>(`${this.#apiUrl}/${AMOSTRAS_ANALISE_EXTERNA.PATCH.UPDATE + id}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }
  updateMany(amostras: AmostraLabExternoFullUpload[]): Observable<AmostraAnaliseExterna[]> {
    return this.#http.patch<AmostraAnaliseExterna[]>(`${this.#apiUrl}/${AMOSTRAS_ANALISE_EXTERNA.PATCH.UPDATE_MANY}`, { amostras }, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  getDashboardCompleto(filtros?: labsExtFiltrosAnalyticsQuery): Observable<DashboardCompleto> {
    let params = new HttpParams();
    if (filtros?.laboratorioId) params = params.set('laboratorioId', filtros.laboratorioId.toString());
    if (filtros?.dataInicio) params = params.set('dataInicio', filtros.dataInicio.toString());
    if (filtros?.dataFim) params = params.set('dataFim', filtros.dataFim.toString());
    if (filtros?.analiseConcluida) params = params.set('analiseConcluida', filtros.analiseConcluida.toString());

    return this.#http.get<DashboardCompleto>(`${this.#apiUrl}/${AMOSTRAS_ANALISE_EXTERNA.GET.DASHBOARD_COMPLETO}?${params}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleGetError.bind(this)));
  }


  delete(id: number): Observable<any> {
    return this.#http.delete(`${this.#apiUrl}/${AMOSTRAS_ANALISE_EXTERNA.DELETE.DELETE + id}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  queryConstructor(filtros: AmostraAnaliseExternaQuery): HttpParams {
    let params = new HttpParams();
    if (filtros.analiseConcluida !== undefined) params = params.set('analiseConcluida', filtros.analiseConcluida.toString());
    if (filtros.dataInicio) params = params.set('dataInicio', filtros.dataInicio);
    if (filtros.dataFim) params = params.set('dataFim', filtros.dataFim);
    if (filtros.amostraName) params = params.set('amostraName', filtros.amostraName);
    if (filtros.labExternoId) params = params.set('labExternoId', filtros.labExternoId.toString());
    if (filtros.page) params = params.set('page', filtros.page.toString());
    if (filtros.limit) params = params.set('limit', filtros.limit.toString());
     return params;
  }

 
}
