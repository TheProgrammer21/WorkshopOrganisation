import { Component, OnInit } from '@angular/core';
import {
  ObligatoryunitService,
  LocalObligatoryUnit,
  PARSE_TO_LOCAL, STATUS,
  PARSE_TO_DATA,
  ObligatoryUnitUpdateData
} from 'src/app/services/obligatoryunit.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ErrorService } from 'src/app/services/error.service';
import { DialogService } from 'src/app/services/dialog.service';

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
    private ouService: ObligatoryunitService,
    private errorService: ErrorService,
    private dialogService: DialogService
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
    if (this.validateInputs()) {
      if (this.ouid) {
        const data = PARSE_TO_DATA(this.obligatoryUnit) as ObligatoryUnitUpdateData;
        data.status = this.status;
        this.ouService.updateObligatoryUnit(this.ouid, data).subscribe(
          res => this.location.back()
        );
      } else {
        this.ouService.createObligatoryUnit(PARSE_TO_DATA(this.obligatoryUnit)).subscribe(
          res => this.router.navigateByUrl(`/obligatoryunits/${res.id}`)
        );
      }
    }
  }

  private validateInputs(): boolean {
    let error;

    if (!this.obligatoryUnit.name) { // Name prüfen
      error = 'Bitte Name eingeben';
    } else if (this.obligatoryUnit.name.length > 64) {
      error = 'Bitte Name mit maximal 64 Zeichen wählen';
    } else if (!this.obligatoryUnit.description) { // Beschreibung prüfen
      error = 'Bitte Beschreibung eingeben';
    } else if (this.obligatoryUnit.description.length > 512) {
      error = 'Bitte Beschreibung mit maximal 512 Zeichen wählen';
    } else if (!this.obligatoryUnit.startDate) { // Beginndatum prüfen
      error = 'Bitte Beginndatum eingeben';
    } else if (!this.obligatoryUnit.endDate) { // Enddatum prüfen
      error = 'Bitte Enddatum eingeben';
    }

    if (error) {
      this.errorService.showError(error);
    }
    return !(error);
  }

  public async onCancel() {
    if (await this.dialogService.showConfirmDialog(
      'Änderungen verwerfen?', 'Wollen Sie die Änderungen verwerfen',
      'Verwerfen', 'Abbrechen'
    ).afterClosed().toPromise()) {
      this.location.back();
    }
  }

}
