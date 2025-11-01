import {catchError, Observable, of, throwError} from 'rxjs';
import {inject, Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {IMateriaPrima} from '../shared/interfaces/materia-prima.interface';
import {ToastrService} from './toastr.service';
import {API_ROUTES} from '../core/constants/api-routes.constant';

const { MATERIAS_PRIMAS } = API_ROUTES;

@Injectable({
  providedIn: 'root',
})
export class MateriaPrimaService {
  #apiUrl = `${environment.apiURL}/${MATERIAS_PRIMAS.BASE}`;
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

  findAll(): Observable<IMateriaPrima[]> {
    return this.#http.get<IMateriaPrima[]>(`${this.#apiUrl}/${MATERIAS_PRIMAS.GET.FIND_ALL}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleGetError.bind(this)));
  }

  create(body: IMateriaPrima): Observable<IMateriaPrima> {
    return this.#http.post<IMateriaPrima>(`${this.#apiUrl}/${MATERIAS_PRIMAS.POST.CREATE}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  update(id: number, body: IMateriaPrima): Observable<IMateriaPrima> {
    return this.#http.patch<IMateriaPrima>(`${this.#apiUrl}/${MATERIAS_PRIMAS.PATCH.UPDATE+id}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  delete(id: number): Observable<any> {
    return this.#http.delete(`${this.#apiUrl}/${MATERIAS_PRIMAS.DELETE.DELETE+id}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }
}
