import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { InstrumentDTO } from '../models/instrument.dto';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InstrumentService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<InstrumentDTO[]> {
    return this.http.get<InstrumentDTO[]>(`${environment.apiUrl}/instruments`, {
      withCredentials: true,
    });
  }

  getById(id: string): Observable<InstrumentDTO> {
    return this.http.get<InstrumentDTO>(
      `${environment.apiUrl}/instruments/${id}`,
      {
        withCredentials: true,
      }
    );
  }
}
