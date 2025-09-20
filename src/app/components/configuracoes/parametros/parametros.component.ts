import {Component, inject, makeStateKey, OnInit, PLATFORM_ID, signal, TransferState} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {NgIconComponent, provideIcons} from '@ng-icons/core';
import {
  heroPencil,
  heroTrash,
  heroChevronLeft,
  heroChevronRight,
  heroPlus,
  heroMagnifyingGlass,
} from '@ng-icons/heroicons/outline';
import {
  ITipoAnalise,
} from '../../../shared/interfaces/analysis-type.interface';
import {ParametersService} from '../../../services/parameters.service';
import {AnalysisTypeService} from '../../../services/analysis-type.service';
import {IParameters} from '../../../shared/interfaces/parameters.interface';
import {ConfirmationModalService} from '../../../services/confirmation-modal.service';
import {isPlatformServer} from '@angular/common';
import {catchError, of} from 'rxjs';
import {ToastrService} from '../../../services/toastr.service';

const PARAMETROS_KEY = makeStateKey<IParameters[]>('appParametros');
const ANALISE_KEY = makeStateKey<ITipoAnalise[]>('appParamTipoAnalise');

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
export class ParametrosComponent implements OnInit {
  #platformId = inject(PLATFORM_ID)
  #transferState = inject(TransferState)
  #parametrosService = inject(ParametersService);
  #analysisTypeService = inject(AnalysisTypeService);
  confirmationModal = inject(ConfirmationModalService);
  #toastr = inject(ToastrService);


  parametros = signal<IParameters[] | []>([])
  parametrosFiltro = signal<IParameters[] | []>([])
  editingItem = signal<IParameters | null>(null);
  editItemIndex = signal<number | null>(null);
  tipoAnalise = signal<ITipoAnalise[] | []>([]);

  materiaPrimaForm = new FormGroup({
    tipoAnaliseId: new FormControl<string | number>('', [Validators.required]),
    descricao: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(2),
    ]),
    subDescricao: new FormControl<string>(''),
    unidadeResultado: new FormControl<string>(''),
    casasDecimais: new FormControl<number>(0, Validators.nullValidator),
  });

  ngOnInit(): void {
    const keyParametros = this.#transferState.get(PARAMETROS_KEY, null);
    const keyTipoAnalise = this.#transferState.get(ANALISE_KEY, null);
    if (isPlatformServer(this.#platformId)) {
      this.loadingAnalysis();
      this.loadingParams();
      return;
    } else {
      if (keyParametros) {
        this.parametros.set(keyParametros);
        this.parametrosFiltro.set(keyParametros);
        this.#transferState.remove(PARAMETROS_KEY);
      } else {
        this.loadingParams();
      }
      if (keyTipoAnalise) {
        this.tipoAnalise.set(keyTipoAnalise);
        this.#transferState.remove(ANALISE_KEY);
      } else {
        this.loadingAnalysis();
      }
    }
  }

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
    return this.parametrosFiltro().slice(inicio, fim);
  }

  // Utilitário
  Math = Math;


  loadingParams() {
    this.#parametrosService.findAll().pipe(
      catchError((error) => {
        console.log('Erro ao carregar parâmetros:', error)
        return of([])
      })
    ).subscribe({
      next: (res) => {
        this.parametros.set(res);
        this.parametrosFiltro.set(this.parametros());
        if (isPlatformServer(this.#platformId)) {
          this.#transferState.set(PARAMETROS_KEY, res);
        }
      },
    });
  }

  loadingAnalysis() {
    this.#analysisTypeService.findAll().pipe(
      catchError((error) => {
        console.log('Erro ao carregar tipos de análise:', error)
        return of([])
      })
    ).subscribe({
      next: (res) => {
        this.tipoAnalise.set(res);
        if (isPlatformServer(this.#platformId)) {
          this.#transferState.set(ANALISE_KEY, res)
        }
      },
    });

  }

  salvarItem(): void {
    if (
      !this.materiaPrimaForm.value.tipoAnaliseId ||
      !this.materiaPrimaForm.value.descricao
    ) {
      return;
    }
    const _params = {
      subDescricao: this.materiaPrimaForm.value.subDescricao,
      unidadeResultado: this.materiaPrimaForm.value.unidadeResultado,
      descricao: this.materiaPrimaForm.value.descricao,
      tipoAnaliseId: this.materiaPrimaForm.value.tipoAnaliseId,
      casasDecimais: this.materiaPrimaForm.value.casasDecimais,
    };

    if (this.editingItem() && this.editingItem()?.id) {
      this.#parametrosService
        .update(this.editingItem()?.id!, _params as IParameters)
        .subscribe({
          next: (res) => {
            this.#toastr.success('Tipo de análise editada com sucesso!')
            if (this.editItemIndex() !== -1) {
              this.parametros()[this.editItemIndex()!] = res;
            }
          },
        });
    } else {
      this.#parametrosService.create(_params as IParameters).subscribe({
        next: (res) => {
          this.#toastr.success('Tipo de análise salva com sucesso!')
          this.parametros.update((items) => [...items, res]);
          this.parametrosFiltro.set(this.parametros());
        },
      });
    }

    this.materiaPrimaForm.setValue({
      casasDecimais: 0,
      subDescricao: '',
      descricao: '',
      unidadeResultado: '',
      tipoAnaliseId: ''
    })

    // paginação
    if (this.paginaAtual > this.totalPaginas && this.totalPaginas > 0) {
      this.paginaAtual = this.totalPaginas;
    }
  }

  editarItem(item: IParameters, index: number): void {
    this.editingItem.set(item);
    this.editItemIndex.set(index);
    this.materiaPrimaForm.setValue({
      tipoAnaliseId: item.id ? item.id : null,
      descricao: item.descricao,
      subDescricao: item.subDescricao,
      unidadeResultado: item.unidadeResultado,
      casasDecimais: item.casasDecimais,
    });
  }

  cancelarEdicao(): void {
    this.editingItem.set(null);
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
            this.loadingParams()
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
    const filtro = this.parametros().filter((param) => {

      const idStr = param.id?.toString() ?? '';
      const descricao = param.descricao?.toLowerCase();
      const analise = param.tipoAnalise?.tipo!.toLowerCase() || ''

      return (
        idStr.includes(params) ||
        descricao.includes(params) ||
        analise.includes(params)
      );
    });
    this.parametrosFiltro.set(filtro);
  }
}
