import {
  Component,
  ElementRef,
  inject,
  makeStateKey, OnInit,
  PLATFORM_ID,
  signal,
  TransferState,
  viewChild
} from '@angular/core';
import {CommonModule, isPlatformBrowser, isPlatformServer} from '@angular/common';
import {ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule} from '@angular/forms';
import {NgIconComponent, provideIcons} from '@ng-icons/core';
import {
  heroBuildingOffice2,
  heroMapPin,
  heroPhone,
  heroEnvelope,
  heroHome,
  heroHashtag,
  heroGlobeAlt,
  heroCheck,
  heroXMark,
  heroMagnifyingGlass,
  heroTrash,
  heroEye,
  heroPencilSquare,
  heroBeaker
} from '@ng-icons/heroicons/outline';
import {Endereco, Laboratorio, Remessa} from '../../../shared/interfaces/laboratorios-externos.interfaces';
import {NgxMaskDirective} from 'ngx-mask';
import {ConfirmationModalService} from '../../../services/confirmation-modal.service';
import {ToastrService} from '../../../services/toastr.service';
import {LabsLabExternosService} from '../../../services/labs-lab-externos.service';

const LABS_KEY = makeStateKey<Laboratorio[]>('appLaboratorios');

@Component({
  selector: 'app-laboratorios',
  imports: [
    CommonModule, ReactiveFormsModule, NgIconComponent, NgxMaskDirective, FormsModule
  ],
  viewProviders: [
    provideIcons({
      heroBuildingOffice2,
      heroMapPin,
      heroPhone,
      heroEnvelope,
      heroHome,
      heroHashtag,
      heroGlobeAlt,
      heroCheck,
      heroXMark,
      heroMagnifyingGlass,
      heroTrash,
      heroEye,
      heroPencilSquare,
      heroBeaker
    })
  ],
  templateUrl: './laboratorios.component.html',
})
export class LaboratoriosComponent implements OnInit {
  #confirmModal = inject(ConfirmationModalService);
  #toast = inject(ToastrService);
  #transferState = inject(TransferState);
  #platformId = inject(PLATFORM_ID);
  #labService = inject(LabsLabExternosService);

  laboratorioForm: FormGroup;
  isLoading = signal(false);
  selectTable = signal<number>(0)
  laboratorios = signal<Laboratorio[]>([])
  laboratoriosFiltrados = signal<Laboratorio[]>([])
  searchTerm: string = '';
  editando = signal<boolean>(false);
  telMask = signal('(00) 0 0000-0000');
  openModal = signal<boolean>(false);
  laboratorioSelecionado = signal<Laboratorio | null>(null);

  constructor(private fb: FormBuilder) {
    this.laboratorioForm = this.createForm();
  }

  ngOnInit(): void {
    const labs = this.#transferState.get(LABS_KEY, null);
    if (isPlatformBrowser(this.#platformId) && labs) {
      this.laboratorios.set(labs);
      this.laboratoriosFiltrados.set(labs);
      this.#transferState.remove(LABS_KEY);
    } else {
      this.loadLabs();
    }
  }

  loadLabs() {
    this.#labService.findAll().subscribe((res) => {
      if (res) {
        this.laboratorios.set(res);
        this.laboratoriosFiltrados.set(res);
        if (isPlatformServer(this.#platformId)) {
          this.#transferState.set(LABS_KEY, res);
        }
      }
    })
  }

  setMask(element: HTMLInputElement) {
    const digitos = element.value.replace(/\D/g, '');
    if (digitos.length == 10) {
      this.telMask.set('(00) 0000-0000')
    } else {
      this.telMask.set('(00) 0 0000-0000');
    }
  }

  resetMask() {
    this.telMask.set('(00) 0 0000-0000');
  }

  private createForm(): FormGroup {
    return this.fb.group({
      id: [null],
      nome: ['', [Validators.required, Validators.minLength(3)]],
      telefone: ['', [Validators.minLength(10), Validators.maxLength(11), Validators.required]],
      email: ['', [Validators.email]],
      endereco: this.fb.group({
        cep: ['', [Validators.required]],
        logradouro: ['', [Validators.required]],
        numero: ['', [Validators.required]],
        complemento: [''],
        bairro: ['', [Validators.required]],
        cidade: ['', [Validators.required]],
        estado: ['', [Validators.required]],
        pais: ['Brasil', [Validators.required]]
      })
    });
  }

  get enderecoForm(): FormGroup {
    return this.laboratorioForm.get('endereco') as FormGroup;
  }

