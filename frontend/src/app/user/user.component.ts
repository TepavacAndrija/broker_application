import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UserDTO } from '../models/user.dto';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { FormsModule } from '@angular/forms';
import * as Stomp from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent implements OnInit {
  users: UserDTO[] = [];
  editingUser: UserDTO | null = null;
  private client!: Stomp.Client;

  showCreateModal = false;

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
    this.connectWebSocket();
  }

  connectWebSocket() {
    this.client = new Stomp.Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: {},
      debug: (str) => {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      onConnect: () => {
        console.log(' Connected websocket');

        this.client.subscribe('/topic/users', (message) => {
          console.log('user:', JSON.parse(message.body));
          this.loadUsers();
        });

        this.client.subscribe('/topic/users/deleted', (message: any) => {
          const deletedAccountId = message.body;
          console.log('Deleted:', deletedAccountId);
          this.loadUsers();
        });
      },
      onStompError: (error) => {
        console.error('STOMP Error:', error);
      },
    });

    this.client.activate();
  }

  loadUsers(): void {
    this.userService.getAll().subscribe((data) => {
      this.users = data;
    });
  }

  deleteUser(id: string): void {
    if (confirm('Delete?')) {
      this.userService.delete(id).subscribe(() => {
        // this.loadUsers();
      });
    }
  }

  createUser(
    nameInput: HTMLInputElement,
    passwordInput: HTMLInputElement,
    roleInput: HTMLSelectElement
  ): void {
    const name = nameInput.value.trim();
    const password = passwordInput.value;
    const role = roleInput.value as 'MANAGER' | 'BROKER';

    if (!name || !password) {
      alert('Name and password required');
      return;
    }

    this.userService.create({ name, password, role }).subscribe({
      next: () => {
        nameInput.value = '';
        passwordInput.value = '';
        roleInput.value = 'BROKER';
        // this.loadUsers();
      },
      error: (err) => {
        alert('Error while creating the user');
        console.error(err);
      },
    });
  }

  startEdit(user: UserDTO): void {
    this.editingUser = { ...user };
  }

  saveEdit(): void {
    if (!this.editingUser) return;

    const { id, name, role } = this.editingUser;

    this.userService.update(id, { name, role }).subscribe({
      next: () => {
        this.cancelEdit();
        // this.loadUsers();
      },
      error: (e) => {
        alert('Error while updating');
        console.error(e);
      },
    });
  }

  cancelEdit(): void {
    this.editingUser = null;
  }
  isManager(): boolean {
    return this.authService.getRole() === 'MANAGER';
  }
}
