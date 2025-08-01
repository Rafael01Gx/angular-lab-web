import {
  Component,
  inject,
  OnInit,
  PLATFORM_ID, signal
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroEye,
  heroEyeSlash,
  heroEnvelope,
  heroLockClosed,
  heroArrowRight,
  heroSparkles,
  heroShieldCheck,
  heroUsers,
} from '@ng-icons/heroicons/outline';
import { AuthService } from '../../services/auth.service';
import {Router} from '@angular/router';
import {catchError, throwError} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  viewProviders: [
    provideIcons({
      heroEye,
      heroEyeSlash,
      heroEnvelope,
      heroLockClosed,
      heroArrowRight,
      heroSparkles,
      heroShieldCheck,
      heroUsers,
    }),
  ],
  template: `
      <div
        class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex"
      >
        <div class="flex-1 flex items-center justify-center p-8 lg:p-12">
          <div class="w-full max-w-md">
            <div class="text-center mb-12">
              <div
                class="inline-flex items-center justify-center w-16 h-16  rounded-md mb-4 shadow-md"
              >
                <img src="img/logo.png" alt="" srcset=""/>
              </div>
              <h1
                class="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent"
              >
                Bem-vindo
              </h1>
              <p class="text-slate-500 mt-2">Faça login para continuar</p>
            </div>
            @if(errMessage()){<div class="text-center -mt-6">
              <span class="text-red-400 text-sm">{{errMessage()}}</span>
            </div>}
            <form (ngSubmit)="onLogin()" #loginForm="ngForm" class=" space-y-6">
              <div class="space-y-2">
                <label
                  for="email"
                  class="block text-sm font-medium text-slate-700"
                >
                  Email
                </label>
                <div class="relative">
                  <div
                    class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                  >
                    <ng-icon
                      name="heroEnvelope"
                      size="18"
                      class="text-slate-400"
                    ></ng-icon>
                  </div>
                  <input
                    id="email"
                    type="email"
                    [(ngModel)]="loginData.email"
                    name="email"
                    autocomplete="email"
                    required
                    email
                    class="w-full pl-12 pr-4 py-3 rounded-sm border border-slate-200 bg-white/70
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400
                         placeholder-slate-400 text-slate-700 transition-all duration-200
                         hover:bg-white/80"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <label
                  for="password"
                  class="block text-sm font-medium text-slate-700"
                >
                  Senha
                </label>
                <div class="relative">
                  <div
                    class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                  >
                    <ng-icon
                      name="heroLockClosed"
                      size="18"
                      class="text-slate-400"
                    ></ng-icon>
                  </div>
                  <input
                    id="password"
                    [type]="showPassword ? 'text' : 'password'"
                    [(ngModel)]="loginData.password"
                    name="password"
                    autocomplete="current-password"
                    required
                    minlength="6"
                    class="w-full pl-12 pr-12 py-3 rounded-sm border border-slate-200 bg-white/70
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400
                         placeholder-slate-400 text-slate-700 transition-all duration-200
                         hover:bg-white/80"
                    placeholder="Sua senha"
                  />
                  <button
                    type="button"
                    (click)="togglePassword()"
                    class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <ng-icon
                      [name]="showPassword ? 'heroEyeSlash' : 'heroEye'"
                      size="18"
                    ></ng-icon>
                  </button>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <label class="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    [(ngModel)]="rememberMe"
                    name="rememberMe"
                    class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/20"
                  />
                  <span class="text-sm text-slate-600">Lembrar-me</span>
                </label>
                <a
                  href="#"
                  class="text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Esqueceu a senha?
                </a>
              </div>

              <button
                type="submit"
                [disabled]="!loginForm.valid || isLoading"
                class="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl
                     font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                     transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                     disabled:transform-none disabled:shadow-md flex items-center justify-center gap-2"
              >
                <span *ngIf="!isLoading">Entrar</span>
                <span *ngIf="isLoading">Entrando...</span>
                <ng-icon
                  *ngIf="!isLoading"
                  name="heroArrowRight"
                  size="18"
                  class="transform group-hover:translate-x-1 transition-transform"
                ></ng-icon>
                <div
                  *ngIf="isLoading"
                  class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                ></div>
              </button>
            </form>
          </div>
        </div>

        <div class="hidden lg:flex flex-3 relative overflow-hidden">
          <div
            class="absolute inset-0 bg-gradient-to-br from-orange-400 via-orange-500 to-red-400"
          ></div>
        </div>
      </div>
  `,
  styleUrls: [],
})
export class LoginComponent implements OnInit {
  #authService = inject(AuthService);
  #router = inject(Router);
  #platformId = inject(PLATFORM_ID);

  errMessage = signal<string|null>(null)

  loginData = {
    email: '',
    password: '',
  };

  showPassword = false;
  rememberMe = false;
  isLoading = false;


  ngOnInit(): void {}


  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    if (!this.loginData.email || !this.loginData.password) {
      return;
    }
    this.isLoading = true;
    if (isPlatformBrowser(this.#platformId)) {

        this.#authService
          .login(this.loginData.email, this.loginData.password).pipe(
            catchError((err:HttpErrorResponse)=>{
              this.isLoading = false;
              if(err.status == 401){
                this.errMessage.set('E-mail ou senha incorretos.')
                setTimeout(()=>{
                  this.errMessage.set(null)
                },5000)
              }
              return throwError(() => new Error(err.message))
            })
        )
          .subscribe({
            next: () => {
              this.isLoading = false;
              this.#router.navigate(['/']);
            }
          });
    }


  }
}
