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
import {
  IClasseItem,
  ITipoAnalise,
} from '../../../shared/interfaces/analysis-type.interface';
import { AnalysisTypeService } from '../../../services/analysis-type.service';
import { ConfirmationModalService } from '../../../services/confirmation-modal.service';
import {isPlatformBrowser, isPlatformServer} from '@angular/common';
import {ToastrService} from '../../layout/toastr/toastr.service';

const TIPOS_ANALISE_KEY = makeStateKey<ITipoAnalise[]>('appTiposAnalise');

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
  #platformId = inject(PLATFORM_ID)
  #transferState = inject(TransferState)
  #analysisTypeService = inject(AnalysisTypeService);
  #toastr = inject(ToastrService);
  confirmationModal = inject(ConfirmationModalService);

  isLoading = signal(false);
  tiposAnalise= signal<ITipoAnalise[]|[]>([])
  editingItem= signal<ITipoAnalise| null>(null);
  editItemIndex= signal<number | null>(null);

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

  ngOnInit(): void {
    const keyData = this.#transferState.get(TIPOS_ANALISE_KEY,null)
    if(isPlatformServer(this.#platformId)){
      this.loadingData();
      return;
    }else if(isPlatformBrowser(this.#platformId) && keyData){
      this.tiposAnalise.set(keyData);
      this.#transferState.remove(TIPOS_ANALISE_KEY)
      return;
    }
    this.loadingData();
  }


  // Paginação
  paginaAtual = 1;

  itensPorPagina = 5;
  // Propriedades

  get totalPaginas(): number {
    return Math.ceil(this.tiposAnalise().length / this.itensPorPagina);
  }

  get itensPaginados(): ITipoAnalise[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    return this.tiposAnalise().slice(inicio, fim);
  }
  // Utilitário

  Math = Math;
  loadingData(){
    this.isLoading.set(true);

    this.#analysisTypeService.findAll().subscribe({
      next: (res) => {
        this.tiposAnalise.set(res);
        this.isLoading.set(false)
        if(isPlatformServer(this.#platformId)){
          this.#transferState.set(TIPOS_ANALISE_KEY,res);
        }
      },
    });
  }

  salvarItem(): void {
    if (!this.analiseForm.value.tipo || !this.analiseForm.value.classe) {
      return;
    }

    if (this.editingItem() && this.editingItem()?.id) {
      this.#analysisTypeService
        .update(this.editingItem()?.id!, this.analiseForm.value as ITipoAnalise)
        .subscribe({
          next: (res) => {
            this.#toastr.success('Análise editada com sucesso!')
            if (this.editItemIndex() !== -1) {
              this.tiposAnalise()[this.editItemIndex()!] = res;
            }
          },
        });
    } else {
      this.#analysisTypeService
        .create(this.analiseForm.value as ITipoAnalise)
        .subscribe({
          next: (res) => {
            this.#toastr.success('Análise salva com sucesso!')
            this.tiposAnalise.update((items) => [...items, res])
          },
        });
    }

    this.analiseForm.reset();

    // paginação
    if (this.paginaAtual > this.totalPaginas && this.totalPaginas > 0) {
      this.paginaAtual = this.totalPaginas;
    }
  }

  editarItem(item: ITipoAnalise, index: number): void {
    this.editingItem.set(item);
    this.editItemIndex.set(index);
    this.analiseForm.setValue({
      classe: item.classe,
      tipo: item.tipo,
    });
  }

  cancelarEdicao(): void {
    this.editingItem.set(null);
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
