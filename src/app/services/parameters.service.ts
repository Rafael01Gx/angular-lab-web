import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { IParameters } from '../interfaces/parameters.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParametersService {
#http = inject(HttpClient);
#apiUrl = `${environment.apiURL}/parametro-analise`

  findAll(): Observable<IParameters[]> {
    return this.#http.get<IParameters[]>(`${this.#apiUrl}`, {
      withCredentials: true,
    });
  }
  create(body: IParameters): Observable<IParameters> {
    return this.#http.post<IParameters>(`${this.#apiUrl}`, body, {
      withCredentials: true,
    });
  }
  update(id: number, body: IParameters): Observable<IParameters> {
    return this.#http.patch<IParameters>(`${this.#apiUrl}/${id}`, body, {
      withCredentials: true,
    });
  }
  delete(id: number): Observable<any> {
    return this.#http.delete(`${this.#apiUrl}/${id}`, {
      withCredentials: true,
    });
  }
}