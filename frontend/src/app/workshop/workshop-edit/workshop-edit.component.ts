import { Component, OnInit } from '@angular/core';
import { WorkshopService, PARSE_TO_LOCAL, PARSE_TO_DATA, LocalWorkshop } from 'src/app/services/workshop.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-workshop-edit',
  templateUrl: './workshop-edit.component.html',
  styleUrls: ['./workshop-edit.component.scss']
})
export class WorkshopEditComponent implements OnInit {

  public error: string;

  private ouid: number;
  private wsid: number;
  public workshop: LocalWorkshop;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private wsService: WorkshopService
  ) {
    this.ouid = +this.route.snapshot.paramMap.get('ouid');
    this.wsid = +this.route.snapshot.paramMap.get('wsid');
  }

  ngOnInit(): void {
    this.fetchWorkshop();
  }

  private fetchWorkshop() {
    this.workshop = undefined;
    if (this.ouid && this.wsid) {
      this.wsService.getWorkshop(this.wsid).subscribe(
        res => {
          this.workshop = PARSE_TO_LOCAL(res);
        },
        err => {
          if (err.status === 404) {
            this.error = 'Event nicht gefunden!';
          }
        }
      );
    } else {
      this.workshop = {
        obligatoryUnit: this.ouid,
        name: 'Neuer Workshop',
        description: 'Neue Beschreibung',
        startDate: new Date(),
        duration: 1,
        participants: 36
      };
    }
  }

  public onSave(): void {
    if (this.wsid) {
      this.wsService.updateWorkshop(this.wsid, PARSE_TO_DATA(this.workshop)).subscribe(
        res => this.fetchWorkshop()
      );
    } else {
      this.wsService.createWorkshop(PARSE_TO_DATA(this.workshop)).subscribe(
        res => this.router.navigateByUrl(`/obligatoryunits/${this.ouid}/workshop/${res.id}`)
      );
    }
  }

  public onCancel() {
    if (confirm('Sind Sie sicher, dass Sie die Änderungen verwerfen wollen?')) {
      this.location.back();
    }
  }

}
