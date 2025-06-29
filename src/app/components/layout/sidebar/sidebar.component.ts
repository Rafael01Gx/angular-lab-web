import { Component, Output, EventEmitter, HostListener, OnInit, inject, PLATFORM_ID, OutputEmitterRef, output } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  heroClipboardDocumentList,
  heroBeaker,
  heroCog6Tooth,
  heroChartBarSquare,
  heroUserGroup,
  heroChevronDown,
  heroBars3,
  heroXMark,
  heroPlus,
  heroClock,
  heroCheckCircle,
  heroExclamationTriangle,
  heroPlay,
  heroUsers,
  heroUserPlus,
  heroTrash,
  heroAdjustmentsHorizontal,
  heroTag,
  heroCube
} from '@ng-icons/heroicons/outline';
import { filter } from 'rxjs/operators';
import { IMenuItem } from '../../../interfaces/layout.interface';

@Component({
  selector: 'app-sidebar',
  imports:  [CommonModule, NgIconComponent],
  templateUrl: './sidebar.component.html',
  viewProviders:  [
    provideIcons({
      heroClipboardDocumentList,
      heroBeaker,
      heroCog6Tooth,
      heroChartBarSquare,
      heroUserGroup,
      heroChevronDown,
      heroBars3,
      heroXMark,
      heroPlus,
      heroClock,
      heroCheckCircle,
      heroExclamationTriangle,
      heroPlay,
      heroUsers,
      heroUserPlus,
      heroTrash,
      heroAdjustmentsHorizontal,
      heroTag,
      heroCube
    })
  ],
  host: { class: 'block max-h-full'
  },
})
export class SidebarComponent implements OnInit {

sidebarToggled: OutputEmitterRef<boolean> = output<boolean>();

platformID = inject(PLATFORM_ID);
router = inject(Router);

  isExpanded = true;
  isMobile = false;
  currentRoute = '';

  menuItems: IMenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'heroChartBarSquare',
      route: '/dashboard'
    },
    {
      id: 'orders',
      label: 'Ordens de Serviço',
      icon: 'heroClipboardDocumentList',
      expanded: false,
      children: [
        { id: 'orders-create', label: 'Criar', icon: 'heroPlus', route: '/orders/create' },
        { id: 'orders-pending', label: 'Pendentes', icon: 'heroClock', route: '/orders/pending' },
        { id: 'orders-completed', label: 'Finalizadas', icon: 'heroCheckCircle', route: '/orders/completed' }
      ]
    },
    {
      id: 'samples',
      label: 'Amostras',
      icon: 'heroBeaker',
      route: '/samples'
    },
    {
      id: 'analysis',
      label: 'Análises',
      icon: 'heroBeaker',
      expanded: false,
      children: [
        { id: 'analysis-waiting-auth', label: 'Aguardando autorização', icon: 'heroExclamationTriangle', route: '/analysis/waiting-authorization' },
        { id: 'analysis-waiting', label: 'Aguardando Análise', icon: 'heroClock', route: '/analysis/waiting-analysis' },
        { id: 'analysis-progress', label: 'Em andamento', icon: 'heroPlay', route: '/analysis/in-progress' },
        { id: 'analysis-completed', label: 'Finalizadas', icon: 'heroCheckCircle', route: '/analysis/completed' }
      ]
    },
    {
      id: 'manage-orders',
      label: 'Gerenciar OS',
      icon: 'heroAdjustmentsHorizontal',
      expanded: false,
      children: [
        { id: 'manage-waiting', label: 'Aguardando', icon: 'heroClock', route: '/manage-orders/waiting' },
        { id: 'manage-authorized', label: 'Autorizada', icon: 'heroCheckCircle', route: '/manage-orders/authorized' },
        { id: 'manage-executing', label: 'Em Execução', icon: 'heroPlay', route: '/manage-orders/executing' },
        { id: 'manage-completed', label: 'Finalizadas', icon: 'heroCheckCircle', route: '/manage-orders/completed' }
      ]
    },
    {
      id: 'access-management',
      label: 'Gerenciar Acesso',
      icon: 'heroUserGroup',
      expanded: false,
      children: [
        { id: 'access-authorize', label: 'Autorizar Acesso', icon: 'heroCheckCircle', route: '/access-management/authorize' },
        { id: 'access-level', label: 'Alterar Nível de Usuário', icon: 'heroUsers', route: '/access-management/user-level' },
        { id: 'access-delete', label: 'Excluir Usuário', icon: 'heroTrash', route: '/access-management/delete-user' },
        { id: 'access-create', label: 'Cadastrar Novo Usuário', icon: 'heroUserPlus', route: '/access-management/create-user' }
      ]
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: 'heroCog6Tooth',
      expanded: false,
      children: [
        { id: 'settings-analysis', label: 'Configuração de Análise', icon: 'heroBeaker', route: '/settings/analysis' },
        { id: 'settings-parameters', label: 'Parâmetros', icon: 'heroAdjustmentsHorizontal', route: '/settings/parameters' },
        { id: 'settings-materials', label: 'Matéria-prima', icon: 'heroCube', route: '/settings/materials' },
        { id: 'settings-analysis-type', label: 'Tipo de Análise', icon: 'heroTag', route: '/settings/analysis-type' }
      ]
    }
  ];



  ngOnInit(): void {
    if(isPlatformBrowser(this.platformID)){
      this.checkScreenSize();
    }
    this.currentRoute = this.router.url;
    
    // Listen to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.url;
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
      if(isPlatformBrowser(this.platformID)){
    this.checkScreenSize();}
  }

  private checkScreenSize(): void {
      if(isPlatformBrowser(this.platformID)){
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 1024;
    
    if (this.isMobile && !wasMobile) {
      this.isExpanded = false;
    } else if (!this.isMobile && wasMobile) {
      this.isExpanded = true;
    }}
  }

  toggleSidebar(): void {
    this.isExpanded = !this.isExpanded;
    this.sidebarToggled.emit(this.isExpanded);
  }

  handleMenuClick(item: IMenuItem): void {
    if (item.children) {
      item.expanded = !item.expanded;
    } else if (item.route) {
      this.navigateToRoute(item.route);
    }
  }

  navigateToRoute(route: string): void {
    this.router.navigate([route]);
    
    // Close sidebar on mobile after navigation
    if (this.isMobile) {
      this.isExpanded = false;
      this.sidebarToggled.emit(this.isExpanded);
    }
  }

  getMenuItemClasses(item: IMenuItem): string {
    const isActive = this.isRouteActive(item);
    return `
      w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200
      ${isActive 
        ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 shadow-md border border-blue-200/60' 
        : 'text-slate-700 hover:bg-slate-100 hover:text-blue-600'
      }
      group relative
    `;
  }

  getSubMenuItemClasses(subItem: IMenuItem): string {
    const isActive = this.currentRoute === subItem.route;
    return `
      w-full flex items-center p-2 rounded-lg transition-all duration-200
      ${isActive 
        ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 shadow-sm border-l-2 border-blue-400' 
        : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
      }
    `;
  }

  private isRouteActive(item: IMenuItem): boolean {
    if (item.route) {
      return this.currentRoute === item.route;
    }
    
    if (item.children) {
      return item.children.some(child => this.currentRoute === child.route);
    }
    
    return false;
  }
}