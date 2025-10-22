import { Injectable, inject, signal, computed, DestroyRef, PLATFORM_ID, afterNextRender, TransferState, makeStateKey } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, tap, of, retry } from 'rxjs';
import { environment } from '../../environments/environment';
import { ToastrService } from './toastr.service';
import { isPlatformBrowser } from '@angular/common';
import { INotifications } from '../components/notification/notifications.component';

const NOTIFICATION_STATE_KEY = makeStateKey<INotifications[]>('notifications-state');
@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  #apiUrl = `${environment.apiURL}/notificacoes`;
  #http = inject(HttpClient);
  #toastr = inject(ToastrService);
  #destroyRef = inject(DestroyRef);
  #platformId = inject(PLATFORM_ID);
  #transdferState = inject(TransferState);


  #socket: Socket | null = null;
  #isInitialized = signal(false);

  #notifications = signal<INotifications[]>([]);
  #isLoading = signal<boolean>(false);
  #isConnected = signal<boolean>(false);
  #error = signal<string | null>(null);

  notifications = this.#notifications.asReadonly();
  unreadCount = computed(() => this.#notifications().filter(n => !n.read).length);
  isLoading = this.#isLoading.asReadonly();
  isConnected = this.#isConnected.asReadonly();
  error = this.#error.asReadonly();

  constructor() {
    this.#destroyRef.onDestroy(() => {
      this.disconnect();
    });

    if (isPlatformBrowser(this.#platformId)) {
      afterNextRender(() => {
        setTimeout(() => {
          if (this.#isInitialized()) {
            this.connectWebSocket();
          }
        }, 100);
      });
    }
  }


  initialize(): void {
    this.loadNotifications();
    this.#isInitialized.set(true);

    if (isPlatformBrowser(this.#platformId) && !this.#socket) {
      this.connectWebSocket();
    }
  }

  loadNotifications(): void {
    const savedNotifications = this.#transdferState.get<INotifications[]>(NOTIFICATION_STATE_KEY, []);
    if (savedNotifications.length > 0) {
      this.#notifications.set(savedNotifications);
      this.#transdferState.remove(NOTIFICATION_STATE_KEY);
      return;
    }
    this.#isLoading.set(true);
    this.#error.set(null);

    this.#http.get<INotifications[]>(`${this.#apiUrl}/all`, { withCredentials: true })
      .pipe(
        retry({ count: 3, delay: 1000 }),
        tap(notifications => {
          const sorted = notifications.sort((a, b) => {
            if (!a.data || !b.data) return 0;
            return new Date(b.data).getTime() - new Date(a.data).getTime();
          });
          this.#notifications.set(sorted);
          this.#isLoading.set(false);
        }),
        catchError(error => {
          console.error('Erro ao carregar notificações:', error);
          this.#error.set('Erro ao carregar notificações');
          this.#isLoading.set(false);
          this.#toastr.error('Erro ao carregar notificações', 'Erro');
          return of([]);
        }),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe();
  }

  private connectWebSocket(): void {
    if (!isPlatformBrowser(this.#platformId)) {
      return;
    }

    if (this.#socket?.connected) {
      console.warn('WebSocket já está conectado');
      return;
    }

    try {
      this.#socket = io(`${environment.apiURL}`, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        autoConnect: true,
      });

      this.setupSocketListeners();
    } catch (error) {
      console.error('Erro ao conectar WebSocket:', error);
      this.#error.set('Erro na conexão em tempo real');
    }
  }

  private setupSocketListeners(): void {
    if (!this.#socket) return;

    this.#socket.on('connect', () => {
      this.#isConnected.set(true);
      this.#error.set(null);
    });

    if (isPlatformBrowser(this.#platformId)) {
      this.#socket.on('new-notification', (notification: INotifications) => {
        notification.data = new Date().toISOString();
        notification.id = `localid-${Date.now()}`;
        notification.read = false;
        this.#notifications.update(current => [notification, ...current]);
        this.#toastr.info(notification.message, notification.title);
        this.playNotificationSound();
      }
      );
    }

    this.#socket.on('disconnect', (reason) => {
      console.log('WebSocket desconectado:', reason);
      this.#isConnected.set(false);

      if (reason === 'io server disconnect') {
        this.#socket?.connect();
      }
    });

    this.#socket.on('connect_error', (error) => {
      console.error('Erro de conexão WebSocket:', error);
      this.#isConnected.set(false);
      this.#error.set('Erro na conexão em tempo real');
    });

    this.#socket.on('reconnect_attempt', (attempt) => {
      console.log(`Tentativa de reconexão ${attempt}...`);
    });

    this.#socket.on('reconnect', (attempt) => {
      console.log(`Reconectado após ${attempt} tentativas`);
      this.#isConnected.set(true);
      this.#error.set(null);
      this.loadNotifications();
    });
  }

  markAsRead(id: number | string): void {
    if (typeof id == "string" && id.includes("localid-")) {
      this.#notifications.update(notifications =>
        notifications.map(n => n.id === id ? { ...n, read: true } : n)
      );
      return;
    };
    this.#http.patch<INotifications>(`${this.#apiUrl}/${id}/read`, {}, { withCredentials: true })
      .pipe(
        tap(updatedNotification => {
          this.#notifications.update(notifications =>
            notifications.map(n => n.id === id ? { ...n, read: true } : n)
          );
        }),
        catchError(error => {
          console.error('Erro ao marcar notificação como lida:', error);
          this.#toastr.error('Erro ao atualizar notificação', 'Erro');
          return of(null);
        }),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe();
  }

  markAllAsRead(): void {
    const unreadIds = this.#notifications()
      .filter(n => !n.read && !(typeof n.id === "string" && n.id.includes("localid-")))
      .map(n => n.id);

    if (unreadIds.length === 0) {
      this.#toastr.info('Todas as notificações já foram lidas');
      return;
    }

    this.#http.patch(`${this.#apiUrl}/read-all`, { ids: unreadIds }, { withCredentials: true })
      .pipe(
        tap(() => {
          this.#notifications.update(notifications =>
            notifications.map(n => ({ ...n, read: true }))
          );
          this.#toastr.success('Todas as notificações foram marcadas como lidas');
        }),
        catchError(error => {
          console.error('Erro ao marcar todas como lidas:', error);
          this.#toastr.error('Erro ao atualizar notificações', 'Erro');
          return of(null);
        }),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe();
  }

  deleteNotification(id: number): void {
    this.#http.delete(`${this.#apiUrl}/${id}`, { withCredentials: true })
      .pipe(
        tap(() => {
          this.#notifications.update(notifications =>
            notifications.filter(n => n.id !== id)
          );
          this.#toastr.success('Notificação excluída');
        }),
        catchError(error => {
          console.error('Erro ao deletar notificação:', error);
          this.#toastr.error('Erro ao excluir notificação', 'Erro');
          return of(null);
        }),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe();
  }

  clearReadNotifications(): void {
    const readIds = this.#notifications()
      .filter(n => n.read)
      .map(n => n.id);

    if (readIds.length === 0) {
      this.#toastr.info('Não há notificações lidas para limpar');
      return;
    }

    this.#http.delete(`${this.#apiUrl}/clear-read`, { body: { ids: readIds }, withCredentials: true },)
      .pipe(
        tap(() => {
          this.#notifications.update(notifications =>
            notifications.filter(n => !n.read)
          );
          this.#toastr.success(`${readIds.length} notificações removidas`);
        }),
        catchError(error => {
          console.error('Erro ao limpar notificações:', error);
          this.#toastr.error('Erro ao limpar notificações', 'Erro');
          return of(null);
        }),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe();
  }

  disconnect(): void {
    if (this.#socket) {
      this.#socket.disconnect();
      this.#socket = null;
      this.#isConnected.set(false);
      console.log('WebSocket desconectado');
    }
  }


  private playNotificationSound(): void {
    if (!isPlatformBrowser(this.#platformId)) {
      return;
    }

    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => {
        console.warn('Não foi possível reproduzir som de notificação:', err);
      });
    } catch (error) {
    }
  }

  refresh(): void {
    this.loadNotifications();
  }
}