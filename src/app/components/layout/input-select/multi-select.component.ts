import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface MultiSelectItem {
  id: number | string;
  [key: string]: any;
}

export interface MultiSelectConfig {
  displayField: string;
  searchField?: string;
  placeholder?: string;
  maxHeight?: string;
}

@Component({
  selector: 'app-multi-select',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative w-full">
      <!-- Trigger Button -->
      <button
        type="button"
        class="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-left shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
        (click)="toggleDropdown()"
        [class.ring-2]="isOpen"
        [class.ring-blue-500]="isOpen"
        [class.border-blue-500]="isOpen"
      >
        <div class="flex items-center justify-between">
          <span class="text-gray-700">
            {{ getDisplayText() }}
          </span>
          <svg
            class="w-5 h-5 text-gray-400 transition-transform duration-200"
            [class.rotate-180]="isOpen"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </button>

      <!-- Selected Items Pills 
      <div *ngIf="selectedItems.length > 0" class="flex flex-wrap gap-2 mt-2">
        <span
          *ngFor="let item of selectedItems; trackBy: trackByFn"
          class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
        >
          {{ getItemDisplayText(item) }}
          <button
            type="button"
            class="ml-2 inline-flex items-center justify-center w-4 h-4 text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-full transition-colors duration-150"
            (click)="removeItem(item); $event.stopPropagation()"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </span>
      </div>    -->

      <!-- Dropdown -->
      <div
        *ngIf="isOpen"
        class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg"
        
      >
        <!-- Search Input -->
        <div class="p-3 border-b border-gray-200">
          <div class="relative">
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (input)="onSearchChange()"
              class="w-full px-4 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Buscar..."
            />
            <svg
              class="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="p-3 border-b border-gray-200 bg-gray-50">
          <div class="flex gap-2">
            <button
              type="button"
              class="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors duration-150"
              (click)="selectAll()"
            >
              Selecionar Todos
            </button>
            <button
              type="button"
              class="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors duration-150"
              (click)="clearAll()"
            >
              Limpar Todos
            </button>
          </div>
        </div>

        <!-- Options List -->
        <div class="max-h-60 overflow-y-auto">
          <div
            *ngFor="let item of filteredItems; trackBy: trackByFn"
            class="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
            (click)="toggleItem(item)"
          >
            <div class="flex items-center">
              <input
                type="checkbox"
                [checked]="isSelected(item)"
                (change)="toggleItem(item)"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label class="ml-3 text-sm font-medium text-gray-900 cursor-pointer">
                {{ getItemDisplayText(item) }}
              </label>
            </div>
          </div>
          
          <!-- No results message -->
          <div
            *ngIf="filteredItems.length === 0"
            class="px-4 py-6 text-center text-gray-500 text-sm"
          >
            Nenhum item encontrado
          </div>
        </div>
      </div>
    </div>

    <!-- Backdrop -->
    <div
      *ngIf="isOpen"
      class="fixed inset-0 z-40"
      (click)="closeDropdown()"
    ></div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class MultiSelectComponent implements OnInit, OnChanges {
  @Input() data: any[] = [];
  @Input() config: MultiSelectConfig = { displayField: 'name' };
  @Input() selectedIds: (number | string)[] = [];
  @Input() disabled: boolean = false;

  @Output() selectionChange = new EventEmitter<(number | string)[]>();
  @Output() itemsChange = new EventEmitter<any>();

  isOpen = false;
  searchTerm = '';
  filteredItems: MultiSelectItem[] = [];
  selectedItems: MultiSelectItem[] = [];

  ngOnInit() {
    this.initializeComponent();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] || changes['selectedIds']) {
      this.initializeComponent();
    }
  }

  private initializeComponent() {
    this.filteredItems = [...this.data];
    this.updateSelectedItems();
    this.filterItems();
  }

  private updateSelectedItems() {
    this.selectedItems = this.data.filter(item => 
      this.selectedIds.includes(item.id)
    );
  
  }

  toggleDropdown() {
    if (!this.disabled) {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.searchTerm = '';
        this.filterItems();
      }
    }
  }

  closeDropdown() {
    this.isOpen = false;
  }

  toggleItem(item: MultiSelectItem) {
    const index = this.selectedIds.indexOf(item.id);
    let newSelectedIds: (number | string)[];

    if (index > -1) {
      newSelectedIds = this.selectedIds.filter(id => id !== item.id);
    } else {
      newSelectedIds = [...this.selectedIds, item.id];
    }

    this.selectedIds = newSelectedIds;
    this.updateSelectedItems();
    this.emitChanges();
  }

  removeItem(item: MultiSelectItem) {
    const newSelectedIds = this.selectedIds.filter(id => id !== item.id);
    this.selectedIds = newSelectedIds;
    this.updateSelectedItems();
    this.emitChanges();
  }

  selectAll() {
    this.selectedIds = this.filteredItems.map(item => item.id);
    this.updateSelectedItems();
    this.emitChanges();
  }

  clearAll() {
    this.selectedIds = [];
    this.selectedItems = [];
    this.emitChanges();
  }

  isSelected(item: MultiSelectItem): boolean {
    return this.selectedIds.includes(item.id);
  }

  onSearchChange() {
    this.filterItems();
  }

  private filterItems() {
    if (!this.searchTerm.trim()) {
      this.filteredItems = [...this.data];
      return;
    }

    const searchField = this.config.searchField || this.config.displayField;
    this.filteredItems = this.data.filter(item => {
      const fieldValue = item[searchField];
      return fieldValue && 
             fieldValue.toString().toLowerCase().includes(this.searchTerm.toLowerCase());
    });
  }

  getDisplayText(): string {
    if (this.selectedItems.length === 0) {
      return this.config.placeholder || 'Selecione os itens';
    }
    
    if (this.selectedItems.length === 1) {
      return this.getItemDisplayText(this.selectedItems[0]);
    }
    
    return `${this.selectedItems.length} itens selecionados`;
  }

  getItemDisplayText(item: MultiSelectItem): string {
    return item[this.config.displayField] || item.id.toString();
  }

  private emitChanges() {
    this.selectionChange.emit([...this.selectedIds]);
    this.itemsChange.emit([...this.selectedItems]);

  }

  trackByFn(index: number, item: MultiSelectItem): any {
    return item.id;
  }
}