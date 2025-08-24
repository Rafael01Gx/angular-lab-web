import {catchError, Observable, of, throwError} from 'rxjs';
import {inject, Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {IMateriaPrima} from '../shared/interfaces/materia-prima.interface';
import {ToastrService} from './toastr.service';

@Injectable({
  providedIn: 'root',
})
export class MateriaPrimaService {
  #apiUrl = `${environment.apiURL}/materia-prima`;
  #http = inject(HttpClient);
  #toastr = inject(ToastrService);

  handleSetError(err: HttpErrorResponse): Observable<never> {
    this.#toastr.error(err.message);
    return throwError(() => new Error(err.message));
  }

  handleGetError(err: HttpErrorResponse): Observable<any> {
    this.#toastr.error(err.message);
    return of([]);
  }

  findAll(): Observable<IMateriaPrima[]> {
    return this.#http.get<IMateriaPrima[]>(`${this.#apiUrl}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleGetError.bind(this)));
  }

  create(body: IMateriaPrima): Observable<IMateriaPrima> {
    return this.#http.post<IMateriaPrima>(`${this.#apiUrl}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  update(id: number, body: IMateriaPrima): Observable<IMateriaPrima> {
    return this.#http.patch<IMateriaPrima>(`${this.#apiUrl}/${id}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  delete(id: number): Observable<any> {
    return this.#http.delete(`${this.#apiUrl}/${id}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }
}
