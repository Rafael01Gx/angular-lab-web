import {inject, Injectable} from '@angular/core';
import {ToastrService} from '../components/layout/toastr/toastr.service';
import {HttpErrorResponse} from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HandleFetchErrorService {
  #toastr = inject(ToastrService);

   handleSetError(err: HttpErrorResponse): Observable<never> {
    this.#toastr.error(err.message);
    return throwError(() => new Error(err.message));
  }

   handleGetError(err: HttpErrorResponse): Observable<any> {
    this.#toastr.error(err.message);
    return of([]);
  }
}
