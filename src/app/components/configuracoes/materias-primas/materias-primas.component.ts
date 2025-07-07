import { Component, inject } from '@angular/core';
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
import { IClasseItem } from '../../../interfaces/analysis-type.interface';

import { ConfirmationModalService } from '../../../services/confirmation-modal.service';
import { MateriaPrimaService } from '../../../services/materia-prima.service';
import { IMateriaPrima } from '../../../interfaces/materia-prima.interface';
@Component({
  selector: 'app-materias-primas',
  imports: [ReactiveFormsModule, NgIconComponent],
  templateUrl: './materias-primas.component.html',
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
export class MateriasPrimasComponent {
  classeTipo: IClasseItem[] = [
    { value: 'Combustível', label: 'Combustível' },
    { value: 'Fundente', label: 'Fundente' },
    { value: 'Matéria-prima', label: 'Matéria-prima' },
    { value: 'Térmica', label: 'Térmica' },
    { value: 'Aglutinante', label: 'Aglutinante' },
    { value: 'Resíduo de processo', label: 'Resíduo de processo' },
    { value: 'Variável', label: 'Variável' },
  ];

  #materiaPrimaService = inject(MateriaPrimaService);
  materiasPrimas: IMateriaPrima[]=[]
  materiasPrimasFiltro: IMateriaPrima[]=[]
  editingItem: IMateriaPrima | null = null;
  editItemIndex: number | null = null;
  confirmationModal = inject(ConfirmationModalService);
  materiaPrimaForm = new FormGroup({
    nomeDescricao: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(3),
    ]),
    classeTipo: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(3),
    ]),
  });

  // Paginação
  paginaAtual = 1;
  itensPorPagina = 5;

  // Propriedades calculadas
  get totalPaginas(): number {
    return Math.ceil(this.materiasPrimasFiltro.length / this.itensPorPagina);
  }

  get itensPaginados(): IMateriaPrima[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    return this.materiasPrimasFiltro.slice(inicio, fim);
  }

  // Utilitário
  Math = Math;

  ngOnInit(): void {
    this.loadingData()
  }
  loadingData() {
    try {
      this.#materiaPrimaService.findAll().subscribe({
        next: (res) => {
          this.materiasPrimas = res;
          this.materiasPrimasFiltro = this.materiasPrimas;
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  salvarItem(): void {
    if (
      !this.materiaPrimaForm.value.nomeDescricao ||
      !this.materiaPrimaForm.value.classeTipo
    ) {
      return;
    }

    if (this.editingItem && this.editingItem.id) {
      this.#materiaPrimaService
        .update(
          this.editingItem.id,
          this.materiaPrimaForm.value as IMateriaPrima
        )
        .subscribe({
          next: (res) => {
            if (this.editItemIndex !== -1) {
              this.materiasPrimas[this.editItemIndex!] = res;
            }
          },
        });
    } else {
      this.#materiaPrimaService
        .create(this.materiaPrimaForm.value as IMateriaPrima)
        .subscribe({
          next: (res) => {
            this.materiasPrimas.push(res),
              (this.materiasPrimasFiltro = this.materiasPrimas);
          },
        });
    }

    this.materiaPrimaForm.reset();

    // paginação
    if (this.paginaAtual > this.totalPaginas && this.totalPaginas > 0) {
      this.paginaAtual = this.totalPaginas;
    }
  }

  editarItem(item: IMateriaPrima, index: number): void {
    this.editingItem = item;
    this.editItemIndex = index;
    this.materiaPrimaForm.setValue({
      nomeDescricao: item.nomeDescricao,
      classeTipo: item.classeTipo,
    });
  }

  cancelarEdicao(): void {
    this.editingItem = null;
    this.materiaPrimaForm.reset();
  }

  getClasseLabel(value: string): string {
    const classe = this.classeTipo.find((item) => item.value === value);
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

  async excluirItem(item: IMateriaPrima): Promise<void> {
    const confirmed = await this.confirmationModal.confirmDelete(
      item.classeTipo,
      'Esta Matéria-Prima será removida permanentemente.'
    );

    if (confirmed) {
      try {
        this.#materiaPrimaService.delete(item.id!).subscribe({
          next: () => {
         this.loadingData()
            if (this.paginaAtual > this.totalPaginas && this.totalPaginas > 0) {
              this.paginaAtual = this.totalPaginas;
            }
          },
        });
      } catch (error) {
        await this.confirmationModal.confirmInfo(
          item.classeTipo,
          'Ocorreu um erro ao remover esta Matéria-Prima.'
        );
      }
    }
  }

  filtrar(params: string) {
    const filtro = this.materiasPrimas.filter((materia) => {
      const idStr = materia.id?.toString() ?? '';
      const nome = materia.nomeDescricao.toLowerCase();
      const classe = materia.classeTipo.toLowerCase();

      return (
        idStr.includes(params) ||
        nome.includes(params) ||
        classe.includes(params)
      );
    });
    this.materiasPrimasFiltro = filtro;
  }
}
