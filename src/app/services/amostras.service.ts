import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {ToastrService} from './toastr.service';
import {catchError, Observable, of, tap, throwError} from 'rxjs';
import {IAmostra} from '../shared/interfaces/amostra.interface';
import {PaginatedResponse, Querys} from '../shared/interfaces/querys.interface';
import {API_ROUTES} from '../shared/constants/routes.constant';

const { AMOSTRAS } = API_ROUTES;

@Injectable({
  providedIn: 'root',
})
export class AmostrasService {
  #apiUrl = `${environment.apiURL}/${AMOSTRAS.BASE}`;
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

  findAll(query?: Querys): Observable<IAmostra[]> {
    return this.#http.get<IAmostra[]>(`${this.#apiUrl}${AMOSTRAS.GET.FIND_ALL}?${query?.status}`, {
      withCredentials: true,
    }).pipe( catchError(this.handleGetError.bind(this)));
  }

findAllWithAnalystsAndCompleted(query?: Querys): Observable<PaginatedResponse<IAmostra[]>> {
  const params = this.queryContructor(query);
  return this.#http.get<PaginatedResponse<IAmostra[]>>(`${this.#apiUrl}/${AMOSTRAS.GET.FIND_ALL_WITH_USERS}`, {
    params,
    withCredentials: true,
  }).pipe(
    catchError(this.handleGetError.bind(this))
  );
}

findComplete(query?: Querys): Observable<PaginatedResponse<IAmostra[]>> {
  const params = this.queryContructor(query);
  return this.#http.get<PaginatedResponse<IAmostra[]>>(`${this.#apiUrl}/${AMOSTRAS.GET.FIND_ALL_WITH_USERS_ADMIN}`, {
    params,
    withCredentials: true,
  }).pipe(
    catchError(this.handleGetError.bind(this))
  );
}


  findById(id: string|number): Observable<IAmostra> {
    return this.#http.get<IAmostra>(`${this.#apiUrl}/${AMOSTRAS.GET.FIND_BY_ID+id}`, {
      withCredentials: true,
    }).pipe( catchError(this.handleGetError.bind(this)));
  }

  findAllByUser(query?: Querys): Observable<IAmostra[]> {
    return this.#http.get<IAmostra[]>(`${this.#apiUrl}/${AMOSTRAS.GET.FIND_ALL_BY_USER}?${query?.status}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleGetError.bind(this)));
  }

  findAllWithUsersByOs(numberOs:string): Observable<IAmostra[]> {
    return this.#http.get<IAmostra[]>(`${this.#apiUrl}/${AMOSTRAS.GET.FIND_ALL_WITH_USERS_BY_OS+numberOs}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleGetError.bind(this)));
  }



  create(amostras: Partial<IAmostra[]>): Observable<IAmostra> {
    return this.#http.post<IAmostra>(`${this.#apiUrl}/${AMOSTRAS.POST.CREATE}`, {amostras}, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  update(id: number | string, body: Partial<IAmostra>): Observable<IAmostra> {
    return this.#http.patch<IAmostra>(`${this.#apiUrl}/${AMOSTRAS.PATCH.UPDATE+id}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  assinar(id: number | string, body: Partial<IAmostra>): Observable<IAmostra> {
    return this.#http.patch<IAmostra>(`${this.#apiUrl}/${AMOSTRAS.PATCH.ASSINAR+id}`,{body}, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  delete(id: number): Observable<any> {
    return this.#http.delete(`${this.#apiUrl}/${AMOSTRAS.DELETE.DELETE+id}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }



queryContructor(query?: Querys): HttpParams {

  let params = new HttpParams();

  if (query) {
    if (query.status) params = params.append('status', query.status.toString());
    if (query.limit) params = params.append('limit', query.limit.toString());
    if (query.page) params = params.append('page', query.page.toString());
    if (query.dataInicio) params = params.append('dataInicio', query.dataInicio.toString());
    if (query.dataFim) params = params.append('dataFim', query.dataFim.toString());
    if (query.concluidas) params = params.append('concluidas', query.concluidas.toString());
    if (query.progresso) params = params.append('progresso', query.progresso.toString());
  }
  return params;

}
}
