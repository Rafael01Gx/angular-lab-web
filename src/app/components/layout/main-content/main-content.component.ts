import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-content',
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './main-content.component.html',
  styleUrl: './main-content.component.scss',
})
export class MainContentComponent implements OnInit {
  sidebarExpanded = signal(true);
  platformID = inject(PLATFORM_ID);



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
