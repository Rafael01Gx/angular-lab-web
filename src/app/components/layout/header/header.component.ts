import {Component, computed, inject, input, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {NgIconComponent, provideIcons} from '@ng-icons/core';
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
import {AuthService} from '../../../services/auth.service';
import { routeMap } from '../../../shared/constants/menu-items';
import { NotificationsService } from '../../../services/notification.service';

@Component({
  selector: 'app-header',
  imports: [NgIconComponent],
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
  host: {class: 'block'},
})
export class HeaderComponent implements OnInit {
  #authService = inject(AuthService);
  #notificationsService = inject(NotificationsService);
  notificationCount = computed(() => this.#notificationsService.unreadCount());
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

  if (url.startsWith('/orders')) return 'heroClipboardDocumentList';         // Ordens de Serviço
  if (url.startsWith('/samples')) return 'heroBeaker';                       // Amostras
  if (url.startsWith('/analysis')) return 'heroBriefcase';                   // Análises
  if (url.startsWith('/manage-orders')) return 'heroAdjustmentsHorizontal';  // Gerenciar OS
  if (url.startsWith('/external-labs')) return 'heroListBullet';             // Laboratórios Externos
  if (url.startsWith('/access-management')) return 'heroUserGroup';          // Gerenciar Acesso
  if (url.startsWith('/settings')) return 'heroCog6Tooth';                   // Configurações

  return 'heroInformationCircle';
}

  onNotificationClick(): void {
    this.#router.navigate(['/notifications']);
  }

  onProfileClick(): void {
    this.#router.navigate(['/profile']);
  }

  onLogout(): void {
    this.#authService.logout().subscribe({
      next: () => {
        this.#router.navigate(['/login']);
      },
    });
  }
}
