import { Component, OnInit } from '@angular/core';
import { ObligatoryunitService, LocalObligatoryUnit, PARSE_TO_LOCAL, STATUS, PARSE_TO_DATA } from 'src/app/services/obligatoryunit.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-obligatory-unit-edit',
  templateUrl: './obligatory-unit-edit.component.html',
  styleUrls: ['./obligatory-unit-edit.component.scss']
})
export class ObligatoryUnitEditComponent implements OnInit {

  public allStatus: Map<number, string[]> = STATUS;

  public error: string;

  private ouid: number;
  public obligatoryUnit: LocalObligatoryUnit;
  public status: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private ouService: ObligatoryunitService
  ) {
    this.ouid = +this.route.snapshot.paramMap.get('ouid');
  }

  ngOnInit(): void {
    this.fetchObligatoryUnit();
  }

  private fetchObligatoryUnit() {
    this.obligatoryUnit = undefined;
    if (this.ouid) {
      this.ouService.getObligatoryUnit(this.ouid).subscribe(
        res => {
          this.obligatoryUnit = PARSE_TO_LOCAL(res);
          this.status = res.status;
        },
        err => {
          if (err.status === 404) {
            this.error = 'Event nicht gefunden!';
          }
        }
      );
    } else {
      this.obligatoryUnit = {
        name: 'Neues Event',
        description: 'Neue Beschreibung',
        startDate: new Date(),
        endDate: new Date()
      };
    }
  }

  public onSave(): void {
    if (this.ouid) {
      this.ouService.updateObligatoryUnit(this.ouid, PARSE_TO_DATA(this.obligatoryUnit)).subscribe(
        res => this.fetchObligatoryUnit()
      );
    } else {
      this.ouService.createObligatoryUnit(PARSE_TO_DATA(this.obligatoryUnit)).subscribe(
        res => this.router.navigateByUrl(`/obligatoryunits/${res.id}`)
      );
    }
  }

  public onCancel() {
    if (confirm('Sind Sie sicher, dass Sie die Änderungen verwerfen wollen?')) {
      this.location.back();
    }
  }

}
