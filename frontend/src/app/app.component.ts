import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FadeIn } from './animations/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    FadeIn
  ]
})
export class AppComponent {
  title = 'frontend';

  public getRouterOutletState(outlet: RouterOutlet) {
    return outlet.isActivated ? outlet.activatedRoute : '';
  }

}
