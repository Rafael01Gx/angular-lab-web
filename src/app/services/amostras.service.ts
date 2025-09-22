import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {ToastrService} from './toastr.service';
import {catchError, Observable, of, tap, throwError} from 'rxjs';
import {IAmostra} from '../shared/interfaces/amostra.interface';
import {Querys} from '../shared/interfaces/querys.interface';



@Injectable({
  providedIn: 'root',
})
export class AmostrasService {
  #apiUrl = `${environment.apiURL}/amostra`;
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
    return this.#http.get<IAmostra[]>(`${this.#apiUrl}?${query?.status}`, {
      withCredentials: true,
    }).pipe( catchError(this.handleGetError.bind(this)));
  }
  findAllByUser(query?: Querys): Observable<IAmostra[]> {
    return this.#http.get<IAmostra[]>(`${this.#apiUrl}/user?${query?.status}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleGetError.bind(this)));
  }

  create(amostras: Partial<IAmostra[]>): Observable<IAmostra> {
    return this.#http.post<IAmostra>(`${this.#apiUrl}`, {amostras}, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  update(id: number | string, body: Partial<IAmostra>): Observable<IAmostra> {
    return this.#http.patch<IAmostra>(`${this.#apiUrl}/${id}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  delete(id: number): Observable<any> {
    return this.#http.delete(`${this.#apiUrl}/${id}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }
}
