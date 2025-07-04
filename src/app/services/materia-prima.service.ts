import { Observable } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ITipoAnalise } from '../interfaces/settings.interface';
import { IMateriaPrima } from '../interfaces/materia-prima.interface';

@Injectable({
  providedIn: 'root',
})
export class MateriaPrimaService {
  #apiUrl = `${environment.apiURL}/materia-prima`;
  #http = inject(HttpClient);

  findAll(): Observable<IMateriaPrima[]> {
    return this.#http.get<IMateriaPrima[]>(`${this.#apiUrl}`, {
      withCredentials: true,
    });
  }
  create(body: IMateriaPrima): Observable<IMateriaPrima> {
    return this.#http.post<IMateriaPrima>(`${this.#apiUrl}`, body, {
      withCredentials: true,
    });
  }
  update(id: number, body: IMateriaPrima): Observable<IMateriaPrima> {
    return this.#http.patch<IMateriaPrima>(`${this.#apiUrl}/${id}`, body, {
      withCredentials: true,
    });
  }
  delete(id: number): Observable<any> {
    return this.#http.delete(`${this.#apiUrl}/${id}`, {
      withCredentials: true,
    });
  }
}
