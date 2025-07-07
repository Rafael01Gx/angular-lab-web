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
import {
  IClasseItem,
  ITipoAnalise,
} from '../../../interfaces/analysis-type.interface';
import { ParametersService } from '../../../services/parameters.service';
import { AnalysisTypeService } from '../../../services/analysis-type.service';
import { IParameters } from '../../../interfaces/parameters.interface';
import { ConfirmationModalService } from '../../../services/confirmation-modal.service';

@Component({
  selector: 'app-parametros',
  imports: [ReactiveFormsModule, NgIconComponent],
  templateUrl: './parametros.component.html',
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
export class ParametrosComponent {
  #parametrosService = inject(ParametersService);
  #analysisTypeService = inject(AnalysisTypeService);
  parametros: IParameters[]=[]
  parametrosFiltro: IParameters[]=[]
  editingItem: IParameters | null = null;
  editItemIndex: number | null = null;
  confirmationModal = inject(ConfirmationModalService);

  tipoAnalise: ITipoAnalise[] = [];

  materiaPrimaForm = new FormGroup({
    tipoAnaliseId: new FormControl<string | number>('', [Validators.required]),
    descricao: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(2),
    ]),
    unidadeMedida: new FormControl<string>(''),
    unidadeResultado: new FormControl<string>(''),
    casasDecimais: new FormControl<number>(0),
  });

  // Paginação
  paginaAtual = 1;
  itensPorPagina = 5;

  // Propriedades calculadas
  get totalPaginas(): number {
    return Math.ceil(this.parametrosFiltro.length / this.itensPorPagina);
  }

  get itensPaginados(): IParameters[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    return this.parametrosFiltro.slice(inicio, fim);
  }

  // Utilitário
  Math = Math;

  ngOnInit(): void {
    this.loadingData();
    try {
      this.#analysisTypeService.findAll().subscribe({
        next: (res) => {
          this.tipoAnalise = res;
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  loadingData() {
    try {
      this.#parametrosService.findAll().subscribe({
        next: (res) => {
          this.parametros = res;
          this.parametrosFiltro = this.parametros;
        },
      });
    } catch (error) {
      console.log(error);
    }
  }
  salvarItem(): void {
    if (
      !this.materiaPrimaForm.value.tipoAnaliseId ||
      !this.materiaPrimaForm.value.descricao
    ) {
      return;
    }
    const _params = {
      unidadeMedida: this.materiaPrimaForm.value.unidadeMedida,
      unidadeResultado: this.materiaPrimaForm.value.unidadeResultado,
      descricao: this.materiaPrimaForm.value.descricao,
      tipoAnaliseId: this.materiaPrimaForm.value.tipoAnaliseId,
      casasDecimais: this.materiaPrimaForm.value.casasDecimais,
    };

    if (this.editingItem && this.editingItem.id) {
      this.#parametrosService
        .update(this.editingItem.id, _params as IParameters)
        .subscribe({
          next: (res) => {
            if (this.editItemIndex !== -1) {
              this.parametros[this.editItemIndex!] = res;
            }
          },
        });
    } else {
      this.#parametrosService.create(_params as IParameters).subscribe({
        next: (res) => {
          this.parametros.push(res), (this.parametrosFiltro = this.parametros);
        },
      });
    }

    this.materiaPrimaForm.reset();

    // paginação
    if (this.paginaAtual > this.totalPaginas && this.totalPaginas > 0) {
      this.paginaAtual = this.totalPaginas;
    }
  }

  editarItem(item: IParameters, index: number): void {
    this.editingItem = item;
    this.editItemIndex = index;
    this.materiaPrimaForm.setValue({
      tipoAnaliseId: item.id ? item.id : null,
      descricao: item.descricao,
      unidadeMedida: item.unidadeMedida,
      unidadeResultado: item.unidadeResultado,
      casasDecimais: item.casasDecimais,
    });
  }

  cancelarEdicao(): void {
    this.editingItem = null;
    this.materiaPrimaForm.reset();
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

  async excluirItem(item: IParameters): Promise<void> {
    const confirmed = await this.confirmationModal.confirmDelete(
      `${item.descricao} - ${item.tipoAnalise?.tipo}`,
      'Esta Parâmetro será removido permanentemente.'
    );

    if (confirmed) {
      try {
        this.#parametrosService.delete(item.id!).subscribe({
          next: () => {
            this.loadingData()
            if (this.paginaAtual > this.totalPaginas && this.totalPaginas > 0) {
              this.paginaAtual = this.totalPaginas;
            }
          },
        });
      } catch (error) {
        await this.confirmationModal.confirmInfo(
          `${item.descricao} - ${item.tipoAnalise?.tipo}`,
          'Ocorreu um erro ao remover esta Matéria-Prima.'
        );
      }
    }
  }

  filtrar(params: string) {
    const filtro = this.parametros.filter((param) => {
      const idStr = param.id?.toString() ?? '';
      const descricao = param.descricao.toLowerCase();
      const medida = param.unidadeMedida.toLowerCase();

      return (
        idStr.includes(params) ||
        descricao.includes(params) ||
        medida.includes(params)
      );
    });
    this.parametrosFiltro = filtro;
  }
}
