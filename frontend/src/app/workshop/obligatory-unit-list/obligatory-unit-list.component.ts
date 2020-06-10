import { Component } from '@angular/core';
import { ObligatoryUnit, ObligatoryunitService, STATUS } from 'src/app/services/obligatoryunit.service';
import { UserService } from 'src/app/services/user.service';
import { FadeInRetarded } from 'src/app/animations/animations';
import { ErrorService } from 'src/app/services/error.service';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-obligatory-unit-list',
  templateUrl: './obligatory-unit-list.component.html',
  styleUrls: ['./obligatory-unit-list.component.scss'],
  animations: [ FadeInRetarded ]
})
export class ObligatoryUnitListComponent {

  public allStatus: Map<number, string[]> = STATUS;

  public obligatoryUnits: ObligatoryUnit[];
  public showStatus: number[] = Array.from(STATUS.keys());

  public loading: boolean;
  public error: string;
  public notice: string;
  public showAdmin: boolean;

  constructor(
    private ouService: ObligatoryunitService,
    private userService: UserService,
    private errorService: ErrorService,
    private dialogService: DialogService
  ) {
    this.fetchAndInit();
    this.userService.getUser().subscribe(user => {
      this.showAdmin = user.role === 'admin';
    });
  }

  public fetchAndInit() {
    this.loading = true;
    this.error = undefined;
    this.ouService.getAllObligatoryUntis().subscribe(
      res => {
        this.obligatoryUnits = res;
        if (this.obligatoryUnits.length === 0) {
          this.notice = 'Keine Events gefunden';
        }
        this.loading = false;
      },
      err => {
        this.error = 'Fehler beim Laden!';
        this.loading = false;
      }
    );
  }

  public fetchFiltered() {
    this.loading = true;
    this.error = undefined;
    this.notice = undefined;
    this.ouService.getAllObligatoryUntis(this.showStatus).subscribe(
      res => {
        this.obligatoryUnits = res;
        if (this.obligatoryUnits.length === 0) {
          this.notice = 'Keine Events gefunden';
          this.errorService.showError('Keine Events gefunden');
        }
        this.loading = false;
      },
      err => {
        this.error = 'Fehler beim Laden!';
        this.loading = false;
      }
    );
  }

  public async deleteOU(ou: ObligatoryUnit) {
    if (await this.dialogService.showConfirmDialog(
        'Löschen?',
        `Möchten Sie\n'${ou.name}'\nwirklich löschen?`,
        'Löschen', 'Abbrechen').afterClosed().toPromise()) {
      this.ouService.deleteObligatoryUnit(ou.id).subscribe(
        res => this.fetchFiltered()
      );
    }
  }

}
