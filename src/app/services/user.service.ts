import { inject, Injectable } from '@angular/core';
import { IUserResponse, UpdateUserData } from '../interfaces/user.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  #apiUrl = `${environment.apiURL}/user`;
  #http = inject(HttpClient);
  #authService = inject(AuthService);

  update(user: UpdateUserData): Observable<IUserResponse> {
    console.log(user)
    const id = this.#authService.currentUser()?.id;
    return this.#http
      .patch<IUserResponse>(
        `${this.#apiUrl}/${id}`,
         user ,
        { withCredentials: true }
      )
      .pipe(
        map((res) => {
          if (res.user) {
            this.#authService.setUser(res.user);
          }
          return res;
        })
      );
  }
}
