import {catchError, Observable, of, throwError} from 'rxjs';
import {inject, Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {ITipoAnalise} from '../shared/interfaces/analysis-type.interface';
import {ToastrService} from '../components/layout/toastr/toastr.service';


@Injectable({
  providedIn: 'root',
})
export class AnalysisTypeService {
  #apiUrl = `${environment.apiURL}/tipo-de-analise`;
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

  findAll(): Observable<ITipoAnalise[]> {
    return this.#http.get<ITipoAnalise[]>(`${this.#apiUrl}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleGetError.bind(this)));
  }

  create(body: ITipoAnalise): Observable<ITipoAnalise> {
    return this.#http.post<ITipoAnalise>(`${this.#apiUrl}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  update(id: number, body: ITipoAnalise): Observable<ITipoAnalise> {
    return this.#http.patch<ITipoAnalise>(`${this.#apiUrl}/${id}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  delete(id: number): Observable<any> {
    return this.#http.delete(`${this.#apiUrl}/${id}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }
}
