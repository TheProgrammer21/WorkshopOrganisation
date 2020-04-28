import { Component, OnInit, Inject } from '@angular/core';
import { ObligatoryunitService, LocalObligatoryUnit, PARSE_TO_LOCAL, STATUS } from 'src/app/services/obligatoryunit.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-obligatory-unit-edit',
  templateUrl: './obligatory-unit-edit.component.html',
  styleUrls: ['./obligatory-unit-edit.component.scss']
})
export class ObligatoryUnitEditComponent implements OnInit {

  public allStatus: Map<number, string[]> = STATUS;

  public error: string;
  public obligatoryUnit: LocalObligatoryUnit;

  public status: number;

  constructor(
    private route: ActivatedRoute,
    private ouService: ObligatoryunitService
  ) { }

  ngOnInit(): void {
    this.fetchObligatoryUnit();
  }

  private fetchObligatoryUnit() {
    const ouid = +this.route.snapshot.paramMap.get('ouid');
    if (ouid) {
      this.ouService.getObligatoryUnit(ouid).subscribe(
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



}
