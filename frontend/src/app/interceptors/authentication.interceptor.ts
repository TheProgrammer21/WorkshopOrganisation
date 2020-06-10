import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { UserService } from '../services/user.service';
import { catchError, tap, switchMap } from 'rxjs/operators';

/** Pass untouched request through to the next request handler. */
@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {

  constructor(private userService: UserService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.userService.getAccessToken()).pipe(
      switchMap(token => {
        if (token) {
          req = req.clone({
            headers: req.headers.append('Authorization',
              `Bearer ${token}`)
          });
        }
        return next.handle(req).pipe(
          tap(evt => {
            if (evt instanceof HttpResponse) {
              if (evt.headers.has('Authorization') && evt.headers.get('Authorization') !== `Bearer ${token}`) {
                this.userService.changeAccessToken(evt.headers.get('Authorization').split(' ')[1]);
              }
            }
          }),
          catchError(err => {
            if (err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403)) {
              return this.userService.handleUnauthorized(err);
            } else {
              return throwError(err);
            }
          })
        );
      })
    );
  }
}
