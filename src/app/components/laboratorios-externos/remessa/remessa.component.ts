import {CommonModule} from '@angular/common';
import {Component, ElementRef, inject, OnInit, signal, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {EtiquetasService} from '../../../services/impressao-de-etiquetas.service';
import {
  Amostra, AmostraRemessa,
  ElementoQuimico,
  Laboratorio,
  Remessa
} from '../../../shared/interfaces/laboratorios-externos.interfaces';
import {ConfirmationModalService} from '../../../services/confirmation-modal.service';
import {ToastrService} from '../../layout/toastr/toastr.service';
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
  // Lista de elementos químicos (simulando dados do banco)
  elementos: ElementoQuimico[] = [
    {id: 'a1b2c3d4e5f6g7h8i9j0', element_name: 'H'},
    {id: 'k9l8m7n6o5p4q3r2s1t0', element_name: 'He'},
    {id: 'z9y8x7w6v5u4t3s2r1q0', element_name: 'Li'},
    {id: 'm1n2b3v4c5x6z7a8s9d0', element_name: 'Be'},
    {id: 'f1g2h3j4k5l6q7w8e9r0', element_name: 'B'},
    {id: 'u9i8o7p6a5s4d3f2g1h0', element_name: 'C'},
    {id: 'j1k2l3z4x5c6v7b8n9m0', element_name: 'N'},
    {id: 'p9o8i7u6y5t4r3e2w1q0', element_name: 'O'},
    {id: 'l1k2j3h4g5f6d7s8a9z0', element_name: 'F'},
    {id: 'x9c8v7b6n5m4l3k2j1h0', element_name: 'Ne'},
    {id: 'w1e2r3t4y5u6i7o8p9a0', element_name: 'Na'},
    {id: 's9d8f7g6h5j4k3l2z1x0', element_name: 'Mg'},
    {id: 'q1w2e3r4t5y6u7i8o9p0', element_name: 'Al'},
    {id: 'n9m8b7v6c5x4z3a2s1d0', element_name: 'Si'},
    {id: 'v1b2n3m4l5k6j7h8g9f0', element_name: 'K'},
  ];

  // Lista de amostras (simulando dados do banco)
  amostras: Amostra[] = [
    {
      id: 'a0b1c2d3e4f5g6h7i8j9',
      amostra_name: 'Antracito',
      elementos_analisados: ['H', 'Si', 'O'],
    },
    {
      id: 'j9i8h7g6f5e4d3c2b1a0',
      amostra_name: 'Calcário',
      elementos_analisados: ['Ca', 'C', 'O'],
    },
    {
      id: 'z0x9c8v7b6n5m4l3k2j1',
      amostra_name: 'Argila',
      elementos_analisados: ['Al', 'Si', 'O', 'H'],
    },
    {
      id: 'p0o9i8u7y6t5r4e3w2q1',
      amostra_name: 'Granito',
      elementos_analisados: ['Si', 'Al', 'K', 'Na', 'O'],
    },
  ];

  // Lista de laboratórios (simulando dados do banco)
  laboratorios: Laboratorio[] = [
    {id: 'lab001', nome: 'Laboratório Central de Análises'},
    {id: 'lab002', nome: 'Laboratório Geo-Química'},
    {id: 'lab003', nome: 'Instituto de Análises Minerais'},
    {id: 'lab004', nome: 'Centro de Pesquisas Avançadas'},
  ];

  // Lista de remessas (simulando dados do banco)
  remessas: Remessa[] = [
    {
      id: 'rem001',
      data: '2025-05-10',
      destino: 'lab001',
      amostras: [
        {
          id: 'a0b1c2d3e4f5g6h7i8j9',
          amostra_name: 'Antracito',
          sub_identificacao: 'Lote 01',
          periodo: {
            inicio: '2025-05-01',
            fim: '2025-05-05',
          },
          elementos_analisados: ['H', 'Si', 'O'],
        },
        {
          id: 'z0x9c8v7b6n5m4l3k2j1',
          amostra_name: 'Argila',
          sub_identificacao: 'Amostra A',
          periodo: {
            inicio: '2025-05-01',
            fim: '2025-05-07',
          },
          elementos_analisados: ['Al', 'Si', 'O', 'H'],
        },
      ],
    },
    {
      id: 'rem002',
      data: '2025-05-12',
      destino: 'lab003',
      amostras: [
        {
          id: 'p0o9i8u7y6t5r4e3w2q1',
          amostra_name: 'Granito',
          sub_identificacao: 'Tipo A',
          periodo: {
            inicio: '2025-05-05',
            fim: '2025-05-10',
          },
          elementos_analisados: ['Si', 'Al', 'K', 'Na'],
        },
      ],
    },

  ];

  // Remessas filtradas (usado na tabela)
  remessasFiltradas: Remessa[] = [];

  // Nova remessa para cadastro
  novaRemessa: Remessa = {
    id: '',
    data: new Date().toISOString().split('T')[0],
    destino: '',
    amostras: [],
  };

  // Amostra selecionada para adicionar à remessa
  amostraSelecionada: Amostra | null = null;

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
        return remessa.id.toLowerCase().includes(term) ||
          new Date(remessa.data).toLocaleDateString().toLowerCase().includes(term) ||
          this.getLaboratorioNome(remessa.destino).toLowerCase().includes(term) ||
          // Busca nas amostras
          remessa.amostras.some(amostra =>
            amostra.amostra_name.toLowerCase().includes(term) ||
            (amostra.sub_identificacao && amostra.sub_identificacao.toLowerCase().includes(term))
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
      destino: '',
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
      id: this.amostraSelecionada.id,
      amostra_name: this.amostraSelecionada.amostra_name,
      sub_identificacao: '',
      periodo: {
        inicio: new Date().toISOString().split('T')[0], // Data atual como início
        fim: new Date().toISOString().split('T')[0], // Data atual como fim
      },
      elementos_analisados: [...this.amostraSelecionada.elementos_analisados],
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
  toggleElementoAmostra(amostraIndex: number, elementName: string): void {
    const amostra = this.novaRemessa.amostras[amostraIndex];
    const index = amostra.elementos_analisados.indexOf(elementName);

    if (index === -1) {
      // Adicionar elemento
      amostra.elementos_analisados.push(elementName);
    } else {
      // Remover elemento
      amostra.elementos_analisados.splice(index, 1);
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
      const novoId = `rem${this.gerarIdAleatorio()}`;
      const novaRemessa: Remessa = {
        id: novoId,
        data: this.novaRemessa.data,
        destino: this.novaRemessa.destino,
        amostras: [...this.novaRemessa.amostras.map(amostra => ({...amostra}))],
      };

      this.remessas.unshift(novaRemessa);
      this.ultimaRemessa = novaRemessa;
      alert(`Remessa ${novoId} adicionada com sucesso!`);
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
      id: '',
      data: new Date().toISOString().split('T')[0], // Data atual
      destino: remessa.destino,
      amostras: remessa.amostras.map(amostra => ({
        ...amostra,
        periodo: {
          inicio: new Date().toISOString().split('T')[0], // Data atual
          fim: new Date().toISOString().split('T')[0], // Data atual
        }
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
      .map(a => a.amostra_name + (a.sub_identificacao ? ` (${a.sub_identificacao})` : ''))
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
    try {
      this.etiquetasService.prepararParaImpressaoBrowser(remessa)
    } catch (err) {
      console.log(err)

    }
  }
}
