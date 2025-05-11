import { Component, OnInit } from '@angular/core';
import {
  Exercise,
  SeriesDetail,
  TrainingService,
} from '../../services/training.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.css'],
  imports: [CommonModule, FormsModule],
})
export class TrainingComponent implements OnInit {
  isLoggedIn: boolean = false;
  userId!: number;

  exercises: Exercise[] = [];
  selectedExerciseId: number | null = null;

  numSeries: number = 1;
  seriesInputs: SeriesDetail[] = [];

  loading = false;
  viewingHistory = false;

  exerciseLogs: {
    date: string;
    series: { repetitions: number; weight: number }[];
  }[] = [];

  constructor(
    private trainingService: TrainingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      this.userId = parseInt(storedUserId, 10);
      this.isLoggedIn = true;
    } else {
      this.isLoggedIn = false;
      return;
    }

    this.trainingService.getExercises().subscribe({
      next: (data) => {
        this.exercises = data;
      },
      error: (err) => {
        console.error('Error al cargar ejercicios:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los ejercicios.',
          confirmButtonColor: '#d33',
        });
      },
    });

    this.seriesInputs = [{ repetitions: null, weight: null }];
  }

  irALogin(): void {
    this.router.navigate(['/login']);
  }

  onSeriesCountChange(): void {
    this.seriesInputs = Array.from({ length: this.numSeries }, () => ({
      repetitions: null,
      weight: null,
    }));
  }

  selectExercise(): void {
    const inputOptions: Record<string, string> = {};
    this.exercises.forEach((e) => (inputOptions[e.id] = e.name));

    Swal.fire({
      title: 'Elige un ejercicio',
      input: 'select',
      inputOptions: inputOptions,
      inputPlaceholder: '-- Elegir --',
      showCancelButton: true,
      confirmButtonText: 'Seleccionar',
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.selectedExerciseId = parseInt(result.value, 10);
        this.viewingHistory = false; // modo registro
        this.seriesInputs = [{ repetitions: null, weight: null }];
        this.numSeries = 1;

        // 👉 cargar historial automáticamente
        this.loadExerciseLogs(this.selectedExerciseId);
      }
    });
  }

  loadExerciseLogs(exerciseId: number): void {
    this.trainingService.getExerciseLogs(this.userId, exerciseId).subscribe({
      next: (data) => {
        this.exerciseLogs = data.sort((a, b) => b.date.localeCompare(a.date));
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el historial de este ejercicio.',
        });
        this.exerciseLogs = [];
      },
    });
  }

  submitTraining(): void {
    if (!this.selectedExerciseId || !this.seriesInputs.length) return;

    this.loading = true;

    const cleanedSeries: SeriesDetail[] = this.seriesInputs.map((s) => ({
      repetitions: s.repetitions ?? 0,
      weight: s.weight !== null && s.weight !== undefined ? s.weight : 0,
    }));

    if (this.editingLogId) {
      // 🔄 Actualizar las series: borrar y volver a insertar
      this.trainingService.deleteSeriesDetails(this.editingLogId).subscribe({
        next: () => {
          this.trainingService
            .createSeriesDetails(this.editingLogId!, cleanedSeries)
            .subscribe({
              next: () => {
                Swal.fire(
                  'Actualizado',
                  'Entrenamiento editado con éxito.',
                  'success'
                );
                this.resetForm();
                this.loadExerciseLogs(this.selectedExerciseId!);
              },
              error: () => {
                Swal.fire(
                  'Error',
                  'No se pudieron actualizar las series.',
                  'error'
                );
              },
              complete: () => (this.loading = false),
            });
        },
        error: () => {
          Swal.fire('Error', 'No se pudo preparar la edición.', 'error');
          this.loading = false;
        },
      });
    } else {
      // ➕ Nuevo registro (igual que antes)
      const today = new Date().toISOString().split('T')[0];
      this.trainingService
        .createExerciseLog(this.userId, this.selectedExerciseId, today)
        .subscribe({
          next: (res) => {
            this.trainingService
              .createSeriesDetails(res.exercise_log_id, cleanedSeries)
              .subscribe({
                next: () => {
                  Swal.fire(
                    '¡Éxito!',
                    'Entrenamiento registrado con éxito.',
                    'success'
                  );
                  this.resetForm();
                  this.loadExerciseLogs(this.selectedExerciseId!);
                },
                error: () => {
                  Swal.fire(
                    'Error',
                    'No se pudieron guardar las series.',
                    'error'
                  );
                  this.loading = false;
                },
                complete: () => (this.loading = false),
              });
          },
          error: () => {
            Swal.fire('Error', 'No se pudo crear el log.', 'error');
            this.loading = false;
          },
        });
    }
  }

  getSelectedExerciseName(): string {
    const selected = this.exercises.find(
      (e) => e.id === this.selectedExerciseId
    );
    return selected ? selected.name : '';
  }

  eliminarLog(log: any): void {
    console.log('Log recibido:', log); // 👈 Mira qué ID tiene

    const logId = log.id ?? log.exercise_log_id; // usa la que exista
    if (!logId) {
      console.error('No se encontró el ID del log.');
      return;
    }

    Swal.fire({
      icon: 'warning',
      title: '¿Eliminar entrenamiento?',
      text: 'Esta acción no se puede deshacer.',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        this.trainingService.deleteExerciseLog(logId).subscribe({
          next: (res) => {
            if (res.success) {
              Swal.fire(
                'Eliminado',
                'El entrenamiento ha sido eliminado.',
                'success'
              );
              this.loadExerciseLogs(this.selectedExerciseId!);
            } else {
              Swal.fire(
                'Error',
                res.message || 'No se pudo eliminar.',
                'error'
              );
            }
          },
          error: () => {
            Swal.fire('Error', 'No se pudo conectar con el servidor.', 'error');
          },
        });
      }
    });
  }

  editingLogId: number | null = null; // 🆕 para saber si estamos editando

  editarLog(log: any): void {
    this.editingLogId = log.id;
    this.viewingHistory = false; // cambia a modo edición
    this.selectedExerciseId = this.selectedExerciseId; // ya debe estar activo
    this.seriesInputs = log.series.map((s: any) => ({
      repetitions: s.repetitions,
      weight: parseFloat(s.weight), // por si viene como string
    }));
    this.numSeries = this.seriesInputs.length;
  }

  resetForm(): void {
    this.seriesInputs = [{ repetitions: null, weight: null }];
    this.numSeries = 1;
    this.selectedExerciseId = null;
    this.editingLogId = null;
    this.exerciseLogs = [];
  }
}
