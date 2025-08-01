import {Component, inject, makeStateKey, OnInit, PLATFORM_ID, signal, TransferState} from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroPencil,
  heroTrash,
  heroChevronLeft,
  heroChevronRight,
  heroPlus,
  heroMagnifyingGlass,
} from '@ng-icons/heroicons/outline';
import { IParameters } from '../../../shared/interfaces/parameters.interface';
import { ConfirmationModalService } from '../../../services/confirmation-modal.service';
import { AnalysisSettingsService } from '../../../services/analysis-settings.service';
import { IAnalysisSettings } from '../../../shared/interfaces/analysis-settings.interface';
import { AnalysisModalService } from '../../../services/analysis-modal.service';
import {isPlatformBrowser, isPlatformServer} from '@angular/common';

const ANALISE_SETTINGS_KEY = makeStateKey<IAnalysisSettings[]>('appAnalise');

@Component({
  selector: 'app-analise-config',
  imports: [NgIconComponent],
  templateUrl: './analise-config.component.html',
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
export class AnaliseConfigComponent implements OnInit{
  #analysisSettingsService = inject(AnalysisSettingsService);
  #analysisModalService = inject(AnalysisModalService);
  #transferState = inject(TransferState);
  #platformId = inject(PLATFORM_ID);
  confirmationModal = inject(ConfirmationModalService);

  analysisSettings=signal<IAnalysisSettings[]>([])
  analysisSettingsFlt=signal<IAnalysisSettings[]>([])
  editingItem= signal<IAnalysisSettings | null>(null);
  editItemIndex= signal<number | null>(null);

  paginaAtual = 1;
  itensPorPagina = 5;

  // Propriedades calculadas
  get totalPaginas(): number {
    return Math.ceil(this.analysisSettingsFlt().length / this.itensPorPagina);
  }

  get itensPaginados(): IAnalysisSettings[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    return this.analysisSettingsFlt().slice(inicio, fim);
  }

  // Utilitário HT
  Math = Math;

  ngOnInit(): void {
    const keyData = this.#transferState.get(ANALISE_SETTINGS_KEY,null)
    if(isPlatformBrowser(this.#platformId) && keyData){
      this.analysisSettings.set(keyData);
      this.analysisSettingsFlt.set(keyData);
      this.#transferState.remove(ANALISE_SETTINGS_KEY)
      return;
    }
    this.loadingData();
  }

  loadingData() {
      this.#analysisSettingsService.findAll().subscribe({
        next: (res) => {
          this.analysisSettings.set(res);
          this.analysisSettingsFlt.set(res);
          if(isPlatformServer(this.#platformId)){
            this.#transferState.set(ANALISE_SETTINGS_KEY,res);
          }
        },
      });
  }
  async editarItem(item: IAnalysisSettings, index: number): Promise<void> {
    const close = await this.#analysisModalService.openModal(true, item);
    if (close) {
      this.loadingData();
    }
    this.editingItem.set(item);
    this.editItemIndex.set(index);
  }

  cancelarEdicao(): void {
    this.editingItem.set(null);
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

  async excluirItem(item: IAnalysisSettings): Promise<void> {
    const confirmed = await this.confirmationModal.confirmDelete(
      `${item.nomeDescricao} - ${item.tipoAnalise?.tipo}`,
      'Esta Configuração será removida permanentemente.'
    );
    if (confirmed) {
        this.#analysisSettingsService.delete(item.id!).subscribe({
          next: () => {
            this.analysisSettingsFlt.update(()=>this.analysisSettings().filter(
              (t) => t.id !== item.id
            ));
            if (this.paginaAtual > this.totalPaginas && this.totalPaginas > 0) {
              this.paginaAtual = this.totalPaginas;
            }
          },
        });
      }
  }

  filtrar(params: string) {
    const filtro = this.analysisSettings().filter((param) => {
      const idStr = param.id?.toString() ?? '';
      const descricao = param.nomeDescricao.toLowerCase();
      const tipoAnalise = param.tipoAnalise?.tipo.toLowerCase();

      return (
        idStr.includes(params) ||
        descricao.includes(params) ||
        tipoAnalise?.includes(params)
      );
    });
    this.analysisSettingsFlt.set(filtro);
  }

  paramMap(params: IParameters[]) {
    return params.map(
      (param) => `${param.descricao} ${param.unidadeMedida || ''}`
    );
  }

  async openModal() {
    const close = await this.#analysisModalService.open({
      isEditMode: false,
    });

    if (close) {
      this.loadingData();
    }
    return;
  }
}
