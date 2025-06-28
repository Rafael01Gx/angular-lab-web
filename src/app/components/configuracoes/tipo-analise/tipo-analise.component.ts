import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { 
  heroPencil, 
  heroTrash, 
  heroChevronLeft, 
  heroChevronRight,
  heroPlus,
  heroMagnifyingGlass
} from '@ng-icons/heroicons/outline';

export interface TipoAnalise {
  id: number;
  tipo: string;
  classe: string;
}

export interface ClasseItem {
  value: string;
  label: string;
}

@Component({
  selector: 'app-tipo-analise',
  imports: [CommonModule, FormsModule, NgIconComponent],
  templateUrl: './tipo-analise.component.html',
viewProviders: [
    provideIcons({ 
      heroPencil,
      heroTrash,
      heroChevronLeft,
      heroChevronRight,
      heroPlus,
      heroMagnifyingGlass 
    })
  ],

})
export class TipoAnaliseComponent implements OnInit {
  // Dados mock
  classe_itens: ClasseItem[] = [
    { value: 'microbiologica', label: 'Microbiológica' },
    { value: 'fisico-quimica', label: 'Físico-Química' },
    { value: 'sensorial', label: 'Sensorial' },
    { value: 'nutricional', label: 'Nutricional' },
    { value: 'contaminantes', label: 'Contaminantes' },
    { value: 'aditivos', label: 'Aditivos' },
    { value: 'pesticidas', label: 'Pesticidas' },
    { value: 'toxicologica', label: 'Toxicológica' }
  ];

  tiposAnalise: TipoAnalise[] = [
    { id: 1, tipo: 'Análise de Coliformes', classe: 'microbiologica' },
    { id: 2, tipo: 'Teste de pH', classe: 'fisico-quimica' },
    { id: 3, tipo: 'Avaliação de Cor', classe: 'sensorial' },
    { id: 4, tipo: 'Análise de Proteínas', classe: 'nutricional' },
    { id: 5, tipo: 'Detecção de Metais Pesados', classe: 'contaminantes' },
    { id: 6, tipo: 'Análise de Conservantes', classe: 'aditivos' },
    { id: 7, tipo: 'Resíduos de Agrotóxicos', classe: 'pesticidas' },
    { id: 8, tipo: 'Teste de Mutagenicidade', classe: 'toxicologica' },
    { id: 9, tipo: 'Contagem de Leveduras', classe: 'microbiologica' },
    { id: 10, tipo: 'Análise de Umidade', classe: 'fisico-quimica' },
    { id: 11, tipo: 'Teste de Sabor', classe: 'sensorial' },
    { id: 12, tipo: 'Análise de Vitaminas', classe: 'nutricional' }
  ];

  // Formulário
  novoItem: Partial<TipoAnalise> = { tipo: '', classe: '' };
  editingItem: TipoAnalise | null = null;

  // Paginação
  paginaAtual = 1;
  itensPorPagina = 5;
  
  // Propriedades calculadas
  get totalPaginas(): number {
    return Math.ceil(this.tiposAnalise.length / this.itensPorPagina);
  }

  get itensPaginados(): TipoAnalise[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    return this.tiposAnalise.slice(inicio, fim);
  }

  // Utilitário Math para template
  Math = Math;

  ngOnInit(): void {
    // Componente inicializado
  }

  salvarItem(): void {
    if (!this.novoItem.tipo || !this.novoItem.classe) {
      return;
    }

    if (this.editingItem) {
      // Editar item existente
      const index = this.tiposAnalise.findIndex(item => item.id === this.editingItem!.id);
      if (index !== -1) {
        this.tiposAnalise[index] = {
          ...this.editingItem,
          tipo: this.novoItem.tipo,
          classe: this.novoItem.classe
        };
      }
      this.editingItem = null;
    } else {
      // Criar novo item
      const novoId = Math.max(...this.tiposAnalise.map(item => item.id), 0) + 1;
      this.tiposAnalise.push({
        id: novoId,
        tipo: this.novoItem.tipo,
        classe: this.novoItem.classe
      });
    }

    // Limpar formulário
    this.novoItem = { tipo: '', classe: '' };
    
    // Ajustar paginação se necessário
    if (this.paginaAtual > this.totalPaginas && this.totalPaginas > 0) {
      this.paginaAtual = this.totalPaginas;
    }
  }

  editarItem(item: TipoAnalise): void {
    this.editingItem = item;
    this.novoItem = { tipo: item.tipo, classe: item.classe };
  }

  cancelarEdicao(): void {
    this.editingItem = null;
    this.novoItem = { tipo: '', classe: '' };
  }

  excluirItem(id: number): void {
    if (confirm('Tem certeza que deseja excluir este item?')) {
      this.tiposAnalise = this.tiposAnalise.filter(item => item.id !== id);
      
      // Ajustar paginação se necessário
      if (this.paginaAtual > this.totalPaginas && this.totalPaginas > 0) {
        this.paginaAtual = this.totalPaginas;
      }
    }
  }

  getClasseLabel(value: string): string {
    const classe = this.classe_itens.find(item => item.value === value);
    return classe ? classe.label : value;
  }

  paginaAnterior(): void {
    if (this.paginaAtual > 1) {
      this.paginaAtual--;
    }
  }

  proximaPagina(): void {
    if (this.paginaAtual < this.totalPaginas) {
      this.paginaAtual++;
    }
  }
}