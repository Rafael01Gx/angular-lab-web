import { resolve } from 'node:path';
import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
} from '@angular/core';
import { AnalysisSettingsModalComponent } from '../components/configuracoes/analysis-settings-modal/analysis-settings-modal.component';
import { AnalysisSettingsModal } from '../interfaces/modals.interface';

@Injectable({
  providedIn: 'root',
})
export class AnalysisModalService {
  #modalRef: ComponentRef<AnalysisSettingsModalComponent> | null = null;
  #appRef = inject(ApplicationRef);
  #eInjector = inject(EnvironmentInjector);

  open(config: AnalysisSettingsModal): Promise<boolean> {
    return new Promise((resolve) => {
      this.#modalRef = createComponent(AnalysisSettingsModalComponent, {
        environmentInjector: this.#eInjector,
      });

      this.#modalRef.instance.isEditMode = config.isEditMode;
      this.#modalRef.instance.isVisible = true;
      this.#modalRef.instance.data = config.data ? config.data : null;

      this.#modalRef.instance.cancelled.subscribe(() => {
        resolve(true);
        this.close();
      });
      
      this.#modalRef.instance.dataSaved.subscribe(() => {
        resolve(true);
        this.close();
      });


      this.#appRef.attachView(this.#modalRef.hostView);
      document.body.appendChild(this.#modalRef.location.nativeElement);
    });
  }
  private close(): void {
setTimeout(() => {
  if (this.#modalRef?.hostView) {
    this.#appRef.detachView(this.#modalRef.hostView);
    this.#modalRef.destroy();
    this.#modalRef = null;
  }
}, 500);
}

  openModal(isEditMode: boolean = false, _data: any): Promise<boolean> {
    return this.open({
      isEditMode,
      data: _data
    });
  }
}
