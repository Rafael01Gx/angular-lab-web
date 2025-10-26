import {inject, Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {ToastrService} from './toastr.service';
import {catchError, Observable, of, throwError} from 'rxjs';
import {
  Laboratorio
} from '../shared/interfaces/laboratorios-externos.interfaces';
import {API_ROUTES} from '../core/constants/routes.constant';

const { LABORATORIO_EXTERNO } = API_ROUTES;

@Injectable({
  providedIn: 'root',
})
export class LabsLabExternosService {
  #apiUrl = `${environment.apiURL}/${LABORATORIO_EXTERNO.BASE}`;
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

  findAll(): Observable<Laboratorio[]> {
    return this.#http.get<Laboratorio[]>(`${this.#apiUrl}/${LABORATORIO_EXTERNO.GET.FIND_ALL}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleGetError.bind(this)));
  }

  create(body: Partial<Laboratorio>): Observable<Laboratorio> {
    return this.#http.post<Laboratorio>(`${this.#apiUrl}/${LABORATORIO_EXTERNO.POST.CREATE}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  update(id: number | string, body: Laboratorio): Observable<Laboratorio> {
    return this.#http.patch<Laboratorio>(`${this.#apiUrl}/${LABORATORIO_EXTERNO.PATCH.UPDATE+id}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  delete(id: number | string): Observable<any> {
    return this.#http.delete(`${this.#apiUrl}/${LABORATORIO_EXTERNO.DELETE.DELETE+id}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }
}
