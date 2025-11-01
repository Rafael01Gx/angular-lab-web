import { CommonModule, isPlatformBrowser, isPlatformServer, TitleCasePipe } from '@angular/common';
import { Component, inject, makeStateKey, OnInit, PLATFORM_ID, signal, TransferState } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ElementoQuimico } from '../../../shared/interfaces/laboratorios-externos.interfaces';
import { ElementoQuimicoLabExternosService } from '../../../services/elemento-quimico-lab-externos.service';
import { ToastrService } from '../../../services/toastr.service';
import { ConfirmationModalService } from '../../../services/confirmation-modal.service';
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  heroPencilSquare,
  heroTrash,
  heroPlus,
  heroCheck,
  heroXMark,
  heroMagnifyingGlass
} from "@ng-icons/heroicons/outline"

const ELEMENT_KEY = makeStateKey<ElementoQuimico[]>('elementosQuimicosComponent');

@Component({
  selector: 'app-elementos-quimicos',
  imports: [CommonModule, FormsModule, NgIcon],
  viewProviders: [provideIcons({
    heroPencilSquare,
    heroTrash,
    heroPlus,
    heroCheck,
    heroXMark,
    heroMagnifyingGlass
  })],
  templateUrl: './elementos-quimicos.component.html',
})
export class ElementosQuimicosComponent implements OnInit {
  #elementService = inject(ElementoQuimicoLabExternosService);
  #confirmationModalService = inject(ConfirmationModalService);
  #toast = inject(ToastrService);
  #transferState = inject(TransferState);
  #platformId = inject(PLATFORM_ID);
  elementos = signal<ElementoQuimico[]>([]);
  elementosFiltrados = signal<ElementoQuimico[]>([]);
  searchTerm: string = '';
  edicao = signal<boolean>(false);


  // Novo elemento para cadastro
  elemento= signal <ElementoQuimico>( {
    id: undefined,
    elementName: '',
    simbolo: ''
  });

  ngOnInit(): void {
    const elements = this.#transferState.get(ELEMENT_KEY, [])
    if (elements.length > 0 && isPlatformBrowser(this.#platformId)) {
      this.elementos.set(elements)
      this.#transferState.remove(ELEMENT_KEY)
      return;
    }
    this.loadElements()

  }

  // Filtra os elementos com base no termo de pesquisa
  filtrarElementos(): void {
    if (!this.searchTerm) {
      this.elementosFiltrados.set(this.elementos());
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.elementosFiltrados.update(value => this.elementos().filter(elemento =>
      elemento.elementName.toLowerCase().includes(term) ||
      elemento.simbolo.toLowerCase().includes(term)
    ))
  }

  loadElements() {
    this.#elementService.findAll().subscribe(elementos => {
      if (elementos) {
        this.elementos.set(elementos)
        this.filtrarElementos();
        if (isPlatformServer(this.#platformId)) {
          this.#transferState.set(ELEMENT_KEY, elementos)
        }
      }
    })
  }


  adicionarElemento(): void {
    if (!this.elemento().elementName || !this.elemento().simbolo) return;

    if (this.edicao() && this.elemento().id) {
      const id = this.elemento().id!
      this.#elementService.update(id, this.elemento()).subscribe({
        next: (result) => {
          if (result) {
            const elm = this.elementos().filter((e)=> e.id !== result.id)
            this.elementos.update(value => [...elm, result]);
            this.elementosFiltrados.update(value => [...elm, result]);
            this.#toast.success('Elemento atualizado sucesso!')

          }
        }
      })
    } else {
      const novoElemento = {
        elementName: this.elemento().elementName,
        simbolo: this.elemento().simbolo
      };
      this.#elementService.create(novoElemento).subscribe({
        next:(result) => {
        if (result) {
            this.elementos.update(value => [...value, result]);
            this.elementosFiltrados.update(value => [...value, result]);
          this.#toast.success('Elemento salvo com sucesso!')
        }

      }
      })
    }
    this.filtrarElementos();
    this.elemento.set({
      id: undefined,
      elementName: '',
      simbolo: ''
    });
  }

  editarElemento(el: ElementoQuimico) {
    if (!el) return;
    this.edicao.set(true);
     this.elemento.set({
      id: el.id,
      elementName: el.elementName,
      simbolo: el.simbolo
    });
  }
  calcelarEdicao(){
    this.edicao.set(false);
     this.elemento.set({
      id: undefined,
      elementName: "",
      simbolo: ""
    });
  }

  removerElemento(id: number, name: string): void {
    this.#confirmationModalService.confirmDelete('Remover Elemento', 'Tem certeza que deseja remover este elemento?').then((res) => {
      if (res) {
        this.#elementService.delete(id).subscribe(result => {
          if (result) {
            this.elementos.update(value => value.filter((el) => el.id !== id))
            this.filtrarElementos();
            this.#toast.success(`Elemento ${name} removido com sucesso!`);
          }
        }
        )
          ;
      }
    }
    )
  }

}
