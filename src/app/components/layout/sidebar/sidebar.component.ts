import { Component, HostListener, OnInit, inject, PLATFORM_ID, OutputEmitterRef, output, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
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
  heroCube,
  heroBriefcase,heroListBullet,heroArchiveBox,heroSquare2Stack,heroGlobeAmericas,heroPresentationChartBar,
  heroInformationCircle
} from '@ng-icons/heroicons/outline';
import { filter } from 'rxjs/operators';
import { EMenuRoles, IMenuItem } from '../../../shared/interfaces/layout.interface';
import { AuthService } from '../../../services/auth.service';
import { menuItems } from '../../../shared/constants/menu-items';

@Component({
  selector: 'app-sidebar',
  imports:  [NgIconComponent],
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
      heroCube,
      heroBriefcase,
      heroListBullet,
      heroArchiveBox,
      heroSquare2Stack,
      heroGlobeAmericas,
      heroPresentationChartBar,
      heroInformationCircle
    })
  ],
  host: { class: 'block max-h-full'
  },
  styles:[`
    .custom-scrollbar::-webkit-scrollbar {
  width: 2px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #a7c7e7;
  border-radius: 3px;
}

.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background: #93b5e1;
}
    `]
})
export class SidebarComponent implements OnInit {
#authService = inject(AuthService);
userRole = computed(() => this.#authService.currentUser()?.role || '');

sidebarToggled: OutputEmitterRef<boolean> = output<boolean>();

platformID = inject(PLATFORM_ID);
router = inject(Router);

  isExpanded = true;
  isMobile = false;
  currentRoute = '';

  menuItemsFiltered= computed<IMenuItem[]>(() => {
    return menuItems.filter(item => {
      return item.rolesAllowed ? item.rolesAllowed.includes(this.userRole() as EMenuRoles) : true;
    });
  })



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
        ? 'bg-gradient-to-r from-neutral-300 to-neutral-300 text-blue-700 shadow-md border border-blue-200/60'
        : ' text-gray-400 hover:bg-blue-500/50 hover:text-gray-200'
      }
      group relative
    `;
  }

  getSubMenuItemClasses(subItem: IMenuItem): string {
    const isActive = this.currentRoute === subItem.route;
    return `
      w-full flex items-center p-2 rounded-lg transition-all duration-200
      ${isActive
        ? 'bg-gradient-to-r from-neutral-200 to-neutral-200 text-blue-600 shadow-sm border-l-2 border-blue-400'
        : 'text-gray-400 hover:text-gray-200 hover:bg-blue-500/50'
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
