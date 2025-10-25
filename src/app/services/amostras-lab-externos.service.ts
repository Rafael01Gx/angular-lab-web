import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {ToastrService} from './toastr.service';
import {catchError, Observable, of, throwError} from 'rxjs';
import {AmostraLabExterno, AmostraLabExternoFull} from '../shared/interfaces/laboratorios-externos.interfaces';
import {API_ROUTES} from '../shared/constants/routes.constant';

const { AMOSTRAS_LAB_EXTERNO } = API_ROUTES;

@Injectable({
  providedIn: 'root',
})
export class AmostrasLabExternos {
  #apiUrl = `${environment.apiURL}/${AMOSTRAS_LAB_EXTERNO.BASE}`;
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

  findAll(): Observable<AmostraLabExternoFull[]> {
    return this.#http.get<AmostraLabExternoFull[]>(`${this.#apiUrl}/${AMOSTRAS_LAB_EXTERNO.GET.FIND_ALL}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleGetError.bind(this)));
  }

  create(body: AmostraLabExterno): Observable<AmostraLabExternoFull> {
    return this.#http.post<AmostraLabExternoFull>(`${this.#apiUrl}/${AMOSTRAS_LAB_EXTERNO.POST.CREATE}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  update(id: number, body: AmostraLabExterno): Observable<AmostraLabExterno> {
    return this.#http.patch<AmostraLabExterno>(`${this.#apiUrl}/${AMOSTRAS_LAB_EXTERNO.PATCH.UPDATE+id}`, body, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  delete(id: number): Observable<any> {
    return this.#http.delete(`${this.#apiUrl}/${AMOSTRAS_LAB_EXTERNO.DELETE.DELETE+id}`, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }
}
