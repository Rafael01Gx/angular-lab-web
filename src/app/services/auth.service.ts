import { IUser, IUserResponse } from '../shared/interfaces/user.interface';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, firstValueFrom, Observable, of, tap } from 'rxjs';
import {API_ROUTES} from '../core/constants/api-routes.constant';

const { AUTH } = API_ROUTES;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  #apiUrl = `${environment.apiURL}/${AUTH.BASE}`;
  #http = inject(HttpClient);

  #user$ = signal<IUser | null>(null);
  currentUser = this.#user$.asReadonly();
  isLogin = computed(() => !!this.#user$());

  constructor() {}

  login(email: string, password: string): Observable<IUserResponse> {
    return this.#http
      .post<IUserResponse>(
        `${this.#apiUrl}/${AUTH.POST.LOGIN}`,
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
      .post(`${this.#apiUrl}/${AUTH.POST.LOGOUT}`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.clearUser();
        })
      );
  }

  checkAuthStatus(): Observable<IUserResponse | null> {
    return this.#http
      .get<IUserResponse>(`${this.#apiUrl}/${AUTH.GET.PROFILE}`, {
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
      this.#http.post<IUserResponse>(`${this.#apiUrl}/${AUTH.POST.REGISTER}`, user, {
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
