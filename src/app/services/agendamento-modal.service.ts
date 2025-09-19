import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
} from '@angular/core';
import {AgendamentoModalComponent} from '../components/analises/modal-agendamento/agendamento-modal.component';
import {IOrders} from '../shared/interfaces/orders.interface';

interface IConfig {
  data: IOrders;
}

@Injectable({
  providedIn: 'root',
})
export class AgendamentoModalService {
  #modalRef: ComponentRef<AgendamentoModalComponent> | null = null;
  #appRef = inject(ApplicationRef);
  #eInjector = inject(EnvironmentInjector);

 private open(config:IConfig): Promise<boolean|IOrders> {
    return new Promise((resolve) => {
      this.#modalRef = createComponent(AgendamentoModalComponent, {
        environmentInjector: this.#eInjector,
      });

      this.#modalRef.instance.isVisible.set(true);
      this.#modalRef.instance.ordemServico.set(config.data ? config.data : null);

      this.#modalRef.instance.close.subscribe(() => {
        resolve(true);
        this.close();
      });

      this.#modalRef.instance.save.subscribe((data) => {
        resolve(data);
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

  openModal(_data: IOrders): Promise<boolean|IOrders> {
    return this.open({
      data: _data
    });
  }
}
