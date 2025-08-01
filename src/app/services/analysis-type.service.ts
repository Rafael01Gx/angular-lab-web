import {catchError, Observable} from 'rxjs';
import {inject, Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {ITipoAnalise} from '../shared/interfaces/analysis-type.interface';
import {HandleFetchErrorService} from './handle-fetch-error.service';

@Injectable({
  providedIn: 'root',
})
export class AnalysisTypeService {
  #apiUrl = `${environment.apiURL}/tipo-de-analise`;
  #http = inject(HttpClient);
  #handleFetchError = inject(HandleFetchErrorService);

  findAll(): Observable<ITipoAnalise[]> {
    return this.#http.get<ITipoAnalise[]>(`${this.#apiUrl}`, {
      withCredentials: true,
    }).pipe(catchError(this.#handleFetchError.handleGetError.bind(this)));
  }

  create(body: ITipoAnalise): Observable<ITipoAnalise> {
    return this.#http.post<ITipoAnalise>(`${this.#apiUrl}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.#handleFetchError.handleSetError.bind(this)));
  }

  update(id: number, body: ITipoAnalise): Observable<ITipoAnalise> {
    return this.#http.patch<ITipoAnalise>(`${this.#apiUrl}/${id}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.#handleFetchError.handleSetError.bind(this)));
  }

  delete(id: number): Observable<any> {
    return this.#http.delete(`${this.#apiUrl}/${id}`, {
      withCredentials: true,
    }).pipe(catchError(this.#handleFetchError.handleSetError.bind(this)));
  }
}
