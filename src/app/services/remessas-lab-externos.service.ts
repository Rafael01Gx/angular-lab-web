import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {ToastrService} from './toastr.service';
import {catchError, Observable, of, throwError} from 'rxjs';
import {Remessa} from '../shared/interfaces/laboratorios-externos.interfaces';


@Injectable({
  providedIn: 'root',
})
export class RemessasLabExternosService {
  #apiUrl = `${environment.apiURL}/remessa-lab-externo`;
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

  findAll(): Observable<Remessa[]> {
    return this.#http.get<Remessa[]>(`${this.#apiUrl}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleGetError.bind(this)));
  }

  create(body: Remessa): Observable<Remessa> {
    return this.#http.post<Remessa>(`${this.#apiUrl}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  update(id: number | string, body: Remessa): Observable<Remessa> {
    return this.#http.patch<Remessa>(`${this.#apiUrl}/${id}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  delete(id: number | string): Observable<any> {
    return this.#http.delete(`${this.#apiUrl}/${id}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }
}
