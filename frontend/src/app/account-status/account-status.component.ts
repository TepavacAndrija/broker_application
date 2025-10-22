import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AccountDTO } from '../models/account.dto';
import {
  AccountStatusService,
  UpdateAccountStatusDTO,
} from './account-status.service';
import { AccountService } from '../account/account.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-account-status',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account-status.component.html',
  styleUrl: './account-status.component.scss',
})
export class AccountStatusComponent implements OnInit {
  selectedDate: string = new Date().toISOString().split('T')[0];
  statuses: UpdateAccountStatusDTO[] = [];
  accounts: AccountDTO[] = [];

  constructor(
    private statusService: AccountStatusService,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
    this.loadStatuses();
  }

  loadAccounts(): void {
    this.accountService.getAll().subscribe((data) => {
      this.accounts = data;
    });
  }

  loadStatuses(): void {
    this.statusService.getAllForDate(this.selectedDate).subscribe({
      next: (data) => {
        this.statuses = data;
      },
      error: (err) => {
        console.error('Error while loading statuses', err);
        this.statuses = [];
      },
    });
  }
  triggerDailyBalance() {
    this.statusService.triggerDailyBalance();
    this.loadAccounts();
  }
  getAccountName(accountId: string): string {
    const account = this.accounts.find((a) => a.id === accountId);
    return account?.name || 'Unknown account';
  }
}