  async buscarCep(): Promise<void> {
    const cep = this.enderecoForm.get('cep')?.value
    if (cep?.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const endereco = await response.json();

        if (!endereco.erro) {
          this.enderecoForm.patchValue({
            logradouro: endereco.logradouro || '',
            bairro: endereco.bairro || '',
            cidade: endereco.localidade || '',
            estado: endereco.uf || ''
          });
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }

  }

  onSubmit(): void {
    if (this.laboratorioForm.valid) {
      this.isLoading.set(true);
      if (!this.editando()) {
        const laboratorio: Partial<Laboratorio> = {
          nome: this.laboratorioForm.value.nome,
          endereco: this.laboratorioForm.value.endereco,
          telefone: this.laboratorioForm.value.telefone || null,
          email: this.laboratorioForm.value.email || null
        };
        this.#labService.create(laboratorio).subscribe((res) => {
          if (res) {
            this.laboratorios.update(labs => [...labs, res])
            this.filtrarLaboratorios();
            this.#toast.success('Laboratório cadastrado com sucesso!');
            this.laboratorioForm.reset();
          }
        })
      } else {
        const id = this.laboratorioForm.value.id;
        if (!id) return;
        this.#labService.update(id, this.laboratorioForm.value).subscribe((res) => {
          if (res) {
            this.laboratorios.update(labs => labs.map(lab => lab.id === id ? res : lab))
            this.filtrarLaboratorios();
            this.#toast.success('Laboratório Atualizado com sucesso!');
            this.laboratorioForm.reset();
          }
        })
      }

    } else {
      this.markFormGroupTouched(this.laboratorioForm);
    }
    this.isLoading.set(false);
  }

  tableSelect(table: number) {
    return this.selectTable.set(table)
  }

  filtrarLaboratorios(): void {
    if (!this.searchTerm) {
      this.laboratoriosFiltrados.update(labs => [...this.laboratorios()]);
      return;
    }

    const term = this.searchTerm.toLowerCase();
    const filtro = this.laboratorios().filter(
      (laboratorio) => {
        // Busca no ID, data ou laboratório
        return laboratorio.nome.toLowerCase().includes(term)
      }
    );
    this.laboratoriosFiltrados.set(filtro);
  }

  visualizarLaboratorio(lab: Laboratorio): void {
    if (!lab) return;
    this.laboratorioSelecionado.set(lab);
    this.openModal.set(true);
  }

  fecharModal(): void {
    this.openModal.set(false);
  }

  formatarEnderecoCompleto(endereco: Endereco): string {
    const partes: string[] = [];

    if (endereco.logradouro) partes.push(endereco.logradouro);
    if (endereco.numero) partes.push(endereco.numero);
    if (endereco.complemento) partes.push(endereco.complemento);
    if (endereco.bairro) partes.push(endereco.bairro);
    if (endereco.cidade) partes.push(endereco.cidade);
    if (endereco.estado) partes.push(endereco.estado);
    if (endereco.cep) partes.push(`CEP: ${endereco.cep}`);
    if (endereco.pais) partes.push(endereco.pais);

    return partes.length > 0 ? partes.join(', ') : 'Endereço não disponível';
  }

  removerLaboratorio(id: string): void {
    this.#confirmModal.confirmDelete('', 'Tem certeza que deseja remover esta remessa?').then((confirm) => {
      if (confirm) {
        this.#labService.delete(id).subscribe((res) => {
          if (res) {
            this.laboratorios.update(labs => labs.filter(lab => lab.id !== id))
            this.filtrarLaboratorios();
            this.#toast.success(`Laboratório removido com sucesso!`);
          }
        })

      }
    })
  }

  editarLaboratorio(lab: Laboratorio): void {
    if (!lab) return;
    this.laboratorioForm.setValue(
      {
        id: lab.id,
        nome: lab.nome,
        telefone: lab.telefone,
        email: lab.email,
        endereco: {
          cep: lab.endereco?.cep,
          logradouro: lab.endereco?.logradouro,
          numero: lab.endereco?.numero,
          complemento: lab.endereco?.complemento || '',
          bairro: lab.endereco?.bairro,
          cidade: lab.endereco?.cidade,
          estado: lab.endereco?.estado,
          pais: lab.endereco?.pais || 'Brasil'
        }
      }
    )
    this.editando.set(true);
    this.selectTable.set(0);
  }

  cancelar(): void {
    this.#confirmModal.confirmWarning('Cancelar', 'Ao confirmar o formulário será limpo. Deseja continuar?').then((res) => {
      if (res) {
        this.laboratorioForm.reset();
        this.editando.set(false);
      }
    })
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }
}
