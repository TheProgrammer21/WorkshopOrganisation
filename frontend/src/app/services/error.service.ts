import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Router, NavigationStart } from '@angular/router';
import { throwError, Observable } from 'rxjs';

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
    error: HttpErrorResponse, tasks?: Map<number, HttpErrorTask>): Observable<any> {
    if (error.status === 0) {
      this.showError('Verbindungsfehler mit Server!');
      console.error(error);
    } else if (tasks.has(error.status)) {
      if (tasks.get(error.status).message) {
        this.showError(tasks.get(error.status).message); // show Message
      }
    } else if (error.error.error) {
      this.showError('Server Error: ' + error.error.error);
    }
    return throwError(error);
  }

  public showError(message: string, action: string = 'OK', config?: MatSnackBarConfig<any>): void {
    this.snackBar.open(message, action, config);
  }

  public dismissError(): void {
    this.snackBar.dismiss();
  }

}
