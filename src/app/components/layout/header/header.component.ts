import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  heroUserGroup
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-header',
  imports: [CommonModule, NgIconComponent],
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
      heroUserGroup
    })
  ],
  host: {class: 'block'}

})
export class HeaderComponent {
 @Input() userName: string = 'Usuário';
  @Input() notificationCount: number = 0;

  constructor(private router: Router) {}

  getCurrentRouteName(): string {
    const url = this.router.url;
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

    // Find the best match for nested routes
    const matchingRoute = Object.keys(routeMap)
      .sort((a, b) => b.length - a.length)
      .find(route => url.startsWith(route));
    
    return matchingRoute ? routeMap[matchingRoute] : 'Sistema';
  }

  getCurrentRouteIcon(): string {
    const url = this.router.url;
    
    if (url.includes('/dashboard')) return 'heroChartBarSquare';
    if (url.includes('/orders')) return 'heroClipboardDocumentList';
    if (url.includes('/samples')) return 'heroBeaker';
    if (url.includes('/analysis')) return 'heroBeaker';
    if (url.includes('/access-management')) return 'heroUserGroup';
    if (url.includes('/settings')) return 'heroCog6Tooth';
    
    return 'heroHome';
  }

  onNotificationClick(): void {
    // Implementar lógica de notificações
    console.log('Notificações clicadas');
  }

  onProfileClick(): void {
    this.router.navigate(['/profile']);
  }

  onLogout(): void {
    // Implementar lógica de logout
    console.log('Logout realizado');
    // this.authService.logout();
  }
}