import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface AuthDTO {
  name: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  private roleSubject = new BehaviorSubject<string | null>(this.getRole());

  isLoggedIn$ = this.loggedIn.asObservable();
  role$ = this.roleSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkAuthStatus();
  }

  login(name: string, password: string): Observable<AuthDTO> {
    return this.http.post<AuthDTO>(
      `${environment.apiUrl}/auth/login`,
      { name, password },
      { withCredentials: true }
    );
  }

  private hasToken(): boolean {
    const auth = localStorage.getItem('auth');
    return !!auth;
  }

  getRole(): string | null {
    const auth = localStorage.getItem('auth');
    return auth ? JSON.parse(auth).role : null;
  }

  isLoggedIn(): boolean {
    return this.loggedIn.getValue();
  }

  logout(): void {
    this.http
      .post<AuthDTO>(
        `${environment.apiUrl}/auth/logout`,
        {},
        { withCredentials: true }
      )
      .subscribe({
        next: () => this.loggedIn.next(false),
      });
  }

  checkAuthStatus(): Observable<boolean> {
    return this.http
      .get<AuthDTO>(`${environment.apiUrl}/auth/me`, { withCredentials: true })
      .pipe(
        map(() => {
          this.loggedIn.next(true);
          return true;
        }),
        catchError(() => {
          this.loggedIn.next(false);
          return of(false);
        })
      );
  }
}
