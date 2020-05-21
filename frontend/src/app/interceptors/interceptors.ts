import { AuthenticationInterceptor } from './authentication.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

export const INTERCEPTORS_PROVIDER = [
  { provide: HTTP_INTERCEPTORS, useClass: AuthenticationInterceptor, multi: true }
];
