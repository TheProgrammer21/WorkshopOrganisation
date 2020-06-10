import { Component, AfterViewInit } from '@angular/core';
import { UserService } from './services/user.service';
import { FadeIn } from './animations/animations';
import { RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    FadeIn
  ]
})
export class AppComponent implements AfterViewInit {
  title = 'WorkshopOrganisation';

  public barExpanded: boolean;

  public loggedIn: boolean;
  public showLogin: boolean;

  constructor(
    private userService: UserService,
    private router: Router
  ) {
    this.userService.getUser().subscribe(
      user => {
        if (user) {
          this.showLogin = false;
          setTimeout(() => this.loggedIn = true, 1);
        } else {
          this.loggedIn = false;
          setTimeout(() => this.showLogin = true, 1);
        }
      }
    );
  }

  ngAfterViewInit() { }

  public getRouterOutletState(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData;
  }

  public onLogOut() {
    this.userService.logOut();
  }

  public canGoBack(): boolean {
    return this.router.url !== '/obligatoryunits';
  }

  public goBack(): void {
    let newloc = this.router.url.substring(0, this.router.url.lastIndexOf('/'));
    if (newloc.match(/[0-9]/gm)) {
      while (!newloc.match(/[0-9]$/gm)) {
        newloc = newloc.substring(0, newloc.lastIndexOf('/'));
      }
    }
    this.router.navigateByUrl(newloc);
  }

}
