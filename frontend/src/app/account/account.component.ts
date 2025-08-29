import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountDTO } from '../models/account.dto';
import { AccountService } from './account.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountComponent implements OnInit {
  accounts: AccountDTO[] = [];
  editingAccount: AccountDTO | null = null;

  constructor(
    private accountService: AccountService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.accountService.getAll().subscribe((data) => {
      this.accounts = data;
    });
  }

  startEdit(account: AccountDTO): void {
    this.editingAccount = { ...account };
  }

  startCreate(): void {
    this.editingAccount = { id: '', name: '', userInfo: '' };
  }

  saveAccount(): void {
    if (!this.editingAccount) return;

    const { id, ...dto } = this.editingAccount;

    if (id) {
      this.accountService.update(id, dto).subscribe({
        next: () => {
          this.cancelEdit();
          this.loadAccounts();
        },
        error: (err) => {
          alert('Error while updatin account');
          console.error(err);
        },
      });
    } else {
      this.accountService.create(dto).subscribe({
        next: () => {
          this.cancelEdit();
          this.loadAccounts();
        },
        error: (err) => {
          alert('Error while creating account');
          console.error(err);
        },
      });
    }
  }

  cancelEdit(): void {
    this.editingAccount = null;
  }

  deleteAccount(id: string): void {
    if (confirm('Delete account?')) {
      this.accountService.delete(id).subscribe(() => {
        this.loadAccounts();
      });
    }
  }

  isManager(): boolean {
    return this.authService.getRole() === 'MANAGER';
  }
}
