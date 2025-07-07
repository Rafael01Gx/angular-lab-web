import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroPencil,
  heroTrash,
  heroChevronLeft,
  heroChevronRight,
  heroPlus,
  heroMagnifyingGlass,
} from '@ng-icons/heroicons/outline';
import {
  IClasseItem,
  ITipoAnalise,
} from '../../../interfaces/analysis-type.interface';
import { AnalysisTypeService } from '../../../services/analysis-type.service';
import { ConfirmationModalService } from '../../../services/confirmation-modal.service';

@Component({
  selector: 'app-tipo-analise',
  imports: [ReactiveFormsModule, NgIconComponent],
  templateUrl: './tipo-analise.component.html',
  viewProviders: [
    provideIcons({
      heroPencil,
      heroTrash,
      heroChevronLeft,
      heroChevronRight,
      heroPlus,
      heroMagnifyingGlass,
    }),
  ],
})
export class TipoAnaliseComponent implements OnInit {
  #analysisTypeService = inject(AnalysisTypeService);
  tiposAnalise: ITipoAnalise[]=[]
  editingItem: ITipoAnalise | null = null;
  editItemIndex: number | null = null;
  confirmationModal = inject(ConfirmationModalService);
  analiseForm = new FormGroup({
    tipo: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(3),
    ]),
    classe: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(3),
    ]),
  });

  classe_itens: IClasseItem[] = [
    { value: 'Física', label: 'Física' },
    { value: 'Metalúrgica', label: 'Metalúrgica' },
    { value: 'Química', label: 'Química' },
    { value: 'Térmica', label: 'Térmica' },
    { value: 'Física/Química', label: 'Física/Química' },
  ];

  // Paginação
  paginaAtual = 1;
  itensPorPagina = 5;

  // Propriedades calculadas
  get totalPaginas(): number {
    return Math.ceil(this.tiposAnalise.length / this.itensPorPagina);
  }

  get itensPaginados(): ITipoAnalise[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    return this.tiposAnalise.slice(inicio, fim);
  }

  // Utilitário Math para template
  Math = Math;

  ngOnInit(): void {
this.loadingData()
  }
  loadingData(){
    try {
          this.#analysisTypeService.findAll().subscribe({
      next: (res) => {
        this.tiposAnalise = res;
      },
    });
    } catch (error) {
      console.log(error)
    }
  }

  salvarItem(): void {
    if (!this.analiseForm.value.tipo || !this.analiseForm.value.classe) {
      return;
    }

    if (this.editingItem && this.editingItem.id) {
      this.#analysisTypeService
        .update(this.editingItem.id, this.analiseForm.value as ITipoAnalise)
        .subscribe({
          next: (res) => {
            if (this.editItemIndex !== -1) {
              this.tiposAnalise[this.editItemIndex!] = res;
            }
          },
        });
    } else {
      this.#analysisTypeService
        .create(this.analiseForm.value as ITipoAnalise)
        .subscribe({
          next: (res) => this.tiposAnalise.push(res),
        });
    }

    this.analiseForm.reset();

    // paginação
    if (this.paginaAtual > this.totalPaginas && this.totalPaginas > 0) {
      this.paginaAtual = this.totalPaginas;
    }
  }

  editarItem(item: ITipoAnalise, index: number): void {
    this.editingItem = item;
    this.editItemIndex = index;
    this.analiseForm.setValue({
      classe: item.classe,
      tipo: item.tipo,
    });
  }

  cancelarEdicao(): void {
    this.editingItem = null;
    this.analiseForm.reset();
  }

  getClasseLabel(value: string): string {
    const classe = this.classe_itens.find((item) => item.value === value);
    return classe ? classe.label : value;
  }

  paginaAnterior(): void {
    if (this.paginaAtual > 1) {
      this.paginaAtual--;
    }
  }

  proximaPagina(): void {
    if (this.paginaAtual < this.totalPaginas) {
      this.paginaAtual++;
    }
  }

  async excluirItem(item: ITipoAnalise): Promise<void> {
    const confirmed = await this.confirmationModal.confirmDelete(
      item.tipo,
      'Esta análise será removida permanentemente do sistema.'
    );

    if (confirmed) {
      this.#analysisTypeService.delete(item.id!).subscribe({
        next: () => {
         this.loadingData()
          if (this.paginaAtual > this.totalPaginas && this.totalPaginas > 0) {
            this.paginaAtual = this.totalPaginas;
          }
        },
      });
    }
  }
}
