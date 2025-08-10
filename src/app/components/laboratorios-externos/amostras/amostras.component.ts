import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {Amostra, ElementoQuimico} from '../../../shared/interfaces/laboratorios-externos.interfaces';

@Component({
  selector: 'app-amostras',
  imports: [CommonModule, FormsModule],
  templateUrl: './amostras.component.html',
})
export class AmostrasComponent implements OnInit {
  // Lista de elementos químicos (simulando dados do banco)
  elementos: ElementoQuimico[] = [
    { id: 'a1b2c3d4e5f6g7h8i9j0', element_name: 'H' },
    { id: 'k9l8m7n6o5p4q3r2s1t0', element_name: 'He' },
    { id: 'z9y8x7w6v5u4t3s2r1q0', element_name: 'Li' },
    { id: 'm1n2b3v4c5x6z7a8s9d0', element_name: 'Be' },
    { id: 'f1g2h3j4k5l6q7w8e9r0', element_name: 'B' },
    { id: 'u9i8o7p6a5s4d3f2g1h0', element_name: 'C' },
    { id: 'j1k2l3z4x5c6v7b8n9m0', element_name: 'N' },
    { id: 'p9o8i7u6y5t4r3e2w1q0', element_name: 'O' },
    { id: 'l1k2j3h4g5f6d7s8a9z0', element_name: 'F' },
    { id: 'x9c8v7b6n5m4l3k2j1h0', element_name: 'Ne' },
    { id: 'w1e2r3t4y5u6i7o8p9a0', element_name: 'Na' },
    { id: 's9d8f7g6h5j4k3l2z1x0', element_name: 'Mg' },
    { id: 'q1w2e3r4t5y6u7i8o9p0', element_name: 'Al' },
    { id: 'n9m8b7v6c5x4z3a2s1d0', element_name: 'Si' },
    { id: 'v1b2n3m4l5k6j7h8g9f0', element_name: 'K' },
  ];

  // Lista de amostras (simulando dados do banco)
  amostras: Amostra[] = [
    {
      id: 'a0b1c2d3e4f5g6h7i8j9',
      amostra_name: 'Antracito',
      elementos_analisados: ['H', 'Si', 'Fe', 'O'],
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

  // Amostras filtradas (usado na tabela)
  amostrasFiltradas: Amostra[] = [];

  // Nova amostra para cadastro
  novaAmostra: Amostra = {
    id: '',
    amostra_name: '',
    elementos_analisados: [],
  };

  // Termo de pesquisa
  searchTerm: string = '';

  // Controle de exibição do formulário
  formularioVisivel: boolean = false;

  // Flag para saber se está editando ou adicionando
  editando: boolean = false;

  ngOnInit(): void {
    // Inicializa as amostras filtradas com todas as amostras
    this.amostrasFiltradas = [...this.amostras];
  }

  // Filtrar amostras com base no termo de pesquisa
  filtrarAmostras(): void {
    if (!this.searchTerm) {
      this.amostrasFiltradas = [...this.amostras];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.amostrasFiltradas = this.amostras.filter(
      (amostra) =>
        amostra.amostra_name.toLowerCase().includes(term) ||
        amostra.id.toLowerCase().includes(term)
    );
  }

  // Adicionar/atualizar amostra
  adicionarAmostra(): void {
    if (
      !this.novaAmostra.amostra_name ||
      this.novaAmostra.elementos_analisados.length === 0
    )
      return;

    if (this.editando) {
      // Atualizar amostra existente
      const index = this.amostras.findIndex(
        (a) => a.id === this.novaAmostra.id
      );
      if (index !== -1) {
        this.amostras[index] = { ...this.novaAmostra };
        alert(
          `Amostra ${this.novaAmostra.amostra_name} atualizada com sucesso!`
        );
      }
    } else {
      // Adicionar nova amostra
      const novoId = this.gerarIdAleatorio();
      const novaAmostra: Amostra = {
        id: novoId,
        amostra_name: this.novaAmostra.amostra_name.trim(),
        elementos_analisados: [...this.novaAmostra.elementos_analisados],
      };

      this.amostras.unshift(novaAmostra);
      alert(`Amostra ${novaAmostra.amostra_name} adicionada com sucesso!`);
    }

    this.filtrarAmostras();
    this.resetarFormulario();
    this.fecharFormulario();
  }

  // Remover amostra
  removerAmostra(id: string): void {
    if (confirm('Tem certeza que deseja remover esta amostra?')) {
      const amostraIndex = this.amostras.findIndex(
        (amostra) => amostra.id === id
      );
      if (amostraIndex !== -1) {
        const amostraRemovida = this.amostras[amostraIndex];
        this.amostras.splice(amostraIndex, 1);
        this.filtrarAmostras();
        alert(`Amostra ${amostraRemovida.amostra_name} removida com sucesso!`);
      }
    }
  }

  // Copiar amostra para edição
  copiarAmostra(amostra: Amostra): void {
    this.novaAmostra = {
      id: this.gerarIdAleatorio(), // Gera um novo ID para a cópia
      amostra_name: `Cópia de ${amostra.amostra_name}`,
      elementos_analisados: [...amostra.elementos_analisados],
    };

    this.editando = false; // É uma nova amostra, não uma edição
    this.formularioVisivel = true;
  }

  // Toggle elemento na seleção
  toggleElemento(elementName: string): void {
    const index = this.novaAmostra.elementos_analisados.indexOf(elementName);
    if (index === -1) {
      // Adicionar elemento
      this.novaAmostra.elementos_analisados.push(elementName);
    } else {
      // Remover elemento
      this.novaAmostra.elementos_analisados.splice(index, 1);
    }
  }

  // Abrir formulário para nova amostra
  abrirFormulario(): void {
    this.resetarFormulario();
    this.formularioVisivel = true;
    this.editando = false;
  }

  // Fechar formulário
  fecharFormulario(): void {
    this.formularioVisivel = false;
    this.resetarFormulario();
  }

  // Resetar formulário
  resetarFormulario(): void {
    this.novaAmostra = {
      id: '',
      amostra_name: '',
      elementos_analisados: [],
    };
    this.editando = false;
  }

  // Gera um ID aleatório de 20 caracteres (simulando um ID de banco de dados)
  private gerarIdAleatorio(): string {
    const caracteres = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let resultado = '';
    for (let i = 0; i < 20; i++) {
      resultado += caracteres.charAt(
        Math.floor(Math.random() * caracteres.length)
      );
    }
    return resultado;
  }
}
