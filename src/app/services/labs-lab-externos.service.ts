import {inject, Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {ToastrService} from './toastr.service';
import {catchError, Observable, of, throwError} from 'rxjs';
import {
  Laboratorio
} from '../shared/interfaces/laboratorios-externos.interfaces';

@Injectable({
  providedIn: 'root',
})
export class LabsLabExternosService {
  #apiUrl = `${environment.apiURL}/laboratorio-externo`;
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

  findAll(): Observable<Laboratorio[]> {
    return this.#http.get<Laboratorio[]>(`${this.#apiUrl}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleGetError.bind(this)));
  }

  create(body: Partial<Laboratorio>): Observable<Laboratorio> {
    return this.#http.post<Laboratorio>(`${this.#apiUrl}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  update(id: number | string, body: Laboratorio): Observable<Laboratorio> {
    return this.#http.patch<Laboratorio>(`${this.#apiUrl}/${id}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  delete(id: number | string): Observable<any> {
    return this.#http.delete(`${this.#apiUrl}/${id}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }
}
