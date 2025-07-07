import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  DestroyRef,
  output,
  OutputEmitterRef,
  Input,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroXMark,
  heroCheck,
  heroPlus,
  heroTrash,
  heroChevronUp,
  heroChevronDown,
  heroMagnifyingGlass,
} from '@ng-icons/heroicons/outline';
import { IAnalysisSettings } from '../../../interfaces/analysis-settings.interface';
import { ITipoAnalise } from '../../../interfaces/analysis-type.interface';
import { IParameters } from '../../../interfaces/parameters.interface';
import { AnalysisTypeService } from '../../../services/analysis-type.service';
import { ParametersService } from '../../../services/parameters.service';
import {
  MultiSelectComponent,
  MultiSelectConfig,
} from '../../layout/input-select/multi-select.component';
import { AnalysisSettingsService } from '../../../services/analysis-settings.service';

@Component({
  selector: 'app-analysis-settings-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgIconComponent,
    MultiSelectComponent,
  ],
  viewProviders: [
    provideIcons({
      heroXMark,
      heroCheck,
      heroPlus,
      heroTrash,
      heroChevronUp,
      heroChevronDown,
      heroMagnifyingGlass,
    }),
  ],
  templateUrl: './analysis-settings-modal.component.html',
  styleUrl: './analysis-settings-modal.component.scss',
})
export class AnalysisSettingsModalComponent implements OnInit, AfterViewInit {
  #analysisTypeService = inject(AnalysisTypeService);
  #analysisSettingsService = inject(AnalysisSettingsService);
  #parametersService = inject(ParametersService);

  dataSaved: OutputEmitterRef<IAnalysisSettings> = output<IAnalysisSettings>();
  cancelled: OutputEmitterRef<void> = output<void>();

  @Input('isEditMode') isEditMode: boolean = false;
  @Input('data') data: IAnalysisSettings | null = null;
  @Input() isVisible: boolean = false;

  allparameters: IParameters[] = [];
  parameters: IParameters[] = [];
  selectedParams: IParameters[] = [];
  tiposAnalise = signal<ITipoAnalise[]>([]);

  animatedRows = signal<{ [key: number]: string }>({});
  paramFilter: IParameters[] = [];

  canSave = computed(
    () => this.analysisSettingsForm.valid && this.parameters.length > 0
  );

  selectedParameterIds: IParameters[] = [];
  config: MultiSelectConfig = {
    displayField: 'descricao',
    searchField: 'descricao',
    placeholder: 'Selecione...',
    maxHeight: '300px',
  };

  // Forms
  analysisSettingsForm = new FormGroup({
    nomeDescricao: new FormControl<string>('', [
      Validators.required,
      Validators.minLength(3),
    ]),
    tipoAnaliseId: new FormControl<number>(0, [Validators.required]),
  });

  ngOnInit() {
    this.loadTiposAnalise();
    this.loadParametros();
  }

  ngAfterViewInit(): void {
    if (this.data && this.isEditMode) {
      this.analysisSettingsForm.setValue({
        nomeDescricao: this.data.nomeDescricao,
        tipoAnaliseId: this.data.tipoAnaliseId!,
      });
      this.parameters = this.data.parametros;
      this.selectedParams = this.data.parametros;
    }
  }

  open(data: any) {
    this.loadModalData();
  }

  close(result?: any) {
    this.cancelled.emit();
    this.analysisSettingsForm.reset();
    this.parameters = [];
  }

  loadTiposAnalise() {
    try {
      this.#analysisTypeService.findAll().subscribe({
        next: (res) => {
          this.tiposAnalise.set(res);
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  loadParametros() {
    try {
      this.#parametersService.findAll().subscribe({
        next: (res) => {
          this.allparameters = res;
          this.filtrarParametro()
        },
      });
    } catch (error) {
      console.log(error);
    }
  }

  private loadModalData() {
    const data = this.data;
    if (this.isEditMode && data) {
      this.analysisSettingsForm.patchValue({
        nomeDescricao: data.nomeDescricao,
        tipoAnaliseId: data.tipoAnaliseId,
      });
      this.parameters = [...data.parametros];
    }
  }

  addParameter() {
    this.parameters = [
      ...this.parameters,
      ...this.selectedParams.filter(
        (arr2) => !this.parameters.some((arr1) => arr1.id === arr2.id)
      ),
    ];
  }

  removeParameter(index: number) {
    this.parameters = this.parameters.filter((_, i) => i !== index);
  }

  moveParameter(index: number, direction: 'up' | 'down') {
    const currentParams = [...this.parameters];

    if (direction === 'up' && index > 0) {
      this.setRowAnimation(index, 'animate-move-up');
      this.setRowAnimation(index - 1, 'animate-move-down');
      [currentParams[index - 1], currentParams[index]] = [
        currentParams[index],
        currentParams[index - 1],
      ];
    } else if (direction === 'down' && index < currentParams.length - 1) {
      this.setRowAnimation(index, 'animate-move-down');
      this.setRowAnimation(index + 1, 'animate-move-up');
      [currentParams[index], currentParams[index + 1]] = [
        currentParams[index + 1],
        currentParams[index],
      ];
    }

    this.parameters = currentParams;

    // Clear animations
    setTimeout(() => {
      this.animatedRows.set({});
    }, 300);
  }

  private setRowAnimation(index: number, animation: string) {
    this.animatedRows.update((rows) => ({
      ...rows,
      [index]: animation,
    }));
  }

  getRowAnimation(index: number): string {
    return this.animatedRows()[index] || '';
  }

  onSave() {
    if (
      this.analysisSettingsForm.value.nomeDescricao &&
      this.analysisSettingsForm.value.tipoAnaliseId &&
      this.parameters
    ) {
      const _analysisSettings: IAnalysisSettings = {
        nomeDescricao: this.analysisSettingsForm.value.nomeDescricao,
        tipoAnaliseId: this.analysisSettingsForm.value.tipoAnaliseId,
        parametros: this.parameters,
      };
      try {
        if (this.data?.id && this.isEditMode) {
          this.#analysisSettingsService
            .update(this.data.id, _analysisSettings)
            .subscribe({
              next: () => {
                this.dataSaved.emit(_analysisSettings);
                this.close(_analysisSettings);
              },
              error: (err) => {
                console.log(err);
              },
            });
        } else {
          this.#analysisSettingsService.create(_analysisSettings).subscribe({
            next: () => {
              this.dataSaved.emit(_analysisSettings);
              this.close(_analysisSettings);
            },
            error: (err) => {
              console.log(err);
            },
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  filtrarParametro() {
    const tipoAnaliseId = Number(this.analysisSettingsForm.value.tipoAnaliseId);
    this.paramFilter = this.allparameters.filter(
      (p) => p.tipoAnalise?.id == tipoAnaliseId
    );
  }
  onSelect(event: IParameters[]) {
    return (this.selectedParams = event);
  }
}
