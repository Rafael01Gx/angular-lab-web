import {ApplicationRef, ComponentRef, createComponent, EnvironmentInjector, inject, Injectable} from '@angular/core';
import {StatusModalComponent} from '../components/orders/status-modal/status-modal.component';

@Injectable({
  providedIn: "root"
})
export class StatusModalService {
  #modalRef: ComponentRef<StatusModalComponent> | null = null;
  #appRef= inject(ApplicationRef);
  #eInjector = inject(EnvironmentInjector);

  open(config: any): Promise<boolean> {
    return new Promise((resolve) => {
      this.#modalRef = createComponent(StatusModalComponent, {
        environmentInjector: this.#eInjector,
      });

      //implementar a logica ...
    })
  }
}
