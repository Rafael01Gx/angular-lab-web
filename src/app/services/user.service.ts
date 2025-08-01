import { inject, Injectable } from '@angular/core';
import {
  IUser,
  IUserResponse,
  UpdateUserData,
} from '../shared/interfaces/user.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import {firstValueFrom, map, Observable} from 'rxjs';
import {HandleFetchErrorService} from './handle-fetch-error.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  #apiUrl = `${environment.apiURL}/user`;
  #http = inject(HttpClient);
  #authService = inject(AuthService);
  #handleFetchError = inject(HandleFetchErrorService);

  update(user: UpdateUserData): Observable<IUserResponse> {
    console.log(user);
    const id = this.#authService.currentUser()?.id;
    return this.#http
      .patch<IUserResponse>(`${this.#apiUrl}/${id}`, user, {
        withCredentials: true,
      })
      .pipe(
        map((res) => {
          if (res.user) {
            this.#authService.setUser(res.user);
          }
          return res;
        })
      );
  }

  async findAll(): Promise<IUser[]> {
    return firstValueFrom(
      this.#http.get<IUser[]>(`${this.#apiUrl}`, { withCredentials: true })
    );
  }
  async updateStatus(id: string, user: IUser): Promise<IUserResponse> {
    return firstValueFrom(
      this.#http.patch<IUserResponse>(`${this.#apiUrl}/status/${id}`, user, {
        withCredentials: true,
      })
    )
  }


}
