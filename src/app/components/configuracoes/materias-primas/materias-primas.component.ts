import {Component, inject, makeStateKey, OnInit, PLATFORM_ID, signal, TransferState} from '@angular/core';
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
import {catchError, of} from 'rxjs';
import {isPlatformBrowser, isPlatformServer} from '@angular/common';

const MATERIA_PRIMA_KEY = makeStateKey<IMateriaPrima[]>('appMateriasPrimas');

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
export class MateriasPrimasComponent implements OnInit {
  #materiaPrimaService = inject(MateriaPrimaService);
  #transferState = inject(TransferState);
  #platformId = inject(PLATFORM_ID);
  confirmationModal = inject(ConfirmationModalService);

  materiasPrimas= signal<IMateriaPrima[]|[]>([])
  materiasPrimasFiltro= signal<IMateriaPrima[]|[]>([])
  editingItem= signal<IMateriaPrima | null>(null);
  editItemIndex= signal<number | null>(null);

  classeTipo: IClasseItem[] = [
    { value: 'Combustível', label: 'Combustível' },
    { value: 'Fundente', label: 'Fundente' },
    { value: 'Matéria-prima', label: 'Matéria-prima' },
    { value: 'Térmica', label: 'Térmica' },
    { value: 'Aglutinante', label: 'Aglutinante' },
    { value: 'Resíduo de processo', label: 'Resíduo de processo' },
    { value: 'Variável', label: 'Variável' },
  ];

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
    return this.materiasPrimasFiltro().slice(inicio, fim);
  }

  // Utilitário
  Math = Math;

  ngOnInit(): void {
    const keyData = this.#transferState.get(MATERIA_PRIMA_KEY,null)
    if(isPlatformBrowser(this.#platformId) && keyData){
      this.materiasPrimas.set(keyData);
      this.materiasPrimasFiltro.set(keyData);
      this.#transferState.remove(MATERIA_PRIMA_KEY)
      return;
    }
    this.loadingData()
  }

  loadingData() {
      this.#materiaPrimaService.findAll().pipe(
        catchError((error) => {
          console.error('Erro ao carregar materias primas:', error);
          return of([]);
        })
      ).subscribe({
        next: (res) => {
          this.materiasPrimas.set(res);
          this.materiasPrimasFiltro.set(this.materiasPrimas());
          if(isPlatformServer(this.#platformId)){
            this.#transferState.set(MATERIA_PRIMA_KEY,res);
          }
        },
      });
  }

  salvarItem(): void {
    if (
      !this.materiaPrimaForm.value.nomeDescricao ||
      !this.materiaPrimaForm.value.classeTipo
    ) {
      return;
    }

    if (this.editingItem() && this.editingItem()?.id) {
      this.#materiaPrimaService
        .update(
          this.editingItem()?.id!,
          this.materiaPrimaForm.value as IMateriaPrima
        )
        .subscribe({
          next: (res) => {
            if (this.editItemIndex() !== -1) {
              this.materiasPrimas()[this.editItemIndex()!] = res;
            }
          },
        });
    } else {
      this.#materiaPrimaService
        .create(this.materiaPrimaForm.value as IMateriaPrima)
        .subscribe({
          next: (res) => {
            this.materiasPrimas.update((items)=> [...items, res]);
              (this.materiasPrimasFiltro.set(this.materiasPrimas()));
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
    this.editingItem.set(item);
    this.editItemIndex.set(index);
    this.materiaPrimaForm.setValue({
      nomeDescricao: item.nomeDescricao,
      classeTipo: item.classeTipo,
    });
  }

  cancelarEdicao(): void {
    this.editingItem.set(null);
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
    const filtro = this.materiasPrimas().filter((materia) => {
      const idStr = materia.id?.toString() ?? '';
      const nome = materia.nomeDescricao.toLowerCase();
      const classe = materia.classeTipo.toLowerCase();

      return (
        idStr.includes(params) ||
        nome.includes(params) ||
        classe.includes(params)
      );
    });
    this.materiasPrimasFiltro.set(filtro);
  }
}
