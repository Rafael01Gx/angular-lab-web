import { Component, input, output, computed, signal } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  heroBell, 
  heroCheck, 
  heroXMark,
  heroEnvelope,
  heroEnvelopeOpen 
} from '@ng-icons/heroicons/outline';

export interface INotifications {
  id: number;
  title: string;
  message: string;
  data?: string;
  read?: boolean;
  userId: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [NgIconComponent],
  providers: [
    provideIcons({ 
      heroBell, 
      heroCheck, 
      heroXMark,
      heroEnvelope,
      heroEnvelopeOpen 
    })
  ],
  template: `
    <div class="relative">
      <button
        type="button"
        (click)="toggleDropdown()"
        class="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors duration-200"
      >
        <ng-icon name="heroBell" size="24"></ng-icon>
        
        @if (unreadCount() > 0) {
          <span
            class="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white"
          >
            {{ unreadCount() > 99 ? '99+' : unreadCount() }}
          </span>
        }
      </button>

      @if (isOpen()) {
        <div
          class="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Notificações</h3>
            <button
              type="button"
              (click)="toggleDropdown()"
              class="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
            >
              <ng-icon name="heroXMark" size="20"></ng-icon>
            </button>
          </div>

          <!-- Lista -->
          <div class="overflow-y-auto flex-1">
            @if (notifications().length === 0) {
              <div class="px-4 py-8 text-center">
                <ng-icon name="heroBell" size="48" class="text-gray-300 mx-auto mb-3"></ng-icon>
                <p class="text-gray-500 text-sm">Nenhuma notificação</p>
              </div>
            } @else {
              @for (notification of notifications(); track notification.id) {
                <div
                  (click)="handleNotificationClick(notification)"
                  class="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                  [class.bg-blue-50]="!notification.read"
                >
                  <div class="flex items-start gap-3">

                    <div class="flex-shrink-0 mt-1">
                      <div
                        class="w-10 h-10 rounded-full flex items-center justify-center"
                        [class.bg-blue-100]="!notification.read"
                        [class.bg-gray-100]="notification.read"
                      >
                        <ng-icon
                          [name]="notification.read ? 'heroEnvelopeOpen' : 'heroEnvelope'"
                          size="20"
                          [class.text-blue-600]="!notification.read"
                          [class.text-gray-400]="notification.read"
                        ></ng-icon>
                      </div>
                    </div>

                    <!-- Conteúdo -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-start justify-between gap-2">
                        <h4
                          class="text-sm font-semibold text-gray-900 truncate"
                          [class.font-bold]="!notification.read"
                        >
                          {{ notification.title }}
                        </h4>
                        @if (!notification.read) {
                          <span
                            class="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"
                          ></span>
                        }
                      </div>
                      <p class="text-sm text-gray-600 mt-1 line-clamp-2">
                        {{ notification.message }}
                      </p>
                      @if (notification.data) {
                        <p class="text-xs text-gray-400 mt-1">
                          {{ notification.data }}
                        </p>
                      }
                    </div>
                  </div>
                </div>
              }
            }
          </div>

          <!-- Footer -->
          @if (notifications().length > 0) {
            <div class="px-4 py-3 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                (click)="markAllAsRead()"
                class="w-full text-sm font-medium text-blue-600 hover:text-blue-700 py-2 rounded-md hover:bg-blue-50 transition-colors"
              >
                Marcar todas como lidas
              </button>
            </div>
          }
        </div>

        <div
          (click)="toggleDropdown()"
          class="fixed inset-0 z-40"
        ></div>
      }
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class NotificationsComponent {
  notifications = input.required<INotifications[]>();
  onRead = output<number>();
  onMarkAllAsRead = output<void>();

  isOpen = signal(false);
  unreadCount = computed(() => 
    this.notifications().filter(n => !n.read).length
  );

  toggleDropdown(): void {
    this.isOpen.update(value => !value);
  }

  handleNotificationClick(notification: INotifications): void {
    if (!notification.read) {
      this.onRead.emit(notification.id);
    }
  }

  markAllAsRead(): void {
    this.onMarkAllAsRead.emit();
  }
}