import {Component, signal} from '@angular/core';
import {AnaliseForm} from '../../../shared/interfaces/form-analise.interface';
import data from "../../../core/data.json";
import data2 from "../../../core/data2.json";
import {
  LancamentoResultadoFormComponent
} from '../../forms/lancamento-resultado-form/lancamento-resultado-form.component';
@Component({
  selector: 'app-lancamento-resultado',
  imports: [LancamentoResultadoFormComponent],
  template: `
    <div class="w-full h-full flex ">
      <!-- Botões para simular mudança de dados -->
      <div class="flex-1 flex flex-col gap-4">
        <button
          (click)="loadAnalise1()"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Carregar Análise 1
        </button>
        <button
          (click)="loadAnalise2()"
          class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Carregar Análise 2
        </button>
        <button
          (click)="clearAnalise()"
          class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Limpar
        </button>
      </div>

      <!-- Componente dinâmico -->
      <div class="flex-1 flex">
        <app-lancamento-resultado-form
          class="flex-1"
          [parametrosConfig]="currentAnalise()"
          (formSaved)="onFormSaved($event)"
        />
      </div>
    </div>
  `
})
export class LancamentoResultadoComponent {
  currentAnalise = signal<AnaliseForm | null>(null);
 data= data as AnaliseForm;
 data2= data2 as AnaliseForm;

  loadAnalise1() {
    this.currentAnalise.set(this.data);
  }

  loadAnalise2() {
    this.currentAnalise.set(this.data2);
  }

  clearAnalise() {
    this.currentAnalise.set(null);
  }

  onFormSaved(data: any) {
    console.log('Dados salvos:', data);
    alert('Formulário salvo com sucesso!');
  }
}
