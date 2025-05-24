import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { User } from '../../interfaces/user';
import { Router } from '@angular/router';
import { DataTablesModule } from 'angular-datatables';
import { Subject } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-admin-usuarios',
  templateUrl: './admin-usuarios.component.html',
  styleUrls: ['./admin-usuarios.component.css'],
  imports: [FormsModule, CommonModule, DataTablesModule],
})
export class AdminUsuariosComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  users: User[] = [];
  selectedUser: User | null = null;
  isAdmin: boolean = false;

  dtOptions: any = {};
  dtTrigger: Subject<any> = new Subject<any>();

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    const nombreUser = localStorage.getItem('user_name');
    this.isAdmin = nombreUser === 'admin';

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 6,
      lengthChange: false,
      language: {
        url: '/es-ES.json',
      },
    };

    this.loadUsers();
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  irAInicio(): void {
    this.router.navigate(['/inicio']);
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe((data) => {
      this.users = data;
      this.dtTrigger.next(null); // Inicializa DataTable
    });
  }

  editUser(user: User): void {
    this.selectedUser = { ...user };
  }

  saveUser(): void {
    if (this.selectedUser) {
      this.userService.updateUser(this.selectedUser).subscribe(() => {
        this.selectedUser = null;
        location.reload(); // Reinicia DataTable correctamente
      });
    }
  }

  cancelEdit(): void {
    this.selectedUser = null;
  }

  deleteUser(id: number): void {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      this.userService.deleteUser(id).subscribe(() => location.reload());
    }
  }
}
