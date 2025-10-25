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
import {API_ROUTES} from '../shared/constants/routes.constant';

const { USER } = API_ROUTES;

@Injectable({ providedIn: 'root' })
export class UserService {
  #apiUrl = `${environment.apiURL}/${USER.BASE}`;
  #http = inject(HttpClient);
  #authService = inject(AuthService);


  update(user: UpdateUserData): Observable<IUserResponse> {
    const id = this.#authService.currentUser()?.id;
    return this.#http
      .patch<IUserResponse>(`${this.#apiUrl}/${USER.PATCH.UPDATE+id}`, user, {
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
      this.#http.get<IUser[]>(`${this.#apiUrl}/${USER.GET.GET_ALL}`, { withCredentials: true })
    );
  }

  async updateStatus(id: string, user: IUser): Promise<IUserResponse> {
    return firstValueFrom(
      this.#http.patch<IUserResponse>(`${this.#apiUrl}/${USER.PATCH.UPDATE_STATUS+id}`, user, {
        withCredentials: true,
      })
    )
  }


}
