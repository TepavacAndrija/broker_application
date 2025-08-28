import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AccountDTO } from '../models/account.dto';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<AccountDTO[]> {
    return this.http.get<AccountDTO[]>(`${environment.apiUrl}/accounts`, {
      withCredentials: true,
    });
  }

  getById(id: string): Observable<AccountDTO> {
    return this.http.get<AccountDTO>(`${environment.apiUrl}/accounts/${id}`, {
      withCredentials: true,
    });
  }
}
