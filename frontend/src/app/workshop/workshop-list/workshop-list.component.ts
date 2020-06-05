import { Component } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Workshop, WorkshopService } from 'src/app/services/workshop.service';
import { UserService } from 'src/app/services/user.service';
import { FadeInRetarded } from 'src/app/animations/animations';

@Component({
  selector: 'app-workshop-list',
  templateUrl: './workshop-list.component.html',
  styleUrls: ['./workshop-list.component.scss'],
  animations: [ FadeInRetarded ]
})
export class WorkshopListComponent {

  public workshops: Workshop[];

  public loading: boolean;
  public error: string;
  public showAdmin: boolean;

  public ouid: number;

  constructor(
    private route: ActivatedRoute,
    private wsService: WorkshopService,
    private userService: UserService
  ) {
    this.ouid = +this.route.snapshot.paramMap.get('ouid');
    this.fetchAndInit();
    this.userService.getUser().subscribe(user => {
      this.showAdmin = user.role === 'admin';
    });
  }

  public fetchAndInit() {
    this.loading = true;
    this.error = undefined;
    this.wsService.getWorkshopsForObligatoryUnit(this.ouid).subscribe(
      res => {
        this.workshops = res;
        this.loading = false;
      },
      err => {
        if ((err as HttpErrorResponse).status === 404) {
          this.error = 'Keine Workshops gefunden';
        }
        this.loading = false;
      }
    );
  }

  public deleteWS(ws: Workshop) {
    if (confirm(`Wollen Sie '${ws.name}' wirklich löschen?`)) {
      this.wsService.deleteWorkshop(ws.id).subscribe(
        res => this.fetchAndInit()
      );
    }
  }

}
