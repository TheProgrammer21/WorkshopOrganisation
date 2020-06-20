import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Workshop, WorkshopService } from 'src/app/services/workshop.service';
import { UserService } from 'src/app/services/user.service';
import { FadeInRetarded } from 'src/app/animations/animations';
import { DialogService } from 'src/app/services/dialog.service';
import { ErrorService } from 'src/app/services/error.service';

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
  public notice: string;
  public showAdmin: boolean;

  public ouid: number;

  constructor(
    private route: ActivatedRoute,
    private wsService: WorkshopService,
    private userService: UserService,
    private dialogService: DialogService,
    private errorService: ErrorService
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
        if (this.workshops.length === 0) {
          this.notice = 'Keine Workshops vorhanden';
        }
        this.loading = false;
      },
      err => {
        this.error = 'Fehler beim Laden!';
        this.loading = false;
      }
    );
  }

  public async deleteWS(ws: Workshop) {
    if (await this.dialogService.showConfirmDialog(
        'Löschen?',
        `Wollen Sie '${ws.name}' wirklich löschen?`,
        'Löschen', 'Abbrechen').afterClosed().toPromise()) {
      this.wsService.deleteWorkshop(ws.id).subscribe(
        res => this.fetchAndInit()
      );
    }
  }

}
