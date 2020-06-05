import { Component, OnInit, Input } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { FadeIn, FadeInRetarded } from 'src/app/animations/animations';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { Router } from '@angular/router';
import { ErrorService } from 'src/app/services/error.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [
    FadeIn, FadeInRetarded,
    trigger('loadingResize', [
      state('expanded', style ({
        height: '135px'
      })),
      state('loading', style ({
        height: '70px'
      })),
      transition('loading <=> *', [
        animate('300ms ease')
      ])
    ])
  ]
})
export class LoginComponent implements OnInit {

  @Input() redirectUrl = '/';

  public username: string;
  public password: string;

  public error: string;
  public loading: boolean;
  public showPassword = false;

  constructor(
    private router: Router,
    private errorService: ErrorService,
    private userService: UserService
  ) {
//    if (this.router.getCurrentNavigation() && this.router.getCurrentNavigation().extras.state) {
//      this.error = this.router.getCurrentNavigation().extras.state.error;
//    }
  }

  ngOnInit(): void {
  }

  public onLogin(): void {
    if (this.username && this.password) {
      this.error = undefined;
      this.loading = true;
      this.userService.authenticate({
        username: this.username,
        password: this.password
      }).subscribe(
        res => {
          if (this.redirectUrl) {
            this.router.navigateByUrl(this.redirectUrl);
          }
        },
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
