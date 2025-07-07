import { Component, inject, signal, ViewChild } from '@angular/core';

import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroPencil,
  heroTrash,
  heroChevronLeft,
  heroChevronRight,
  heroPlus,
  heroMagnifyingGlass,
} from '@ng-icons/heroicons/outline';
import { IParameters } from '../../../interfaces/parameters.interface';
import { ConfirmationModalService } from '../../../services/confirmation-modal.service';
import { AnalysisSettingsService } from '../../../services/analysis-settings.service';
import { IAnalysisSettings } from '../../../interfaces/analysis-settings.interface';
import { AnalysisModalService } from '../../../services/analysis-modal.service';

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
export class AnaliseConfigComponent {
  #analysisSettingsService = inject(AnalysisSettingsService);
  #analysisModalService = inject(AnalysisModalService);
  confirmationModal = inject(ConfirmationModalService);

  analysisSettings!: IAnalysisSettings[];
  analysisSettingsFlt: IAnalysisSettings[]=[]
  editingItem: IAnalysisSettings | null = null;
  editItemIndex: number | null = null;

  paginaAtual = 1;
  itensPorPagina = 5;

  // Propriedades calculadas
  get totalPaginas(): number {
    return Math.ceil(this.analysisSettingsFlt.length / this.itensPorPagina);
  }

  get itensPaginados(): IAnalysisSettings[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    return this.analysisSettingsFlt.slice(inicio, fim);
  }

  // Utilitário HT
  Math = Math;

  ngOnInit(): void {
    this.loadingData();
  }

  loadingData() {
    try {
      this.#analysisSettingsService.findAll().subscribe({
        next: (res) => {
          this.analysisSettings = res;
          this.analysisSettingsFlt = this.analysisSettings;
        },
      });
    } catch (error) {
      console.log(error);
    }
  }
  async editarItem(item: IAnalysisSettings, index: number): Promise<void> {
    const close = await this.#analysisModalService.openModal(true, item);
    if (close) {
      this.loadingData();
    }
    this.editingItem = item;
    this.editItemIndex = index;
  }

  cancelarEdicao(): void {
    this.editingItem = null;
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
      try {
        this.#analysisSettingsService.delete(item.id!).subscribe({
          next: () => {
            this.analysisSettingsFlt = this.analysisSettings.filter(
              (t) => t.id !== item.id
            );
            if (this.paginaAtual > this.totalPaginas && this.totalPaginas > 0) {
              this.paginaAtual = this.totalPaginas;
            }
          },
        });
      } catch (error) {
        await this.confirmationModal.confirmInfo(
          `${item.nomeDescricao} - ${item.tipoAnalise?.tipo}`,
          'Ocorreu um erro ao remover esta Matéria-Prima.'
        );
      }
    }
  }

  filtrar(params: string) {
    const filtro = this.analysisSettings.filter((param) => {
      const idStr = param.id?.toString() ?? '';
      const descricao = param.nomeDescricao.toLowerCase();
      const tipoAnalise = param.tipoAnalise?.tipo.toLowerCase();

      return (
        idStr.includes(params) ||
        descricao.includes(params) ||
        tipoAnalise?.includes(params)
      );
    });
    this.analysisSettingsFlt = filtro;
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
