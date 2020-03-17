import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from '../services/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FadeIn } from '../animations/animations';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [
    FadeIn
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
      this.userService.authenticate({username: this.username, password: this.password}).subscribe(res => {
        if (res instanceof HttpErrorResponse) {
          const err: HttpErrorResponse = res;
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
          this.loading = false;
        } else {
          this.router.navigateByUrl('/user');
        }
      });
    } else {
      this.error = 'Bitte Nutzername und Passwort angeben!';
    }
  }

}
