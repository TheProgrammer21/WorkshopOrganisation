import { Component } from '@angular/core';
import { ObligatoryUnit, ObligatoryunitService } from 'src/app/services/obligatoryunit.service';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-obligatory-unit-list',
  templateUrl: './obligatory-unit-list.component.html',
  styleUrls: ['./obligatory-unit-list.component.scss']
})
export class ObligatoryUnitListComponent {

  public obligatoryUnits: ObligatoryUnit[];

  public loading: boolean;
  public error: string;
  public showAdmin: boolean;

  constructor(
    private ouService: ObligatoryunitService,
    private userService: UserService
  ) {
    this.fetchAndInit();
    this.userService.getUser().subscribe(user => {
      this.loading = user.role === 'admin';
    });
  }

  private fetchAndInit() {
    this.loading = true;
    this.error = undefined;
    this.ouService.getAllObligatoryUntis().subscribe(
      res => {
        this.obligatoryUnits = res;
        this.loading = false;
      },
      err => {
        if ((err as HttpErrorResponse).status === 404) {
          this.error = 'Keine Einträge gefunden';
        }
        this.loading = false;
      }
    );
  }

}
