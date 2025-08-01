import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {IParameters} from '../shared/interfaces/parameters.interface';
import {catchError, Observable} from 'rxjs';
import {HandleFetchErrorService} from './handle-fetch-error.service';

@Injectable({
  providedIn: 'root'
})
export class ParametersService {
  #http = inject(HttpClient);
  #apiUrl = `${environment.apiURL}/parametro-analise`;
  #handleFetchError = inject(HandleFetchErrorService);

  findAll(): Observable<IParameters[]> {
    return this.#http.get<IParameters[]>(`${this.#apiUrl}`, {
      withCredentials: true,
    }).pipe(catchError(this.#handleFetchError.handleGetError.bind(this)));
  }

  create(body: IParameters): Observable<IParameters> {
    return this.#http.post<IParameters>(`${this.#apiUrl}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.#handleFetchError.handleSetError.bind(this)));
  }

  update(id: number, body: IParameters): Observable<IParameters> {
    return this.#http.patch<IParameters>(`${this.#apiUrl}/${id}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.#handleFetchError.handleSetError.bind(this)));
  }

  delete(id: number): Observable<any> {
    return this.#http.delete(`${this.#apiUrl}/${id}`, {
      withCredentials: true,
    }).pipe(catchError(this.#handleFetchError.handleSetError.bind(this)));
  }
}
