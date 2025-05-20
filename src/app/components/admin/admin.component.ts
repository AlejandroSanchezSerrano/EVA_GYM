import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { UserService } from '../../services/user.service';
import { User } from '../../interfaces/user';

import { ExerciseService, Exercise } from '../../services/exercise.service';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  imports: [FormsModule, CommonModule]
})
export class AdminComponent implements OnInit {
  isAdmin: boolean = false;

  // Usuarios
  users: User[] = [];
  selectedUser: User | null = null;

  // Ejercicios
  exercises: Exercise[] = [];
  editingExercise: Exercise | null = null;

  constructor(
    private userService: UserService,
    private exerciseService: ExerciseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const nombreUser = localStorage.getItem('user_name');
    this.isAdmin = nombreUser === 'admin';
    this.loadUsers();
    this.loadExercises();
  }

  // ----------- Usuarios -----------
  loadUsers(): void {
    this.userService.getAllUsers().subscribe(users => {
      this.users = users;
    });
  }

  editUser(user: User): void {
    this.selectedUser = { ...user };
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

  // ----------- Ejercicios -----------
  loadExercises(): void {
    this.exerciseService.getAll().subscribe(exs => this.exercises = exs);
  }

  startEditExercise(ex: Exercise): void {
    this.editingExercise = { ...ex };
  }

  saveExercise(): void {
    if (this.editingExercise) {
      this.exerciseService.update(this.editingExercise).subscribe(() => {
        this.editingExercise = null;
        this.loadExercises();
      });
    }
  }

  deleteExercise(id: number): void {
    if (confirm('¿Eliminar este ejercicio?')) {
      this.exerciseService.delete(id).subscribe(() => this.loadExercises());
    }
  }

  addExercise(): void {
    Swal.fire({
      title: 'Nuevo ejercicio',
      html:
        '<input id="swal-name" class="swal2-input" placeholder="Nombre">' +
        '<input id="swal-group" class="swal2-input" placeholder="Grupo muscular">',
      preConfirm: () => {
        const name = (document.getElementById('swal-name') as HTMLInputElement).value;
        const group = (document.getElementById('swal-group') as HTMLInputElement).value;
        if (!name || !group) {
          Swal.showValidationMessage('Ambos campos son obligatorios');
          return;
        }
        return { name, group };
      },
      showCancelButton: true,
      confirmButtonText: 'Agregar'
    }).then(result => {
      if (result.isConfirmed) {
        this.exerciseService.create(result.value.name, result.value.group).subscribe(() => {
          this.loadExercises();
        });
      }
    });
  }
}
