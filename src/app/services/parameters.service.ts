import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {IParameters} from '../shared/interfaces/parameters.interface';
import {catchError, Observable, of, throwError} from 'rxjs';
import {ToastrService} from './toastr.service';
import {API_ROUTES} from '../core/constants/api-routes.constant';

const { PARAMETROS_ANALISES } = API_ROUTES;

@Injectable({
  providedIn: 'root'
})
export class ParametersService {
  #http = inject(HttpClient);
  #apiUrl = `${environment.apiURL}/${PARAMETROS_ANALISES.BASE}`;
  #toastr = inject(ToastrService);

  handleSetError(err: HttpErrorResponse): Observable<never> {
    this.#toastr.error(err.error.message);
    return throwError(() => new Error(err.error.message));
  }

  handleGetError(err: HttpErrorResponse): Observable<any> {
    this.#toastr.error(err.error.message);
    return of([]);
  }

  findAll(): Observable<IParameters[]> {
    return this.#http.get<IParameters[]>(`${this.#apiUrl}/${PARAMETROS_ANALISES.GET.FIND_ALL}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleGetError.bind(this)));
  }

  create(body: IParameters): Observable<IParameters> {
    return this.#http.post<IParameters>(`${this.#apiUrl}/${PARAMETROS_ANALISES.POST.CREATE}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  update(id: number, body: IParameters): Observable<IParameters> {
    return this.#http.patch<IParameters>(`${this.#apiUrl}/${PARAMETROS_ANALISES.PATCH.UPDATE+id}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  delete(id: number): Observable<any> {
    return this.#http.delete(`${this.#apiUrl}/${PARAMETROS_ANALISES.DELETE.DELETE+id}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }
}
