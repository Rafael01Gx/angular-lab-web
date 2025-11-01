import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {ToastrService} from './toastr.service';
import {catchError, Observable, of, throwError} from 'rxjs';
import {Remessa} from '../shared/interfaces/laboratorios-externos.interfaces';
import {API_ROUTES} from '../core/constants/api-routes.constant';
import { PaginatedResponse, Querys } from '../shared/interfaces/querys.interface';
import { query } from 'express';

const { REMESSA_LAB_EXTERNO } = API_ROUTES;

@Injectable({
  providedIn: 'root',
})
export class RemessasLabExternosService {
  #apiUrl = `${environment.apiURL}/${REMESSA_LAB_EXTERNO.BASE}`;
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

  findAll(query:Querys): Observable<PaginatedResponse<Remessa[]>> {
    let params = new HttpParams();
    if(query.page) params = params.append('page',query.page.toString());
    if(query.limit) params = params.append('limit',query.limit.toString());
    return this.#http.get<PaginatedResponse<Remessa[]>>(`${this.#apiUrl}/${REMESSA_LAB_EXTERNO.GET.FIND_ALL}`, {
      params,
      withCredentials: true,
    }).pipe(catchError(this.handleGetError.bind(this)));
  }

  create(body: Remessa): Observable<Remessa> {
    return this.#http.post<Remessa>(`${this.#apiUrl}/${REMESSA_LAB_EXTERNO.POST.CREATE}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  update(id: number | string, body: Remessa): Observable<Remessa> {
    return this.#http.patch<Remessa>(`${this.#apiUrl}/${REMESSA_LAB_EXTERNO.PATCH.UPDATE+id}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  delete(id: number | string): Observable<any> {
    return this.#http.delete(`${this.#apiUrl}/${REMESSA_LAB_EXTERNO.DELETE.DELETE+id}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }
}
