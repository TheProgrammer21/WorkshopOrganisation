import { Component, OnInit } from '@angular/core';
import { WorkshopService, PARSE_TO_LOCAL, PARSE_TO_DATA, LocalWorkshop } from 'src/app/services/workshop.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { DialogService } from 'src/app/services/dialog.service';
import { ErrorService } from 'src/app/services/error.service';

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
    private wsService: WorkshopService,
    private dialogService: DialogService,
    private errorService: ErrorService
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
    if (this.validateInputs) {
      if (this.wsid) {
        this.wsService.updateWorkshop(this.wsid, PARSE_TO_DATA(this.workshop)).subscribe(
          res => this.location.back()
        );
      } else {
        this.wsService.createWorkshop(PARSE_TO_DATA(this.workshop)).subscribe(
          res => this.router.navigateByUrl(`/obligatoryunits/${this.ouid}/workshop/${res.id}`)
        );
      }
    }
  }

  private validateInputs(): boolean {
    let error;

    if (!this.workshop.name) { // Name prüfen v
      error = 'Bitte Name eingeben';
    } else if (this.workshop.name.length > 64) {
      error = 'Bitte Name mit maximal 64 Zeichen wählen';
    } else if (!this.workshop.description) { // Beschreibung prüfen v
      error = 'Bitte Beschreibung eingeben';
    } else if (this.workshop.description.length > 512) {
      error = 'Bitte Beschreibung mit maximal 512 Zeichen wählen';
    } else if (!this.workshop.startDate) { // Beginndatum prüfen
      error = 'Bitte Beginndatum eingeben';
    } else if (!this.workshop.duration) { // Dauer prüfen v
      error = 'Bitte Dauer eingeben';
    } else if (this.workshop.duration < 1) {
      error = 'Bitte eine Dauer größer 0 wählen';
    } else if (this.workshop.duration !== Math.floor(this.workshop.duration)) { // Ganzzahligkeit prüfen
      error = 'Bitte Ganzzahlige Dauer wählen';
    } else if (!this.workshop.participants) { // Teilnehmerzahl prüfen v
      error = 'Bitte maximale Teilnehmerzahl eingeben';
    } else if (this.workshop.participants < 1) {
      error = 'Bitte maximale Teilnehmerzahl größer 0 wählen';
    } else if (this.workshop.duration !== Math.floor(this.workshop.participants)) { // Ganzzahligkeit prüfen
      error = 'Bitte Ganzzahlige maximale Teilnehmerzahl wählen';
    }

    if (error) { // Display Error falls gefunden
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
