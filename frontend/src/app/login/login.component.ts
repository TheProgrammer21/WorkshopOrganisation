import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FadeIn, FadeInRetarded } from '../animations/animations';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [
    FadeIn, FadeInRetarded,
    trigger('loadingResize', [
      state('expanded', style ({
        height: '113px'
      })),
      state('loading', style ({
        height: '50px'
      })),
      transition('loading <=> *', [
        animate('300ms ease')
      ])
    ])
  ]
})
export class LoginComponent implements OnInit {

  public username: string;
  public password: string;
  public error: string;

  public loading = false;

  constructor(
    private router: Router,
    private userService: UserService
  ) {
    if (this.router.getCurrentNavigation().extras.state) {
      this.error = this.router.getCurrentNavigation().extras.state.error;
    }
  }

  ngOnInit() {
  }

  public onLogin(): void {
    if (this.username && this.password) {
      this.error = undefined;
      this.loading = true;
      this.userService.authenticate({username: this.username, password: this.password}).subscribe(
        res => {
          // this.router.navigateByUrl('/user');
        },
        err => {
          switch (err.status) {
            case 0:
              this.error = 'Verbindung mit Server nicht möglich';
              break;
            case 401:
              // this.username = '';
              this.password = '';
              this.error = 'Nutzerdaten ungültig!';
              break;
          }
        }
      );
    } else {
      this.error = 'Bitte Nutzername und Passwort angeben!';
    }
  }

}
