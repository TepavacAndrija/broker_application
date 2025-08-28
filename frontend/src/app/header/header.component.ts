import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthDTO, AuthService } from '../auth/auth.service';
import { CommonModule } from '@angular/common';
import { map, Observable } from 'rxjs';
import { UserDTO } from '../models/user.dto';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  user$!: Observable<AuthDTO | null>;
  constructor(public authService: AuthService, private router: Router) {
    this.user$ = this.authService.user$;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
