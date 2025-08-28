import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  of,
  tap,
  throwError,
} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Role } from '../models/user.dto';

export interface AuthDTO {
  name: string;
  role: Role;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  private userSubject = new BehaviorSubject<AuthDTO | null>(null);
  // private roleSubject = new BehaviorSubject<string | null>(this.getRole());

  isLoggedIn$ = this.loggedIn.asObservable();
  // role$ = this.roleSubject.asObservable();
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    this.checkAuthStatus().subscribe();
  }

  login(name: string, password: string): Observable<AuthDTO> {
    return this.http
      .post<AuthDTO>(
        `${environment.apiUrl}/auth/login`,
        { name, password },
        { withCredentials: true }
      )
      .pipe(
        tap((user) => {
          this.loggedIn.next(true);
          this.userSubject.next(user);
          console.log('Korisnik sacuvan u authservice: ', user);
        }),
        catchError((err) => {
          this.loggedIn.next(false);
          this.userSubject.next(null);
          return throwError(() => new Error('Login failed'));
        })
      );
  }

  private hasToken(): boolean {
    const auth = localStorage.getItem('auth');
    return !!auth;
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
        map((userData) => {
          this.loggedIn.next(true);
          console.log('provera statusa, ulogovan je korisnik ');
          this.userSubject.next(userData);
          return true;
        }),
        catchError(() => {
          this.loggedIn.next(false);
          return of(false);
        })
      );
  }

  getName(): string | null {
    return this.userSubject.getValue()?.name || null;
  }

  getRole(): string | null {
    return this.userSubject.getValue()?.role || null;
  }
}
