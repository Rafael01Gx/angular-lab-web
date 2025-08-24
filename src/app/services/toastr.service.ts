import { Message } from 'esbuild';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface IToast {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

@Injectable({
  providedIn: 'root',
})
export class ToastrService {
  #toasts: IToast[] = [];
  #toastSubject = new BehaviorSubject<IToast[]>([]);
  toasts$ = this.#toastSubject.asObservable();

  private show(
    title: string,
    message: string,
    type: 'success' | 'error' | 'info' | 'warning'
  ) {
    const id = Date.now();
    const toast: IToast = { id, title, message, type };
    this.#toasts.push(toast);
    this.#toastSubject.next(this.#toasts);
    setTimeout(() => {
      this.remove(id);
    }, 3000);
  }
  remove(id: number) {
    this.#toasts = this.#toasts.filter((t) => t.id !== id);
    this.#toastSubject.next(this.#toasts);
  }

  success(message: string, title: string = 'Sucesso') {
    return this.show(title, message, 'success');
  }
  error(message: string, title: string = 'Erro') {
    return this.show(title, message, 'error');
  }
  info(message: string, title: string = 'Informação') {
    return this.show(title, message, 'info');
  }
  warning(message: string, title: string = 'Aviso') {
    return this.show(title, message, 'warning');
  }
}
