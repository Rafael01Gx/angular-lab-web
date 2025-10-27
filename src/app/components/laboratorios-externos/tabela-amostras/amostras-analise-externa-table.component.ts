import { Component, signal, computed, inject, OnInit, TransferState, PLATFORM_ID, makeStateKey } from '@angular/core';
import {CommonModule, DatePipe, isPlatformBrowser, isPlatformServer} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  heroChevronDown,
  heroChevronUp,
  heroFunnel,
  heroXMark,
  heroPencilSquare,
  heroEye,
  heroPlus,
  heroChevronLeft,
  heroChevronRight,
} from '@ng-icons/heroicons/outline';
import {AmostraAnaliseExterna} from '../../../shared/interfaces/amostra-analise-externa.interfaces';
import {AmostraLabExternoService} from '../../../services/amostras-analises-externas.service';
import {ToastrService} from '../../../services/toastr.service';
import { PaginatedResponse } from '../../../shared/interfaces/querys.interface';
import { tap } from 'rxjs';

const AMOSTRAS_ANALISE_EXTERNA_KEY = makeStateKey<PaginatedResponse<AmostraAnaliseExterna[]>>('amostraAnaliseExterna-table')
interface FiltrosAvancados {
  analiseConcluida?: boolean;
  dataInicio?: string;
  dataFim?: string;
  amostraName?: string;
  labExternoId?: number;
}

@Component({
  selector: 'app-amostras-analise-externa-table',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent, DatePipe],
  providers: [
    provideIcons({
      heroChevronDown,
      heroChevronUp,
      heroFunnel,
      heroXMark,
      heroPencilSquare,
      heroEye,
      heroPlus,
      heroChevronLeft,
      heroChevronRight,
    }),
  ],
  templateUrl: './amostras-analise-externa-table.html',
  styleUrls: ['./amostras-analise-externa-table.css'],
  host:{
    class:'w-full h-full'
  }
})
export class AmostrasAnaliseExternaTableComponent implements OnInit {
  #tranferState = inject(TransferState);
  #platformId = inject(PLATFORM_ID);
  #amostrasAnaliseExt = inject(AmostraLabExternoService);
  #toast = inject(ToastrService);
  amostras = signal<AmostraAnaliseExterna[]>([]);
  loading = signal(false);
  filtrosExpanded = signal(false);

  currentPage = signal(1);
  totalPages = signal(1);
  total = signal(0);
  perPage = signal(30);

  filtros = signal<FiltrosAvancados>({});

  modalLancamento = signal(false);
  modalVisualizacao = signal(false);
  amostraSelecionada = signal<AmostraAnaliseExterna | null>(null);
  resultados = signal<Record<string, string>>({});

  paginaAtual = computed(() => this.currentPage());
  temPaginaAnterior = computed(() => this.currentPage() > 1);
  temProximaPagina = computed(() => this.currentPage() < this.totalPages());


