import { Injectable, inject, PLATFORM_ID, TransferState, makeStateKey } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { isPlatformBrowser} from '@angular/common';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
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

@Injectable({ providedIn: 'root' })
export class AgendaService {
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);
  private transferState = inject(TransferState);
  private platformId = inject(PLATFORM_ID);

  private isBrowser = isPlatformBrowser(this.platformId);
  private readonly CACHE_DURATION = 5 * 60 * 1000; 
  private readonly AGENDA_KEY = makeStateKey<AgendamentoSemanal[]>('agenda-semanal');
  private readonly apiUrl = `${environment.apiURL}/amostra`;

  private agendamentosSubject = new BehaviorSubject<AgendamentoSemanal[]>([]);
  agendamentos$ = this.agendamentosSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  error$ = this.errorSubject.asObservable();

  private cache = new Map<string, { data: any; timestamp: number }>();

  getAgendamentoSemanal(forceRefresh = false): Observable<AgendamentoSemanal[]> {
    const cacheKey = 'agenda-semanal';

    const transferData = this.transferState.get(this.AGENDA_KEY, null);
    if (transferData && !forceRefresh) {
      this.agendamentosSubject.next(transferData);
      this.transferState.remove(this.AGENDA_KEY);
      return of(transferData);
    }

    if (this.isBrowser && !forceRefresh && this.isCacheValid(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      this.agendamentosSubject.next(cached.data);
      return of(cached.data);
    }

    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<AgendamentoSemanal[]>(`${this.apiUrl}/agenda-semanal`, { withCredentials: true }).pipe(
      retry(2),
      tap((data) => {
        this.agendamentosSubject.next(data);
        this.loadingSubject.next(false);

        this.transferState.set(this.AGENDA_KEY, data);
        if (this.isBrowser) this.cache.set(cacheKey, { data, timestamp: Date.now() });
      }),
      catchError((error) => {
        this.loadingSubject.next(false);
        return this.handleSetError(error);
      })
    );
  }

  handleSetError(err: HttpErrorResponse): Observable<never> {
    const message = err.error?.message || 'Erro ao carregar dados.';
    if (this.isBrowser) this.toastr.error(message);
    return throwError(() => new Error(message));
  }

  clearCache() {
    if (this.isBrowser) this.cache.clear();
  }

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    const expired = Date.now() - cached.timestamp > this.CACHE_DURATION;
    if (expired) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  calcularEstatisticas(agendamentos: AgendamentoSemanal[]): EstatisticasGerais {
    const totalAmostras = agendamentos.reduce((acc, s) => acc + s.totalAmostras, 0);
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

  filtrarPorTipo(agendamentos: AgendamentoSemanal[], filtro: string): AgendamentoSemanal[] {
    if (!filtro.trim()) return agendamentos;
    const filtroLower = filtro.toLowerCase();

    return agendamentos
      .map((sem) => ({
        ...sem,
        tiposAnalise: sem.tiposAnalise.filter(
          (tipo) =>
            tipo.tipo.toLowerCase().includes(filtroLower) ||
            tipo.classe.toLowerCase().includes(filtroLower)
        ),
        totalAmostras: sem.tiposAnalise
          .filter(
            (tipo) =>
              tipo.tipo.toLowerCase().includes(filtroLower) ||
              tipo.classe.toLowerCase().includes(filtroLower)
          )
          .reduce((acc, tipo) => acc + tipo.amostras.length, 0),
      }))
      .filter((sem) => sem.tiposAnalise.length > 0);
  }

  getDetalhesAmostra(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/detalhes/${id}`).pipe(
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
      ...rows.map((r) => r.map((c) => `"${c}"`).join(',')),
    ].join('\n');

    return csvContent;
  }

  downloadCSV(agendamentos: AgendamentoSemanal[], filename = 'agendamentos.csv') {
    if (!this.isBrowser) return; 
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
