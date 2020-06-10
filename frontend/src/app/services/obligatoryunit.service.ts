import { Injectable } from '@angular/core';
import { ErrorService, HttpErrorTask } from './error.service';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { ConfigurationService } from './configuration.service';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ObligatoryUnit extends ObligatoryUnitData {
  id: number;
  status: number;
}

export interface ObligatoryUnitData {
  startDate: string;
  endDate: string;
  name: string;
  description: string;
}

export interface LocalObligatoryUnit {
  startDate: Date;
  endDate: Date;
  name: string;
  description: string;
}

export interface ObligatoryUnitUpdateData extends ObligatoryUnitData {
  status: number;
}

export function PARSE_TO_LOCAL(ou: ObligatoryUnit): LocalObligatoryUnit {
  return {
    name: ou.name,
    description: ou.description,
    startDate: new Date(ou.startDate),
    endDate: new Date(ou.endDate)
  };
}

export function PARSE_TO_DATA(ou: LocalObligatoryUnit): ObligatoryUnitData {
  return {
    name: ou.name,
    description: ou.description,
    startDate: ou.startDate.toString(),
    endDate: ou.endDate.toString()
  };
}

export const STATUS = new Map<number, string[]>([
  [1, ['Versteckt', 'Nur Admins - Alte Events']],
  [0, ['Unsichtbar', 'Nur Admins - Neu erstellt']],
  [2, ['Sichtbar', 'Jeder - Normal verwendbar']],
  [3, ['Gesperrt', 'Jeder - Nur ansehen, nicht registrieren']]
]);

@Injectable({
  providedIn: 'root'
})
export class ObligatoryunitService {

  private obligatoryUnitAddress: string;

  private standardHttpErrorMessages: Map<number, HttpErrorTask> = new Map([
    [404, {
      message: 'Events nicht gefunden!'
    }]
  ]);
  private httpErrorMessages: Map<number, HttpErrorTask> = new Map();

  constructor(
    private http: HttpClient,
    private configService: ConfigurationService,
    private errorService: ErrorService
  ) {
    this.obligatoryUnitAddress = `${this.configService.getBackendAddress()}/obligatoryUnit`;
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

  // Get All Obligatory Units with status
  // If no status is specified, any status will be returned
  public getAllObligatoryUntis(status?: number[]): Observable<ObligatoryUnit[]> {
    let params = new HttpParams();
    if (status) {
      for (const stat of status) {
        params = params.append('status', stat.toString());
      }
    }
    console.log(params);
    return this.http.get<ObligatoryUnit[]>(`${this.obligatoryUnitAddress}/all`, {params}).pipe(
      catchError(err => this.handleError(err))
    );
  }

  public getObligatoryUnit(id: number): Observable<ObligatoryUnit> {
    return this.http.get(`${this.obligatoryUnitAddress}/${id}`).pipe(
      catchError(err => this.handleError(err))
    );
  }

  public createObligatoryUnit(data: ObligatoryUnitData): Observable<any> {
    return this.http.post<any>(this.obligatoryUnitAddress, data).pipe(
      catchError(err => this.handleError(err))
    );
  }

  public updateObligatoryUnit(id: number, data: ObligatoryUnitUpdateData): Observable<any> {
    return this.http.put<any>(`${this.obligatoryUnitAddress}/${id}`, data).pipe(
      catchError(err => this.handleError(err))
    );
  }

  public deleteObligatoryUnit(id: number): Observable<any> {
    return this.http.delete<any>(`${this.obligatoryUnitAddress}/${id}`).pipe(
      catchError(err => this.handleError(err))
    );
  }

}