  ngOnInit() {
    const amostraKeyData = this.#tranferState.get(AMOSTRAS_ANALISE_EXTERNA_KEY,null);
    if(amostraKeyData && isPlatformBrowser(this.#platformId)){
      this.amostras.set(amostraKeyData.data);
        this.currentPage.set(amostraKeyData.meta.currentPage);
        this.totalPages.set(amostraKeyData.meta.totalPages);
        this.total.set(amostraKeyData.meta.total);
        this.#tranferState.remove(AMOSTRAS_ANALISE_EXTERNA_KEY)
        return;
    }
    this.carregarAmostras();
  }

  carregarAmostras() {
    this.loading.set(true);

    const params = {
      ...this.filtros(),
      page: this.currentPage(),
      limit: this.perPage()
    };

    this.#amostrasAnaliseExt.findAll(params).pipe(tap((data)=>{
      if(data && isPlatformServer(this.#platformId)){
        this.#tranferState.set(AMOSTRAS_ANALISE_EXTERNA_KEY,data)
      }
    })).subscribe({
      next: (response) => {
        this.amostras.set(response.data);
        this.currentPage.set(response.meta.currentPage);
        this.totalPages.set(response.meta.totalPages);
        this.total.set(response.meta.total);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar amostras:', err);
        this.loading.set(false);
      }
    });

  }

  toggleFiltros() {
    this.filtrosExpanded.update(v => !v);
  }

  aplicarFiltros() {
    this.currentPage.set(1);
    this.carregarAmostras();
  }

  limparFiltros() {
    this.filtros.set({});
    this.currentPage.set(1);
    this.carregarAmostras();
  }

  atualizarFiltro(campo: keyof FiltrosAvancados, valor: any) {
    this.filtros.update(f => ({ ...f, [campo]: valor || undefined }));
  }

  irParaPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPages()) {
      this.currentPage.set(pagina);
      this.carregarAmostras();
    }
  }

  proximaPagina() {
    if (this.temProximaPagina()) {
      this.irParaPagina(this.currentPage() + 1);
    }
  }

  paginaAnterior() {
    if (this.temPaginaAnterior()) {
      this.irParaPagina(this.currentPage() - 1);
    }
  }

  abrirModalLancamento(amostra: AmostraAnaliseExterna) {
    this.amostraSelecionada.set(amostra);
    const resultadosIniciais: Record<string, string> = {};
    amostra.elementosSolicitados.forEach(elem => {
      resultadosIniciais[elem] = '';
    });
    this.resultados.set(resultadosIniciais);
    this.modalLancamento.set(true);
  }

  atualizarResultado(elemento: string, valor: string) {
    valor = valor.replace('.',',');
    this.resultados.update(r => ({ ...r, [elemento]: valor }));
  }

  salvarResultados() {
    const amostra = this.amostraSelecionada();
    if (!amostra) return;

    amostra.elementosAnalisados = Object.entries(this.resultados())
      .map(([elemento, valor]) => ({ elemento, valor }));
    amostra.analiseConcluida = true;
    this.#amostrasAnaliseExt.update(amostra.id, amostra).subscribe({
      next: () => {
        this.fecharModalLancamento();
        this.carregarAmostras();
        this.#toast.success('Resultado salvo com sucesso!');
      },
      error: (err) => {
        this.#toast.error('Erro ao salvar resultados!');
      }
    });


    this.fecharModalLancamento();
  }

  fecharModalLancamento() {
    this.modalLancamento.set(false);
    this.amostraSelecionada.set(null);
    this.resultados.set({});
  }

  abrirModalVisualizacao(amostra: AmostraAnaliseExterna) {
    this.amostraSelecionada.set(amostra);
    const resultadosAtuais: Record<string, string> = {};

    if (amostra.elementosAnalisados) {
      amostra.elementosAnalisados.forEach(elem => {
        resultadosAtuais[elem.elemento] = elem.valor;
      });
    }

    this.resultados.set(resultadosAtuais);
    this.modalVisualizacao.set(true);
  }

  salvarEdicao() {
    const amostra = this.amostraSelecionada();
    if (!amostra) return;

    amostra.elementosAnalisados = Object.entries(this.resultados())
      .map(([elemento, valor]) => ({ elemento, valor }));
    this.#amostrasAnaliseExt.update(amostra.id, amostra).subscribe({
      next: () => {
        this.fecharModalVisualizacao();
        this.carregarAmostras();
        this.#toast.info('Resultado alterado com sucesso!');
      },
      error: (err) => {
        this.#toast.error('Erro ao salvar resultados!');
      }
    });

    this.fecharModalVisualizacao();
  }

  fecharModalVisualizacao() {
    this.modalVisualizacao.set(false);
    this.amostraSelecionada.set(null);
    this.resultados.set({});
  }

  getEndereco(amostra: AmostraAnaliseExterna): any {
    try {
      return JSON.parse(amostra.RemessaLabExterno.destino.endereco);
    } catch {
      return {};
    }
  }

  toNumber(data:any):number {
    return Number.parseInt(data, 10);
  }

  protected readonly Math= Math;
}
