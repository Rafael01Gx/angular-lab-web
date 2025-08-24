import {CommonModule, isPlatformBrowser, isPlatformServer} from '@angular/common';
import {Component, effect, inject, makeStateKey, OnInit, PLATFORM_ID, signal, TransferState} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {AmostraLabExterno, ElementoQuimico} from '../../../shared/interfaces/laboratorios-externos.interfaces';
import {NgIcon, provideIcons} from '@ng-icons/core';
import {heroClipboardDocument, heroPlus, heroTrash, heroXMark} from '@ng-icons/heroicons/outline'
import {ElementoQuimicoLabExternosService} from '../../../services/elemento-quimico-lab-externos.service';
import {ConfirmationModalService} from '../../../services/confirmation-modal.service';
import {ToastrService} from '../../../services/toastr.service';
import {AmostrasLabExternos} from '../../../services/amostras-lab-externos.service';
import {map} from 'rxjs';

const ELEMENT_KEY = makeStateKey<ElementoQuimico[]>('elementosAmostrasComponent');
const AMOSTRAS_KEY = makeStateKey<AmostraLabExterno[]>('amostrasAmostrasComponent');


@Component({
  selector: 'app-amostras',
  imports: [CommonModule, FormsModule, NgIcon],
  viewProviders: [provideIcons({heroClipboardDocument, heroTrash, heroXMark, heroPlus})],
  templateUrl: './amostras.component.html',
})
export class AmostrasComponent implements OnInit {
  #elementService = inject(ElementoQuimicoLabExternosService);
  #amostrasLabExternos = inject(AmostrasLabExternos);
  #confirmationModalService = inject(ConfirmationModalService);
  #toast = inject(ToastrService);
  #transferState = inject(TransferState);
  #platformId = inject(PLATFORM_ID);

  elementos = signal<ElementoQuimico[]>([])
  amostras = signal<AmostraLabExterno[]>([])
  formularioVisivel = signal<boolean>(false);
  amostrasFiltradas = signal<AmostraLabExterno[]>([])
  editando = signal<boolean>(false);

  // Nova amostra para cadastro
  novaAmostra: AmostraLabExterno = {
    id: undefined,
    amostraName: '',
    elementosAnalisados: [],
  };

  searchTerm: string = '';

  constructor() {
    effect(() => {
      console.log(this.amostrasFiltradas())
      console.log(this.amostras())
    });
  }

  ngOnInit(): void {
    const elements = this.#transferState.get(ELEMENT_KEY, null);
    const amostras = this.#transferState.get(AMOSTRAS_KEY, null);

    if (elements && isPlatformBrowser(this.#platformId)) {
      this.elementos.set(elements)
      this.#transferState.remove(ELEMENT_KEY)
    } else {
      this.loadElements()
    }
    if (amostras && isPlatformBrowser(this.#platformId)) {
      this.amostras.set(amostras)
      this.amostrasFiltradas.set(amostras)
      this.#transferState.remove(AMOSTRAS_KEY)
    } else {
      this.loadAmostras()
    }
  }

  loadElements() {
    this.#elementService.findAll().subscribe(elementos => {
      if (elementos) {
        this.elementos.set(elementos)
        if (isPlatformServer(this.#platformId)) {
          this.#transferState.set(ELEMENT_KEY, elementos)
        }
      }
    })
  }

  loadAmostras() {
    this.#amostrasLabExternos.findAll().pipe(
      map(amostras =>
        amostras.map(amostra => ({
          ...amostra,
          elementosAnalisados: amostra.elementosAnalisados.map((element) => element.id )
        })) as AmostraLabExterno[]
      )
    ).subscribe((amostras) => {
      if (amostras) {
        this.amostras.set(amostras)
        this.amostrasFiltradas.set(amostras);
        if (isPlatformServer(this.#platformId)) {
          this.#transferState.set(AMOSTRAS_KEY, amostras)
        }
      }
    })
  }


  // Filtrar amostras com base no termo de pesquisa
  filtrarAmostras(): void {
    if (!this.searchTerm) {
      this.amostrasFiltradas.update(value => [...this.amostras()]);
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.amostrasFiltradas.update(value => this.amostras().filter(
      (amostra) =>
        amostra.amostraName.toLowerCase().includes(term)
    ))
  }

  adicionarAmostra(id?: number): void {
    if (
      !this.novaAmostra.amostraName ||
      this.novaAmostra.elementosAnalisados.length === 0
    )
      return;

    const novaAmostra: AmostraLabExterno = {
      amostraName: this.novaAmostra.amostraName,
      elementosAnalisados: [...this.novaAmostra.elementosAnalisados],
    };

    if (this.editando()) {
      if(!id) return;
      this.#amostrasLabExternos.update(id,novaAmostra).subscribe((res)=>{
        if(res){
            this.amostras.update((amostras)=>{
              const amostraIndex = amostras.findIndex(amostra => amostra.id === id)
              if(amostraIndex !== -1){
                amostras[amostraIndex] = {
                  id: id,
                  amostraName: novaAmostra.amostraName,
                  elementosAnalisados: novaAmostra.elementosAnalisados,
                };
              }
              return [...amostras]
            })
            this.#toast.success("Amostra atualizada com sucesso!")

        }
      })
    } else {
      this.#amostrasLabExternos.create(novaAmostra).subscribe((res) => {
        if (res) {
          const _amostra: AmostraLabExterno = {
            id: res.id,
            amostraName: res.amostraName,
            elementosAnalisados: res.elementosAnalisados.map(ele => ele.id) as number[],
          }
          this.amostras.update(value => [...value, _amostra]);
          this.amostrasFiltradas.set(this.amostras());
          this.#toast.success("Amostra adicionada com sucesso!")
        }
      })
    }

    this.filtrarAmostras();
    this.resetarFormulario();
    this.fecharFormulario();
  }

  // Remover amostra
  removerAmostra(id: number): void {
    this.#confirmationModalService.confirmDelete('Remover Amostra', 'Tem certeza que deseja remover esta amostra?').then((res) => {
      if (res) {
        this.#amostrasLabExternos.delete(id).subscribe(result => {
            if (result) {
              this.amostras.update(value => value.filter((amostra) => amostra.id !== id))
              this.filtrarAmostras();
              this.#toast.success(`Amostra removida com sucesso!`);
            }
          }
        )
        ;
      }
    })

  }

  copiarAmostra(amostra: AmostraLabExterno): void {
    this.novaAmostra = {
      amostraName: `Cópia de ${amostra.amostraName}`,
      elementosAnalisados: [...amostra.elementosAnalisados],
    };
    this.editando.set(false);
    this.formularioVisivel.set(true);
  }


  toggleElemento(element: ElementoQuimico): void {
    const index = this.novaAmostra.elementosAnalisados.indexOf(element.id!);
    if (index === -1) {
      this.novaAmostra.elementosAnalisados.push(element.id!);
    } else {
      this.novaAmostra.elementosAnalisados.splice(index, 1);
    }
  }

  abrirFormulario(): void {
    this.resetarFormulario();
    this.formularioVisivel.set(true);
    this.editando.set(false);
  }

  fecharFormulario(): void {
    this.formularioVisivel.set(false);
    this.resetarFormulario();
  }

  resetarFormulario(): void {
    this.novaAmostra = {
      id: undefined,
      amostraName: '',
      elementosAnalisados: [],
    };
    this.editando.set(false);
  }

}
