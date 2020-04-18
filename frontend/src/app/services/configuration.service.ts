import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  public backendAddress: string;

  constructor() {
    this.backendAddress =
      `${window.location.protocol}//${window.location.hostname}:8085/api`;
  }

  public getBackendAddress(): string {
    return this.backendAddress;
  }

}
