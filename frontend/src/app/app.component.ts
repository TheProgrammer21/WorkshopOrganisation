import { Component, AfterViewInit } from '@angular/core';
import { UserService } from './services/user.service';
import { FadeSite, FadeIn } from './animations/animations';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    FadeSite, FadeIn
  ]
})
export class AppComponent implements AfterViewInit {
  title = 'WorkshopOrganisation';

  public barExpanded: boolean;

  public loggedIn: boolean;
  public showContent: boolean;

  constructor(
    private userService: UserService
  ) {
    this.userService.getUser().subscribe(user => {
      if (user) {
        this.loggedIn = true;
        this.showContent = true;
      } else {
        this.loggedIn = false;
      }
    });
  }

  ngAfterViewInit() { }

  public getRouterOutletState(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData;
  }

  public removeContent() {
    if (!this.loggedIn) {
      this.showContent = false;
    }
  }

}
