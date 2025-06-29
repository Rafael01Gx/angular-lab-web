import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IUser } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  #apiUrl = `${environment.apiURL}/auth`;
  #http = inject(HttpClient);
  constructor() {}

  login(email: string, password: string): Observable<any> {
    return this.#http.post(
      `${this.#apiUrl}/login`,
      { email, password },
      { withCredentials: true }
    );
  }
}
