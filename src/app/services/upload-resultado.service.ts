import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {ToastrService} from './toastr.service';
import {catchError, Observable, of, tap, throwError} from 'rxjs';
import {API_ROUTES} from '../core/constants/routes.constant';
import { UploadConfig } from '../shared/interfaces/upload-resultados.interface';
import { AmostraLabExternoFullUpload } from '../shared/interfaces/laboratorios-externos.interfaces';

const { UPLOAD } = API_ROUTES;

export const DEFAULT_UPLOAD_CONFIG: Required<UploadConfig> = {
  headerSearch: { columnIndex: 0, value: 'Type' },
  elementosRowOffset: 1,
  unidadesRowOffset: 2,
  elementosStartColumn: 2,
  ignoreElementNames: ['Sample ID'],
  sampleTypeValue: 'SMP',
  sampleIdColumnOffset: 1,
  hasDateConfig: true,
  hasValuesConfig: [],
};

@Injectable({
  providedIn: 'root',
})
export class UploadResultadoService {
  #apiUrl = `${environment.apiURL}/${UPLOAD.BASE}`;
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


  upload(file: File,configuracoes?: UploadConfig): Observable<AmostraLabExternoFullUpload[]> {
    const config = configuracoes ? configuracoes : DEFAULT_UPLOAD_CONFIG;
    const formData = new FormData();
    formData.append('file', file, file.name); 
    formData.append('config', JSON.stringify(config));
    return this.#http.post<AmostraLabExternoFullUpload[]>(`${this.#apiUrl}/${UPLOAD.POST.UPLOAD_RESULTADO}`, formData, {
      withCredentials: true,
    }).pipe(catchError(this.handleSetError.bind(this)));
  }

  
}
