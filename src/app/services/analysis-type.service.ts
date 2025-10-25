import {catchError, Observable, of, throwError} from 'rxjs';
import {inject, Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {ITipoAnalise} from '../shared/interfaces/analysis-type.interface';
import {ToastrService} from './toastr.service';
import {API_ROUTES} from '../shared/constants/routes.constant';

const { TIPOS_DE_ANALISES } = API_ROUTES;

@Injectable({
  providedIn: 'root',
})
export class AnalysisTypeService {
  #apiUrl = `${environment.apiURL}/${TIPOS_DE_ANALISES.BASE}`;
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

  findAll(): Observable<ITipoAnalise[]> {
    return this.#http.get<ITipoAnalise[]>(`${this.#apiUrl}/${TIPOS_DE_ANALISES.GET.FIND_ALL}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleGetError.bind(this)));
  }

  create(body: ITipoAnalise): Observable<ITipoAnalise> {
    return this.#http.post<ITipoAnalise>(`${this.#apiUrl}/${TIPOS_DE_ANALISES.POST.CREATE}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  update(id: number, body: ITipoAnalise): Observable<ITipoAnalise> {
    return this.#http.patch<ITipoAnalise>(`${this.#apiUrl}/${TIPOS_DE_ANALISES.PATCH.UPDATE+id}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  delete(id: number): Observable<any> {
    return this.#http.delete(`${this.#apiUrl}/${TIPOS_DE_ANALISES.DELETE.DELETE+id}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }
}
