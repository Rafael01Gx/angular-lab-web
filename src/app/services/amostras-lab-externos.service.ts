import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {ToastrService} from './toastr.service';
import {catchError, Observable, of, throwError} from 'rxjs';
import {AmostraLabExterno, AmostraLabExternoFull} from '../shared/interfaces/laboratorios-externos.interfaces';


@Injectable({
  providedIn: 'root',
})
export class AmostrasLabExternos {
  #apiUrl = `${environment.apiURL}/amostra-lab-externo`;
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

  findAll(): Observable<AmostraLabExternoFull[]> {
    return this.#http.get<AmostraLabExternoFull[]>(`${this.#apiUrl}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleGetError.bind(this)));
  }

  create(body: AmostraLabExterno): Observable<AmostraLabExternoFull> {
    return this.#http.post<AmostraLabExternoFull>(`${this.#apiUrl}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  update(id: number, body: AmostraLabExterno): Observable<AmostraLabExterno> {
    return this.#http.patch<AmostraLabExterno>(`${this.#apiUrl}/${id}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  delete(id: number): Observable<any> {
    return this.#http.delete(`${this.#apiUrl}/${id}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }
}
