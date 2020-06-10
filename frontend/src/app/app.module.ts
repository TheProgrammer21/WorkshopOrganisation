import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { UserService } from './services/user.service';
import { INTERCEPTORS_PROVIDER } from './interceptors/interceptors';
import { LoginDialogComponent } from './user/login-dialog/login.dialog';
import { LoginComponent } from './user/login/login.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ObligatoryUnitListComponent } from './workshop/obligatory-unit-list/obligatory-unit-list.component';
import { WorkshopListComponent } from './workshop/workshop-list/workshop-list.component';
import { WorkshopDetailComponent } from './workshop/workshop-detail/workshop-detail.component';
import { WorkshopEditComponent } from './workshop/workshop-edit/workshop-edit.component';
import { ObligatoryUnitEditComponent } from './workshop/obligatory-unit-edit/obligatory-unit-edit.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import {
  MatMomentDateModule,
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MAT_MOMENT_DATE_FORMATS
} from '@angular/material-moment-adapter';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmDialogComponent } from './custom-modals/confirm-dialog/confirm.dialog';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LoginDialogComponent,
    ObligatoryUnitListComponent,
    WorkshopListComponent,
    WorkshopDetailComponent,
    WorkshopEditComponent,
    ObligatoryUnitEditComponent,
    ConfirmDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatListModule,
    MatSnackBarModule,
    HttpClientModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatToolbarModule,
    MatIconModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatSelectModule,
    MatTooltipModule
  ],
  providers: [
    UserService, ErrorService, // Fix undefined on first requests (Interceptor)
    INTERCEPTORS_PROVIDER,
    { provide: LOCALE_ID, useValue: navigator.language },
    { provide: MAT_DATE_LOCALE, useValue: navigator.language }, // Set date local to browser local --> Datepicker
    // Setting providers for DatePicker to support local
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

// Localization
import { registerLocaleData } from '@angular/common';

import localeDe from '@angular/common/locales/de';
import localeDeExtra from '@angular/common/locales/extra/de';
import { ErrorService } from './services/error.service';
import { MAT_DATE_LOCALE, DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';

registerLocaleData(localeDe, 'de', localeDeExtra);
