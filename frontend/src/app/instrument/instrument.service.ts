import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { InstrumentDTO } from '../models/instrument.dto';
import { environment } from '../../environments/environment';

export interface UpdateInstrumentDTO {
  code: string;
  maturityDate: string;
}

@Injectable({
  providedIn: 'root',
})
export class InstrumentService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<InstrumentDTO[]> {
    return this.http.get<InstrumentDTO[]>(`${environment.apiUrl}/instruments`, {
      // withCredentials: true,
    });
  }

  create(dto: UpdateInstrumentDTO): Observable<InstrumentDTO> {
    return this.http.post<InstrumentDTO>(
      `${environment.apiUrl}/instruments`,
      dto
      // { withCredentials: true }
    );
  }

  update(id: string, dto: UpdateInstrumentDTO): Observable<InstrumentDTO> {
    return this.http.put<InstrumentDTO>(
      `${environment.apiUrl}/instruments/${id}`,
      dto
      // { withCredentials: true }
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/instruments/${id}`, {
      // withCredentials: true,
    });
  }

  getById(id: string): Observable<InstrumentDTO> {
    return this.http.get<InstrumentDTO>(
      `${environment.apiUrl}/instruments/${id}`
      // {
      //   withCredentials: true,
      // }
    );
  }
}
