import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Workshop, WorkshopService } from 'src/app/services/workshop.service';
import { ObligatoryUnit, ObligatoryunitService } from 'src/app/services/obligatoryunit.service';
import { UserService } from 'src/app/services/user.service';
import { FadeInRetarded } from 'src/app/animations/animations';
import { DialogService } from 'src/app/services/dialog.service';
import { ErrorService } from 'src/app/services/error.service';

@Component({
  selector: 'app-workshop-detail',
  templateUrl: './workshop-detail.component.html',
  styleUrls: ['./workshop-detail.component.scss'],
  animations: [ FadeInRetarded ]
})
export class WorkshopDetailComponent implements OnInit {

  public workshop: Workshop;
  public obligatoryUnit: ObligatoryUnit;

  public loading: boolean;
  public error: string;
  public showAdmin: boolean;

  public ouid: number;
  public wsid: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private wsService: WorkshopService,
    private ouService: ObligatoryunitService,
    private userService: UserService,
    private dialogService: DialogService,
    private errorService: ErrorService
  ) {
    this.ouid = +this.route.snapshot.paramMap.get('ouid');
    this.wsid = +this.route.snapshot.paramMap.get('wsid');
    this.userService.getUser().subscribe(user => {
      if (user) {
        this.showAdmin = user.role === 'admin';
      }
    });
  }

  ngOnInit(): void {
    this.fetchAndInit();
  }

  private fetchAndInit() {
    this.workshop = undefined;
    if (this.ouid && this.wsid) {
      this.wsService.getWorkshop(this.wsid).subscribe(
        res => {
          this.workshop = res;
          this.ouService.getObligatoryUnit(this.ouid).subscribe(
            res2 => {
              this.obligatoryUnit = res2;
            },
            err => {
              if (err.status === 404) {
                this.error = 'Event nicht gefunden!';
              }
            }
          );
        },
        err => {
          if (err.status === 404) {
            this.error = 'Event nicht gefunden!';
          }
        }
      );
    }
  }

  public registerForWorkshop() {
    this.wsService.register(this.wsid).subscribe(
      res => {
        this.fetchAndInit();
      },
      err => {
        if (err.status === 409) {
          this.errorService.showError('Zeitlicher Konflikt mit anderem Workshop!');
        }
      }
    );
  }

  public unregisterFromWorkshop() {
    this.wsService.unregister(this.wsid).subscribe(
      res => {
        this.fetchAndInit();
      }
    );
  }

  public async deleteWS() {
    this.dialogService.showConfirmDialog(
        'Löschen?',
        `Wollen Sie '${this.workshop.name}' wirklich löschen?`,
        'Löschen', 'Abbrechen')
    .afterClosed().subscribe(confirm => {
      if (confirm) {
        this.wsService.deleteWorkshop(this.workshop.id).subscribe(
          res => this.router.navigateByUrl(`/obligatoryunits/${this.ouid}`)
        );
      }
    });
  }

}
