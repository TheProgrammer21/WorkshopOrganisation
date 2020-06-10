import { Injectable } from '@angular/core';
import { ConfirmDialogComponent } from '../custom-modals/confirm-dialog/confirm.dialog';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { LoginDialogComponent } from '../user/login-dialog/login.dialog';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private dialog: MatDialog) { }

  public showConfirmDialog(
    title: string,
    message: string,
    confirmText: string,
    cancelText?: string
  ): MatDialogRef<ConfirmDialogComponent> {
    return this.dialog.open(ConfirmDialogComponent, {
      disableClose: true,
      data: { title, message, confirmText, cancelText }
    });
  }

  public showLoginDialog(error: string): MatDialogRef<LoginDialogComponent> {
    return this.dialog.open(LoginDialogComponent, {
          height: '325px',
          width: '300px',
          disableClose: true,
          data: { error }
        });
  }

}
