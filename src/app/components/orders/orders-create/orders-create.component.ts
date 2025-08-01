import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {NgIconComponent, provideIcons} from '@ng-icons/core';
import {
  MultiSelectComponent,
  MultiSelectConfig,
} from '../../layout/input-select/multi-select.component';
import {AnalysisTypeService} from '../../../services/analysis-type.service';
import {ITipoAnalise} from '../../../shared/interfaces/analysis-type.interface';
import {IAmostra} from '../../../shared/interfaces/amostra.interface';
import {FormsModule} from '@angular/forms';
import {
  heroArrowTurnRightDown,
  heroTrash,
  heroMagnifyingGlass,
  heroXMark,
  heroCheck,
  heroPlus,
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-orders-create',
  imports: [NgIconComponent, MultiSelectComponent, FormsModule],
  viewProviders: [
    provideIcons({
      heroArrowTurnRightDown,
      heroTrash,
      heroMagnifyingGlass,
      heroXMark,
      heroCheck,
      heroPlus,
    }),
  ],
  templateUrl: './orders-create.component.html',
})
export class OrdersCreateComponent implements OnInit {
  #analysisService = inject(AnalysisTypeService);
  identificacao = signal('');
  data = signal('');
  observacao = signal('');
  clearSelect = signal(false);
  ensaios: ITipoAnalise[] = [];
  selectedEnsaios: ITipoAnalise[] = [];
  amostras: Partial<IAmostra>[] = [];

  isValid = computed(() => {
    return !!(
      this.identificacao().length > 2 &&
      this.data().length > 0 &&
      this.selectedEnsaios.length > 0
    );
  });
  config: MultiSelectConfig = {
    displayField: 'tipo',
    searchField: 'descricao',
    placeholder: 'Selecione...',
    maxHeight: '300px',
  };

  objectValues(item: ITipoAnalise[]) {
    return item.map((i) => i.tipo);
  }

  ngOnInit(): void {
    this.getAnalysis();
  }

  getAnalysis() {
    try {
      this.#analysisService.findAll().subscribe((res) => {
        if (res) {
          this.ensaios = res;
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  addEnsaios(event: ITipoAnalise[]) {
    return (this.selectedEnsaios = event);
  }

  addAmostras() {
    const amostra: Partial<IAmostra> = {
      nomeAmostra: this.identificacao(),
      dataAmostra: this.data(),
      ensaiosSolicitados: this.selectedEnsaios,
    };
    this.amostras.push(amostra);
    this.clearForm();
  }

  rmAmostras(index: number) {
    return this.amostras.splice(index, 1);
  }

  clearForm() {
    this.identificacao.update((value) => (value = ''));
    this.data.update((value) => (value = ''));
    this.selectedEnsaios = [];
    this.clearSelect.update((value) => !value);
    setTimeout(() => {
      this.clearSelect.update((value) => !value);
    }, 500);
  }
}
