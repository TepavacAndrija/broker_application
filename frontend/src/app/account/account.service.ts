import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AccountDTO } from '../models/account.dto';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UpdateAccountDTO {
  name: string;
  userInfo: string;
}

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

  create(dto: UpdateAccountDTO): Observable<AccountDTO> {
    return this.http.post<AccountDTO>(`${environment.apiUrl}/accounts`, dto, {
      withCredentials: true,
    });
  }

  update(id: string, dto: UpdateAccountDTO): Observable<AccountDTO> {
    return this.http.put<AccountDTO>(
      `${environment.apiUrl}/accounts/${id}`,
      dto,
      { withCredentials: true }
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/accounts/${id}`, {
      withCredentials: true,
    });
  }
  getById(id: string): Observable<AccountDTO> {
    return this.http.get<AccountDTO>(`${environment.apiUrl}/accounts/${id}`, {
      withCredentials: true,
    });
  }
}
