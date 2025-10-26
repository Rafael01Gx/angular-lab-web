import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroBeaker,
  heroBell,
  heroUser,
  heroArrowRightOnRectangle,
  heroHome,
  heroClipboardDocumentList,
  heroChartBarSquare,
  heroCog6Tooth,
  heroUserGroup,
  heroInformationCircle,
  heroListBullet,
  heroAdjustmentsHorizontal,
  heroBriefcase
} from '@ng-icons/heroicons/outline';
import { AuthService } from '../../../services/auth.service';
import { routeMap } from '../../../core/constants/menu-items';
import { NotificationsService } from '../../../services/notification.service';
import { NotificationsComponent } from "../../notification/notifications.component";

@Component({
  selector: 'app-header',
  imports: [NgIconComponent, NotificationsComponent],
  templateUrl: './header.component.html',
  viewProviders: [
    provideIcons({
      heroBeaker,
      heroBell,
      heroUser,
      heroArrowRightOnRectangle,
      heroHome,
      heroClipboardDocumentList,
      heroChartBarSquare,
      heroCog6Tooth,
      heroUserGroup,
      heroInformationCircle,
      heroListBullet,
      heroAdjustmentsHorizontal,
      heroBriefcase
    }),
  ],
  host: { class: 'block' },
})
export class HeaderComponent implements OnInit {
  #authService = inject(AuthService);
  #notificationsService = inject(NotificationsService);
  notificationCount = computed(() => this.#notificationsService.unreadCount());
  notifications = computed(() => this.#notificationsService.notifications().slice(0, 20));
  #router = inject(Router);
  authService = inject(AuthService);
  user = signal(this.#authService.currentUser());

  ngOnInit() {
    this.#notificationsService.initialize();
  }

  getCurrentRouteName(): string {
    const url = this.#router.url;
    const mapRoutes = routeMap

    const matchingRoute = Object.keys(routeMap)
      .sort((a, b) => b.length - a.length)
      .find((route) => url.startsWith(route));

    return matchingRoute ? mapRoutes[matchingRoute] : 'Info';
  }

  getCurrentRouteIcon(): string {
    const url = this.#router.url;

    if (url.startsWith('/ordens')) return 'heroClipboardDocumentList';         // Ordens de Serviço
    if (url.startsWith('/amostras')) return 'heroBeaker';                       // Amostras
    if (url.startsWith('/analises')) return 'heroBriefcase';                   // Análises
    if (url.startsWith('/gerenciar-ordens')) return 'heroAdjustmentsHorizontal';  // Gerenciar OS
    if (url.startsWith('/laboratorios-externos')) return 'heroListBullet';             // Laboratórios Externos
    if (url.startsWith('/acessos')) return 'heroUserGroup';          // Gerenciar Acesso
    if (url.startsWith('/configuracoes')) return 'heroCog6Tooth';                   // Configurações

    return 'heroInformationCircle';
  }

  onNotificationClick(): void {
    this.#router.navigate(['/notificacoes']);
  }

  onProfileClick(): void {
    this.#router.navigate(['/perfil']);
  }

  onLogout(): void {
    this.#authService.logout().subscribe({
      next: () => {
        this.#router.navigate(['/login']);
      },
    });
  }


  onRead(id: number| string) {
    if (!id) return;
    this.#notificationsService.markAsRead(id);
  }
  onMarkAllAsRead() {
    this.#notificationsService.markAllAsRead();
  }
}
