import { Component, signal, computed, inject, OnInit, TransferState, PLATFORM_ID, makeStateKey } from '@angular/core';
import { CommonModule, DatePipe, isPlatformBrowser, isPlatformServer } from '@angular/common';
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
  heroDocumentArrowUp
} from '@ng-icons/heroicons/outline';
import { AmostraAnaliseExterna, ElementoResultado } from '../../../shared/interfaces/amostra-analise-externa.interfaces';
import { AmostraLabExternoService } from '../../../services/amostras-analises-externas.service';
import { ToastrService } from '../../../services/toastr.service';
import { PaginatedResponse } from '../../../shared/interfaces/querys.interface';
import { tap } from 'rxjs';
import { RouterLink } from "@angular/router";

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
  imports: [CommonModule, FormsModule, NgIconComponent, DatePipe, RouterLink],
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
      heroDocumentArrowUp
    }),
  ],
  templateUrl: './amostras-analise-externa-table.html',
  styleUrls: ['./amostras-analise-externa-table.css'],
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
  perPage = signal(10);

  filtros = signal<FiltrosAvancados>({});

  modalLancamento = signal(false);
  modalVisualizacao = signal(false);
  amostraSelecionada = signal<AmostraAnaliseExterna | null>(null);
  resultados = signal<ElementoResultado[]>([]);

  paginaAtual = computed(() => this.currentPage());
  temPaginaAnterior = computed(() => this.currentPage() > 1);
  temProximaPagina = computed(() => this.currentPage() < this.totalPages());


  ngOnInit() {
    const amostraKeyData = this.#tranferState.get(AMOSTRAS_ANALISE_EXTERNA_KEY, null);
    if (amostraKeyData && isPlatformBrowser(this.#platformId)) {
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

    this.#amostrasAnaliseExt.findAll(params).pipe(tap((data) => {
      if (data && isPlatformServer(this.#platformId)) {
        this.#tranferState.set(AMOSTRAS_ANALISE_EXTERNA_KEY, data)
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
    const resultadosIniciais: ElementoResultado[] = [];
    amostra.elementosSolicitados.forEach(elem => {
      const item: ElementoResultado = {
        elemento: elem,
        valor: "",
        unidade: "%",
      }
      resultadosIniciais.push(item)
    });
    this.resultados.set(resultadosIniciais);
    this.modalLancamento.set(true);
  }

  atualizarResultado(elemento: string, valor: string) {
    valor = valor.replace('.', ',');
    const index = this.resultados().findIndex((item) => item.elemento === elemento);
    if (index !== -1) {
        this.resultados.update(resultadosAntigos => {
            const resultadosNovos = [...resultadosAntigos];
            resultadosNovos[index] = {
                ...resultadosNovos[index],
                valor: valor 
            };
            return resultadosNovos;
        });
    }
  }

  salvarResultados() {
    const amostra = this.amostraSelecionada();
    if (!amostra) return;
    amostra.elementosAnalisados = this.resultados()
    amostra.analiseConcluida = true;
    console.log(amostra)
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
    this.resultados.set([]);
  }

  abrirModalVisualizacao(amostra: AmostraAnaliseExterna) {
    this.amostraSelecionada.set(amostra);

    if (amostra.elementosAnalisados) {
      this.resultados.set(amostra.elementosAnalisados);
    }
    this.modalVisualizacao.set(true);
  }

  salvarEdicao() {
    const amostra = this.amostraSelecionada();
    if (!amostra) return;
    amostra.elementosAnalisados = this.resultados()
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
    this.resultados.set([]);
  }

  getEndereco(amostra: AmostraAnaliseExterna): any {
    try {
      return JSON.parse(amostra.RemessaLabExterno.destino.endereco);
    } catch {
      return {};
    }
  }

  toNumber(data: any): number {
    return Number.parseInt(data, 10);
  }

  protected readonly Math = Math;
}
