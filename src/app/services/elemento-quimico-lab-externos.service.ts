import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {ToastrService} from '../components/layout/toastr/toastr.service';
import {catchError, Observable, of, throwError} from 'rxjs';
import {ElementoQuimico} from '../shared/interfaces/laboratorios-externos.interfaces';



@Injectable({
  providedIn: 'root',
})
export class ElementoQuimicoLabExternosService {
  #apiUrl = `${environment.apiURL}/elemento-quimico`;
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

  findAll(): Observable<ElementoQuimico[]> {
    return this.#http.get<ElementoQuimico[]>(`${this.#apiUrl}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleGetError.bind(this)));
  }

  create(body: ElementoQuimico): Observable<ElementoQuimico> {
    return this.#http.post<ElementoQuimico>(`${this.#apiUrl}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  update(id: string| number, body: ElementoQuimico): Observable<ElementoQuimico> {
    return this.#http.patch<ElementoQuimico>(`${this.#apiUrl}/${id}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  delete(id: string| number): Observable<any> {
    return this.#http.delete(`${this.#apiUrl}/${id}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }
}
