import {
  Component,
  OnInit,
  OnDestroy,
  output,
  OutputEmitterRef, signal, model,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroExclamationTriangle,
  heroTrash,
  heroXMark,
  heroCheck,
  heroInformationCircle,
  heroExclamationCircle,
} from '@ng-icons/heroicons/outline';
import { ConfirmationModalConfig } from '../../../shared/interfaces/modals.interface';

@Component({
  selector: 'app-confirmation-modal',
  imports: [CommonModule, NgIconComponent],
  viewProviders: [
    provideIcons({
      heroExclamationTriangle,
      heroTrash,
      heroXMark,
      heroCheck,
      heroInformationCircle,
      heroExclamationCircle,
    }),
  ],
  template: `
    @if(isVisible()){<div
    class="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
    (click)="onBackdropClick($event)"
    >
    <div class="absolute inset-0 bg-slate-800/20 "></div>

    <!-- Container -->
    <div
    class="relative w-full max-w-md bg-blue-50/80 backdrop-blur-sm rounded-md shadow-2xl
    border border-white/50 animate-scale-in overflow-hidden dark:bg-gray-800 dark:text-gray-600"
    (click)="$event.stopPropagation()"
    >
    <!-- Header -->
    <div class="relative p-6 pb-4">
    <!-- Close Button -->
    <button
    (click)="onCancel()"
    class="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600
    hover:bg-slate-100/50 rounded-sm transition-all duration-200"
    type="button"
    aria-label="Fechar modal"
    >
    <ng-icon name="heroXMark" size="20"></ng-icon>
    </button>

    <!-- Icon -->
    <div class="flex items-center justify-center mb-4">
    <div
    [ngClass]="getIconContainerClass()"
    class="w-16 h-16 rounded-full flex items-center justify-center"
    >
    <ng-icon
    [name]="getIconName()"
    size="32"
    [ngClass]="getIconClass()"
    ></ng-icon>
    </div>
    </div>

    <!-- Title -->
    <h2 class="text-xl font-bold text-center text-slate-800 dark:text-white mb-2">
    {{ config().title || getDefaultTitle() }}
    </h2>

    <!-- Message -->
    <div class="text-center text-slate-600 dark:text-gray-400 space-y-2">
    <p class="leading-relaxed">
    {{ config().message || getDefaultMessage() }}
    </p>

    <!-- Item Name -->
    <div
    *ngIf="config().showItemName && config().itemName"
    class="inline-flex items-center px-3 py-1 bg-slate-100/80 rounded-sm text-sm font-medium text-slate-700 mt-3"
    >
    <span class="truncate max-w-xs">{{ config().itemName }}</span>
    </div>
    </div>
    </div>

    <!-- Actions -->
    <div class="px-6 pb-6 flex gap-3">
    <!-- Cancel Button -->
    <button
    (click)="onCancel()"
    type="button"
    class="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700
    rounded-md font-medium transition-all duration-200 hover:shadow-md"
    >
    {{ config().cancelText || 'Cancelar' }}
    </button>

    <!-- Confirm Button -->
    <button [disabled]="isLoading()"
    (click)="onConfirm()"
    type="button"
    [ngClass]="getConfirmButtonClass()"
    class="flex-1 py-3 px-4 rounded-md font-medium transition-all duration-200
    transform hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
    >
    <ng-icon [name]="getConfirmIconName()" size="18"></ng-icon>
    <span>{{ config().confirmText || getDefaultConfirmText() }}</span>
    </button>
    </div>

    <!-- Bottom gradient decoration -->
    <div [ngClass]="getBottomGradientClass()" class="h-1"></div>
    </div>
    </div>}
  `,
  styles: [
    `
      @keyframes fade-in {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes scale-in {
        from {
          opacity: 0;
          transform: scale(0.95) translateY(10px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      .animate-fade-in {
        animation: fade-in 0.2s ease-out;
      }

      .animate-scale-in {
        animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
    `,
  ],
})
export class ConfirmationModalComponent implements OnInit, OnDestroy {
  isVisible= model<boolean>(false);
  config= model<ConfirmationModalConfig>({});

