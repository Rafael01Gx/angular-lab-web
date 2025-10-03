import {
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  input,
  output, OutputEmitterRef,
  signal
} from '@angular/core';
import {FormConfig} from '../../../shared/interfaces/form-config.interface';
import {FormularioDinamicoService} from '../../../services/formulario-dinamico.service';
import {AnaliseForm, ParametrosForm} from '../../../shared/interfaces/form-analise.interface';
import {formConfigAnalise, formConfigEditarResultado} from '../../../core/config/form-config-analise.config';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {NgxMaskDirective} from 'ngx-mask';
import {NgIconComponent, provideIcons} from '@ng-icons/core';
import {
  heroDocumentText,
  heroCheck,
  heroExclamationCircle,
  heroExclamationTriangle,
  heroArrowPath
} from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-lancamento-resultado-form',
  imports: [
    ReactiveFormsModule,
    NgxMaskDirective,
    NgIconComponent
  ],
  viewProviders: [provideIcons({
    heroDocumentText,
    heroCheck,
    heroExclamationCircle,
    heroExclamationTriangle,
    heroArrowPath
  })],
  template: `
    <div class="w-full h-full flex">
      <!-- Header Card -->

      @if (resultadosForm() && formConfig().fields.length > 0) {
        <!-- Form Card -->
        <div class="flex-1 bg-white shadow-xl border border-slate-200 overflow-hidden flex flex-col">
          <!-- Header
          <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 flex-shrink-0">
            <h2 class="text-xl font-semibold text-white flex items-center">
              <ng-icon name="heroDocumentText" class="w-6 h-6 mr-3"></ng-icon>
              Dados de Análise
            </h2>
          </div> -->

          <!-- Form Structure -->
          <form [formGroup]="resultadosForm()!" (ngSubmit)="onSubmit()" class="flex-1 flex flex-col min-h-0">
            <!-- Scrollable Content Area -->
            <div class="flex-1 overflow-y-auto p-8">
              <div class="flex flex-col gap-4">
                @for (field of formConfig().fields; track field.formControlName) {
                  <div class="flex justify-center items-center gap-2">
                    <!-- Label -->
                    <label
                      [for]="field.formControlName"
                      class="block text-sm font-semibold text-slate-700 text-center"
                    >
                      {{ field.label }}
                      @if (field.required) {
                        <span class="text-red-500 ml-1">*</span>
                      }
                    </label>
                    <!-- Input Container -->
                    <div class="relative">
                      <input
                        [id]="field.formControlName"
                        [formControlName]="field.formControlName"
                        [type]="field.type"
                        [required]="field.required ?? true"
                        [placeholder]="field.placeholder || 'Digite o valor...'"
                        [mask]="field.mask"
                        class="w-[1/3] input-icon-left"
                        [class.border-slate-300]="!hasFieldError(field.formControlName)"
                        [class.focus:border-blue-500]="!hasFieldError(field.formControlName)"
                        [class.border-red-300]="hasFieldError(field.formControlName)"
                        [class.focus:border-red-500]="hasFieldError(field.formControlName)"
                        [class.bg-red-50]="hasFieldError(field.formControlName)"
                      >
                      <!-- Success Icon -->
                      @if (isFieldValid(field.formControlName)) {
                        <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                          <ng-icon name="heroCheck" class="w-5 h-5 text-green-500"></ng-icon>
                        </div>
                      }

                      <!-- Error Icon -->
                      @if (hasFieldError(field.formControlName)) {
                        <div class="absolute inset-y-0 right-0 flex items-center pr-3">
                          <ng-icon name="heroExclamationCircle" class="w-5 h-5 text-red-500"></ng-icon>
                        </div>
                      }
                    </div>

                    <div>
                        <span class="text-sm font-semibold text-slate-700 text-center">{{field.unidadeResultado}}</span>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Fixed Form Actions -->
            <div class="flex-shrink-0 p-8 pt-6 border-t border-slate-200 bg-white">
              <div class="flex flex-col sm:flex-row gap-4 justify-end">
                <button
                  type="button"
                  (click)="onReset()"
                  class="px-6 py-3 text-slate-600 bg-white border-2 border-slate-300 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-slate-500/20"
                >
                    <span class="flex items-center justify-center">
                      <ng-icon name="heroArrowPath" class="w-5 h-5 mr-2"></ng-icon>
                      Limpar
                    </span>
                </button>

                <button
                  type="submit"
                  [disabled]="!resultadosForm()!.valid"
                  class="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-500/30"
                >
                    <span class="flex items-center justify-center">
                      <ng-icon name="heroCheck" class="w-5 h-5 mr-2"></ng-icon>
                      Salvar Resultados
                    </span>
                </button>
              </div>
            </div>
          </form>
        </div>
      } @else {
        <!-- Loading State -->
        <div class="flex-1 bg-white my-auto shadow-xl border border-slate-200 p-12 text-center">
          <div
            class="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
          <h3 class="text-lg font-semibold text-slate-700 mb-2">Carregando formulário...</h3>
          <p class="text-slate-500">Aguarde enquanto preparamos os campos necessários</p>
        </div>
      }
    </div>
  `
})
export class LancamentoResultadoFormComponent {
  #formDinamicoService = inject(FormularioDinamicoService);
  #cdr = inject(ChangeDetectorRef);

