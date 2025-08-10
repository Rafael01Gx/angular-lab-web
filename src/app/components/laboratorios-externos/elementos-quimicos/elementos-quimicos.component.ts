import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {ElementoQuimico} from '../../../shared/interfaces/laboratorios-externos.interfaces';

@Component({
  selector: 'app-elementos-quimicos',
  imports: [CommonModule, FormsModule],
  templateUrl: './elementos-quimicos.component.html',
})
export class ElementosQuimicosComponent implements OnInit {
  // Dados iniciais dos elementos químicos
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
    { id: 'v1b2n3m4l5k6j7h8g9f0', element_name: 'K' }
  ];

  // Novo elemento para cadastro
  novoElemento: ElementoQuimico = {
    id: '',
    element_name: ''
  };

  // Termo de pesquisa
  searchTerm: string = '';

  // Elementos filtrados (usado na tabela)
  elementosFiltrados: ElementoQuimico[] = [];

  ngOnInit(): void {
    // Inicializa os elementos filtrados com todos os elementos
    this.filtrarElementos();
  }

  // Filtra os elementos com base no termo de pesquisa
  filtrarElementos(): void {
    if (!this.searchTerm) {
      this.elementosFiltrados = [...this.elementos];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.elementosFiltrados = this.elementos.filter(elemento =>
      elemento.element_name.toLowerCase().includes(term) ||
      elemento.id.toLowerCase().includes(term)
    );
  }

  // Adiciona um novo elemento
  adicionarElemento(): void {
    if (!this.novoElemento.element_name) return;

    // Gera um ID aleatório (simulando um ID de banco de dados)
    const novoId = this.gerarIdAleatorio();

    // Adiciona o novo elemento à lista
    const novoElemento: ElementoQuimico = {
      id: novoId,
      element_name: this.novoElemento.element_name.trim()
    };

    this.elementos.unshift(novoElemento);
    this.filtrarElementos();

    // Limpa o formulário
    this.novoElemento = {
      id: '',
      element_name: ''
    };

    // Exibe um alerta de sucesso
    alert(`Elemento ${novoElemento.element_name} adicionado com sucesso!`);
  }

  // Remove um elemento
  removerElemento(id: string): void {
    if (confirm('Tem certeza que deseja remover este elemento?')) {
      const elementoIndex = this.elementos.findIndex(elemento => elemento.id === id);
      if (elementoIndex !== -1) {
        const elementoRemovido = this.elementos[elementoIndex];
        this.elementos.splice(elementoIndex, 1);
        this.filtrarElementos();
        alert(`Elemento ${elementoRemovido.element_name} removido com sucesso!`);
      }
    }
  }

  // Gera um ID aleatório de 20 caracteres (simulando um ID de banco de dados)
  private gerarIdAleatorio(): string {
    const caracteres = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let resultado = '';
    for (let i = 0; i < 20; i++) {
      resultado += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return resultado;
  }
}
