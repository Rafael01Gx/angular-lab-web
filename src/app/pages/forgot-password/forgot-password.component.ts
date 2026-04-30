import {
  Component,
  inject,
  signal,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroEnvelope,
  heroArrowRight,
  heroArrowLeft,
  heroCheckCircle,
  heroExclamationCircle,
} from '@ng-icons/heroicons/outline';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent, RouterLink],
  viewProviders: [
    provideIcons({
      heroEnvelope,
      heroArrowRight,
      heroArrowLeft,
      heroCheckCircle,
      heroExclamationCircle,
    }),
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex">

      <!-- Left: Form Panel -->
      <div class="flex-1 flex items-center justify-center p-8 lg:p-12">
        <div class="w-full max-w-md">

          <!-- Header -->
          <div class="text-center mb-12">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-md mb-4 shadow-md">
              <img src="img/logo.png" alt="Logo" />
            </div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Recuperar Senha
            </h1>
            <p class="text-slate-500 mt-2">
              Informe seu e-mail para receber o link de redefinição
            </p>
          </div>

          <!-- Success State -->
          @if (submitted()) {
            <div class="text-center space-y-6">
              <div class="flex justify-center">
                <div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <ng-icon name="heroCheckCircle" size="36" class="text-green-500"></ng-icon>
                </div>
              </div>
              <div>
                <h2 class="text-xl font-semibold text-slate-700 mb-2">E-mail enviado!</h2>
                <p class="text-slate-500 text-sm leading-relaxed">
                  Se o endereço <strong class="text-slate-700">{{ email }}</strong> estiver cadastrado,
                  você receberá um e-mail com as instruções para redefinir sua senha.
                </p>
                <p class="text-slate-400 text-xs mt-3">Verifique também a caixa de spam.</p>
              </div>
              <button
                (click)="goBack()"
                class="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl
                       font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                       transition-all duration-200 flex items-center justify-center gap-2"
              >
                <ng-icon name="heroArrowLeft" size="18"></ng-icon>
                <span>Voltar ao Login</span>
              </button>
            </div>
          }

          <!-- Form State -->
          @if (!submitted()) {
            <!-- Error Message -->
            @if (errMessage()) {
              <div class="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6 -mt-4">
                <ng-icon name="heroExclamationCircle" size="16" class="text-red-400 shrink-0"></ng-icon>
                <span class="text-red-500 text-sm">{{ errMessage() }}</span>
              </div>
            }

            <form (ngSubmit)="onSubmit()" #forgotForm="ngForm" class="space-y-6">
              <!-- Email Field -->
              <div class="space-y-2">
                <label for="email" class="block text-sm font-medium text-slate-700">
                  E-mail
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ng-icon name="heroEnvelope" size="18" class="text-slate-400"></ng-icon>
                  </div>
                  <input
                    id="email"
                    type="email"
                    [(ngModel)]="email"
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

              <!-- Submit Button -->
              <button
                type="submit"
                [disabled]="!forgotForm.valid || isLoading()"
                class="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl
                       font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                       transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                       disabled:transform-none disabled:shadow-md flex items-center justify-center gap-2"
              >
                @if (!isLoading()) {
                  <span>Enviar Link de Recuperação</span>
                  <ng-icon name="heroArrowRight" size="18"></ng-icon>
                } @else {
                  <span>Enviando...</span>
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                }
              </button>

              <!-- Back to Login -->
              <div class="text-center">
                <a
                  routerLink="/login"
                  class="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <ng-icon name="heroArrowLeft" size="14"></ng-icon>
                  Voltar ao Login
                </a>
              </div>
            </form>
          }

        </div>
      </div>

      <!-- Right: Decorative Panel -->
      <div class="hidden lg:flex flex-3 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-orange-400 via-orange-500 to-red-400"></div>
        <div class="absolute inset-0 flex flex-col items-center justify-center text-white p-12 space-y-8">
          <div class="text-center space-y-4 max-w-sm">
            <div class="w-20 h-20 mx-auto rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <ng-icon name="heroEnvelope" size="40" class="text-white"></ng-icon>
            </div>
            <h2 class="text-3xl font-bold leading-tight">Recupere o seu acesso</h2>
            <p class="text-white/80 text-base leading-relaxed">
              Enviaremos um link seguro para o seu e-mail. O link expira em 30 minutos.
            </p>
          </div>
          <!-- Decorative circles -->
          <div class="absolute top-12 right-12 w-32 h-32 rounded-full bg-white/10"></div>
          <div class="absolute bottom-12 left-12 w-48 h-48 rounded-full bg-white/5"></div>
          <div class="absolute top-1/2 left-8 w-16 h-16 rounded-full bg-white/10"></div>
        </div>
      </div>
    </div>
  `,
})
export class ForgotPasswordComponent {
  readonly #authService = inject(AuthService);
  readonly #router = inject(Router);
  readonly #platformId = inject(PLATFORM_ID);

  email = '';
  isLoading = signal(false);
  submitted = signal(false);
  errMessage = signal<string | null>(null);

  goBack(): void {
    this.#router.navigate(['/login']);
  }

  async onSubmit(): Promise<void> {
    if (!this.email) return;

    if (!isPlatformBrowser(this.#platformId)) return;

    this.isLoading.set(true);
    this.errMessage.set(null);

    try {
      await this.#authService.resetPasswordRequest(this.email);
      this.submitted.set(true);
    } catch {
      this.errMessage.set('Ocorreu um erro ao enviar o e-mail. Tente novamente.');
      setTimeout(() => this.errMessage.set(null), 5000);
    } finally {
      this.isLoading.set(false);
    }
  }
}
