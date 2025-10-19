import {
  Component,
  inject,
  makeStateKey,
  OnInit,
  PLATFORM_ID,
  signal,
  TransferState,
} from '@angular/core';
import { TabelaAnaliseAmostrasComponent } from '../../tables/tabela-analise-amostras.component';
import {
  PaginatedMeta,
  Querys,
} from '../../../shared/interfaces/querys.interface';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { IAmostra } from '../../../shared/interfaces/amostra.interface';
import { AmostrasService } from '../../../services/amostras.service';
import { AmostraDetailsModalComponent } from "./amostra-details-modal.component";
import { ToastrService } from '../../../services/toastr.service';
import { ConfirmationModalService } from '../../../services/confirmation-modal.service';

const AMOSTRAS_KEY = makeStateKey<IAmostra[]>(
  'amostras-aproavacao'
);

@Component({
  selector: 'app-aproavacao',
  imports: [TabelaAnaliseAmostrasComponent, AmostraDetailsModalComponent],
  template: ` <app-tabela-analise-amostras
    class="w-full h-full"
    [analiseFinalizada]="true"
    [revisar]="true"
    [selectFilter]="false"
    [amostras]="amostras()"
    [paginatedMeta]="paginatedMeta()"
    (amostraOutput)="revisar($event)" 
    (pageChange)="onPageChange($event)"
    titulo="Aguardando Aprovação"
  />
   <app-amostra-details-modal
      [amostra]="selectedAmostra()"
      [isOpen]="isModalOpen()"
      (close)="handleClose()"
      (onRevisar)="handleRevisar($event)">
    </app-amostra-details-modal>
  `,
})
export class AproavacaoComponent implements OnInit {
  #toast = inject(ToastrService);
  #confirm = inject(ConfirmationModalService);
  #platFormId = inject(PLATFORM_ID);
  #transferState = inject(TransferState);
  #amostraService = inject(AmostrasService);
  amostras = signal<IAmostra[]>([]);
  paginatedMeta = signal<PaginatedMeta | null>(null);
  selectedAmostra =  signal<IAmostra | null>(null);
  isModalOpen =signal<boolean>(false);

  ngOnInit() {
    const amostras = this.#transferState.get(AMOSTRAS_KEY, []);
    if (amostras.length > 0 && isPlatformBrowser(this.#platFormId)) {
      this.amostras.set(amostras);
      this.#transferState.remove(AMOSTRAS_KEY);
      return;
    }
    this.carregarAmostras();
  }

  private carregarAmostras(limit: number = 20, page: number = 1,status:string='EXECUCAO',progresso:number=100) {
    const query: Querys = { limit, page ,progresso,status};
    this.#amostraService
      .findAllWithAnalystsAndCompleted(query)
      .subscribe((res) => {
        if (res && res.data.length > 0) {
          this.amostras.update((v) => [...v, ...res.data]);
          this.paginatedMeta.set(res.meta);
          console.log(res.meta);
          if (isPlatformServer(this.#platFormId)) {
            this.paginatedMeta.set(res.meta);
            this.#transferState.set(AMOSTRAS_KEY, res.data);
          }
        }
      });
  }

  onPageChange(event: { page?: number; limit?: number }) {
    this.carregarAmostras(event.limit, event.page);
  }

  revisar(amostra: IAmostra) {
    if (!amostra) return;
    this.selectedAmostra.set(amostra)
    this.isModalOpen.set(true);
  }

  handleClose() {
    this.isModalOpen.set(false);
  }

  handleRevisar(amostra: IAmostra) {
    if(!amostra) return;
    const id = amostra.id
    this.#confirm.confirmWarning("Confirmar Assinatura?","Ao confirmar a assinatura, esta ação será irreversível. Todas as alterações na amostra serão bloqueadas e o Laudo de Análise poderá ser gerado. Deseja prosseguir?").then((confirm)=>{
      if(confirm){
         this.#amostraService.assinar(id,amostra).subscribe((res)=>{
      if(res){
        this.isModalOpen.set(false);
        this.#toast.success("A amostra foi assinada e concluida com sucesso!","Sucesso")
      }
    })
      }else{
        this.isModalOpen.set(false);
        this.#toast.warning("Não foram realizadas alterações!", "Info");
      }
    })
  }
}
