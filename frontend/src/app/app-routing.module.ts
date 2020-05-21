import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ObligatoryUnitListComponent } from './workshop/obligatory-unit-list/obligatory-unit-list.component';
import { WorkshopListComponent } from './workshop/workshop-list/workshop-list.component';
import { WorkshopDetailComponent } from './workshop/workshop-detail/workshop-detail.component';
import { WorkshopEditComponent } from './workshop/workshop-edit/workshop-edit.component';
import { ObligatoryUnitEditComponent } from './workshop/obligatory-unit-edit/obligatory-unit-edit.component';


const routes: Routes = [
  {path: '', redirectTo: 'obligatoryunits', pathMatch: 'full'},
  {path: 'obligatoryunits', component: ObligatoryUnitListComponent},
  {path: 'obligatoryunits/new', component: ObligatoryUnitEditComponent},
  {path: 'obligatoryunits/:ouid', component: WorkshopListComponent},
  {path: 'obligatoryunits/:ouid/edit', component: ObligatoryUnitEditComponent},
  {path: 'obligatoryunits/:ouid/workshop/:wid', component: WorkshopDetailComponent},
  {path: 'obligatoryunits/:ouid/workshop/:wid/edit', component: WorkshopEditComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
