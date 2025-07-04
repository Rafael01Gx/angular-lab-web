import { Injectable } from '@angular/core';
import { UpdateUserData } from '../interfaces/user.interface';

@Injectable({ providedIn: 'root' })
export class UserService {

  
  update(data: UpdateUserData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Dados atualizados:', data);
        resolve(data);
      }, 1000);
    });
  }
}
