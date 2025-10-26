import {HttpErrorResponse, HttpInterceptorFn} from '@angular/common/http';
import {catchError, throwError} from 'rxjs';
import {httpErrorMessages} from '../constants/http-error-messages';
import {inject} from '@angular/core';
import {ToastrService} from '../../services/toastr.service';

export const errorsInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastrService);
  return next(req).pipe(
    catchError((err:HttpErrorResponse)=>{
      if(err.status < 408){
        return throwError(()=>err);
      }
      const errorMessage = httpErrorMessages[err.status.toString()] || httpErrorMessages['default']
      if(err.status >= 408){
        toast.error(errorMessage);
      }
      return throwError(() => new Error(errorMessage))
    })
  );
};
