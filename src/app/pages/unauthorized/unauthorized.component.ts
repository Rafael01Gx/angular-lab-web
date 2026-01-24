import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';
import {NgIconComponent, provideIcons} from '@ng-icons/core';
import {
  heroShieldExclamation,
  heroArrowLeft,
  heroLockClosed,
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-unauthorized-page',
  standalone: true,
  imports: [NgIconComponent],
  viewProviders: [
    provideIcons({
      heroShieldExclamation,
      heroArrowLeft,
      heroLockClosed,
    }),
  ],
  template: `
    <section
      class="relative min-h-screen overflow-hidden bg-gradient-to-br from-[var(--gradient-main-bg-from)] via-[var(--gradient-main-bg-via)] to-[var(--gradient-main-bg-to)]"
    >
      <!-- Background decoration -->
      <div class="pointer-events-none absolute inset-0">
        <div
          class="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[var(--color-blue-50)] blur-3xl"
        ></div>
        <div
          class="absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-[var(--color-purple-50)] blur-3xl"
        ></div>
      </div>

      <!-- Content -->
      <div
        class="relative z-10 flex min-h-screen flex-col items-center justify-center px-6"
      >
        <!-- Icon -->
        <div
          class="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--gradient-notification-from)] to-[var(--gradient-notification-to)] shadow-lg"
        >
          <ng-icon
            name="heroLockClosed"
            class="h-10 w-10 text-[var(--color-white)]"
          />
        </div>

        <!-- Title -->
        <h1
          class="text-center text-3xl font-semibold tracking-tight text-[var(--color-text-dark)]"
        >
          Acesso restrito
        </h1>

        <!-- Subtitle -->
        <p
          class="mt-4 max-w-xl text-center text-base leading-relaxed text-[var(--color-text-medium)]"
        >
          Você não tem permissão para visualizar esta página. Este recurso é
          restrito de acordo com seu perfil de acesso. Caso necessite desse
          acesso, solicite autorização ao administrador do sistema.
        </p>

        <!-- Info banner -->
        <div
          class="mt-8 flex w-full max-w-2xl items-start gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-white)] p-5 shadow-sm"
        >
          <ng-icon
            name="heroShieldExclamation"
            class="mt-0.5 h-6 w-6 shrink-0 text-[var(--color-accent)]"
          />
          <div class="text-sm text-[var(--color-text-medium)]">
            Se você acredita que esta mensagem é um engano, verifique se está
            utilizando a conta correta ou entre em contato com o suporte técnico.
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-10 flex flex-col gap-4 sm:flex-row">
          <button
            type="button"
            (click)="goBack()"
            class="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--gradient-button-save-from)] to-[var(--gradient-button-save-to)] px-6 py-3 text-sm font-medium text-[var(--color-white)] shadow transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          >
            <ng-icon name="heroArrowLeft" class="h-4 w-4"/>
            Voltar ao início
          </button>
        </div>
      </div>
    </section>
  `,
})
export class UnauthorizedPage {
private readonly router = inject(Router);

  goBack(): void {
    this.router.navigate(['/']);
  }
}
