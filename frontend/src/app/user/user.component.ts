import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UserDTO } from '../models/user.dto';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { FormsModule } from '@angular/forms';

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

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAll().subscribe((data) => {
      this.users = data;
    });
  }

  deleteUser(id: string): void {
    if (confirm('Delete?')) {
      this.userService.delete(id).subscribe(() => {
        this.loadUsers();
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
        this.loadUsers();
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
        this.loadUsers();
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
}
