import {Component, inject, input, signal} from '@angular/core';
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
} from '@ng-icons/heroicons/outline';
import {AuthService} from '../../../services/auth.service';

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
    }),
  ],
  host: {class: 'block'},
})
export class HeaderComponent {
  #authService = inject(AuthService);
  notificationCount = input<number>(0);
  #router = inject(Router);
  authService = inject(AuthService);
  user = signal(this.#authService.currentUser());

  getCurrentRouteName(): string {
    const url = this.#router.url;
    const routeMap: { [key: string]: string } = {
      '/dashboard': 'Dashboard',
      '/orders': 'Ordens de Serviço',
      '/orders/create': 'Criar OS',
      '/orders/pending': 'OS Pendentes',
      '/orders/completed': 'OS Finalizadas',
      '/samples': 'Amostras',
      '/analysis': 'Análises',
      '/analysis/waiting-authorization': 'Aguardando Autorização',
      '/analysis/waiting-analysis': 'Aguardando Análise',
      '/analysis/in-progress': 'Em Andamento',
      '/analysis/completed': 'Finalizadas',
      '/manage-orders': 'Gerenciar OS',
      '/access-management': 'Gerenciar Acesso',
      '/settings': 'Configurações',
    };

    const matchingRoute = Object.keys(routeMap)
      .sort((a, b) => b.length - a.length)
      .find((route) => url.startsWith(route));

    return matchingRoute ? routeMap[matchingRoute] : 'Sistema';
  }

  getCurrentRouteIcon(): string {
    const url = this.#router.url;

    if (url.includes('/dashboard/')) return 'heroChartBarSquare';
    if (url.includes('/orders/')) return 'heroClipboardDocumentList';
    if (url.includes('/samples/')) return 'heroBeaker';
    if (url.includes('/analysis/')) return 'heroBeaker';
    if (url.includes('/access-management/')) return 'heroUserGroup';
    if (url.includes('/settings/')) return 'heroCog6Tooth';

    return 'heroHome';
  }

  onNotificationClick(): void {
    // Implementar lógica de notificações
    console.log(this.user());
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