  parametrosConfig = input<AnaliseForm| Record<string,ParametrosForm> | null>(null);
  formSaved:OutputEmitterRef<any> = output<any>();

  formConfig = signal<FormConfig>({title: '', description: '', fields: []});
  resultadosForm = signal<FormGroup | null>(null);

  constructor() {
    effect(() => {
      const config = this.parametrosConfig();
      if (config) {
        this.createForm(config);
      }
    });
  }

  private createForm(data: AnaliseForm | Record<string,ParametrosForm>) {
    try {
      // Criar uma chave única baseada no ID ou nome da análise
      const isAnaliseForm = !!(data.id && data.tipoAnalise && data.nomeDescricao);
      const formKey = `analise-${data.id || Date.now()}-form`;

      // Registrar a configuração do formulário
      if(isAnaliseForm){
        this.#formDinamicoService.registerFormConfig(formKey, formConfigAnalise);
      } else {
        this.#formDinamicoService.registerFormConfig(formKey, formConfigEditarResultado);
      }

      // Obter a configuração e criar o formulário
      const config = this.#formDinamicoService.getFormConfig(formKey, data);
      const form = this.#formDinamicoService.createForm(config);

      // Atualizar os signals
      this.formConfig.set(config);
      this.resultadosForm.set(form);

      this.#cdr.detectChanges();
    } catch (error) {
      console.error('Erro ao criar formulário:', error);
      // Reset dos signals em caso de erro
      this.formConfig.set({title: 'Erro', description: 'Falha ao carregar formulário', fields: []});
      this.resultadosForm.set(null);
    }
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.resultadosForm()?.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  isFieldValid(fieldName: string): boolean {
    const field = this.resultadosForm()?.get(fieldName);
    return !!(field?.valid && field?.touched);
  }

  getValidFieldsCount(): number {
    if (!this.resultadosForm()) return 0;

    let validCount = 0;
    Object.keys(this.resultadosForm()!.controls).forEach(key => {
      if (this.resultadosForm()!.get(key)?.valid) {
        validCount++;
      }
    });
    return validCount;
  }

  getInvalidFieldsCount(): number {
    if (!this.resultadosForm()) return 0;
    return this.formConfig().fields.length - this.getValidFieldsCount();
  }

  getFormProgress(): number {
    if (!this.resultadosForm() || this.formConfig().fields.length === 0) return 0;
    return (this.getValidFieldsCount() / this.formConfig().fields.length) * 100;
  }

  onSubmit() {
    if (this.resultadosForm()?.valid) {
      const formData = this.resultadosForm()!.value ;
      let dadosFormatados = null;
      if(this.parametrosConfig()?.parametros && this.parametrosConfig()?.id){
        const paramConfig = this.parametrosConfig() as AnaliseForm;
        dadosFormatados = paramConfig.parametros.map((p)=> {
          const valor = formData[`id${p.id}`];
          return {
            valor: valor,
            ...p
          }
        })
      } else {
        const paramConfig = Object.values(this.parametrosConfig() as Record<string,ParametrosForm>);
        dadosFormatados = paramConfig.map((p)=> {
          const valor = formData[`id${p.id}`];
          return {
            ...p,
            valor: valor,
          }
        })
      }
    this.formSaved.emit(dadosFormatados);
    }
  }

  onReset() {
    this.resultadosForm()?.reset();
  }
}
