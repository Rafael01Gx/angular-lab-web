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
import {ConfirmationModalService} from '../../../services/confirmation-modal.service';
import {OrderService} from '../../../services/order.service';
import {EtiquetasService} from '../../../services/impressao-de-etiquetas.service';

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
  #orderService = inject(OrderService);
  #confirm = inject(ConfirmationModalService);
  #etiqueta = inject(EtiquetasService);

  identificacao = signal('');
  data = signal('');
  observacao = signal('');
  clearSelect = signal(false);
  ensaios= signal<ITipoAnalise[]>([]);
  selectedEnsaios= signal<ITipoAnalise[]>([]);
  amostras= signal<Partial<IAmostra>[] >([]);

  isValid = computed(() => {
    return (
      this.identificacao().length > 2 &&
      this.data().length > 0 &&
      this.selectedEnsaios().length > 0
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
          this.ensaios.set(res);
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  addEnsaios(event: ITipoAnalise[]) {
    this.selectedEnsaios.set(event);
  }

  addAmostras() {
    const amostra: Partial<IAmostra> = {
      nomeAmostra: this.identificacao(),
      dataAmostra: this.data(),
      ensaiosSolicitados: this.selectedEnsaios(),
    };
    this.amostras.update((amostras)=> [...amostras, amostra]);
    this.clearForm();
  }

  rmAmostras(index: number) {
    return this.amostras.update((amostras)=> amostras.splice(index, 1));
  }

  clearForm() {
    this.identificacao.set('');
    this.data.set('');
    this.selectedEnsaios.set([]);
    this.clearSelect.update((value) => !value);
    setTimeout(() => {
      this.clearSelect.update((value) => !value);
    }, 500);
  }
  save(){
    const amostras = this.amostras()
    if(!amostras){
      return
    }
    this.#confirm.confirmWarning("Enviar","Confirmar envio das remessa?").then((confirm)=>{
      if(confirm){
        this.#orderService.create(amostras as  Partial<IAmostra[]>).subscribe((ordem)=>{
          if(ordem){
            setTimeout(()=>{
              this.#confirm.confirmInfo("Imprimir","Deseja imprimir as etiquetas?").then((res)=>{
                if(res){
                  this.#etiqueta.gerarEtiquetaAmostrasOS(ordem).catch((err)=> console.log(err))
                }
              })
            },500)
          }
          this.clearForm();
          this.amostras.set([])
        })
      }
    })
  }

  cancel(){
    this.#confirm.confirmWarning("Limpar","Deseja limpar o formulário?").then((res)=>{
      if(res){
        this.clearForm();
        this.amostras.set([])
      }
    })
  }
}
