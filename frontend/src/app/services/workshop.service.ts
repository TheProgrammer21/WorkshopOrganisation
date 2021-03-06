import { Injectable } from '@angular/core';
import { ConfigurationService } from './configuration.service';
import { ErrorService, HttpErrorTask } from './error.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Workshop extends WorkshopData {
  id: number;
  registered: boolean;
  currentParticipants: Array<string>;
}

export interface WorkshopData {
  obligatoryUnit: number;
  name: string;
  description: string;
  startDate: string;
  duration: number; // Duration in days
  participants: number;
}

export interface LocalWorkshop {
  obligatoryUnit: number;
  name: string;
  description: string;
  startDate: Date;
  duration: number; // Duration in days
  participants: number;
}

export function PARSE_TO_LOCAL(ws: Workshop): LocalWorkshop {
  return {
    obligatoryUnit: ws.obligatoryUnit,
    name: ws.name,
    description: ws.description,
    startDate: new Date(ws.startDate),
    duration: ws.duration,
    participants: ws.participants
  };
}

export function PARSE_TO_DATA(ws: LocalWorkshop): WorkshopData {
  return {
    obligatoryUnit: ws.obligatoryUnit,
    name: ws.name,
    description: ws.description,
    startDate: ws.startDate.toString(),
    duration: ws.duration,
    participants: ws.participants
  };
}

@Injectable({
  providedIn: 'root'
})
export class WorkshopService {

  private workshopAddress: string;

  private standardHttpErrorMessages: Map<number, HttpErrorTask> = new Map([
    [404, {
      message: 'Workshop nicht gefunden!'
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

  public updateWorkshop(id: number, data: WorkshopData): Observable<any> {
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
    return this.http.delete(`${this.workshopAddress}/${id}/unregister`, undefined).pipe(
      catchError(err => this.handleError(err))
    );
  }

}
