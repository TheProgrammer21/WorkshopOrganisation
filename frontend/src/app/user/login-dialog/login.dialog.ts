import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserService } from 'src/app/services/user.service';
import { ErrorService } from 'src/app/services/error.service';
import { FadeIn, FadeInRetarded } from 'src/app/animations/animations';
import { HttpErrorResponse } from '@angular/common/http';

export interface LoginDialogData {
  error: string;
}

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login.dialog.html',
  styleUrls: ['./login.dialog.scss'],
  animations: [
    FadeIn, FadeInRetarded
  ]
})
export class LoginDialogComponent {

  public username: string;
  public password: string;

  public error: string;
  public loading: boolean;
  public showPassword = false;

  constructor(
    public dialogRef: MatDialogRef<LoginDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LoginDialogData,
    private errorService: ErrorService,
    private userService: UserService
  ) {
    this.error = data.error;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onLogin(): void {
    if (this.username && this.password) {
      this.loading = true;
      this.userService.authenticate({
        username: this.username,
        password: this.password
      }).subscribe(
        res => this.dialogRef.close(true),
        err => {
          this.password = '';
          this.errorService.handleHttpError(err, new Map([
            [401, {message: undefined}]
          ]));
          if ((err as HttpErrorResponse).status === 401) {
            this.error = 'Benutzer beziehungsweise Passwort inkorrekt!';
          }
          this.loading = false;
        }
        );
    } else {
      this.error = 'Bitte alle Felder ausfüllen!';
    }
  }

}
