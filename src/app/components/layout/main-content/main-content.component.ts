import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-content',
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './main-content.component.html',
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
        overflow: hidden;
      }

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

      main {
        transition: margin-left 0.3s ease-in-out, width 0.3s ease-in-out;
      }
    `,
  ],
})
export class MainContentComponent {
  sidebarExpanded = signal(true);
  notificationCount = 3;
  platformID = inject(PLATFORM_ID);


  constructor() {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformID)) {
      this.checkInitialSidebarState();
    }
  }

  onSidebarToggle(expanded: boolean): void {
    this.sidebarExpanded.set(expanded);
  }

  private checkInitialSidebarState(): void {
    if (window.innerWidth < 1024) {
      this.sidebarExpanded.set(false);
    }
  }
}
