import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Router, NavigationStart } from '@angular/router';
import { throwError, Observable, of } from 'rxjs';

export interface HttpErrorTask {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor(
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.router.events.subscribe(evt => {
      if (evt instanceof NavigationStart) {
        this.dismissError();
      }
    });
  }

  public handleHttpError(
    error: HttpErrorResponse, tasks?: Map<number, HttpErrorTask>, serverErrors?: Map<number, HttpErrorTask>
  ): Observable<any> {
    if (error.status === 0) {
      this.showError('Verbindungsfehler mit Server!');
      console.error(error);
    } else if (tasks.has(error.status)) {
      if (tasks.get(error.status).message) {
        this.showError(tasks.get(error.status).message); // show Message
      }
//      if (tasks.get(error.status).return) {
//        return of(tasks.get(error.status).result); // return result
//      }
    } else if ((error as any).err) {
      if (serverErrors.has(error.error)) {
        if (serverErrors.get(error.error).message) {
          this.showError(serverErrors.get(error.error).message); // show Message
        }
//        if (serverErrors.get(error.error).return) {
//          return of(serverErrors.get(error.error).result); // return result
//        }
      } else {
        this.showError('Server Error: ' + error.error);
      }
    }
    return throwError(error);
  }

  public handleMultipleHttpErrors(errors: HttpErrorResponse[]): void {
    let message = 'Es traten folgende Fehler auf:';
    for (const error of errors) { // generate Message
      message += `\n` + error.error;
    }
    if (errors.every(err => err.status === 0)) {
      this.showError('Verbindungsfehler mit Server!');
    } else if (errors.every(err => errors[0].error === err.error)) { // All errors are the same
      this.showError(errors[0].error); // Show Error only once
    } else {
      this.snackBar.open(message); // Show Message
    }
  }

  public showError(message: string, action: string = 'OK', config?: MatSnackBarConfig<any>): void {
    this.snackBar.open(message, action, config);
  }

  public dismissError(): void {
    this.snackBar.dismiss();
  }

}
