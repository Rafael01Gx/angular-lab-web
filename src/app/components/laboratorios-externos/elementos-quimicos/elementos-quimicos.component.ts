import {CommonModule, isPlatformBrowser, isPlatformServer, TitleCasePipe} from '@angular/common';
import {Component, inject, makeStateKey, OnInit, PLATFORM_ID, signal, TransferState} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ElementoQuimico} from '../../../shared/interfaces/laboratorios-externos.interfaces';
import {ElementoQuimicoLabExternosService} from '../../../services/elemento-quimico-lab-externos.service';
import {ToastrService} from '../../layout/toastr/toastr.service';
import {ConfirmationModalService} from '../../../services/confirmation-modal.service';

const ELEMENT_KEY = makeStateKey<ElementoQuimico[]>('elementosQuimicosComponent');

@Component({
  selector: 'app-elementos-quimicos',
  imports: [CommonModule, FormsModule],
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


  // Novo elemento para cadastro
  novoElemento: ElementoQuimico = {
    id: undefined,
    elementName: '',
    simbolo: ''
  };

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
    if (!this.novoElemento.elementName || !this.novoElemento.simbolo) return;
    const novoElemento = {
      elementName: this.novoElemento.elementName,
      simbolo: this.novoElemento.simbolo
    };

    this.#elementService.create(novoElemento).subscribe(result => {
      if (result) {
        this.elementos.update(value => [...value, result]);
        this.#toast.success('Elemento salvo com sucesso!')
      }
      this.filtrarElementos();
    })


    this.novoElemento = {
      id: undefined,
      elementName: '',
      simbolo: ''
    };
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
