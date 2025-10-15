import { Component } from '@angular/core';
import { AmostrasTableComponent } from '../tables/amostras-table.component';

@Component({
  selector: 'app-amostras',
  template: `<app-amostras-table class="w-full h-full" />`,
  imports: [AmostrasTableComponent],
})
export class AmostrasComponent {}
