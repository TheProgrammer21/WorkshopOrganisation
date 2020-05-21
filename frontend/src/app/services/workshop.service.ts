import { Injectable } from '@angular/core';
import { ConfigurationService } from './configuration.service';
import { ErrorService, HttpErrorTask } from './error.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { WorkshopDetailComponent } from '../workshop/workshop-detail/workshop-detail.component';

export interface Workshop extends WorkshopData {
  id: number;
  registered: boolean;
  currentParticipants: number;
}

export interface WorkshopData {
  name: string;
  description: string;
  startDate: string;
  duration: number; // Duration in days
  participants: number;
}

@Injectable({
  providedIn: 'root'
})
export class WorkshopService {

  private workshopAddress: string;

  private standardHttpErrorMessages: Map<number, HttpErrorTask> = new Map([
    [404, {
      message: 'Keine Workshops gefunden'
    }]
  ]);
  private httpErrorMessages: Map<number, HttpErrorTask> = new Map();

  constructor(
    private http: HttpClient,
    private configService: ConfigurationService,
    private errorService: ErrorService,
  ) {
    this.workshopAddress = `${this.configService.getBackendAddress()}/workshop`;
  }

  private handleError(error: HttpErrorResponse): Observable<any> {
    return this.errorService.handleHttpError(
      error,
      new Map([...this.standardHttpErrorMessages, ...this.httpErrorMessages])
    );
  }

  public setErrorTasks(errorMessages: Map<number, HttpErrorTask>): void {
    this.httpErrorMessages = errorMessages;
  }

  // Get All Workshops In Obligatory Unit
  public getWorkshopsForObligatoryUnit(ouid: number): Observable<Workshop[]> {
    return this.http.get<Workshop[]>(
      `${this.configService.getBackendAddress()}/obligatoryUnit/${ouid}/allWorkshops`
    ).pipe(
      catchError(err => this.handleError(err))
    );
  }

  public getWorkshop(id: number): Observable<Workshop> {
    return this.http.get<Workshop>(`${this.workshopAddress}/${id}`).pipe(
      catchError(err => this.handleError(err))
    );
  }

  public createWorkshop(workshop: WorkshopData): Observable<any> {
    return this.http.post(this.workshopAddress, workshop).pipe(
      catchError(err => this.handleError(err))
    );
  }

  public updateWorkshop(id: number, data: WorkshopDetailComponent): Observable<any> {
    return this.http.put(`${this.workshopAddress}/${id}`, data).pipe(
      catchError(err => this.handleError(err))
    );
  }

  public deleteWorkshop(id: number): Observable<any> {
    return this.http.delete(`${this.workshopAddress}/${id}`).pipe(
      catchError(err => this.handleError(err))
    );
  }

  public register(id: number): Observable<any> {
    return this.http.post(`${this.workshopAddress}/${id}/register`, undefined).pipe(
      catchError(err => this.handleError(err))
    );
  }

  public unregister(id: number): Observable<any> {
    return this.http.post(`${this.workshopAddress}/${id}/register`, undefined).pipe(
      catchError(err => this.handleError(err))
    );
  }

}
