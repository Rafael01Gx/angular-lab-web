import { animate, style, transition, trigger } from '@angular/animations';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { IToast, ToastrService } from '../../../services/toastr.service';
import { Subscription } from 'rxjs';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroCheckCircle,
  heroExclamationTriangle,
  heroInformationCircle,
  heroXCircle,
  heroXMark
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-toastr',
  imports: [NgIconComponent],
  viewProviders: [
    provideIcons({
      heroCheckCircle,
      heroExclamationTriangle,
      heroInformationCircle,
      heroXCircle,
      heroXMark
    })
  ],
  template: `
    <div class="fixed top-5 right-5 z-[1000] flex flex-col items-end pointer-events-none">
      @for(toast of toasts; track toast.id){
      <div
        class="flex items-center w-80 min-h-16 rounded-lg mb-4 overflow-hidden relative shadow-lg backdrop-blur-sm transition-all duration-300 ease-out pointer-events-auto"
        [class]="getToastClasses(toast.type)"
        [@toastAnimation]>

        <div class="flex items-center justify-center w-12 h-12 ml-3">
          <ng-icon
            [name]="getIconName(toast.type)"
            class="w-6 h-6"
            [class]="getIconClasses(toast.type)">
          </ng-icon>
        </div>

        <div class="flex-grow px-2 py-3">
          <div class="font-semibold text-sm mb-1">{{ toast.title }}</div>
          <div class="text-sm opacity-90">{{ toast.message }}</div>
        </div>

        <button
          class="absolute top-2 right-2 p-1 opacity-70 hover:opacity-100 transition-opacity duration-200 rounded-full hover:bg-black/10"
          (click)="removeToast(toast.id)"
          type="button">
          <ng-icon name="heroXMark" class="w-4 h-4"></ng-icon>
        </button>

        <div
          class="absolute bottom-0 left-0 h-1 rounded-bl-lg animate-[toast-loader_3s_linear_forwards]"
          [class]="getLoaderClasses(toast.type)">
        </div>
      </div>
      }
    </div>
  `,
  animations: [
    trigger('toastAnimation', [
      transition(':enter', [
        style({
          transform: 'translateX(100%) scale(0.95)',
          opacity: 0
        }),
        animate(
          '300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          style({
            transform: 'translateX(0) scale(1)',
            opacity: 1
          })
        ),
      ]),
      transition(':leave', [
        animate(
          '200ms cubic-bezier(0.55, 0.055, 0.675, 0.19)',
          style({
            transform: 'translateX(100%) scale(0.95)',
            opacity: 0
          })
        )
      ]),
    ]),
  ],
  styles: `
    @keyframes toast-loader {
      0% {
        width: 100%;
      }
      100% {
        width: 0%;
      }
    }
  `,
})
export class ToastrComponent implements OnInit, OnDestroy {
  #toasterService = inject(ToastrService);
  #subscription!: Subscription;
  toasts: IToast[] = [];

  ngOnInit(): void {
    this.#subscription = this.#toasterService.toasts$.subscribe(
      (toasts) => (this.toasts = toasts)
    );
  }

  ngOnDestroy(): void {
    if (this.#subscription) {
      this.#subscription.unsubscribe();
    }
  }

  removeToast(id: number) {
    this.#toasterService.remove(id);
  }

  getToastClasses(type: string): string {
    const baseClasses = 'border-l-4';

    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-50 border-green-500 text-green-800`;
      case 'error':
        return `${baseClasses} bg-red-50 border-red-500 text-red-800`;
      case 'info':
        return `${baseClasses} bg-blue-50 border-blue-500 text-blue-800`;
      case 'warning':
        return `${baseClasses} bg-yellow-50 border-yellow-500 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-50 border-gray-500 text-gray-800`;
    }
  }

  getIconName(type: string): string {
    switch (type) {
      case 'success':
        return 'heroCheckCircle';
      case 'error':
        return 'heroXCircle';
      case 'info':
        return 'heroInformationCircle';
      case 'warning':
        return 'heroExclamationTriangle';
      default:
        return 'heroInformationCircle';
    }
  }

  getIconClasses(type: string): string {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'info':
        return 'text-blue-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  }

  getLoaderClasses(type: string): string {
    switch (type) {
      case 'success':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
      case 'info':
        return 'bg-blue-600';
      case 'warning':
        return 'bg-yellow-600';
      default:
        return 'bg-gray-600';
    }
  }
}
