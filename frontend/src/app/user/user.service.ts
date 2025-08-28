import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Role, UserDTO } from '../models/user.dto';
import { environment } from '../../environments/environment';

export interface CreateUserDTO {
  name: string;
  password: string;
  role: Role;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${environment.apiUrl}/users`, {
      withCredentials: true,
    });
  }

  create(user: CreateUserDTO): Observable<UserDTO> {
    return this.http.post<UserDTO>(`${environment.apiUrl}/users`, user, {
      withCredentials: true,
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/users/${id}`, {
      withCredentials: true,
    });
  }
}
