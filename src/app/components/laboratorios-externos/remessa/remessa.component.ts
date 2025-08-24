import {CommonModule} from '@angular/common';
import {Component, ElementRef, inject, OnInit, signal, ViewChild} from '@angular/core';
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
  heroEye,heroClipboardDocument,heroXMark
} from '@ng-icons/heroicons/outline'

@Component({
  selector: 'app-remessa',
  imports: [CommonModule, FormsModule, NgIcon],
  viewProviders: [provideIcons({
    heroPencilSquare, heroArrowPathRoundedSquare, heroXMark,heroCheck, heroMagnifyingGlass, heroTrash, heroPlus, heroEye,heroClipboardDocument
  })],
  templateUrl: './remessa.component.html',
})
export class RemessaComponent implements OnInit {
  #confirmModal = inject(ConfirmationModalService);
  #toast = inject(ToastrService);
  etiquetasService = inject(EtiquetasService);
  selectTable = signal<number>(0)

  elementos: ElementoQuimico[] = [];
  amostras: AmostraLabExterno[] = [];
  laboratorios: Laboratorio[] = [];

  remessas: Remessa[] = [];
  remessasFiltradas: Remessa[] = [];

  novaRemessa: Remessa = {
    id: '',
    data: new Date().toISOString().split('T')[0],
    destinoId:'',
    amostras: [],
  };

  // Amostra selecionada para adicionar à remessa
  amostraSelecionada: AmostraLabExterno | null = null;

  // Termo de pesquisa
  searchTerm: string = '';

  // Flag para saber se está editando ou adicionando
  editando: boolean = false;

  // Referência para a última remessa cadastrada
  ultimaRemessa: Remessa | null = null;

  // Remessa sendo visualizada nos detalhes
  remessaVisualizada: Remessa | null = null;

  ngOnInit(): void {
    // Inicializa as remessas filtradas com todas as remessas
    this.remessasFiltradas = [...this.remessas];

    // Define a última remessa (se houver)
    if (this.remessas.length > 0) {
      this.ultimaRemessa = this.remessas[0]; // Assume que a primeira da lista é a mais recente
    }
  }

  tableSelect(table: number) {
    return this.selectTable.set(table)
  }

  // Filtrar remessas com base no termo de pesquisa
  filtrarRemessas(): void {
    if (!this.searchTerm) {
      this.remessasFiltradas = [...this.remessas];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.remessasFiltradas = this.remessas.filter(
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
    this.editando = false;
  }

  // Adicionar amostra à remessa
  adicionarAmostraRemessa(): void {
    if (!this.amostraSelecionada) return;

    // Cria uma nova amostra para a remessa
    const novaAmostraRemessa: AmostraRemessa = {
      amostraName: this.amostraSelecionada.amostraName,
      subIdentificacao: '',
      dataInicio: new Date().toISOString().split('T')[0],
      dataFim: new Date().toISOString().split('T')[0],
      elementosSolicitados: [...this.amostraSelecionada.elementosAnalisados],
    };
    // Adiciona à lista de amostras da remessa
    this.novaRemessa.amostras.push(novaAmostraRemessa);
    // Limpa a seleção atual
    this.amostraSelecionada = null;
  }

  // Remover amostra da remessa
  removerAmostraRemessa(index: number): void {
    this.novaRemessa.amostras.splice(index, 1);
  }

  // Toggle elemento em uma amostra da remessa
  toggleElementoAmostra(amostraIndex: number, elementId: number): void {
    const amostra = this.novaRemessa.amostras[amostraIndex];
    const index = amostra.elementosSolicitados.indexOf(elementId);

    if (index === -1) {
      // Adicionar elemento
      amostra.elementosSolicitados.push(elementId);
    } else {
      // Remover elemento
      amostra.elementosSolicitados.splice(index, 1);
    }
  }

  // Salvar remessa
  salvarRemessa(): void {
    if (!this.novaRemessa.destino || this.novaRemessa.amostras.length === 0) {
      return;
    }

    if (this.editando) {
      // Atualizar remessa existente
      const index = this.remessas.findIndex(
        (r) => r.id === this.novaRemessa.id
      );
      if (index !== -1) {
        this.remessas[index] = {...this.novaRemessa};
        alert(`Remessa ${this.novaRemessa.id} atualizada com sucesso!`);
      }
    } else {
      // Adicionar nova remessa
      const novaRemessa: Remessa = {
        data: this.novaRemessa.data,
        destinoId: this.novaRemessa.destinoId,
        amostras: [...this.novaRemessa.amostras.map(amostra => ({...amostra}))],
      };

      this.remessas.unshift(novaRemessa);
      this.ultimaRemessa = novaRemessa;
    }

    this.filtrarRemessas();
    this.fecharFormulario();
  }

  // Remover remessa
  removerRemessa(id: string): void {
    this.#confirmModal.confirmDelete('', 'Tem certeza que deseja remover esta remessa?').then((res) => {
      if (res) {
        const remessaIndex = this.remessas.findIndex(
          (remessa) => remessa.id === id
        );
        if (remessaIndex !== -1) {
          const remessaRemovida = this.remessas[remessaIndex];
          this.remessas.splice(remessaIndex, 1);

          // Atualiza a última remessa se necessário
          if (this.ultimaRemessa && this.ultimaRemessa.id === id) {
            this.ultimaRemessa = this.remessas.length > 0 ? this.remessas[0] : null;
          }

          this.filtrarRemessas();
          this.#toast.success(`Remessa ${remessaRemovida.id} removida com sucesso!`);
        }
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
    this.editando = false;
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
    const lab = this.laboratorios.find(l => l.id === id);
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

  @ViewChild('remessaDialog') remessaDialog!: ElementRef<HTMLDialogElement>;

  // Manipular clique no backdrop (opcional)
  handleDialogClick(event: MouseEvent) {
    // Verifica se o clique foi no backdrop e não no conteúdo
    if (event.target === this.remessaDialog.nativeElement) {
      this.fecharDetalhesRemessa();
    }
  }

  imprimirEtiquetas(remessa: Remessa) {
    if(!remessa)return;
    try {
      this.etiquetasService.prepararParaImpressaoBrowser(remessa)
    } catch (err) {
      console.log(err)

    }
  }
}
