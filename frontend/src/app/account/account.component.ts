import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccountDTO } from '../models/account.dto';
import { AccountService } from './account.service';
import { AuthService } from '../auth/auth.service';
import * as Stomp from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { NotificationService } from '../notification/notification.service';

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
  private client!: Stomp.Client;

  constructor(
    private accountService: AccountService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
    this.connectWebSocket();
  }

  connectWebSocket() {
    this.client = new Stomp.Client({
      // brokerURL: 'ws://localhost:8080/ws',
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: {},
      debug: (str) => {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log(' Connected to WebSocket');

        this.client.subscribe('/topic/accounts', (message) => {
          const account = JSON.parse(message.body);
          this.notificationService.showInfo(
            'Succesfully created account with ID ' + account.id
          );

          this.loadAccounts();
        });

        this.client.subscribe('/topic/accounts/update', (message) => {
          const account = JSON.parse(message.body);
          this.notificationService.showEdit(
            'Succesfully updated account with ID ' + account.id
          );

          this.loadAccounts();
        });

        this.client.subscribe('/topic/accounts/deleted', (message: any) => {
          this.notificationService.showWarning(
            `Account with ID ${message.body} has been deleted`,
            'Trade Deleted'
          );
          this.loadAccounts();
        });
      },
      onStompError: (error) => {
        console.error('STOMP Error:', error);
      },
    });
    this.client.activate();
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
          // this.loadAccounts();
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
          // this.loadAccounts();
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
      this.accountService.delete(id).subscribe();
    }
  }

  isManager(): boolean {
    return this.authService.getRole() === 'MANAGER';
  }
}
