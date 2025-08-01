import {catchError, Observable} from 'rxjs';
import {inject, Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {IOrders} from '../shared/interfaces/orders.interface';
import {HandleFetchErrorService} from './handle-fetch-error.service';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  #apiUrl = `${environment.apiURL}/order`;
  #http = inject(HttpClient);
  #handleFetchError = inject(HandleFetchErrorService);

  findAll(): Observable<IOrders[]> {
    return this.#http.get<IOrders[]>(`${this.#apiUrl}`, {
      withCredentials: true,
    }).pipe(catchError(this.#handleFetchError.handleGetError.bind(this)));
  }

  create(body: IOrders): Observable<IOrders> {
    return this.#http.post<IOrders>(`${this.#apiUrl}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.#handleFetchError.handleSetError.bind(this)));
  }

  update(id: number, body: IOrders): Observable<IOrders> {
    return this.#http.patch<IOrders>(`${this.#apiUrl}/${id}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.#handleFetchError.handleSetError.bind(this)));
  }

  delete(id: number): Observable<any> {
    return this.#http.delete(`${this.#apiUrl}/${id}`, {
      withCredentials: true,
    }).pipe(catchError(this.#handleFetchError.handleSetError.bind(this)));
  }
}
