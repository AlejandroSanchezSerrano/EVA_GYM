import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { User } from '../../interfaces/user';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  imports: [FormsModule, CommonModule]
})
export class AdminComponent implements OnInit {
  users: User[] = [];
  selectedUser: User | null = null;

  constructor(private userService: UserService, private router: Router) {}

  isAdmin: boolean = false;

  ngOnInit(): void {
    const nombreUser = localStorage.getItem('user_name');
    this.isAdmin = nombreUser === 'admin';
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe(users => {
      this.users = users;
    });
  }

  editUser(user: User): void {
    this.selectedUser = { ...user }; // copia para no alterar original
  }

  saveUser(): void {
    if (this.selectedUser) {
      this.userService.updateUser(this.selectedUser).subscribe({
        next: () => {
          this.selectedUser = null;
          this.loadUsers();
        },
        error: err => console.error('Error al actualizar el usuario', err)
      });
    }
  }

  cancelEdit(): void {
    this.selectedUser = null;
  }

  deleteUser(id: number): void {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      this.userService.deleteUser(id).subscribe(() => {
        this.loadUsers();
      });
    }
  }

  irAInicio(): void {
    this.router.navigate(['/inicio']);
  }
}