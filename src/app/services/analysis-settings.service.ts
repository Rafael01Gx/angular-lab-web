import {inject, Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {IAnalysisSettings} from '../shared/interfaces/analysis-settings.interface';
import {catchError, Observable} from 'rxjs';
import {HandleFetchErrorService} from './handle-fetch-error.service';

@Injectable({
  providedIn: 'root',
})
export class AnalysisSettingsService {
  #apiUrl = `${environment.apiURL}/config-analise`;
  #http = inject(HttpClient);
  #handleFetchError = inject(HandleFetchErrorService);

  findAll(): Observable<IAnalysisSettings[]> {
    return this.#http.get<IAnalysisSettings[]>(`${this.#apiUrl}`, {
      withCredentials: true,
    }).pipe(catchError(this.#handleFetchError.handleGetError.bind(this)));
  }

  create(body: IAnalysisSettings): Observable<IAnalysisSettings> {
    const {parametros, ...data} = body;
    const parametrosId = parametros.map((p) => {
      return p.id;
    });
    return this.#http.post<IAnalysisSettings>(
      `${this.#apiUrl}`,
      {parametros: parametrosId, ...data},
      {
        withCredentials: true,
      }
    ).pipe(catchError(this.#handleFetchError.handleSetError.bind(this)));
  }

  update(id: number, body: IAnalysisSettings): Observable<IAnalysisSettings> {
    const {parametros, ...data} = body;
    const parametrosId = parametros.map((p) => {
      return p.id;
    });
    return this.#http.patch<IAnalysisSettings>(
      `${this.#apiUrl}/${id}`,
      {parametros: parametrosId, ...data},
      {
        withCredentials: true,
      }
    ).pipe(catchError(this.#handleFetchError.handleSetError.bind(this)));
  }

  delete(id: number): Observable<any> {
    return this.#http.delete(`${this.#apiUrl}/${id}`, {
      withCredentials: true,
    }).pipe(catchError(this.#handleFetchError.handleSetError.bind(this)));
  }
}
