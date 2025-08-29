import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UpdateAccountStatusDTO {
  accountId: string;
  date: string;
  ote: number;
}
@Injectable({
  providedIn: 'root',
})
export class AccountStatusService {
  constructor(private http: HttpClient) {}

  getAllForDate(date: string): Observable<UpdateAccountStatusDTO[]> {
    return this.http.get<UpdateAccountStatusDTO[]>(
      `${environment.apiUrl}/account-status/date/${date}`,
      {
        withCredentials: true,
      }
    );
  }

  getByAccountAndDate(
    accountId: string,
    date: string
  ): Observable<UpdateAccountStatusDTO> {
    return this.http.get<UpdateAccountStatusDTO>(
      `${environment.apiUrl}/account-status/${accountId}/date/${date}`,
      {
        withCredentials: true,
      }
    );
  }
}
