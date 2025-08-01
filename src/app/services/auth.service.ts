import { IUser, IUserResponse } from '../shared/interfaces/user.interface';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, firstValueFrom, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  #apiUrl = `${environment.apiURL}/auth`;
  #http = inject(HttpClient);

  #user$ = signal<IUser | null>(null);
  currentUser = this.#user$.asReadonly();
  isLogin = computed(() => !!this.#user$());

  constructor() {}

  login(email: string, password: string): Observable<IUserResponse> {
    return this.#http
      .post<IUserResponse>(
        `${this.#apiUrl}/login`,
        { email, password },
        { withCredentials: true }
      )
      .pipe(
        tap((res) => {
          this.setUser(res.user);
        })
      );
  }

  logout(): Observable<any> {
    return this.#http
      .post(`${this.#apiUrl}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.clearUser();
        })
      );
  }

  checkAuthStatus(): Observable<IUserResponse | null> {
    return this.#http
      .get<IUserResponse>(`${this.#apiUrl}/profile`, {
        withCredentials: true,
      })
      .pipe(
        tap((res) => this.setUser(res.user)),
        catchError(() => {
          this.clearUser();
          return of(null);
        })
      );
  }

  async create(user: IUser): Promise<IUserResponse> {
    return firstValueFrom(
      this.#http.post<IUserResponse>(`${this.#apiUrl}/register`, user, {
        withCredentials: true,
      })
    );
  }

  setUser(user: IUser) {
    this.#user$.set(user);
  }

  clearUser() {
    this.#user$.set(null);
  }
}
