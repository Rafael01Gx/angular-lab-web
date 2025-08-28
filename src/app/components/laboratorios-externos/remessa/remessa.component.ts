import {CommonModule, isPlatformBrowser, isPlatformServer} from '@angular/common';
import {
  Component,
  ElementRef,
  inject,
  makeStateKey,
  OnInit,
  PLATFORM_ID,
  signal,
  TransferState,
  ViewChild
} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {EtiquetasService} from '../../../services/impressao-de-etiquetas.service';
import {
  AmostraLabExterno, AmostraRemessa,
  ElementoQuimico,
  Laboratorio,
  Remessa
} from '../../../shared/interfaces/laboratorios-externos.interfaces';
import {ConfirmationModalService} from '../../../services/confirmation-modal.service';
import {ToastrService} from '../../../services/toastr.service';
import {NgIcon, provideIcons} from '@ng-icons/core';
import {
  heroPencilSquare,
  heroArrowPathRoundedSquare,
  heroCheck,
  heroMagnifyingGlass,
  heroTrash,
  heroPlus,
  heroEye, heroClipboardDocument, heroXMark, heroPaperClip, heroPrinter
} from '@ng-icons/heroicons/outline'
import {LabsLabExternosService} from '../../../services/labs-lab-externos.service';
import {AmostrasLabExternos} from '../../../services/amostras-lab-externos.service';
import {ElementoQuimicoLabExternosService} from '../../../services/elemento-quimico-lab-externos.service';
import {map} from 'rxjs';
import {RemessasLabExternosService} from '../../../services/remessas-lab-externos.service';

const LABORATORIOS_KEY = makeStateKey<Laboratorio[]>('appRemessaLaboratorios');
const ELEMENTOS_KEY = makeStateKey<ElementoQuimico[]>('appRemessaElementos');
const KEY_AMOSTRAS = makeStateKey<AmostraLabExterno[]>('appRemessaAmostras');
const REMESSAS_KEY = makeStateKey<Remessa[]>('appRemessaRemessas');

@Component({
  selector: 'app-remessa',
  imports: [CommonModule, FormsModule, NgIcon],
  viewProviders: [provideIcons({
    heroPencilSquare,
    heroArrowPathRoundedSquare,
    heroXMark,
    heroCheck,
    heroMagnifyingGlass,
    heroTrash,
    heroPlus,
    heroEye,
    heroClipboardDocument,
    heroPaperClip, heroPrinter
  })],
  templateUrl: './remessa.component.html',
})
export class RemessaComponent implements OnInit {
  @ViewChild('remessaDialog') remessaDialog!: ElementRef<HTMLDialogElement>;
  #confirmModal = inject(ConfirmationModalService);
  #toast = inject(ToastrService);
  #transferState = inject(TransferState);
  #platformId = inject(PLATFORM_ID);
  #labService = inject(LabsLabExternosService);
  #amostrasLabExternos = inject(AmostrasLabExternos);
  #remessasLabExternosService = inject(RemessasLabExternosService);
  #elementService = inject(ElementoQuimicoLabExternosService);
  etiquetasService = inject(EtiquetasService);
  selectTable = signal<number>(0)

  elementos = signal<ElementoQuimico[]>([]);
  amostras = signal<AmostraLabExterno[]>([]);
  laboratorios = signal<Laboratorio[]>([]);

  remessas = signal<Remessa[]>([])
  remessasFiltradas = signal<Remessa[]>([])

  novaRemessa: Remessa = {
    id: '',
    data: new Date().toISOString().split('T')[0],
    destinoId: '',
    amostras: [],
  };

  // Amostra selecionada para adicionar à remessa
  amostraSelecionada: AmostraLabExterno | null = null;

  // Termo de pesquisa
  searchTerm: string = '';

  // Flag para saber se está editando ou adicionando
  editando = signal<boolean>(false);

  // Referência para a última remessa cadastrada
  ultimaRemessa: Remessa | null = null;

  // Remessa sendo visualizada nos detalhes
  remessaVisualizada: Remessa | null = null;

  ngOnInit(): void {
    this.loadAllData();
  }

