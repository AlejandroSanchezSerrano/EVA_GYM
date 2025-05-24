import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { User } from '../../interfaces/user';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-admin-usuarios',
  templateUrl: './admin-usuarios.component.html',
  styleUrls: ['./admin-usuarios.component.css'],
  imports: [FormsModule, CommonModule],
})
export class AdminUsuariosComponent implements OnInit {
  users: User[] = [];
  selectedUser: User | null = null;
  isAdmin: boolean = false;

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    const nombreUser = localStorage.getItem('user_name');
    this.isAdmin = nombreUser === 'admin';
    this.loadUsers();
  }

  currentPage: number = 1;
  pageSize: number = 8;
  totalUsers: number = 0;

  irAInicio(): void {
    this.router.navigate(['/inicio']);
  }

  loadUsers(): void {
    this.userService
      .getUsersPaged(this.currentPage, this.pageSize)
      .subscribe((data) => {
        this.users = data.users;
        this.totalUsers = data.total;
      });
  }

  changePage(delta: number): void {
    const newPage = this.currentPage + delta;
    const totalPages = Math.ceil(this.totalUsers / this.pageSize);
    if (newPage >= 1 && newPage <= totalPages) {
      this.currentPage = newPage;
      this.loadUsers();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalUsers / this.pageSize);
  }

  editUser(user: User): void {
    this.selectedUser = { ...user };
  }

  saveUser(): void {
    if (this.selectedUser) {
      this.userService.updateUser(this.selectedUser).subscribe(() => {
        this.selectedUser = null;
        this.loadUsers();
      });
    }
  }

  cancelEdit(): void {
    this.selectedUser = null;
  }

  deleteUser(id: number): void {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      this.userService.deleteUser(id).subscribe(() => this.loadUsers());
    }
  }
}
