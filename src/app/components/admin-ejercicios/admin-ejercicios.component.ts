import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExerciseService, Exercise } from '../../services/exercise.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-admin-ejercicios',
  templateUrl: './admin-ejercicios.component.html',
  styleUrls: ['./admin-ejercicios.component.css'],
  imports: [CommonModule, FormsModule],
})
export class AdminEjerciciosComponent implements OnInit {
  exercises: Exercise[] = [];
  editingExercise: Exercise | null = null;
  isAdmin: boolean = false;

  constructor(private exerciseService: ExerciseService, private router: Router) {}

  ngOnInit(): void {
    const nombreUser = localStorage.getItem('user_name');
    this.isAdmin = nombreUser === 'admin';
    this.loadExercises();
  }

  loadExercises(): void {
    this.exerciseService.getAll().subscribe((exs) => (this.exercises = exs));
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

  irAInicio(): void {
      this.router.navigate(['/inicio']);
    }

  addExercise(): void {
    Swal.fire({
      title: 'Nuevo ejercicio',
      html:
        '<input id="swal-name" class="swal2-input" placeholder="Nombre">' +
        '<input id="swal-group" class="swal2-input" placeholder="Grupo muscular">',
      preConfirm: () => {
        const name = (document.getElementById('swal-name') as HTMLInputElement)
          .value;
        const group = (
          document.getElementById('swal-group') as HTMLInputElement
        ).value;
        if (!name || !group) {
          Swal.showValidationMessage('Ambos campos son obligatorios');
          return;
        }
        return { name, group };
      },
      showCancelButton: true,
      confirmButtonText: 'Agregar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.exerciseService
          .create(result.value.name, result.value.group)
          .subscribe(() => {
            this.loadExercises();
          });
      }
    });
  }
}
