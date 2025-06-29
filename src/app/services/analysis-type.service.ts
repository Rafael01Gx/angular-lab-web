import { Observable } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ITipoAnalise } from '../interfaces/settings.interface';

@Injectable({
  providedIn: 'root',
})
export class AnalysisTypeService {
  #apiUrl = `${environment.apiURL}/tipo-de-analise`;
  #http = inject(HttpClient);

  findAll(): Observable<ITipoAnalise[]> {
    return this.#http.get<ITipoAnalise[]>(`${this.#apiUrl}`, {
      withCredentials: true,
    });
  }
  create(body: ITipoAnalise): Observable<ITipoAnalise> {
    return this.#http.post<ITipoAnalise>(`${this.#apiUrl}`, body, {
      withCredentials: true,
    });
  }
  update(id: string, body: ITipoAnalise): Observable<ITipoAnalise> {
    return this.#http.patch<ITipoAnalise>(`${this.#apiUrl}/${id}`, body, {
      withCredentials: true,
    });
  }
  delete(id: string): Observable<ITipoAnalise> {
    return this.#http.patch<ITipoAnalise>(
      `${this.#apiUrl}/${id}`,
      {},
      {
        withCredentials: true,
      }
    );
  }
}
