import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { HelperService } from './helper.service';
import { catchError, map } from 'rxjs/operators';
import { DialogService } from './dialog.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  selectedOrgId: string = sessionStorage.getItem("selectedOrgId") || ''
  constructor(public helperService: HelperService, private dialogService: DialogService) {
    // this.helperService.selectedOrgId.subscribe(id=>{
    //   this.selectedOrgId = id
    // })
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // if (this.selectedOrgId) {
      request = request.clone({ headers: request.headers.set('OrgId', 'admin410c091cebb2432780720327ac866c56') });
    // }
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${this.helperService.getToken()}`
      }
    });
    return next.handle(request).pipe(
      // REST API Error handler
      catchError((error: HttpErrorResponse) => {
        if (error instanceof HttpErrorResponse) {
          switch ((error as HttpErrorResponse).status) {
            case 400:
              if (error.error.errorMessage) {
                this.dialogService.openSnackBar(error.error.errorMessage, 'OK');
              }
              else if (error.error.message || error.error) {

                this.dialogService.openSnackBar(error.error.message ? error.error.message : 'Sorry! Something went wrong', 'OK');
              }
              else {
                this.dialogService.openSnackBar('Status 400 error.', 'OK');
              }
              return throwError(error);
            case 401:
              if (error.error || error.error.message) {
                this.dialogService.openSnackBar(error.error.message ? error.error.message : 'Sorry! Something went wrong', 'OK');
              } else {
                this.dialogService.openSnackBar('Unauthorized', 'OK');
              }
              return throwError(error);
            case 500:
              if (error.error || error.error.message) {
                this.dialogService.openSnackBar(error.error.message ? error.error.message : 'Sorry! Something went wrong', 'OK');
              } else {
                this.dialogService.openSnackBar('Internal Server Error', 'center');
              }
              return throwError(error);
            case 404:
              if (error.error || error.error.message) {
                this.dialogService.openSnackBar(error.error.message ? error.error.message : 'Sorry! Something went wrong', 'OK');
              } else {
                this.dialogService.openSnackBar('Not Found', 'OK');
              }
              console.log(error);
              return throwError(error);
            case 410:
              if (error.error || error.error.message) {
                this.dialogService.openSnackBar(error.error.message ? error.error.message : 'Sorry! Something went wrong', 'OK');
              } else {
                this.dialogService.openSnackBar('Status 410 error.', 'OK');
              }
              console.log(error);
              return throwError(error);
            default:
              this.dialogService.openSnackBar(error && error.error && error.error.message, 'OK');
              return throwError(error);
          }
        } else {
          return throwError(error);
        }
      })).pipe(map<HttpEvent<any>, any>((evt: HttpEvent<any>) => {
        if (evt instanceof HttpResponse) {
        }
        return evt;
      }));
  }

}
