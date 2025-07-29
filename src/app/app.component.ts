import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastrComponent } from "./components/layout/toastr/toastr.component";

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, ToastrComponent],
  template: `
  <app-toastr />
  <router-outlet /> `,
})
export class AppComponent {
  title = signal('Angular App');
}
