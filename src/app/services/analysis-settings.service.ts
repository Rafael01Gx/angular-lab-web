import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { IAnalysisSettings } from '../interfaces/analysis-settings.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AnalysisSettingsService {
  #apiUrl = `${environment.apiURL}/config-analise`;
  #http = inject(HttpClient);

  findAll(): Observable<IAnalysisSettings[]> {
    return this.#http.get<IAnalysisSettings[]>(`${this.#apiUrl}`, {
      withCredentials: true,
    });
  }
  create(body: IAnalysisSettings): Observable<IAnalysisSettings> {
    const { parametros, ...data } = body;
    const parametrosId = parametros.map((p) => {
      return p.id;
    });
    return this.#http.post<IAnalysisSettings>(
      `${this.#apiUrl}`,
      { parametros: parametrosId, ...data },
      {
        withCredentials: true,
      }
    );
  }
  update(id: number, body: IAnalysisSettings): Observable<IAnalysisSettings> {
    const { parametros, ...data } = body;
    const parametrosId = parametros.map((p) => {
      return p.id;
    });
    return this.#http.patch<IAnalysisSettings>(
      `${this.#apiUrl}/${id}`,
      { parametros: parametrosId, ...data },
      {
        withCredentials: true,
      }
    );
  }
  delete(id: number): Observable<any> {
    return this.#http.delete(`${this.#apiUrl}/${id}`, {
      withCredentials: true,
    });
  }
}
