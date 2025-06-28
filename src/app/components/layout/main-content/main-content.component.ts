import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-content',
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './main-content.component.html',
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
        overflow: hidden;
      }

      /* Custom scrollbar styling */
      .overflow-y-auto::-webkit-scrollbar {
        width: 6px;
      }

      .overflow-y-auto::-webkit-scrollbar-track {
        @apply bg-slate-100/50 rounded-full;
      }

      .overflow-y-auto::-webkit-scrollbar-thumb {
        @apply bg-slate-300 rounded-full hover:bg-slate-400;
      }

      .overflow-y-auto::-webkit-scrollbar-thumb:hover {
        @apply bg-slate-400;
      }

      /* Smooth transitions for layout changes */
      main {
        transition: margin-left 0.3s ease-in-out, width 0.3s ease-in-out;
      }
    `,
  ],
})
export class MainContentComponent {
  sidebarExpanded = true;
  notificationCount = 3; // Exemplo
  platformID = inject(PLATFORM_ID);
  currentUser = {
    name: 'Dr. João Silva',
    email: 'joao.silva@lab.com',
    role: 'Analista Senior',
  };

  constructor() {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformID)) {
      this.checkInitialSidebarState();
    }
  }

  onSidebarToggle(expanded: boolean): void {
    this.sidebarExpanded = expanded;
  }

  private checkInitialSidebarState(): void {
    if (window.innerWidth < 1024) {
      this.sidebarExpanded = false;
    }
  }
}
