import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {IParameters} from '../shared/interfaces/parameters.interface';
import {catchError, Observable, of, throwError} from 'rxjs';
import {ToastrService} from './toastr.service';

@Injectable({
  providedIn: 'root'
})
export class ParametersService {
  #http = inject(HttpClient);
  #apiUrl = `${environment.apiURL}/parametro-analise`;
  #toastr = inject(ToastrService);

  handleSetError(err: HttpErrorResponse): Observable<never> {
    this.#toastr.error(err.message);
    return throwError(() => new Error(err.message));
  }

  handleGetError(err: HttpErrorResponse): Observable<any> {
    this.#toastr.error(err.message);
    return of([]);
  }

  findAll(): Observable<IParameters[]> {
    return this.#http.get<IParameters[]>(`${this.#apiUrl}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleGetError.bind(this)));
  }

  create(body: IParameters): Observable<IParameters> {
    return this.#http.post<IParameters>(`${this.#apiUrl}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  update(id: number, body: IParameters): Observable<IParameters> {
    return this.#http.patch<IParameters>(`${this.#apiUrl}/${id}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  delete(id: number): Observable<any> {
    return this.#http.delete(`${this.#apiUrl}/${id}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }
}
