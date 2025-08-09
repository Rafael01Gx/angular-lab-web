import {inject, Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {IAnalysisSettings} from '../shared/interfaces/analysis-settings.interface';
import {catchError, Observable, of, throwError} from 'rxjs';
import {ToastrService} from '../components/layout/toastr/toastr.service';


@Injectable({
  providedIn: 'root',
})
export class AnalysisSettingsService {
  #apiUrl = `${environment.apiURL}/config-analise`;
  #http = inject(HttpClient);
  #toastr = inject(ToastrService);

  handleSetError(err: HttpErrorResponse): Observable<never> {
    this.#toastr.error(err.message);
    return throwError(() => new Error(err.message));
  }

  handleGetError(err: HttpErrorResponse): Observable<any> {
    this.#toastr.error(err.message);
    return of([]);
  }

  findAll(): Observable<IAnalysisSettings[]> {
    return this.#http.get<IAnalysisSettings[]>(`${this.#apiUrl}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleGetError.bind(this)));
  }

  create(body: IAnalysisSettings): Observable<IAnalysisSettings> {
    const {parametros, ...data} = body;
    const parametrosId = parametros.map((p) => {
      return p.id;
    });
    return this.#http.post<IAnalysisSettings>(
      `${this.#apiUrl}`,
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
      `${this.#apiUrl}/${id}`,
      {parametros: parametrosId, ...data},
      {
        withCredentials: true,
      }
    ).pipe(catchError(this.handleSetError.bind(this)));
  }

  delete(id: number): Observable<any> {
    return this.#http.delete(`${this.#apiUrl}/${id}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }
}
