import { Observable } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { IOrders } from '../interfaces/orders.interface';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  #apiUrl = `${environment.apiURL}/order`;
  #http = inject(HttpClient);

  findAll(): Observable<IOrders[]> {
    return this.#http.get<IOrders[]>(`${this.#apiUrl}`, {
      withCredentials: true,
    });
  }
  create(body: IOrders): Observable<IOrders> {
    return this.#http.post<IOrders>(`${this.#apiUrl}`, body, {
      withCredentials: true,
    });
  }
  update(id: number, body: IOrders): Observable<IOrders> {
    return this.#http.patch<IOrders>(`${this.#apiUrl}/${id}`, body, {
      withCredentials: true,
    });
  }
  delete(id: number): Observable<any> {
    return this.#http.delete(`${this.#apiUrl}/${id}`, {
      withCredentials: true,
    });
  }
}