  isLoading = signal<boolean>(false)

  confirmed: OutputEmitterRef<void> = output<void>();
  cancelled: OutputEmitterRef<void> = output<void>();
  closed: OutputEmitterRef<void> = output<void>();

  ngOnInit(): void {
    if (this.isVisible()) {
    //  document.body.style.overflow = 'hidden';
    }
  }

private isDestroyed = false;

ngOnDestroy(): void {
  this.isDestroyed = true;
  document.body.style.overflow = '';
}

  onBackdropClick(event: Event): void {
    this.onCancel();
  }

  onConfirm(): void {
    this.isLoading.set(true);
    this.confirmed.emit();
    this.close();
  }

  onCancel(): void {
    this.cancelled.emit();
    this.close();
  }

  private close(): void {
    document.body.style.overflow = '';
    this.closed.emit();
  }

  // Dynamic styling methods
  getIconName(): string {
    if (this.config().icon) {
      return this.config().icon!;
    }

    switch (this.config().type) {
      case 'danger':
        return 'heroTrash';
      case 'warning':
        return 'heroExclamationTriangle';
      case 'info':
        return 'heroInformationCircle';
      default:
        return 'heroExclamationCircle';
    }
  }

  getIconClass(): string {
    switch (this.config().type) {
      case 'danger':
        return 'text-red-500';
      case 'warning':
        return 'text-amber-500';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-orange-500';
    }
  }

  getIconContainerClass(): string {
    switch (this.config().type) {
      case 'danger':
        return 'bg-red-50 border-2 border-red-100';
      case 'warning':
        return 'bg-amber-50 border-2 border-amber-100';
      case 'info':
        return 'bg-blue-50 border-2 border-blue-100';
      default:
        return 'bg-orange-50 border-2 border-orange-100';
    }
  }

  getConfirmButtonClass(): string {
    switch (this.config().type) {
      case 'danger':
        return 'bg-gradient-to-r from-red-400 to-red-500 hover:from-red-600 hover:to-red-700 text-white';
      case 'warning':
        return 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white';
      case 'info':
        return 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white';
      default:
        return 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white';
    }
  }

  getConfirmIconName(): string {
    switch (this.config().type) {
      case 'danger':
        return 'heroTrash';
      case 'warning':
      case 'info':
        return 'heroCheck';
      default:
        return 'heroCheck';
    }
  }

  getBottomGradientClass(): string {
    switch (this.config().type) {
      case 'danger':
        return 'bg-gradient-to-r from-red-200 via-red-300 to-red-200';
      case 'warning':
        return 'bg-gradient-to-r from-amber-200 via-amber-300 to-amber-200';
      case 'info':
        return 'bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200';
      default:
        return 'bg-gradient-to-r from-orange-200 via-orange-300 to-orange-200';
    }
  }

  // Default content methods
  getDefaultTitle(): string {
    switch (this.config().type) {
      case 'danger':
        return 'Confirmar Exclusão';
      case 'warning':
        return 'Atenção Necessária';
      case 'info':
        return 'Confirmação';
      default:
        return 'Confirmar Ação';
    }
  }

  getDefaultMessage(): string {
    switch (this.config().type) {
      case 'danger':
        return 'Esta ação não pode ser desfeita. O item será permanentemente removido.';
      case 'warning':
        return 'Esta ação pode ter consequências importantes. Deseja continuar?';
      case 'info':
        return 'Confirme se deseja prosseguir com esta ação.';
      default:
        return 'Tem certeza que deseja continuar?';
    }
  }

  getDefaultConfirmText(): string {
    switch (this.config().type) {
      case 'danger':
        return 'Excluir';
      case 'warning':
        return 'Continuar';
      case 'info':
        return 'Confirmar';
      default:
        return 'Confirmar';
    }
  }
}
