import { Injectable } from '@angular/core';
import { ConfigurationService } from './configuration.service';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface User {
  name: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthResponse {
  username: string;
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
    private http: HttpClient,
    private router: Router
  ) {
    this.backendUrl = `${this.configService.backendAddress}`;
    const token = localStorage.getItem('access_token');
    if (token) {
      console.log(token);
      this.accessToken = token;
      this.http.post<AuthResponse>(`${this.backendUrl}/renew`, {}).subscribe(res => {
        if (res instanceof HttpErrorResponse) {
          const err: HttpErrorResponse = res;
          switch (err.status) {
            case 0:
              this.router.navigateByUrl('/user/login', {state: {error: 'Verbindung zu server nicht möglich'}});
              break;
            case 401:
              localStorage.removeItem('access_token');
              this.accessToken = undefined;
              this.user.next(undefined);
              this.router.navigateByUrl('/user/login');
              break;
          }
        } else {
          this.handleUserChange(res);
        }
      });
    } else {
      this.router.navigateByUrl('/user/login');
    }
  }

  private handleUserChange(auth: AuthResponse): void {
    this.user.next({name: auth.username});
    localStorage.setItem('access_token', auth.accessToken);
    this.accessToken = auth.accessToken;
  }

  public getUser(): BehaviorSubject<User> {
    return this.user;
  }

  public getAccessToken(): string {
    return this.accessToken;
  }

  public authenticate(credentials: LoginCredentials): Observable<object> {
    const body = {
      username: credentials.username,
      password: credentials.password
    };
    return this.http.post<AuthResponse>(
      `${this.backendUrl}/login`,
      body
    ).pipe(
      tap(auth => this.handleUserChange(auth)),
      catchError(error => of(error))
    );
  }

}
