import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { ErrorService } from './error.service';
import { MatDialog } from '@angular/material/dialog';
import { LoginDialogComponent } from '../user/login-dialog/login.dialog';
import { ConfigurationService } from './configuration.service';

export interface User {
  username: string;
  role: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthResponse {
  username: string;
  role: string;
  accessToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private backendUrl: string;

  private user: BehaviorSubject<User> = new BehaviorSubject(undefined);
  private accessToken: string;

  constructor(
    private configService: ConfigurationService,
    private errorService: ErrorService,
    private dialog: MatDialog,
    private http: HttpClient
  ) {
    this.backendUrl = `${this.configService.getBackendAddress()}`;
    const token = localStorage.getItem('access_token');
    if (token && !this.isTokenExpired(token)) {
      this.changeAccessToken(token);
      this.user.next({
        username: this.getUsernameFromToken(token),
        role: localStorage.getItem('user_role')
      });
    }
  }

  private isTokenExpired(token: string): boolean {
    return this.getBodyFromToken(token).exp * 1000 < new Date().getTime();
  }

  private getUsernameFromToken(token: string): string {
    return this.getBodyFromToken(token).username;
  }

  private getBodyFromToken(token: string): any {
    return JSON.parse(atob(token.split('.')[1]));
  }

  private handleUserChange(auth: AuthResponse): void {
    this.user.next({
      username: auth.username,
      role: auth.role
    });
    localStorage.setItem('user_role', auth.role);
    this.changeAccessToken(auth.accessToken.split(' ')[1]);
  }

  public getUser(): BehaviorSubject<User> {
    return this.user;
  }

  public async getAccessToken(): Promise<string> {
    if (this.accessToken && this.isTokenExpired(this.accessToken)) {
      const auth = await this.showLoginDialog('Sitzung abgelaufen').toPromise(); // Wait for Login from Dialog
      if (!auth) {
        this.logOut(); // log out user - delete Token and User
      }
    }
    return this.accessToken;
  }

  public changeAccessToken(token: string): void {
    localStorage.setItem('access_token', token);
    this.accessToken = token;
  }

  public authenticate(credentials: LoginCredentials): Observable<AuthResponse> {
    this.accessToken = undefined;
    return this.http.post<AuthResponse>(
      `${this.backendUrl}/login`,
      credentials
    ).pipe(
      tap(res => this.handleUserChange(res))
    );
  }

  public logOut(): void {
    this.accessToken = undefined;
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    this.user.next(undefined);
  }

  public handleUnauthorized(error: HttpErrorResponse): Observable<any> {
    if (this.accessToken === undefined) {
      return throwError(error);
    } else {
      this.showLoginDialog('Unzureichende Rechte').subscribe(auth => {
        if (!auth) {
          this.errorService.showError('Für diese Aktion nicht authorisiert!');
        }
      });
      return of(undefined);
    }
  }

  private showLoginDialog(error: string): Observable<boolean> {
    return this.dialog.open(LoginDialogComponent, {
          height: '325px',
          width: '300px',
          disableClose: true,
          data: { error }
        }).afterClosed();
  }

}
