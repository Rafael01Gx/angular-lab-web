import {ApplicationRef, ComponentRef, createComponent, EnvironmentInjector, inject, Injectable} from '@angular/core';
import {VisualizarOrdemServicoComponent} from '../components/orders/visualizar-ordem-servico/visualizar-ordem-servico.component';
import {IOrders} from '../shared/interfaces/orders.interface';

interface IOrderViewConfig {
  data: IOrders;
  headerButton?: {
    label: string;
    action: () => void;
  };
  botButton?: {
    label: string;
    action: () => void;
  };
}

@Injectable({
  providedIn: 'root',
})
export class OrderViewService {
  #modalRef: ComponentRef<VisualizarOrdemServicoComponent> | null = null;
  #appRef = inject(ApplicationRef);
  #eInjector = inject(EnvironmentInjector);

  open(config: IOrderViewConfig): Promise<{ htmlContent: string; ordemServico: IOrders }| void> {
    return new Promise((resolve) => {
      if (this.#modalRef) {
        this.close(); // Garante que apenas uma instância exista
      }

      this.#modalRef = createComponent(VisualizarOrdemServicoComponent, {
        environmentInjector: this.#eInjector,
      });

      // Anexa o componente ao DOM (no <body>)
      this.#appRef.attachView(this.#modalRef.hostView);
      document.body.appendChild(this.#modalRef.location.nativeElement);

      this.#modalRef.instance.isVisible.set(true);
      this.#modalRef.instance.ordemServico = config.data;
      if(config.headerButton){
        this.#modalRef.instance.headerButton.set(config.headerButton);
      }
      if(config.botButton){
        this.#modalRef.instance.botButton.set(config.botButton);
      }

      document.body.classList.add('overflow-hidden');

      this.#modalRef.instance.print.subscribe((event) => {
        resolve(event);
        this.close();
      });
      this.#modalRef.instance.closeModal.subscribe(() => {
        this.close();
        resolve();
      });
    });
  }

  private close(): void {
    if (this.#modalRef?.hostView) {
      this.#appRef.detachView(this.#modalRef.hostView);
      this.#modalRef.destroy();
      this.#modalRef = null;
      document.body.classList.remove('overflow-hidden');
    }
  }

  private openModal(_data: any): Promise<{ htmlContent: string, ordemServico: IOrders }|void> {
    return this.open({
      data: _data
    });
  }

}
