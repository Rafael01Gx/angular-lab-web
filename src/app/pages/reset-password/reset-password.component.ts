import {
  Component,
  inject,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroLockClosed,
  heroEye,
  heroEyeSlash,
  heroArrowRight,
  heroArrowLeft,
  heroCheckCircle,
  heroExclamationCircle,
  heroShieldCheck,
  heroXCircle,
} from '@ng-icons/heroicons/outline';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

interface PasswordRule {
  label: string;
  test: (pw: string) => boolean;
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent, RouterLink],
  viewProviders: [
    provideIcons({
      heroLockClosed,
      heroEye,
      heroEyeSlash,
      heroArrowRight,
      heroArrowLeft,
      heroCheckCircle,
      heroExclamationCircle,
      heroShieldCheck,
      heroXCircle,
    }),
  ],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex">

      <!-- Left: Form Panel -->
      <div class="flex-1 flex items-center justify-center p-8 lg:p-12">
        <div class="w-full max-w-md">

          <!-- Header -->
          <div class="text-center mb-10">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-md mb-4 shadow-md">
              <img src="img/logo.png" alt="Logo" />
            </div>
            <h1 class="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Redefinir Senha
            </h1>
            <p class="text-slate-500 mt-2">Crie uma nova senha segura para sua conta</p>
          </div>

          <!-- Invalid Token State -->
          @if (invalidLink()) {
            <div class="text-center space-y-6">
              <div class="flex justify-center">
                <div class="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                  <ng-icon name="heroXCircle" size="36" class="text-red-400"></ng-icon>
                </div>
              </div>
              <div>
                <h2 class="text-xl font-semibold text-slate-700 mb-2">Link inválido ou expirado</h2>
                <p class="text-slate-500 text-sm leading-relaxed">
                  Este link de redefinição de senha é inválido ou já expirou.
                  Solicite um novo link de recuperação.
                </p>
              </div>
              <a
                routerLink="/forgot-password"
                class="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl
                       font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                       transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>Solicitar Novo Link</span>
                <ng-icon name="heroArrowRight" size="18"></ng-icon>
              </a>
            </div>
          }

          <!-- Success State -->
          @if (success()) {
            <div class="text-center space-y-6">
              <div class="flex justify-center">
                <div class="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <ng-icon name="heroCheckCircle" size="36" class="text-green-500"></ng-icon>
                </div>
              </div>
              <div>
                <h2 class="text-xl font-semibold text-slate-700 mb-2">Senha redefinida!</h2>
                <p class="text-slate-500 text-sm leading-relaxed">
                  Sua senha foi alterada com sucesso. Você já pode fazer login com a nova senha.
                </p>
              </div>
              <a
                routerLink="/login"
                class="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl
                       font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                       transition-all duration-200 flex items-center justify-center gap-2"
              >
                <ng-icon name="heroArrowLeft" size="18"></ng-icon>
                <span>Ir para o Login</span>
              </a>
            </div>
          }

          <!-- Form -->
          @if (!invalidLink() && !success()) {
            <!-- Error Message -->
            @if (errMessage()) {
              <div class="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6 -mt-2">
                <ng-icon name="heroExclamationCircle" size="16" class="text-red-400 shrink-0"></ng-icon>
                <span class="text-red-500 text-sm">{{ errMessage() }}</span>
              </div>
            }

            <form (ngSubmit)="onSubmit()" #resetForm="ngForm" class="space-y-6">

              <!-- New Password -->
              <div class="space-y-2">
                <label for="password" class="block text-sm font-medium text-slate-700">
                  Nova Senha
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ng-icon name="heroLockClosed" size="18" class="text-slate-400"></ng-icon>
                  </div>
                  <input
                    id="password"
                    [type]="showPassword() ? 'text' : 'password'"
                    [(ngModel)]="password"
                    name="password"
                    required
                    class="w-full pl-12 pr-12 py-3 rounded-sm border border-slate-200 bg-white/70
                           focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400
                           placeholder-slate-400 text-slate-700 transition-all duration-200 hover:bg-white/80"
                    placeholder="Mínimo 8 caracteres"
                  />
                  <button
                    type="button"
                    (click)="togglePassword()"
                    class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <ng-icon [name]="showPassword() ? 'heroEyeSlash' : 'heroEye'" size="18"></ng-icon>
                  </button>
                </div>

                <!-- Strength Meter -->
                @if (password.length > 0) {
                  <div class="space-y-2 pt-1">
                    <!-- Bar -->
                    <div class="flex gap-1 h-1.5">
                      @for (segment of [0, 1, 2, 3]; track segment) {
                        <div
                          class="flex-1 rounded-full transition-all duration-300"
                          [class]="getSegmentClass(segment)"
                        ></div>
                      }
                    </div>
                    <!-- Label -->
                    <p class="text-xs font-medium" [class]="strengthLabelClass">
                      {{ strengthLabel }}
                    </p>
                    <!-- Rules checklist -->
                    <ul class="space-y-1 mt-2">
                      @for (rule of passwordRules; track rule.label) {
                        <li class="flex items-center gap-2 text-xs"
                            [class]="rule.test(password) ? 'text-green-600' : 'text-slate-400'">
                          <ng-icon
                            [name]="rule.test(password) ? 'heroCheckCircle' : 'heroXCircle'"
                            size="14"
                            [class]="rule.test(password) ? 'text-green-500' : 'text-slate-300'"
                          ></ng-icon>
                          {{ rule.label }}
                        </li>
                      }
                    </ul>
                  </div>
                }
              </div>

              <!-- Confirm Password -->
              <div class="space-y-2">
                <label for="confirmPassword" class="block text-sm font-medium text-slate-700">
                  Confirmar Nova Senha
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ng-icon name="heroShieldCheck" size="18" class="text-slate-400"></ng-icon>
                  </div>
                  <input
                    id="confirmPassword"
                    [type]="showConfirmPassword() ? 'text' : 'password'"
                    [(ngModel)]="confirmPassword"
                    name="confirmPassword"
                    required
                    class="w-full pl-12 pr-12 py-3 rounded-sm border border-slate-200 bg-white/70
                           focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400
                           placeholder-slate-400 text-slate-700 transition-all duration-200 hover:bg-white/80"
                    [class.border-red-300]="confirmPassword.length > 0 && password !== confirmPassword"
                    [class.focus:border-red-400]="confirmPassword.length > 0 && password !== confirmPassword"
                    placeholder="Repita a nova senha"
                  />
                  <button
                    type="button"
                    (click)="toggleConfirmPassword()"
                    class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <ng-icon [name]="showConfirmPassword() ? 'heroEyeSlash' : 'heroEye'" size="18"></ng-icon>
                  </button>
                </div>
                @if (confirmPassword.length > 0 && password !== confirmPassword) {
                  <p class="text-xs text-red-500 flex items-center gap-1">
                    <ng-icon name="heroExclamationCircle" size="12"></ng-icon>
                    As senhas não coincidem
                  </p>
                }
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                [disabled]="!canSubmit || isLoading()"
                class="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl
                       font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                       transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                       disabled:transform-none disabled:shadow-md flex items-center justify-center gap-2"
              >
                @if (!isLoading()) {
                  <span>Redefinir Senha</span>
                  <ng-icon name="heroArrowRight" size="18"></ng-icon>
                } @else {
                  <span>Salvando...</span>
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                }
              </button>

              <!-- Back link -->
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
              <ng-icon name="heroShieldCheck" size="40" class="text-white"></ng-icon>
            </div>
            <h2 class="text-3xl font-bold leading-tight">Senha segura</h2>
            <p class="text-white/80 text-base leading-relaxed">
              Use no mínimo 8 caracteres, combinando letras maiúsculas, minúsculas e um caractere especial.
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
export class ResetPasswordComponent implements OnInit {
  readonly #authService = inject(AuthService);
  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);
  readonly #platformId = inject(PLATFORM_ID);

  password = '';
  confirmPassword = '';
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  isLoading = signal(false);
  success = signal(false);
  errMessage = signal<string | null>(null);
  invalidLink = signal(false);

  #token = '';
  #email = '';

  readonly passwordRules: PasswordRule[] = [
    { label: 'Mínimo de 8 caracteres', test: (pw) => pw.length >= 8 },
    { label: 'Pelo menos uma letra maiúscula (A-Z)', test: (pw) => /[A-Z]/.test(pw) },
    { label: 'Pelo menos uma letra minúscula (a-z)', test: (pw) => /[a-z]/.test(pw) },
    { label: 'Pelo menos um caractere especial (!@#$...)', test: (pw) => /[^a-zA-Z0-9]/.test(pw) },
  ];

  get passwordStrength(): number {
    return this.passwordRules.filter((r) => r.test(this.password)).length;
  }

  get strengthLabel(): string {
    const score = this.passwordStrength;
    if (score === 0) return '';
    if (score === 1) return 'Muito fraca';
    if (score === 2) return 'Fraca';
    if (score === 3) return 'Moderada';
    return 'Forte';
  }

  get strengthLabelClass(): string {
    const score = this.passwordStrength;
    if (score <= 1) return 'text-red-500';
    if (score === 2) return 'text-orange-500';
    if (score === 3) return 'text-yellow-600';
    return 'text-green-600';
  }

  get canSubmit(): boolean {
    return (
      this.passwordStrength === 4 &&
      this.password === this.confirmPassword &&
      this.confirmPassword.length > 0
    );
  }

  ngOnInit(): void {
    this.#route.queryParams.subscribe((params) => {
      this.#token = params['token'] ?? '';
      this.#email = params['email'] ?? '';

      if (!this.#token || !this.#email) {
        this.invalidLink.set(true);
      }
    });
  }

  getSegmentClass(index: number): string {
    const score = this.passwordStrength;
    if (index >= score) return 'bg-slate-200';
    if (score === 1) return 'bg-red-400';
    if (score === 2) return 'bg-orange-400';
    if (score === 3) return 'bg-yellow-400';
    return 'bg-green-500';
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  async onSubmit(): Promise<void> {
    if (!this.canSubmit) return;
    if (!isPlatformBrowser(this.#platformId)) return;

    this.isLoading.set(true);
    this.errMessage.set(null);

    try {
      await this.#authService.resetPasswordFromToken(this.#token, this.#email, this.password);
      this.success.set(true);
    } catch {
      this.errMessage.set('Ocorreu um erro ao redefinir sua senha. Tente novamente ou solicite um novo link.');
      setTimeout(() => this.errMessage.set(null), 6000);
    } finally {
      this.isLoading.set(false);
    }
  }
}
