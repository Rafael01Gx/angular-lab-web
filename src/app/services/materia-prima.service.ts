import {catchError, Observable} from 'rxjs';
import {inject, Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {IMateriaPrima} from '../shared/interfaces/materia-prima.interface';
import {HandleFetchErrorService} from './handle-fetch-error.service';

@Injectable({
  providedIn: 'root',
})
export class MateriaPrimaService {
  #apiUrl = `${environment.apiURL}/materia-prima`;
  #http = inject(HttpClient);
  #handleFetchError = inject(HandleFetchErrorService);

  findAll(): Observable<IMateriaPrima[]> {
    return this.#http.get<IMateriaPrima[]>(`${this.#apiUrl}`, {
      withCredentials: true,
    }).pipe(catchError(this.#handleFetchError.handleGetError.bind(this)));
  }

  create(body: IMateriaPrima): Observable<IMateriaPrima> {
    return this.#http.post<IMateriaPrima>(`${this.#apiUrl}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.#handleFetchError.handleSetError.bind(this)));
  }

  update(id: number, body: IMateriaPrima): Observable<IMateriaPrima> {
    return this.#http.patch<IMateriaPrima>(`${this.#apiUrl}/${id}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.#handleFetchError.handleSetError.bind(this)));
  }

  delete(id: number): Observable<any> {
    return this.#http.delete(`${this.#apiUrl}/${id}`, {
      withCredentials: true,
    }).pipe(catchError(this.#handleFetchError.handleSetError.bind(this)));
  }
}
