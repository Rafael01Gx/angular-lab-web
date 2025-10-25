import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {ToastrService} from './toastr.service';
import {catchError, Observable, of, throwError} from 'rxjs';
import {ElementoQuimico} from '../shared/interfaces/laboratorios-externos.interfaces';
import {API_ROUTES} from '../shared/constants/routes.constant';

const { ELEMENTO_QUIMICO } = API_ROUTES;

@Injectable({
  providedIn: 'root',
})
export class ElementoQuimicoLabExternosService {
  #apiUrl = `${environment.apiURL}/${ELEMENTO_QUIMICO.BASE}`;
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

  findAll(): Observable<ElementoQuimico[]> {
    return this.#http.get<ElementoQuimico[]>(`${this.#apiUrl}/${ELEMENTO_QUIMICO.GET.FIND_ALL}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleGetError.bind(this)));
  }

  create(body: ElementoQuimico): Observable<ElementoQuimico> {
    return this.#http.post<ElementoQuimico>(`${this.#apiUrl}/${ELEMENTO_QUIMICO.POST.CREATE}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  update(id: string| number, body: ElementoQuimico): Observable<ElementoQuimico> {
    return this.#http.patch<ElementoQuimico>(`${this.#apiUrl}/${ELEMENTO_QUIMICO.PATCH.UPDATE+id}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  delete(id: string| number): Observable<any> {
    return this.#http.delete(`${this.#apiUrl}/${ELEMENTO_QUIMICO.DELETE.DELETE+id}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }
}
