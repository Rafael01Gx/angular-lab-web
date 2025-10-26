import {inject, Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {IAnalysisSettings} from '../shared/interfaces/analysis-settings.interface';
import {catchError, Observable, of, throwError} from 'rxjs';
import {ToastrService} from './toastr.service';
import {API_ROUTES} from '../core/constants/routes.constant';

const { CONFIG_ANALISES } = API_ROUTES;

@Injectable({
  providedIn: 'root',
})
export class AnalysisSettingsService {
  #apiUrl = `${environment.apiURL}/${CONFIG_ANALISES.BASE}`;
  #http = inject(HttpClient);
  #toastr = inject(ToastrService);

  handleSetError(err: HttpErrorResponse): Observable<never> {
    this.#toastr.error(err.error.message);
    return throwError(() => new Error(err.error.message));
  }

  handleGetError(err: HttpErrorResponse): Observable<any> {
    this.#toastr.error(err.error.message);
    return of([]);
  }

  findAll(): Observable<IAnalysisSettings[]> {
    return this.#http.get<IAnalysisSettings[]>(`${this.#apiUrl}/${CONFIG_ANALISES.GET.FIND_ALL}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleGetError.bind(this)));
  }

  findByAnalisysId(id:string|number): Observable<IAnalysisSettings[]> {
    return this.#http.get<IAnalysisSettings[]>(`${this.#apiUrl}/${CONFIG_ANALISES.GET.FIND_BY_TIPO_ANALISE_ID+id}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleGetError.bind(this)));
  }

  create(body: IAnalysisSettings): Observable<IAnalysisSettings> {
    const {parametros, ...data} = body;
    const parametrosId = parametros.map((p) => {
      return p.id;
    });
    return this.#http.post<IAnalysisSettings>(
      `${this.#apiUrl}/${CONFIG_ANALISES.POST.CREATE}`,
      {parametros: parametrosId, ...data},
      {
        withCredentials: true,
      }
    ).pipe(catchError(this.handleSetError.bind(this)));
  }

  update(id: number, body: IAnalysisSettings): Observable<IAnalysisSettings> {
    const {parametros, ...data} = body;
    const parametrosId = parametros.map((p) => {
      return p.id;
    });
    return this.#http.patch<IAnalysisSettings>(
      `${this.#apiUrl}/${CONFIG_ANALISES.PATCH.UPDATE+id}`,
      {parametros: parametrosId, ...data},
      {
        withCredentials: true,
      }
    ).pipe(catchError(this.handleSetError.bind(this)));
  }

  delete(id: number): Observable<any> {
    return this.#http.delete(`${this.#apiUrl}/${CONFIG_ANALISES.DELETE.DELETE+id}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }
}
