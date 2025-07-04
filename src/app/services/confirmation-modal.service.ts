import {
  Injectable,
  ComponentRef,
  ViewContainerRef,
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
} from '@angular/core';
import { ConfirmationModalComponent } from '../components/modal/confirmation-modal/confirmation-modal.component';
import { ConfirmationModalConfig } from '../interfaces/confirmation-modal.interface';

@Injectable({
  providedIn: 'root',
})
export class ConfirmationModalService {
  private modalRef: ComponentRef<ConfirmationModalComponent> | null = null;

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) {}

  open(config: ConfirmationModalConfig): Promise<boolean> {
    return new Promise((resolve) => {

      this.modalRef = createComponent(ConfirmationModalComponent, {
        environmentInjector: this.injector,
      });


      this.modalRef.instance.config = config;
      this.modalRef.instance.isVisible = true;


      this.modalRef.instance.confirmed.subscribe(() => {
        resolve(true);
        this.close();
      });

      this.modalRef.instance.cancelled.subscribe(() => {
        resolve(false);
        this.close();
      });

      this.modalRef.instance.closed.subscribe(() => {
        this.close();
      });


      this.appRef.attachView(this.modalRef.hostView);
      document.body.appendChild(this.modalRef.location.nativeElement);
    });
  }

  private close(): void {
    if (this.modalRef) {
      this.appRef.detachView(this.modalRef.hostView);
      this.modalRef.destroy();
      this.modalRef = null;
    }
  }


  confirmDelete(itemName?: string, customMessage?: string): Promise<boolean> {
    return this.open({
      type: 'danger',
      itemName,
      showItemName: !!itemName,
      message: customMessage,
      title: 'Confirmar Exclusão',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
    });
  }

  confirmWarning(title: string, message: string): Promise<boolean> {
    return this.open({
      type: 'warning',
      title,
      message,
      confirmText: 'Continuar',
      cancelText: 'Cancelar',
    });
  }

  confirmInfo(title: string, message: string): Promise<boolean> {
    return this.open({
      type: 'info',
      title,
      message,
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
    });
  }
}