  loadLabs() {
    this.#labService.findAll().subscribe((res) => {
      if (res) {
        this.laboratorios.set(res);
        if (isPlatformServer(this.#platformId)) {
          this.#transferState.set(LABORATORIOS_KEY, res);
        }
      }
    })
  }

  loadElements() {
    this.#elementService.findAll().subscribe(elementos => {
      if (elementos) {
        this.elementos.set(elementos)
        if (isPlatformServer(this.#platformId)) {
          this.#transferState.set(ELEMENTOS_KEY, elementos)
        }
      }
    })
  }

  loadAmostras() {
    this.#amostrasLabExternos.findAll().pipe(
      map(amostras =>
        amostras.map(amostra => ({
          ...amostra,
          elementosAnalisados: amostra.elementosAnalisados.map((element) => element.id)
        })) as AmostraLabExterno[]
      )
    ).subscribe((amostras) => {
      if (amostras) {
        this.amostras.set(amostras)
        if (isPlatformServer(this.#platformId)) {
          this.#transferState.set(KEY_AMOSTRAS, amostras)
        }
      }
    })
  }

  loadRemessas() {
    this.#remessasLabExternosService.findAll().subscribe(remessas => {
      if (remessas) {
        this.remessas.set(remessas)
        this.remessasFiltradas.set(remessas)
        if (isPlatformServer(this.#platformId)) {
          this.#transferState.set(REMESSAS_KEY, remessas);
        }
      }
    })
  };

  loadAllData() {
    const laboratorios = this.#transferState.get(LABORATORIOS_KEY, null);
    const elementos = this.#transferState.get(ELEMENTOS_KEY, null);
    const amostras = this.#transferState.get(KEY_AMOSTRAS, null);
    const remessas = this.#transferState.get(REMESSAS_KEY, null);
    if (laboratorios && isPlatformBrowser(this.#platformId)) {
      this.laboratorios.set(laboratorios);
      this.#transferState.remove(LABORATORIOS_KEY);
    } else {
      this.loadLabs();
    }
    if (elementos && isPlatformBrowser(this.#platformId)) {
      this.elementos.set(elementos);
      this.#transferState.remove(ELEMENTOS_KEY);
    } else {
      this.loadElements();
    }
    if (amostras && isPlatformBrowser(this.#platformId)) {
      this.amostras.set(amostras);
      this.#transferState.remove(KEY_AMOSTRAS);
    } else {
      this.loadAmostras();
    }
    if (remessas && isPlatformBrowser(this.#platformId)) {
      this.remessas.set(remessas);
      this.remessasFiltradas.set(remessas);
      this.#transferState.remove(REMESSAS_KEY);
    } else {
      this.loadRemessas();
    }

    // Inicializa as remessas filtradas com todas as remessas
    this.remessasFiltradas.set([...this.remessas()]);
    // Define a última remessa (se houver)
    if (this.remessas.length > 0) {
      this.ultimaRemessa = this.remessas().at(-1) || null; // Assume que a primeira da lista é a mais recente
    }
  }

  tableSelect(table: number) {
    return this.selectTable.set(table)
  }

  // Filtrar remessas com base no termo de pesquisa
  filtrarRemessas(): void {
    if (!this.searchTerm) {
      this.remessasFiltradas.set([...this.remessas()]);
      return;
    }

    const term = this.searchTerm.toLowerCase();
    const filter = this.remessas().filter(
      (remessa) => {
        // Busca no ID, data ou laboratório
        return new Date(remessa.data).toLocaleDateString().toLowerCase().includes(term) ||
          this.getLaboratorioNome(remessa.destinoId).toLowerCase().includes(term) ||
          // Busca nas amostras
          remessa.amostras.some(amostra =>
            amostra.amostraName.toLowerCase().includes(term) ||
            (amostra.subIdentificacao && amostra.subIdentificacao.toLowerCase().includes(term))
          );
      }
    );
    this.remessasFiltradas.set(filter);
  }

  // Fechar formulário
  fecharFormulario(): void {
    this.#confirmModal.confirmWarning("Limpar", "Deseja limpar o formulário?").then((res) => {
      if (res) {
        this.resetarFormulario();
      }
    })
  }

  // Resetar formulário
  resetarFormulario(): void {
    this.novaRemessa = {
      id: '',
      data: new Date().toISOString().split('T')[0], // Data atual no formato YYYY-MM-DD
      destinoId: '',
      amostras: [],
    };
    this.amostraSelecionada = null;
    this.editando.set(false);
  }

  // Adicionar amostra à remessa
  adicionarAmostraRemessa(): void {
    if (!this.amostraSelecionada) return;
    const elementosSimbolos = this.getElementoSimbolo(this.amostraSelecionada.elementosAnalisados) || []
    // Cria uma nova amostra para a remessa
    const novaAmostraRemessa: AmostraRemessa = {
      amostraName: this.amostraSelecionada.amostraName,
      subIdentificacao: '',
      dataInicio: new Date().toISOString().split('T')[0],
      dataFim: new Date().toISOString().split('T')[0],
      elementosSolicitados: [...elementosSimbolos],
    };
    // Adiciona à lista de amostras da remessa
    this.novaRemessa.amostras.push(novaAmostraRemessa);
    // Limpa a seleção atual
    this.amostraSelecionada = null;
  }

  getElementoSimbolo(id: number[]): string[] {
    const elementos = this.elementos();
    const simbolos: string[] = []
    id.forEach(element => {
      const elemento = elementos.find(e => e.id === element)
      if (elemento) {
        simbolos.push(elemento.simbolo)
      }
    })
    return simbolos
  }

  // Remover amostra da remessa
  removerAmostraRemessa(index: number): void {
    const amostra = this.novaRemessa.amostras[index];
    this.#confirmModal.confirmWarning("Remover", `Deseja remover (${amostra.amostraName + ' ' + (amostra.subIdentificacao ?? "")}) da remessa?`).then((res) => {
      if(res) {
        this.novaRemessa.amostras.splice(index, 1);
      }
    })
  }

  // Toggle elemento em uma amostra da remessa
  toggleElementoAmostra(amostraIndex: number, elementSimbol: string): void {
    const amostra = this.novaRemessa.amostras[amostraIndex];
    const index = amostra.elementosSolicitados.indexOf(elementSimbol);

    if (index === -1) {
      // Adicionar elemento
      amostra.elementosSolicitados.push(elementSimbol);
    } else {
      // Remover elemento
      amostra.elementosSolicitados.splice(index, 1);
    }
  }

  // Salvar Rascunho
  salvarRascunho() {
    if (!this.novaRemessa.destinoId || this.novaRemessa.amostras.length === 0) {
      return;
    }

    if (this.editando()) {
      // Atualizar remessa existente
      const index = this.remessas().findIndex(
        (r) => r.id === this.novaRemessa.id
      );
      if (index !== -1) {
        this.remessas()[index] = {...this.novaRemessa};
        alert(`Remessa ${this.novaRemessa.id} atualizada com sucesso!`);
      }
    } else {
      // Adicionar nova remessa
      const novaRemessa: Remessa = {
        data: this.novaRemessa.data,
        destinoId: this.novaRemessa.destinoId,
        amostras: [...this.novaRemessa.amostras.map(amostra => ({...amostra}))],
      };
      if (isPlatformBrowser(this.#platformId)) {
        window.localStorage.setItem('rascunhosRemessas', JSON.stringify(novaRemessa))
      }
      this.#toast.info(`Rascunho salvo com sucesso!`);
    }
  }

  // Salvar remessa
  salvarRemessa() {
    if (!this.novaRemessa.destinoId || this.novaRemessa.amostras.length === 0) {
      return;
    }
    // Adicionar nova remessa
    const novaRemessa: Remessa = {
      data: this.novaRemessa.data,
      destinoId: this.novaRemessa.destinoId,
      amostras: [...this.novaRemessa.amostras.map(amostra => ({...amostra}))],
    };
    this.#confirmModal.confirmInfo('Atenção!', 'Após salvo os dados não poderão ser alterados!').then((res) => {
      if (res) {
        this.#remessasLabExternosService.create(novaRemessa).subscribe((res) => {
          if (res) {
            this.#toast.success(`Remessa salva com sucesso!`);
            this.remessas.update((remessas) => [...remessas, res]);
            this.ultimaRemessa = res;
            this.resetarFormulario();
          }
        })
        this.filtrarRemessas();
        return;
      } else {
        this.salvarRascunho()
        this.#toast.info(`Os dados foram salvos no rascunho!`);
      }
    })
  }

  // Remover remessa
  removerRemessa(id: string): void {
    this.#confirmModal.confirmDelete('Deletar', 'Tem certeza que deseja remover esta remessa?').then((confirm) => {
      if (confirm) {
        this.#remessasLabExternosService.delete(id).subscribe((res) => {
          if (res) {
            const remessaIndex = this.remessas().findIndex(
              (remessa) => remessa.id === id
            );
            if (remessaIndex !== -1) {
              const remessaRemovida = this.remessas()[remessaIndex];
              this.remessas().splice(remessaIndex, 1);
              // Atualiza a última remessa se necessário
              if (this.ultimaRemessa && this.ultimaRemessa.id === id) {
                this.ultimaRemessa = this.remessas.length > 0 ? this.remessas()[0] : null;
              }
              this.filtrarRemessas();
              this.#toast.success(`Remessa ${remessaRemovida.id} removida com sucesso!`);
            }
          }
        })
      }
    })


  }

  // Copiar remessa
  copiarRemessa(remessa: Remessa): void {
    this.novaRemessa = {
      data: new Date().toISOString().split('T')[0], // Data atual
      destinoId: remessa.destinoId,
      amostras: remessa.amostras.map(amostra => ({
        ...amostra,
        dataInicio: new Date().toISOString().split('T')[0], // Data atual
        dataFim: new Date().toISOString().split('T')[0], // Data atual
      })),
    };
    this.editando.set(false);
    this.selectTable() !== 0 ? this.tableSelect(0) : null;
  }

  // Carregar última remessa
  carregarUltimaRemessa(): void {
    if (!this.ultimaRemessa) return;
    this.#confirmModal.confirmInfo("Copiar Remessa", "Os dados atuais não serão salvos!").then((res) => {
      if (res) {
        this.copiarRemessa(this.ultimaRemessa!);
      }
    })
  }

  // Carregar última remessa
  carregarRascunho(): void {
    if (isPlatformServer(this.#platformId)) return;
    const rascunho = window.localStorage.getItem('rascunhosRemessas')
    if (!rascunho) {
      this.#toast.info('Nenhum rascunho salvo!');
      return;
    }
    if (this.novaRemessa.amostras.length > 0) {
      this.#confirmModal.confirmInfo("Obter Rascunho", "Os dados atuais não serão sobrepostos!").then((res) => {
        if (res) {
          this.getRascunho(rascunho);
        }
      })
    } else {
      this.getRascunho(rascunho);
    }

  }

  getRascunho(rascunho: string) {
    const rascunhoRemessa = JSON.parse(rascunho) as Remessa;
    this.novaRemessa = {
      data: rascunhoRemessa.data,
      destinoId: rascunhoRemessa.destinoId,
      amostras: [...rascunhoRemessa.amostras.map(amostra => ({...amostra}))],
    };
    this.editando.set(false);
  }

  // Visualizar detalhes da remessa
  visualizarRemessa(remessa: Remessa): void {
    this.remessaVisualizada = {...remessa};

    // Precisamos usar setTimeout para garantir que o ViewChild esteja disponível
    // após a detecção de mudanças, especialmente importante com SSR
    setTimeout(() => {
      // Usando a API nativa do elemento dialog
      if (this.remessaDialog?.nativeElement) {
        if (!this.remessaDialog.nativeElement.open) {
          this.remessaDialog.nativeElement.showModal();
        }
      }
    });
  }

  // Fechar detalhes da remessa
  fecharDetalhesRemessa(): void {
    if (this.remessaDialog?.nativeElement) {
      this.remessaDialog.nativeElement.close();
      // Limpar a remessa visualizada após fechar o diálogo
      setTimeout(() => {
        this.remessaVisualizada = null;
      }, 100); // Um pequeno delay para garantir animação suave
    }
  }

  // Obter nome do laboratório pelo ID
  getLaboratorioNome(id: string): string {
    const lab = this.laboratorios().find(l => l.id === id);
    return lab ? lab.nome : 'Desconhecido';
  }

  // Listar amostras da remessa em formato texto curto
  listarAmostras(remessa: Remessa): string {
    return remessa.amostras
      .map(a => a.amostraName + (a.subIdentificacao ? ` (${a.subIdentificacao})` : ''))
      .join(', ');
  }

  // Gera um ID aleatório de 3 dígitos (simulando um ID de banco de dados)
  private gerarIdAleatorio(): string {
    const numero = Math.floor(Math.random() * 900) + 100; // Gera número entre 100 e 999
    return numero.toString().padStart(3, '0');
  }


  handleDialogClick(event: MouseEvent) {
    // Verifica se o clique foi no backdrop e não no conteúdo
    if (event.target === this.remessaDialog.nativeElement) {
      this.fecharDetalhesRemessa();
    }
  }

  imprimirParcial() {
    if (this.novaRemessa.destinoId && this.novaRemessa.amostras.length > 0) {
      this.imprimirEtiquetas(this.novaRemessa);
    }
  }

  imprimirEtiquetas(remessa: Remessa) {
    if (!remessa) return;
    const destino = this.laboratorios().find(l => l.id == remessa.destinoId);
    if (!destino) return;
    remessa.destino = destino;
    try {
      this.etiquetasService.prepararParaImpressaoBrowser(remessa)
    } catch (err) {
      console.log(err)

    }
  }

  imprimirRelacao() {
    const remessa = this.novaRemessa;
    if (remessa.amostras.length == 0) return;
    const destino = this.laboratorios().find(l => l.id == this.novaRemessa.destinoId);
    if (!destino) return;
    remessa.destino = destino;
    const elementosquimicos = this.elementos()
    try {
      this.etiquetasService.imprimirTabelaAnalisesBrowser(this.novaRemessa, elementosquimicos)
    } catch (err) {
      console.log(err)

    }
  }
}
