import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, tap, retry } from 'rxjs/operators';
import { ToastrService } from './toastr.service';
import { environment } from '../../environments/environment';

export interface AmostraDetalhes {
  id: number;
  nomeAmostra: string;
  numeroOs: string;
  prazoInicioFim: string;
  status: string;
}

export interface TipoAnalise {
  tipo: string;
  classe: string;
  quantidade: number;
  amostras: AmostraDetalhes[];
}

export interface AgendamentoSemanal {
  semana: string;
  dataInicio: string;
  dataFim: string;
  tiposAnalise: TipoAnalise[];
  totalAmostras: number;
}

export interface EstatisticasGerais {
  totalAmostras: number;
  totalSemanas: number;
  tiposUnicos: number;
  distribuicaoPorStatus: {
    execucao: number;
    autorizada: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AgendaService {
  private http = inject(HttpClient);
    #apiUrl = `${environment.apiURL}/amostra`;
    #toastr = inject(ToastrService);
  
    handleSetError(err: HttpErrorResponse): Observable<never> {
      this.#toastr.error(err.error.message);
      return throwError(() => new Error(err.error.message));
    }
  
    handleGetError(err: HttpErrorResponse): Observable<any> {
      this.#toastr.error(err.error.message);
      return of([]);
    }
  

  private agendamentosSubject = new BehaviorSubject<AgendamentoSemanal[]>([]);
  agendamentos$ = this.agendamentosSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();

  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  getAgendamentoSemanal(forceRefresh = false): Observable<AgendamentoSemanal[]> {
    const cacheKey = 'agenda-semanal';

    if (!forceRefresh && this.isCacheValid(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      this.agendamentosSubject.next(cached.data);
      return new Observable(subscriber => {
        subscriber.next(cached.data);
        subscriber.complete();
      });
    }

    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<AgendamentoSemanal[]>(`${this.#apiUrl}/agenda-semanal`,{withCredentials:true}).pipe(
      retry(2),
      tap((data) => {
        this.cache.set(cacheKey, { data, timestamp: Date.now() });
        this.agendamentosSubject.next(data);
        this.loadingSubject.next(false);
      }),
      catchError((error) => {
        this.loadingSubject.next(false);
        return this.handleSetError(error);
      })
    );
  }

  calcularEstatisticas(agendamentos: AgendamentoSemanal[]): EstatisticasGerais {
    const totalAmostras = agendamentos.reduce(
      (acc, sem) => acc + sem.totalAmostras,
      0
    );

    const tiposSet = new Set<string>();
    let execucao = 0;
    let autorizada = 0;

    agendamentos.forEach((sem) => {
      sem.tiposAnalise.forEach((tipo) => {
        tiposSet.add(tipo.tipo);
        tipo.amostras.forEach((amostra) => {
          if (amostra.status === 'EXECUCAO') execucao++;
          if (amostra.status === 'AUTORIZADA') autorizada++;
        });
      });
    });

    return {
      totalAmostras,
      totalSemanas: agendamentos.length,
      tiposUnicos: tiposSet.size,
      distribuicaoPorStatus: { execucao, autorizada },
    };
  }

  filtrarPorTipo(
    agendamentos: AgendamentoSemanal[],
    filtro: string
  ): AgendamentoSemanal[] {
    if (!filtro.trim()) return agendamentos;

    const filtroLower = filtro.toLowerCase();

    return agendamentos
      .map((sem) => ({
        ...sem,
        tiposAnalise: sem.tiposAnalise.filter((tipo) =>
          tipo.tipo.toLowerCase().includes(filtroLower) ||
          tipo.classe.toLowerCase().includes(filtroLower)
        ),
        totalAmostras: sem.tiposAnalise
          .filter((tipo) =>
            tipo.tipo.toLowerCase().includes(filtroLower) ||
            tipo.classe.toLowerCase().includes(filtroLower)
          )
          .reduce((acc, tipo) => acc + tipo.amostras.length, 0),
      }))
      .filter((sem) => sem.tiposAnalise.length > 0);
  }

  getDetalhesAmostra(id: number): Observable<any> {
    return this.http.get(`${this.#apiUrl}/detalhes/${id}`).pipe(
      catchError(this.handleSetError.bind(this))
    );
  }

  exportarParaCSV(agendamentos: AgendamentoSemanal[]): string {
    const headers = [
      'Semana',
      'Data Início',
      'Data Fim',
      'Tipo Análise',
      'Classe',
      'Quantidade',
      'Amostra',
      'OS',
      'Status',
      'Prazo',
    ];

    const rows = agendamentos.flatMap((sem) =>
      sem.tiposAnalise.flatMap((tipo) =>
        tipo.amostras.map((amostra) => [
          sem.semana,
          sem.dataInicio,
          sem.dataFim,
          tipo.tipo,
          tipo.classe,
          tipo.quantidade,
          amostra.nomeAmostra,
          amostra.numeroOs,
          amostra.status,
          amostra.prazoInicioFim,
        ])
      )
    );

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return csvContent;
  }

  downloadCSV(agendamentos: AgendamentoSemanal[], filename = 'agendamentos.csv') {
    const csv = this.exportarParaCSV(agendamentos);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  clearCache() {
    this.cache.clear();
  }

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;

    const isExpired = Date.now() - cached.timestamp > this.CACHE_DURATION;
    if (isExpired) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

}

export interface FiltrosAgendamento {
  tipo?: string;
  classe?: string;
  status?: string[];
  dataInicio?: string;
  dataFim?: string;
}

export interface OrdenacaoAgendamento {
  campo: 'semana' | 'totalAmostras' | 'tipo' | 'quantidade';
  direcao: 'asc' | 'desc';
}